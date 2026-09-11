from flask import Flask, request, session, redirect, abort, jsonify, Response, send_file
from pathlib import Path
from datetime import datetime, timedelta, timezone
import sqlite3, secrets, hashlib, threading, socket, urllib.parse, html
import io
import pydicom
from pynetdicom import AE, evt
from pynetdicom.presentation import StoragePresentationContexts

BASE = Path(__file__).resolve().parent
REC = BASE / "received"
DB = BASE / "secure_links.db"
PORT = 5000
DPORT = 11112
AE_TITLE = "SECURELINK"
LINK_PASSWORD = "siva"
ADMIN_PASSWORD = "change-me"
REC.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)


def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init():
    c = db()
    c.execute("""CREATE TABLE IF NOT EXISTS studies(
        uid TEXT PRIMARY KEY, pid TEXT, pname TEXT, description TEXT,
        date TEXT, modality TEXT, folder TEXT)""")
    c.execute("""CREATE TABLE IF NOT EXISTS series(
        uid TEXT PRIMARY KEY, study_uid TEXT NOT NULL, series_number TEXT,
        description TEXT, modality TEXT, body_part TEXT, folder TEXT)""")
    c.execute("""CREATE TABLE IF NOT EXISTS links(
        id INTEGER PRIMARY KEY, uid TEXT, token TEXT UNIQUE, phash TEXT,
        expires TEXT, enabled INTEGER DEFAULT 1)""")
    c.execute("""CREATE TABLE IF NOT EXISTS reports(
        uid TEXT PRIMARY KEY, findings TEXT DEFAULT '', impression TEXT DEFAULT '', updated TEXT)""")
    c.commit(); c.close()


def hp(x):
    return hashlib.sha256(x.encode()).hexdigest()


def ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        x = s.getsockname()[0]
        s.close()
        return x
    except Exception:
        return "127.0.0.1"


def safe(x):
    return "".join(c if c.isalnum() or c in "-_ ." else "_" for c in str(x)).strip().replace(" ", "_") or "UNKNOWN"


def link_for(uid):
    c = db()
    r = c.execute("SELECT * FROM links WHERE uid=? AND enabled=1 ORDER BY id DESC LIMIT 1", (uid,)).fetchone()
    if r:
        try:
            if datetime.now(timezone.utc) < datetime.fromisoformat(r["expires"]):
                c.close(); return r["token"]
        except Exception:
            pass
    t = secrets.token_urlsafe(24)
    e = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    c.execute("INSERT INTO links(uid,token,phash,expires) VALUES(?,?,?,?)", (uid, t, hp(LINK_PASSWORD), e))
    c.commit(); c.close()
    return t


def save_dicom(ds):
    study_uid = str(getattr(ds, "StudyInstanceUID", "") or "")
    series_uid = str(getattr(ds, "SeriesInstanceUID", "") or "NO_SERIES")
    sop_uid = str(getattr(ds, "SOPInstanceUID", "") or secrets.token_hex(8))
    if not study_uid:
        raise ValueError("StudyInstanceUID missing")

    study_dir = REC / safe(study_uid) / safe(series_uid)
    study_dir.mkdir(parents=True, exist_ok=True)
    path = study_dir / (safe(sop_uid) + ".dcm")
    ds.save_as(str(path), write_like_original=False)

    c = db()
    c.execute("INSERT OR REPLACE INTO studies VALUES(?,?,?,?,?,?,?)", (
        study_uid,
        str(getattr(ds, "PatientID", "UNKNOWN") or "UNKNOWN"),
        str(getattr(ds, "PatientName", "") or ""),
        str(getattr(ds, "StudyDescription", "") or ""),
        str(getattr(ds, "StudyDate", "") or ""),
        str(getattr(ds, "Modality", "") or ""),
        str(REC / safe(study_uid)),
    ))
    c.execute("INSERT OR REPLACE INTO series VALUES(?,?,?,?,?,?,?)", (
        series_uid,
        study_uid,
        str(getattr(ds, "SeriesNumber", "") or ""),
        str(getattr(ds, "SeriesDescription", "") or ""),
        str(getattr(ds, "Modality", "") or ""),
        str(getattr(ds, "BodyPartExamined", "") or ""),
        str(study_dir),
    ))
    c.commit(); c.close()
    return path


def cstore(event):
    try:
        ds = event.dataset
        ds.file_meta = event.file_meta
        uid = str(getattr(ds, "StudyInstanceUID", "") or "")
        if not uid:
            print("C-STORE ERROR: StudyInstanceUID missing")
            return 0xC210
        path = save_dicom(ds)
        token = link_for(uid)
        print("\n" + "=" * 60)
        print("DICOM RECEIVED")
        print("Patient:", str(getattr(ds, "PatientName", "") or ""))
        print("Study UID:", uid)
        print("Series UID:", str(getattr(ds, "SeriesInstanceUID", "") or ""))
        print("Saved:", path)
        print("SECURE LINK:", f"http://{ip()}:{PORT}/p/{token}")
        print("PASSWORD:", LINK_PASSWORD)
        print("=" * 60 + "\n")
        return 0x0000
    except Exception as e:
        print("C-STORE ERROR:", repr(e))
        return 0xC210


