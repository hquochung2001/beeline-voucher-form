# Beeline vendor voucher form — setup (≈10 min)

An internal I4S form. Team members log each vendor's voucher, and every submission is saved as a row in a Google Sheet. Nothing is emailed to vendors.

Do all of this signed in with your **@i4s.au** Google account.

## 1. Create the Sheet + script
1. Create a Google Sheet, e.g. **"Beeline – Vendor Vouchers"**. Share it with the team if they need to see results.
2. **Extensions → Apps Script**.
3. Replace `Code.gs` with `apps-script/Code.gs`.
4. **+ → HTML** → name it `Form` → paste `apps-script/Form.html`.
5. Save. Pick `setup` in the function dropdown → **Run** → approve permissions (if you see "Google hasn't verified this app": **Advanced → Go to (project)**). This creates the header row.

## 2. Deploy
1. **Deploy → New deployment → ⚙️ → Web app**.
2. Execute as **Me** · Who has access **Anyone within Intelligence4Start (i4s.au)** → **Deploy**.
3. Copy the URL (ends in `/exec`) and share it with the team.

If "Anyone within Intelligence4Start" isn't offered, the Sheet was created on a personal Gmail account. Recreate it on your i4s.au account.

## 3. Test
Open the link, submit a test voucher, and check that a new row appears in the **Submissions** tab with your email under *Submitted by*.

## Notes
- **Sheet columns:** Submission ID, Submitted at, Submitted by, Business name, Stall number, Voucher name, Type, Voucher details, Number of vouchers, Contact email.
- Only signed-in @i4s.au accounts can open or submit the form. To allow another domain, add it to `TEAM_DOMAINS` in `Code.gs`.
- After any code change: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The link stays the same.
- To fix a mistake, edit the row in the Sheet directly.
