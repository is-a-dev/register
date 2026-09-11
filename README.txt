SECURELINK SERIES DICOM VIEWER

1. Open CMD in this folder.
2. Run: python -m pip install -r requirements.txt
3. Run: python app.py
4. Admin: http://127.0.0.1:5000/admin
5. Admin password: change-me
6. DICOM AE: SECURELINK
7. DICOM port: 11112
8. Secure-link password: siva

Features:
- Stores original DICOM files locally in received/StudyUID/SeriesUID/
- Groups images by SeriesInstanceUID
- Shows every series separately with image count and thumbnail strip
- Opens the original DICOM object in the browser viewer
- Window/Level, Pan, Zoom, Reset and Fit tools
- Previous/Next image navigation
- Patient/study information and report fields
- Per-study secure link and WhatsApp share button

IMPORTANT:
The thumbnail strip is generated from the original DICOM objects in the browser. The server does not convert the diagnostic image to a low-quality JPEG/PNG for the main viewer.
