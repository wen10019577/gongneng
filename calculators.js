(function (root) {
  'use strict';
  function decimal(value, label, max, places) {
    const s = String(value).trim();
    if (!new RegExp('^\\d+(?:\\.\\d{1,' + places + '})?$').test(s)) throw new Error(label + '请输入有效的非负数字，最多 ' + places + ' 位小数。');
    const n = Number(s);
    if (!Number.isFinite(n) || n > max) throw new Error(label + '超出范围。');
    return Math.round(n * 10 ** places);
  }
  function dateValue(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('请填写完整日期。');
    const [y,m,d] = s.split('-').map(Number);
    if (y < 1 || y > 9999) throw new Error('年份应为 0001 至 9999。');
    const date = new Date(0); date.setUTCFullYear(y,m-1,d); date.setUTCHours(0,0,0,0);
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m-1 || date.getUTCDate() !== d) throw new Error('日期不存在，请检查月份和天数。');
    return date.getTime();
  }
  function dateDiff(a,b,inclusive) {
    const start = dateValue(a), end = dateValue(b);
    if (end < start) throw new Error('结束日期不能早于开始日期，请调整日期顺序。');
    const days = (end-start)/86400000 + (inclusive ? 1 : 0);
    return {days, weeks:Math.floor(days/7), remainder:days%7, hours:days*24};
  }
  function discount(price, first, second, coupon) {
    const cents=decimal(price,'原价',10000000,2), a=decimal(first,'第一重折扣',10,2), b=decimal(second,'第二重折扣',10,2), off=decimal(coupon,'立减金额',10000000,2);
    const discounted=Math.round(cents*a*b/1000000);
    const final=Math.max(0,discounted-off);
    return {original:cents,discounted,final,saved:cents-final,rate:cents ? final/cents*100 : 0, clipped:off>discounted};
  }
  function split(total, tip, weights) {
    const cents=decimal(total,'账单金额',10000000,2), rate=decimal(tip,'小费比例',100,2);
    if (!Array.isArray(weights) || weights.length<1 || weights.length>100) throw new Error('人数应为 1 至 100。');
    const w=weights.map(x=>decimal(x,'分摊权重',10000,2));
    if (w.some(x=>x<=0)) throw new Error('每个人的分摊权重必须大于 0。');
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
