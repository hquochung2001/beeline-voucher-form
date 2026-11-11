/**
 * Beeline × Yobee — Vendor Voucher Intake (I4S team form)
 * Colours of Asia festival (Asia Oasis) · Intelligence4Start
 *
 * Bound to a Google Sheet. The I4S team enters each vendor's voucher;
 * the vendor gets an email with a "Confirm" button, and the Sheet records it.
 *
 * Two web-app deployments of this same script (see SETUP.md):
 *   TEAM link    – Execute as: Me · Access: Anyone within i4s.au  → the form
 *   CONFIRM link – Execute as: Me · Access: Anyone                → vendor confirm page only
 */

// ---------- Settings ----------
const CONFIG = {
  SHEET_NAME: 'Submissions',
  TEAM_DOMAINS: ['i4s.au'],   // Google accounts allowed to use the form
  CONFIRM_URL: '',            // paste the CONFIRM deployment URL (ends in /exec) here
  SENDER_NAME: 'Yobee · Beeline',
  REPLY_TO: '',               // e.g. 'beeline@i4s.au' — blank = replies go to the deploying account
  NOTIFY_EMAIL: '',           // optional copy of every vendor confirmation
  CAMPAIGN: 'Beeline on Yobee',
  FESTIVAL: 'Colours of Asia'
};

const HEADERS = [
  'Submission ID', 'Submitted at', 'Submitted by', 'Business name', 'Stall number', 'Voucher name',
  'Type', 'Voucher details', 'Number of vouchers', 'Contact email',
  'Status', 'Confirmed at', 'Token'
];
const COL = { ID: 1, STATUS: 11, CONFIRMED_AT: 12, TOKEN: 13 };

const TYPES = {
  physical: 'Physical voucher (for use during the festival)',
  digital: 'Digital voucher (for use after the festival)'
};

// ---------- Web app entry ----------
function doGet(e) {
  const p = (e && e.parameter) || {};
  const meta = out => out.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  if (p.action === 'confirm') {
    const t = HtmlService.createTemplateFromFile('Confirm');
    t.record = findRecord_(p.id, p.t);   // null if the link is invalid
    t.id = p.id || '';
    t.token = p.t || '';
    return meta(t.evaluate().setTitle('Confirm your voucher · Yobee Beeline'));
  }

  if (!teamUser_()) {
    return meta(HtmlService.createHtmlOutput(
      '<div style="font-family:system-ui,sans-serif;max-width:420px;margin:80px auto;padding:0 16px;color:#0B2A20">' +
      '<h2>I4S team only</h2><p>This form is for the Intelligence4Start team. ' +
      'Please open the team link while signed in with your I4S Google account.</p></div>'
    ).setTitle('Beeline · Team only'));
  }

  const t = HtmlService.createTemplateFromFile('Form');
  t.user = teamUser_();
  return meta(t.evaluate().setTitle('Beeline vendor vouchers · Yobee'));
}

// ---------- Called from Form.html ----------
function submitPromotion(form) {
  const user = teamUser_();
  if (!user) throw new Error('Only signed-in I4S team members can submit this form.');
  if (!CONFIG.CONFIRM_URL) throw new Error('Setup incomplete: CONFIRM_URL is not set in Code.gs.');

  const d = clean_(form);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let id, token;
  try {
    const sh = sheet_();
    id = 'BL-' + Utilities.formatDate(new Date(), 'Australia/Melbourne', 'yyMMdd') + '-' +
         Utilities.getUuid().slice(0, 5).toUpperCase();
    token = Utilities.getUuid().replace(/-/g, '');
    sh.appendRow([
      id, new Date(), user, d.business, d.stall, d.voucherName, TYPES[d.type],
      d.details, d.quantity, d.email, 'Pending confirmation', '', token
    ]);
  } finally {
    lock.releaseLock();
  }
  sendConfirmationEmail_(id, token, d);
  return { id: id, email: d.email };
}

