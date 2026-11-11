# Beeline vendor voucher form — setup (≈15 min)

An internal I4S form. Team members log each vendor's voucher; the vendor gets an email with a **Confirm** button; everything lands in one Google Sheet.

Runs on Google Apps Script under your I4S Google account, deployed **twice from the same code**:

| Link | Who opens it | Access setting |
|---|---|---|
| **Team link** | I4S team, to fill in the form | Anyone within i4s.au |
| **Confirm link** | Vendors, from their email only | Anyone |

The form only works for signed-in @i4s.au accounts, even if someone opens it from the Confirm link.

## 1. Create the Sheet + script
1. Create a Google Sheet, e.g. **"Beeline – Vendor Vouchers"**. Share it with the team if they need to see results.
2. **Extensions → Apps Script**.
3. Replace `Code.gs` with the provided `Code.gs`.
4. **+ → HTML** → name it `Form` → paste `Form.html`.
5. **+ → HTML** → name it `Confirm` → paste `Confirm.html`.
6. Save. Pick `setup` in the function dropdown → **Run** → approve permissions (Sheets + send email).

## 2. Deploy the Confirm link (vendors)
1. **Deploy → New deployment → Web app**. Description: `Confirm`.
2. Execute as **Me** · Who has access **Anyone** → **Deploy**.
3. Copy the URL (ends in `/exec`) and paste it into `CONFIRM_URL` in `CONFIG` at the top of `Code.gs`. Save.
4. **Deploy → Manage deployments → Confirm → ✏️ → Version: New version → Deploy** (so it picks up the saved code).

## 3. Deploy the Team link
1. **Deploy → New deployment → Web app**. Description: `Team form`.
2. Execute as **Me** · Who has access **Anyone within Intelligence4Start (i4s.au)** → **Deploy**.
3. Share this URL with the team (bookmark it or pin it in your team chat).

## 4. Optional settings (`CONFIG` in Code.gs)
- `REPLY_TO`: a shared inbox for vendor replies, e.g. `beeline@i4s.au`.
- `NOTIFY_EMAIL`: get an email each time a vendor confirms.
- `TEAM_DOMAINS`: add another domain if some team members use a different Google account.

After any code change: **Manage deployments → edit each deployment → New version**. The URLs stay the same.

## 5. Test
Submit using your own personal email as the contact → the Sheet shows *Pending confirmation* and *Submitted by* = you → open the email → **Confirm** → **Confirm** on the page → the row changes to *Confirmed* with a timestamp.

## How it works
- **Sheet columns:** Submission ID, Submitted at, Submitted by, Business name, Stall number, Voucher name, Type, Voucher details, Number of vouchers, Contact email, Status, Confirmed at, Token (hidden).
- Emails come from the deploying account under the sender name "Yobee · Beeline".
- Confirming takes a second click on the page, so email security scanners that auto-open links can't confirm by accident. Each link has a random token, so a vendor can only confirm their own voucher.
- To get the final campaign list, filter **Status = Confirmed**.
- If a vendor asks for changes: edit the row, or submit a corrected entry (it sends a fresh email) and delete the old row.
