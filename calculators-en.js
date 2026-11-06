(function (root) {
  'use strict';
  function decimal(value, label, max, places) {
    const s = String(value).trim();
    if (!new RegExp('^\\d+(?:\\.\\d{1,' + places + '})?$').test(s)) throw new Error(label + ' must be a valid non-negative number with at most ' + places + ' decimal places.');
    const n = Number(s);
    if (!Number.isFinite(n) || n > max) throw new Error(label + ' is out of range.');
    return Math.round(n * 10 ** places);
  }
  function dateValue(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Please enter a complete date.');
    const [y,m,d] = s.split('-').map(Number);
    if (y < 1 || y > 9999) throw new Error('The year must be between 0001 and 9999.');
    const date = new Date(0); date.setUTCFullYear(y,m-1,d); date.setUTCHours(0,0,0,0);
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m-1 || date.getUTCDate() !== d) throw new Error('That date does not exist; please check the month and day.');
    return date.getTime();
  }
  function dateDiff(a,b,inclusive) {
    const start = dateValue(a), end = dateValue(b);
    if (end < start) throw new Error('The end date cannot be earlier than the start date; please adjust the order of the dates.');
    const days = (end-start)/86400000 + (inclusive ? 1 : 0);
    return {days, weeks:Math.floor(days/7), remainder:days%7, hours:days*24};
  }
  function discount(price, first, second, coupon) {
    const cents=decimal(price,'Original price',10000000,2), a=decimal(first,'First discount',10,2), b=decimal(second,'Second discount',10,2), off=decimal(coupon,'Amount off',10000000,2);
    const discounted=Math.round(cents*a*b/1000000);
    const final=Math.max(0,discounted-off);
    return {original:cents,discounted,final,saved:cents-final,rate:cents ? final/cents*100 : 0, clipped:off>discounted};
  }
  function split(total, tip, weights) {
    const cents=decimal(total,'Bill amount',10000000,2), rate=decimal(tip,'Tip percentage',100,2);
    if (!Array.isArray(weights) || weights.length<1 || weights.length>100) throw new Error('The number of people must be between 1 and 100.');
    const w=weights.map(x=>decimal(x,'Split weight',10000,2));
    if (w.some(x=>x<=0)) throw new Error("Each person's split weight must be greater than 0.");
    const tipCents=Math.round(cents*rate/10000), sum=cents+tipCents, denominator=w.reduce((a,b)=>a+b,0);
    const shares=w.map(x=>Math.floor(sum*x/denominator));
    let remainder=sum-shares.reduce((a,b)=>a+b,0);
    const order=w.map((x,i)=>({i,r:(sum*x)%denominator})).sort((a,b)=>b.r-a.r || a.i-b.i);
    for (let i=0;i<remainder;i++) shares[order[i].i]++;
    return {subtotal:cents,tip:tipCents,total:sum,shares};
  }
  const api={dateDiff,discount,split};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else root.ErnziCalc=api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
