HH FABTECH fixes: logo, wave animation, favicons
================================================
1. Copy these into your site folder, replacing the existing files:
     favicon.ico
     assets/images/logo.webp, logo.png        (now transparent)
     assets/images/logo-footer.webp           (new, gold footer logo)
     assets/images/apple-touch-icon.png, icon-180.png, icon-192.png, icon-512.png
2. In PowerShell, from your site root (the folder containing index.html):
     node apply-fixes.mjs
   It edits 5 files, saves a .bak copy of each, and can be run twice safely.
   If a file differs from what it expects, it says SKIPPED and leaves that file alone.
3. Hard refresh the browser (Ctrl+F5). Favicons can take a while to update; close and reopen the tab if needed.
No HTML pages are replaced, so your newer pages (e.g. the header Calculator link) are not overwritten.
