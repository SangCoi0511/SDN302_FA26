import axios from 'axios';

const base = 'http://localhost:9999';
const date = process.argv[2] || '2026-03-27';

const list = await axios.get(`${base}/api/field/list`);
const fields = (list.data?.data?.fields || list.data?.fields || []).slice(0, 6);

console.log('date', date);
console.log('first6', fields.map(f => ({
  id: f._id,
  name: f.fieldName,
  status: f.status,
  open: f.openingTime,
  close: f.closingTime,
  slot: f.slotDuration
})));

for (const f of fields) {
  try {
    const url = `${base}/api/customer/fields/${f._id}/availability`;
    const av = await axios.get(url, { params: { date } });
    const slots = av.data?.data?.slots || av.data?.slots || [];
    const available = slots.filter(s => s?.isAvailable).length;
    console.log('ok', f.fieldName, 'slots', slots.length, 'avail', available);
  } catch (e) {
    console.log('err', f.fieldName, e.response?.status, e.response?.data?.message || e.message);
  }
}
