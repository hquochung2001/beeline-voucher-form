# Beeline vendor voucher form

Internal I4S form for logging vendor promotions for the **Beeline** campaign on **Yobee** (Colours of Asia festival).
The team submits each vendor's voucher; the vendor receives an email with a **Confirm** button; everything is tracked in a Google Sheet.

- `apps-script/` — the real form (Google Apps Script, bound to a Google Sheet). Setup: see [SETUP.md](SETUP.md).
- `docs/` — a self-contained clickable test version (no emails sent, nothing saved). Hosted with GitHub Pages (Settings → Pages → `main` / `/docs`).

## Sync with Apps Script (optional)
```bash
npm install -g @google/clasp
clasp login
cd apps-script
clasp clone <SCRIPT_ID>   # creates .clasp.json; keep the files in this folder
clasp push
```
