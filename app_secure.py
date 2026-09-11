from flask import Flask, request, session, redirect, abort, jsonify, Response, send_file
from pathlib import Path
from datetime import datetime, timedelta, timezone
import sqlite3, secrets, threading, socket, urllib.parse, html, os, traceback, hashlib
from werkzeug.security import generate_password_hash, check_password_hash
import pydicom
from pynetdicom import AE, evt
from pynetdicom.presentation import StoragePresentationContexts

BASE=Path(__file__).resolve().parent
REC=BASE/'received'; REC.mkdir(parents=True,exist_ok=True)
DB=Path(os.getenv('DRIPACS_DB',str(BASE/'secure_links.db')))
PORT=int(os.getenv('PORT','5000')); DPORT=int(os.getenv('DICOM_PORT','11112'))
AE_TITLE=os.getenv('DICOM_AE_TITLE','SECURELINK')
PUBLIC_URL=os.getenv('PUBLIC_URL','').strip().rstrip('/')
LINK_PASSWORD=os.getenv('LINK_PASSWORD','').strip()
ADMIN_PASSWORD_HASH=os.getenv('ADMIN_PASSWORD_HASH','').strip()
FLASK_SECRET_KEY=os.getenv('FLASK_SECRET_KEY','').strip()

app=Flask(__name__); app.secret_key=FLASK_SECRET_KEY
app.config.update(SESSION_COOKIE_HTTPONLY=True,SESSION_COOKIE_SAMESITE='Lax',SESSION_COOKIE_SECURE=PUBLIC_URL.startswith('https://'))

def db():
    c=sqlite3.connect(DB,timeout=30); c.row_factory=sqlite3.Row; return c

def init():
    c=db()
    c.execute('CREATE TABLE IF NOT EXISTS studies(uid TEXT PRIMARY KEY,pid TEXT,pname TEXT,description TEXT,date TEXT,modality TEXT,folder TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS series(uid TEXT PRIMARY KEY,study_uid TEXT NOT NULL,series_number TEXT,description TEXT,modality TEXT,body_part TEXT,folder TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS links(id INTEGER PRIMARY KEY,uid TEXT,token TEXT UNIQUE,phash TEXT,expires TEXT,enabled INTEGER DEFAULT 1)')
    c.execute('CREATE TABLE IF NOT EXISTS reports(uid TEXT PRIMARY KEY,findings TEXT DEFAULT \'\',impression TEXT DEFAULT \'\',updated TEXT)')
    c.commit(); c.close()

def ip():
    try:
        s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); x=s.getsockname()[0]; s.close(); return x
    except Exception:return '127.0.0.1'

def safe(x): return ''.join(c if c.isalnum() or c in '-_ .' else '_' for c in str(x)).strip().replace(' ','_') or 'UNKNOWN'

def public_link(t): return f'{PUBLIC_URL}/p/{t}' if PUBLIC_URL else f'http://{ip()}:{PORT}/p/{t}'

def link_for(uid):
    c=db(); r=c.execute('SELECT * FROM links WHERE uid=? AND enabled=1 ORDER BY id DESC LIMIT 1',(uid,)).fetchone()
    if r:
        try:
            if datetime.now(timezone.utc)<datetime.fromisoformat(r['expires']): c.close(); return r['token']
        except Exception: pass
    if not LINK_PASSWORD: c.close(); raise RuntimeError('LINK_PASSWORD is not set')
    t=secrets.token_urlsafe(32); exp=(datetime.now(timezone.utc)+timedelta(days=30)).isoformat()
    ph=generate_password_hash(LINK_PASSWORD)
    c.execute('INSERT INTO links(uid,token,phash,expires) VALUES(?,?,?,?)',(uid,t,ph,exp)); c.commit(); c.close(); return t

def getlink(t):
    c=db(); r=c.execute('SELECT * FROM links WHERE token=? AND enabled=1',(t,)).fetchone(); c.close()
    if not r:return None
    try:
        if datetime.now(timezone.utc)>=datetime.fromisoformat(r['expires']):return None
    except Exception:return None
    return r

def authed(t): return session.get('patient_token')==t

def verify_link_password(stored, entered):
    if len(stored)==64 and all(x in '0123456789abcdef' for x in stored.lower()):
        return secrets.compare_digest(stored, hashlib.sha256(entered.encode()).hexdigest())
    return check_password_hash(stored, entered)