def receiver():
    ae = AE(ae_title=AE_TITLE)
    for p in StoragePresentationContexts:
        ae.add_supported_context(p.abstract_syntax, p.transfer_syntax)
    print(f"DICOM Receiver: {AE_TITLE}:{DPORT}")
    ae.start_server(("0.0.0.0", DPORT), evt_handlers=[(evt.EVT_C_STORE, cstore)], block=True)


def getlink(t):
    c = db(); r = c.execute("SELECT * FROM links WHERE token=? AND enabled=1", (t,)).fetchone(); c.close()
    if not r: return None
    try:
        if datetime.now(timezone.utc) >= datetime.fromisoformat(r["expires"]): return None
    except Exception:
        return None
    return r


def authed(t):
    return session.get("token") == t


@app.route("/", methods=["GET", "POST"])
@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST" and request.form.get("action") == "login":
        if request.form.get("password", "") != ADMIN_PASSWORD:
            return admin_page("Incorrect admin password"), 403
        session["admin"] = True
        return redirect("/admin")
    if not session.get("admin"):
        return Response("""<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'><style>body{background:#070a0e;color:#eee;font:16px Arial;display:grid;place-items:center;height:100vh}.box{background:#151b22;padding:32px;border-radius:12px;width:min(420px,90vw)}input,button{width:100%;padding:13px;margin-top:10px;box-sizing:border-box}button{background:#1976d2;color:#fff;border:0}</style></head><body><form class=box method=post><h2>SECURELINK ADMIN</h2><p>Admin login</p><input type=hidden name=action value=login><input name=password type=password placeholder='Admin password' required autofocus><button>LOGIN</button></form></body></html>""", mimetype="text/html")
    return admin_page()


def admin_page(error=""):
    c = db(); rs = c.execute("SELECT s.*,l.token FROM studies s LEFT JOIN links l ON s.uid=l.uid AND l.enabled=1 ORDER BY s.rowid DESC").fetchall(); c.close()
    rows = []
    for r in rs:
        t = r["token"] or ""
        u = f"http://{ip()}:{PORT}/p/{t}" if t else ""
        w = "https://wa.me/?text=" + urllib.parse.quote(f"DICOM Study - {r['pname'] or '-'}\nViewer: {u}\nPassword: {LINK_PASSWORD}")
        rows.append(f"<tr><td>{html.escape(r['pid'] or '-')}</td><td>{html.escape(r['pname'] or '-')}</td><td>{html.escape(r['description'] or '-')}</td><td>{html.escape(r['modality'] or '-')}</td><td><a href='{u}' target=_blank>OPEN VIEWER</a> <button onclick=copyText('{u}')>COPY LINK</button> <a href='{w}' target=_blank>WHATSAPP</a></td></tr>")
    err = f"<div class=err>{html.escape(error)}</div>" if error else ""
    page = """<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'><style>*{box-sizing:border-box}body{margin:0;background:#090c10;color:#eee;font:14px Arial}.wrap{padding:20px}table{width:100%;border-collapse:collapse;background:#12171d}td,th{padding:10px;border:1px solid #303840;text-align:left}a,button{padding:8px;background:#1976d2;color:white;border:0;margin:2px;text-decoration:none;border-radius:4px}.err{background:#6b2020;padding:10px;margin:10px 0}</style><script>function copyText(x){navigator.clipboard.writeText(x);alert('Link copied')}</script></head><body><div class=wrap><h2>SECURELINK DICOM ADMIN</h2><p>AE: SECURELINK &nbsp; Port: 11112 &nbsp; Link password: siva</p>__ERR__<table><tr><th>ID</th><th>Patient</th><th>Study</th><th>Modality</th><th>Actions</th></tr>__ROWS__</table></div></body></html>"""
    return Response(page.replace("__ERR__", err).replace("__ROWS__", "".join(rows)), mimetype="text/html")


@app.route("/p/<t>", methods=["GET", "POST"])
def patient(t):
    l = getlink(t)
    if not l: return "Secure link expired or invalid.", 404
    if request.method == "POST":
        if hp(request.form.get("password", "")) != l["phash"]:
            return login(t, "Incorrect password"), 403
        session["token"] = t
        return redirect(f"/viewer/{t}")
    if authed(t): return redirect(f"/viewer/{t}")
    return login(t, "")


