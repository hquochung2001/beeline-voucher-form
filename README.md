# Beeline vendor voucher form

Internal I4S form for logging vendor promotions for the **Beeline** campaign on **Yobee** (Colours of Asia festival).
The team submits each vendor's voucher and every submission is saved as a row in a Google Sheet. No emails are sent.

- `apps-script/Code.gs` — Google Apps Script backend, bound to the Sheet (receives submissions).
- `apps-script/Form.html` — the standalone team form; host it anywhere. It posts to the Apps Script `/exec` URL.
- Setup: see [SETUP.md](SETUP.md).
- `docs/` — a self-contained clickable test version (nothing saved). Hosted with GitHub Pages (Settings → Pages → `main` / `/docs`).

## Sync with Apps Script (optional)
```bash
npm install -g @google/clasp
clasp login
cd apps-script
clasp clone <SCRIPT_ID>   # creates .clasp.json; keep the files in this folder
clasp push
```
