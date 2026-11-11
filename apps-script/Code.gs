/**
 * Beeline × Yobee — Vendor Voucher Intake (I4S team form)
 * Colours of Asia festival (Asia Oasis) · Intelligence4Start
 *
 * Bound to a Google Sheet. The I4S team logs each vendor's voucher;
 * every submission becomes a row in the "Submissions" tab.
 *
 * Deploy once as a web app: Execute as Me · Access: Anyone within i4s.au (see SETUP.md).
 */

// ---------- Settings ----------
const CONFIG = {
  SHEET_NAME: 'Submissions',
  TEAM_DOMAINS: ['i4s.au']   // Google accounts allowed to use the form
};

const HEADERS = [
  'Submission ID', 'Submitted at', 'Submitted by', 'Business name', 'Stall number', 'Voucher name',
  'Type', 'Voucher details', 'Number of vouchers', 'Contact email'
];

const TYPES = {
  physical: 'Physical voucher (for use during the festival)',
  digital: 'Digital voucher (for use after the festival)'
};

// ---------- Web app entry ----------
function doGet() {
  const meta = out => out.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  const user = teamUser_();
  if (!user) {
    return meta(HtmlService.createHtmlOutput(
      '<div style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;padding:0 16px;color:#0B2A20">' +
      '<h2>I4S team only</h2><p>This form is for the Intelligence4Start team. ' +
      'Please open it while signed in with your I4S Google account.</p></div>'
    ).setTitle('Beeline · Team only'));
  }
  const t = HtmlService.createTemplateFromFile('Form');
  t.user = user;
  return meta(t.evaluate().setTitle('Beeline vendor vouchers · Yobee'));
}

// ---------- Called from Form.html ----------
function submitPromotion(form) {
  const user = teamUser_();
  if (!user) throw new Error('Only signed-in I4S team members can submit this form.');

  const d = clean_(form);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const id = 'BL-' + Utilities.formatDate(new Date(), 'Australia/Melbourne', 'yyMMdd') + '-' +
               Utilities.getUuid().slice(0, 5).toUpperCase();
    sheet_().appendRow([
      id, new Date(), user, d.business, d.stall, d.voucherName, TYPES[d.type],
      d.details, d.quantity, d.email
    ]);
    return { id: id };
  } finally {
    lock.releaseLock();
  }
}

// ---------- Run once after pasting the code ----------
function setup() {
  const sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#0B2A20').setFontColor('#F6F5EB');
  sh.setFrozenRows(1);
  sh.setColumnWidth(8, 320);
}

// ---------- Helpers ----------
function teamUser_() {
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const domain = email.split('@')[1] || '';
  return CONFIG.TEAM_DOMAINS.indexOf(domain) > -1 ? email : '';
}

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

function clean_(f) {
  const s = v => String(v == null ? '' : v).trim();
  const d = {
    business: s(f.business), stall: s(f.stall), voucherName: s(f.voucherName),
    type: s(f.type), details: s(f.details), quantity: parseInt(f.quantity, 10),
    email: s(f.email).toLowerCase()
  };
  if (!d.business || !d.stall || !d.voucherName || !d.details) throw new Error('Please complete every field.');
  if (!TYPES[d.type]) throw new Error('Please choose a voucher type.');
  if (!(d.quantity >= 1 && d.quantity <= 100000)) throw new Error('Number of vouchers must be a whole number above 0.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error('Please enter a valid email address.');
  ['business', 'stall', 'voucherName', 'details'].forEach(k => {   // block formula injection
    if (/^[=+\-@]/.test(d[k])) d[k] = "'" + d[k];
  });
  return d;
}
