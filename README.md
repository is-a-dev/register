# DRipACS Teleradiology

Local Windows DICOM receiver with a password-protected patient web viewer.

## Current secure architecture

`app_secure.py` is now the default server started by `start_server.bat`.

Flow:

1. Raster Router / modality sends DICOM to `SECURELINK:11112`.
2. The server stores DICOM under `received/<StudyUID>/<SeriesUID>/`.
3. A random 32-byte URL token is created for the study and expires after 30 days.
4. The configured `LINK_PASSWORD` is stored only as a strong password hash in SQLite.
5. The patient opens `/p/<token>` and enters the common patient-link password.
6. A signed Flask session is created only after successful authentication.
7. Viewer and every DICOM/metadata/report API verify both the token and authenticated session.
8. DICOM access is restricted to the series belonging to that study.

## Credentials and secrets

Do not commit `.env`, the SQLite database, or patient DICOM files.

Required environment variables:

- `FLASK_SECRET_KEY` — long random secret used to sign Flask sessions.
- `ADMIN_PASSWORD_HASH` — Werkzeug password hash for the admin account.
- `LINK_PASSWORD` — fixed/common patient-link password for all studies.
- `PUBLIC_URL` — public HTTPS URL used when generating links.

The repository intentionally contains placeholders in `.env.example`, not real credentials.

## Windows setup

```text
python -m pip install -r requirements.txt
python app_secure.py
```

Or double-click `start_server.bat`.

Admin: `http://127.0.0.1:5000/admin`

DICOM: `SECURELINK` on port `11112`.

## Security notes

Use HTTPS for remote patient access. Keep `FLASK_SECRET_KEY`, `ADMIN_PASSWORD_HASH`, and `LINK_PASSWORD` outside GitHub. Rotate credentials if they have ever been committed publicly. The old `app.py` is retained as a legacy backup; production startup now uses `app_secure.py`.

## Viewer

The existing `templates/viewer.html` is served after patient authentication. The viewer receives the study token through `__TOKEN__` and loads original DICOM objects through authenticated APIs.
