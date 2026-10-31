// CSV download of all leads (opens in Excel / Google Sheets).
const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT created_at, name, phone, business_type, requirement, status, note, page, source FROM leads ORDER BY created_at DESC').all();
  const header = ['Date (UTC)', 'Name', 'Phone', 'Business type', 'Requirement', 'Status', 'Note', 'Page', 'Source'];
  const rows = results.map((r) => [r.created_at, r.name, r.phone, r.business_type, r.requirement, r.status, r.note, r.page, r.source].map(csvCell).join(','));
  const csv = `﻿${[header.map(csvCell).join(','), ...rows].join('\r\n')}\r\n`;
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
