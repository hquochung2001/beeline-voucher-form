/**
 * Beeline × Yobee — Vendor Voucher Intake (I4S team form)
 * Colours of Asia festival (Asia Oasis) · Intelligence4Start
 *
 * Bound to a Google Sheet. Receives submissions from the standalone Form.html
 * (hosted anywhere) and saves each one as a row in the "Submissions" tab.
 *
 * Deploy as a web app: Execute as Me · Who has access: Anyone (see SETUP.md).
 * Access is protected by a team passcode stored in Script Properties as TEAM_PASSCODE.
 */

// ---------- Settings ----------
const CONFIG = {
  SHEET_NAME: 'Submissions'
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
// GET: simple health check, so opening the /exec link in a browser shows it's running.
function doGet() {
  return json_({ ok: true, service: 'Beeline voucher form', status: 'running' });
}

// POST: called by Form.html with a JSON body.
function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    checkPasscode_(body.passcode);
    const d = clean_(body);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const id = 'BL-' + Utilities.formatDate(new Date(), 'Australia/Melbourne', 'yyMMdd') + '-' +
                 Utilities.getUuid().slice(0, 5).toUpperCase();
      sheet_().appendRow([
        id, new Date(), d.submittedBy, d.business, d.stall, d.voucherName, TYPES[d.type],
        d.details, d.quantity, d.email
      ]);
      return json_({ ok: true, id: id });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err) });
  }
}

// ---------- Run once after pasting the code ----------
function setup() {
  const sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#0B2A20').setFontColor('#F6F5EB');
  sh.setFrozenRows(1);
  sh.setColumnWidth(8, 320);
  if (!PropertiesService.getScriptProperties().getProperty('TEAM_PASSCODE')) {
    Logger.log('Reminder: add a Script Property named TEAM_PASSCODE (Project Settings → Script properties).');
  }
}

// ---------- Helpers ----------
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkPasscode_(given) {
  const expected = PropertiesService.getScriptProperties().getProperty('TEAM_PASSCODE');
  if (!expected) throw new Error('The form is not set up yet: TEAM_PASSCODE is missing in Script Properties.');
  if (String(given || '') !== expected) {
    Utilities.sleep(800); // slow down guessing
    throw new Error('Wrong team passcode. Check it with the Beeline lead.');
  }
}

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

function clean_(f) {
  const s = v => String(v == null ? '' : v).trim();
  const d = {
    submittedBy: s(f.submittedBy).slice(0, 80),
    business: s(f.business).slice(0, 120), stall: s(f.stall).slice(0, 20),
    voucherName: s(f.voucherName).slice(0, 80), type: s(f.type),
    details: s(f.details).slice(0, 1500), quantity: parseInt(f.quantity, 10),
    email: s(f.email).toLowerCase().slice(0, 200)
  };
  if (!d.submittedBy) throw new Error('Enter your name.');
  if (!d.business || !d.stall || !d.voucherName || !d.details) throw new Error('Please complete every field.');
  if (!TYPES[d.type]) throw new Error('Choose a voucher type.');
  if (!(d.quantity >= 1 && d.quantity <= 100000)) throw new Error('Number of vouchers must be a whole number above 0.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new Error('Enter a valid email address.');
  ['submittedBy', 'business', 'stall', 'voucherName', 'details'].forEach(k => {   // block formula injection
    if (/^[=+\-@]/.test(d[k])) d[k] = "'" + d[k];
  });
  return d;
}