def save_dicom(ds):
    study=str(getattr(ds,'StudyInstanceUID','') or ''); series=str(getattr(ds,'SeriesInstanceUID','') or 'NO_SERIES'); sop=str(getattr(ds,'SOPInstanceUID','') or secrets.token_hex(8))
    if not study: raise ValueError('StudyInstanceUID missing')
    sd=REC/safe(study)/safe(series); sd.mkdir(parents=True,exist_ok=True); path=sd/(safe(sop)+'.dcm'); ds.save_as(str(path),write_like_original=False)
    c=db(); c.execute('INSERT OR REPLACE INTO studies VALUES(?,?,?,?,?,?,?)',(study,str(getattr(ds,'PatientID','') or ''),str(getattr(ds,'PatientName','') or ''),str(getattr(ds,'StudyDescription','') or ''),str(getattr(ds,'StudyDate','') or ''),str(getattr(ds,'Modality','') or ''),str(REC/safe(study))))
    c.execute('INSERT OR REPLACE INTO series VALUES(?,?,?,?,?,?,?)',(series,study,str(getattr(ds,'SeriesNumber','') or ''),str(getattr(ds,'SeriesDescription','') or ''),str(getattr(ds,'Modality','') or ''),str(getattr(ds,'BodyPartExamined','') or ''),str(sd))); c.commit(); c.close(); return path

def cstore(event):
    try:
        ds=event.dataset; ds.file_meta=event.file_meta; uid=str(getattr(ds,'StudyInstanceUID','') or '')
        if not uid:return 0xC210
        path=save_dicom(ds); token=link_for(uid)
        print('\n'+'='*60); print('DICOM RECEIVED'); print('Patient:',getattr(ds,'PatientName','')); print('Saved:',path); print('SECURE LINK:',public_link(token)); print('PASSWORD:',LINK_PASSWORD); print('='*60+'\n'); return 0x0000
    except Exception as e: print('C-STORE ERROR:',repr(e)); traceback.print_exc(); return 0xC210

def receiver():
    ae=AE(ae_title=AE_TITLE)
    for p in StoragePresentationContexts: ae.add_supported_context(p.abstract_syntax,p.transfer_syntax)
    print(f'DICOM Receiver: {AE_TITLE}:{DPORT}'); ae.start_server(('0.0.0.0',DPORT),evt_handlers=[(evt.EVT_C_STORE,cstore)],block=True)

def login_page(message=''):
    return Response(f"""<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><style>body{{background:#071018;color:#fff;font:16px Arial;display:grid;place-items:center;height:100vh}}form{{background:#151b22;padding:35px;border-radius:12px;width:min(420px,90vw)}}input,button{{width:100%;padding:14px;margin-top:10px;box-sizing:border-box}}button{{background:#1976d2;color:#fff;border:0}}</style><form method=post><h2>DRipACS SECURE LINK</h2><p>Protected patient study</p><p style='color:#ff7777'>{html.escape(message)}</p><input name=password type=password placeholder='Password' required autofocus><button>OPEN DICOM VIEWER</button></form>""",mimetype='text/html')

@app.route('/admin',methods=['GET','POST'])
def admin():
    if request.method=='POST':
        if not ADMIN_PASSWORD_HASH or not check_password_hash(ADMIN_PASSWORD_HASH,request.form.get('password','')): return 'Incorrect admin password',403
        session['admin']=True; return redirect('/admin')
    if not session.get('admin'): return login_page('Admin login')
    c=db(); rows=c.execute('SELECT s.*,l.token FROM studies s LEFT JOIN links l ON s.uid=l.uid AND l.enabled=1 ORDER BY s.rowid DESC').fetchall(); c.close()
    out=['<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>body{background:#090c10;color:#eee;font:14px Arial}.wrap{padding:20px;overflow:auto}table{width:100%;border-collapse:collapse}td,th{padding:10px;border:1px solid #303840}a,button{padding:8px;background:#1976d2;color:white;border:0;margin:2px;text-decoration:none;border-radius:4px}</style><div class=wrap><h2>DRipACS DICOM ADMIN</h2><table><tr><th>ID</th><th>Patient</th><th>Study</th><th>Modality</th><th>Actions</th></tr>']
    for r in rows:
        t=r['token'] or ''; u=public_link(t) if t else ''; w='https://wa.me/?text='+urllib.parse.quote(f'DICOM Study - {r["pname"] or "-"}\nViewer: {u}\nPassword: {LINK_PASSWORD}')
        out.append(f"<tr><td>{html.escape(r['pid'] or '-')}</td><td>{html.escape(r['pname'] or '-')}</td><td>{html.escape(r['description'] or '-')}</td><td>{html.escape(r['modality'] or '-')}</td><td><a href='{u}' target=_blank>OPEN VIEWER</a><button onclick=copyText('{u}')>COPY LINK</button><a href='{w}' target=_blank>WHATSAPP</a></td></tr>")
    out.append("</table></div><script>function copyText(x){navigator.clipboard.writeText(x);alert('Link copied')}</script>"); return Response(''.join(out),mimetype='text/html')

@app.route('/p/<t>',methods=['GET','POST'])
def patient(t):
    l=getlink(t)
    if not l:return 'Secure link expired or invalid.',404
    if authed(t):return redirect(f'/viewer/{t}')
    if request.method=='POST':
        if not verify_link_password(l['phash'],request.form.get('password','')):return login_page('Incorrect password'),403
        session.clear(); session['patient_token']=t; return redirect(f'/viewer/{t}')
    return login_page('')