// ---------- Called from Confirm.html (public) ----------
function confirmPromotion(id, token) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let rec;
  try {
    const sh = sheet_();
    const row = rowFor_(sh, id, token);
    if (!row) throw new Error('This confirmation link is not valid.');
    if (sh.getRange(row, COL.STATUS).getValue() === 'Confirmed') return { already: true };
    sh.getRange(row, COL.STATUS, 1, 2).setValues([['Confirmed', new Date()]]);
    rec = findRecord_(id, token);
  } finally {
    lock.releaseLock();
  }
  if (CONFIG.NOTIFY_EMAIL && rec) {
    MailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
      'Confirmed: ' + rec.business + ' – ' + rec.voucherName + ' (' + rec.id + ')',
      [rec.business, 'Stall ' + rec.stall, rec.voucherName, rec.type, rec.quantity + ' vouchers'].join('\n'),
      { name: CONFIG.SENDER_NAME });
  }
  return { already: false };
}

// ---------- Run once after pasting the code ----------
function setup() {
  const sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#0B2A20').setFontColor('#F6F5EB');
  sh.setFrozenRows(1);
  sh.hideColumns(COL.TOKEN);
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

function rowFor_(sh, id, token) {
  if (!id || !token) return 0;
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const ids = sh.getRange(2, COL.ID, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return sh.getRange(i + 2, COL.TOKEN).getValue() === token ? i + 2 : 0;
  }
  return 0;
}

function findRecord_(id, token) {
  const sh = sheet_();
  const row = rowFor_(sh, id, token);
  if (!row) return null;
  const v = sh.getRange(row, 1, 1, COL.CONFIRMED_AT).getValues()[0];
  return {
    id: v[0], business: v[3], stall: v[4], voucherName: v[5], type: v[6],
    details: v[7], quantity: v[8], email: v[9], status: v[10]
  };
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sendConfirmationEmail_(id, token, d) {
  const url = CONFIG.CONFIRM_URL + '?action=confirm&id=' + encodeURIComponent(id) + '&t=' + token;
  const row = (k, v) =>
    '<tr><td style="padding:8px 12px 8px 0;color:#145F47;font-size:13px;vertical-align:top;white-space:nowrap">' + k +
    '</td><td style="padding:8px 0;color:#0B2A20;font-size:14px">' + esc_(v).replace(/\n/g, '<br>') + '</td></tr>';

  const html =
    '<div style="background:#F6F5EB;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E4E2D4">' +
    '<div style="background:#0B2A20;padding:20px 24px;color:#70DDA2;font-size:13px;letter-spacing:.08em;text-transform:uppercase;font-weight:bold">' +
    CONFIG.CAMPAIGN + ' · ' + CONFIG.FESTIVAL + '</div>' +
    '<div style="padding:24px">' +
    '<h1 style="margin:0 0 8px;font-size:22px;color:#0B2A20">Please confirm your voucher</h1>' +
    '<p style="margin:0 0 16px;color:#3B4A44;font-size:14px;line-height:1.5">Hi ' + esc_(d.business) +
    ', thanks for joining Beeline! Our team has set up the voucher below for the Yobee campaign. ' +
    'Please check the details and tap <b>Confirm</b> so we can put it live.</p>' +
    '<table style="border-collapse:collapse;width:100%;margin-bottom:20px">' +
    row('Reference', id) + row('Stall', d.stall) + row('Voucher', d.voucherName) + row('Type', TYPES[d.type]) +
    row('Details', d.details) + row('Quantity', d.quantity) +
    '</table>' +
    '<a href="' + url + '" style="display:inline-block;background:#70DDA2;color:#0B2A20;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:999px">Confirm</a>' +
    '<p style="margin:20px 0 0;color:#6B7A73;font-size:12px;line-height:1.5">Anything need changing? Just reply to this email before confirming and we\'ll update it.</p>' +
    '</div></div></div>';

  const plain = 'Please confirm your Beeline voucher (' + id + '): ' + d.voucherName + ', ' + d.quantity +
    ' vouchers, stall ' + d.stall + '.\n\nConfirm here: ' + url;

  const opts = { name: CONFIG.SENDER_NAME, htmlBody: html };
  if (CONFIG.REPLY_TO) opts.replyTo = CONFIG.REPLY_TO;
  MailApp.sendEmail(d.email, 'Confirm your Beeline voucher – ' + d.voucherName, plain, opts);
}
