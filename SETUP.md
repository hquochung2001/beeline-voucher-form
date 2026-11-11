# Beeline vendor voucher form — setup

An internal I4S form. Team members log each vendor's voucher, and every submission is saved as a row in a Google Sheet. Nothing is emailed to vendors.

**How it fits together**
- `apps-script/Code.gs` runs in Google Apps Script, bound to the Sheet. It receives submissions and writes rows.
- `apps-script/Form.html` is a standalone web page. Host it anywhere (a website, GitHub Pages, a shared drive link opened in a browser). It sends submissions to the Apps Script `/exec` URL set in `ENDPOINT` near the bottom of the file.
- Access is protected by a **team passcode**, stored in Apps Script (never in the code).

## 1. Sheet + script
1. Create a Google Sheet, e.g. **"Beeline – Vendor Vouchers"**.
2. **Extensions → Apps Script** → replace `Code.gs` with `apps-script/Code.gs`. Delete any old `Form` or `Confirm` HTML files in the Apps Script project; they're no longer used there.
3. **Project Settings (⚙️) → Script properties → Add script property**: name `TEAM_PASSCODE`, value = a passcode you share with the team.
4. Back in the editor, pick `setup` → **Run** → approve permissions. This creates the header row.

## 2. Deploy (or update) the web app
- **First time:** **Deploy → New deployment → Web app** · Execute as **Me** · Who has access **Anyone** → **Deploy**. Copy the `/exec` URL into `ENDPOINT` in `Form.html`.
- **Updating an existing deployment (keeps the same URL):** **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

Access must be **Anyone**. A form hosted outside Google can't send a Google sign-in, so "Anyone within i4s.au" would block every submission. The passcode protects it instead.

## 3. Host the form
Put `Form.html` on any web host. It's a single file with the logo embedded. Share the page link and the passcode with the team.

## 4. Test
Open the `/exec` link in a browser: it should show `{"ok":true,...,"status":"running"}`. Then open the form, enter your name + passcode, submit a test voucher, and check the **Submissions** tab.

## Notes
- **Sheet columns:** Submission ID, Submitted at, Submitted by, Business name, Stall number, Voucher name, Type, Voucher details, Number of vouchers, Contact email.
- **Change the passcode** any time in Script properties. It takes effect immediately; team members then re-enter it.
- The form can remember name + passcode on each device (checkbox). Untick it on shared computers.
- To fix a mistake, edit the row in the Sheet directly.