@app.route('/viewer/<t>')
def viewer(t):
    if not getlink(t) or not authed(t):abort(403)
    p=BASE/'templates'/'viewer.html'
    if not p.is_file():return 'Viewer template missing',500
    return Response(p.read_text(encoding='utf-8').replace('__TOKEN__',t),mimetype='text/html')

def authstudy(t):
    l=getlink(t)
    if not l or not authed(t):abort(403)
    return l

@app.route('/api/study/<t>')
def study(t):
    l=authstudy(t); c=db(); r=c.execute('SELECT * FROM studies WHERE uid=?',(l['uid'],)).fetchone(); c.close(); return jsonify(dict(r)) if r else ('Study not found',404)

@app.route('/api/series/<t>')
def series_api(t):
    l=authstudy(t); c=db(); ss=c.execute('SELECT * FROM series WHERE study_uid=? ORDER BY CAST(CASE WHEN series_number=\'\' THEN \'999999\' ELSE series_number END AS INTEGER),uid',(l['uid'],)).fetchall(); c.close(); out=[]
    for s in ss:
        items=[]
        for f in Path(s['folder']).glob('*.dcm'):
            try:
                d=pydicom.dcmread(f,stop_before_pixels=True,specific_tags=['InstanceNumber','ImagePositionPatient','SliceLocation']); inst=int(getattr(d,'InstanceNumber',0) or 0); pos=getattr(d,'ImagePositionPatient',None); z=float(pos[2]) if pos and len(pos)>=3 else float(getattr(d,'SliceLocation',0) or 0); items.append({'file':f.name,'instance':inst,'z':z})
            except Exception:pass
        items.sort(key=lambda x:(x['instance'],x['z'],x['file'])); out.append({'uid':s['uid'],'number':s['series_number'] or '','description':s['description'] or '','modality':s['modality'] or '','bodyPart':s['body_part'] or '','count':len(items),'files':items})
    return jsonify(out)

@app.route('/api/dicom/<t>/<series_uid>/<name>')
def dicom(t,series_uid,name):
    l=authstudy(t); c=db(); r=c.execute('SELECT folder FROM series WHERE uid=? AND study_uid=?',(series_uid,l['uid'])).fetchone(); c.close()
    if not r:abort(404)
    f=Path(r['folder'])/safe(urllib.parse.unquote(name));
    if not f.is_file():abort(404)
    return send_file(f,mimetype='application/dicom',conditional=True)

@app.route('/api/meta/<t>/<series_uid>/<name>')
def meta(t,series_uid,name):
    l=authstudy(t); c=db(); r=c.execute('SELECT folder FROM series WHERE uid=? AND study_uid=?',(series_uid,l['uid'])).fetchone(); c.close()
    if not r:abort(404)
    f=Path(r['folder'])/safe(urllib.parse.unquote(name));
    if not f.is_file():abort(404)
    ds=pydicom.dcmread(f,stop_before_pixels=True)
    def v(k,d=None):
        try:return getattr(ds,k,d)
        except Exception:return d
    return jsonify({'rows':int(v('Rows',0) or 0),'columns':int(v('Columns',0) or 0),'pixelSpacing':[float(x) for x in (v('PixelSpacing',[]) or [])],'sliceThickness':float(v('SliceThickness',0) or 0),'windowCenter':v('WindowCenter',None),'windowWidth':v('WindowWidth',None),'rescaleSlope':float(v('RescaleSlope',1) or 1),'rescaleIntercept':float(v('RescaleIntercept',0) or 0)})

@app.route('/api/report/<t>',methods=['GET','POST'])
def report(t):
    l=authstudy(t); c=db()
    if request.method=='POST':
        d=request.get_json(silent=True) or {}; now=datetime.now(timezone.utc).isoformat(); c.execute('INSERT INTO reports(uid,findings,impression,updated) VALUES(?,?,?,?) ON CONFLICT(uid) DO UPDATE SET findings=excluded.findings,impression=excluded.impression,updated=excluded.updated',(l['uid'],str(d.get('findings','')),str(d.get('impression','')),now)); c.commit()
    r=c.execute('SELECT * FROM reports WHERE uid=?',(l['uid'],)).fetchone(); c.close(); return jsonify(dict(r) if r else {'uid':l['uid'],'findings':'','impression':''})

if __name__=='__main__':
    if not FLASK_SECRET_KEY or not ADMIN_PASSWORD_HASH or not LINK_PASSWORD: raise RuntimeError('Set FLASK_SECRET_KEY, ADMIN_PASSWORD_HASH and LINK_PASSWORD')
    init(); threading.Thread(target=receiver,daemon=True,name='dicom-receiver').start(); print(f'DRipACS WEB: http://{ip()}:{PORT}/admin | DICOM: {ip()}:{DPORT} | PUBLIC: {PUBLIC_URL or "not set"}'); app.run(host='0.0.0.0',port=PORT,debug=False,use_reloader=False)