def login(t, e):
    return Response(f"""<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'><style>body{{background:#071018;color:white;font:16px Arial;display:grid;place-items:center;height:100vh}}form{{background:#151b22;padding:35px;border-radius:12px;width:min(420px,90vw)}}input,button{{width:100%;padding:14px;margin-top:10px;box-sizing:border-box}}button{{background:#1976d2;color:#fff;border:0}}</style></head><body><form method=post><h2>SECURELINK DICOM</h2><p>Protected patient study</p><p style='color:#ff7777'>{html.escape(e)}</p><input name=password type=password placeholder='Password' required autofocus><button>OPEN DICOM VIEWER</button></form></body></html>""", mimetype="text/html")


@app.route("/viewer/<t>")
def viewer(t):
    if not getlink(t) or not authed(t): abort(403)
    return Response((BASE / "templates" / "viewer.html").read_text(encoding="utf-8").replace("__TOKEN__", t), mimetype="text/html")


@app.route("/api/study/<t>")
def study(t):
    l = getlink(t)
    if not l or not authed(t): abort(403)
    c = db(); r = c.execute("SELECT * FROM studies WHERE uid=?", (l["uid"],)).fetchone(); c.close()
    return jsonify(dict(r)) if r else ("Study not found", 404)


@app.route("/api/series/<t>")
def series_api(t):
    l = getlink(t)
    if not l or not authed(t): abort(403)
    c = db(); ss = c.execute("SELECT * FROM series WHERE study_uid=? ORDER BY CAST(CASE WHEN series_number='' THEN '999999' ELSE series_number END AS INTEGER), uid", (l["uid"],)).fetchall(); c.close()
    out = []
    for s in ss:
        folder = Path(s["folder"])
        items = []
        for f in folder.glob("*.dcm"):
            try:
                d = pydicom.dcmread(f, stop_before_pixels=True, specific_tags=["InstanceNumber","SOPInstanceUID","ImagePositionPatient","SliceLocation"])
                inst = int(getattr(d, "InstanceNumber", 0) or 0)
                pos = getattr(d, "ImagePositionPatient", None)
                z = float(pos[2]) if pos and len(pos) >= 3 else float(getattr(d, "SliceLocation", 0) or 0)
                items.append({"file": f.name, "instance": inst, "z": z})
            except Exception:
                pass
        items.sort(key=lambda x: (x["instance"], x["z"], x["file"]))
        out.append({"uid": s["uid"], "number": s["series_number"] or "", "description": s["description"] or "", "modality": s["modality"] or "", "bodyPart": s["body_part"] or "", "count": len(items), "files": items})
    return jsonify(out)


@app.route("/api/dicom/<t>/<series_uid>/<name>")
def dicom(t, series_uid, name):
    l = getlink(t)
    if not l or not authed(t): abort(403)
    c = db(); r = c.execute("SELECT folder FROM series WHERE uid=? AND study_uid=?", (series_uid, l["uid"])).fetchone(); c.close()
    if not r: abort(404)
    f = Path(r["folder"]) / safe(urllib.parse.unquote(name))
    if not f.is_file(): abort(404)
    return send_file(f, mimetype="application/dicom", conditional=True)


@app.route("/api/thumb/<t>/<series_uid>/<name>")
def thumb(t, series_uid, name):
    l = getlink(t)
    if not l or not authed(t): abort(403)
    c = db(); r = c.execute("SELECT folder FROM series WHERE uid=? AND study_uid=?", (series_uid, l["uid"])).fetchone(); c.close()
    if not r: abort(404)
    f = Path(r["folder"]) / safe(urllib.parse.unquote(name))
    if not f.is_file(): abort(404)
    # Return the DICOM itself; the browser viewer generates thumbnails from the original pixels.
    return send_file(f, mimetype="application/dicom", conditional=True)


@app.route("/api/report/<t>", methods=["GET", "POST"])
def report(t):
    l = getlink(t)
    if not l or not authed(t): abort(403)
    c = db()
    if request.method == "POST":
        d = request.get_json() or {}
        c.execute("INSERT OR REPLACE INTO reports VALUES(?,?,?,?)", (l["uid"], str(d.get("findings", "")), str(d.get("impression", "")), datetime.now().isoformat()))
        c.commit()
    r = c.execute("SELECT * FROM reports WHERE uid=?", (l["uid"],)).fetchone(); c.close()
    return jsonify(dict(r) if r else {"findings":"", "impression":""})


if __name__ == "__main__":
    init()
    threading.Thread(target=receiver, daemon=True).start()
    print(f"SECURELINK WEB: http://{ip()}:{PORT}/admin | DICOM: {ip()}:{DPORT} | LINK PASSWORD: {LINK_PASSWORD} | ADMIN PASSWORD: {ADMIN_PASSWORD}")
    app.run(host="0.0.0.0", port=PORT, debug=False, use_reloader=False)
