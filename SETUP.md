# Beeline vendor voucher form — setup

An internal I4S form. Team members log each vendor's voucher, and every submission is saved as a row in a Google Sheet. Nothing is emailed to vendors.

**How it fits together**
- `apps-script/Code.gs` runs in Google Apps Script, bound to the Sheet. It receives submissions and writes rows.
- `apps-script/Form.html` is a standalone web page. Host it anywhere (a website, GitHub Pages, a shared drive link opened in a browser). It sends submissions to the Apps Script `/exec` URL set in `ENDPOINT` near the bottom of the file.
- There is no sign-in or passcode: anyone who has the form link can submit. Share the link with the team only.

## 1. Sheet + script
1. Create a Google Sheet, e.g. **"Beeline – Vendor Vouchers"**.
2. **Extensions → Apps Script** → replace `Code.gs` with `apps-script/Code.gs`. Delete any old `Form` or `Confirm` HTML files in the Apps Script project; they're no longer used there.
3. Pick `setup` → **Run** → approve permissions. This creates the header row.

## 2. Deploy (or update) the web app
- **First time:** **Deploy → New deployment → Web app** · Execute as **Me** · Who has access **Anyone** → **Deploy**. Copy the `/exec` URL into `ENDPOINT` in `Form.html`.
- **Updating an existing deployment (keeps the same URL):** **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

Access must be **Anyone**. A form hosted outside Google can't send a Google sign-in, so "Anyone within i4s.au" or "Only myself" would block every submission.

## 3. Host the form
Put `Form.html` on any web host. It's a single file with the logo embedded. Share the page link with the team.

## 4. Test
Open the `/exec` link in a browser: it should show `{"ok":true,...,"status":"running"}`. Then open the form, enter your name, submit a test voucher, and check the **Submissions** tab.

## Notes
- **Sheet columns:** Submission ID, Submitted at, Submitted by, Business name, Stall number, Voucher name, Type, Voucher details, Number of vouchers, Contact email.
- The form remembers the team member's name on each device.
- To fix a mistake, edit the row in the Sheet directly.
