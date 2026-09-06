document.addEventListener('DOMContentLoaded', () => {
  const form=document.querySelector('[data-tool]');
  const menu=document.querySelector('.nav-toggle');
  if(menu) menu.addEventListener('click',()=>{const open=document.querySelector('.nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  if(!form)return;
  const result=document.getElementById('result'), error=document.getElementById('error');
  const value=id=>document.getElementById(id).value;
  const money=cents=>'¥'+(cents/100).toFixed(2);
  function line(text,large){const p=document.createElement('p');p.textContent=text;if(large)p.className='answer';result.appendChild(p);}
  function clear(){result.replaceChildren();result.hidden=true;error.textContent='';}
  form.addEventListener('input',clear);
  function weightFields(){
    const weighted=value('mode')==='weighted', panel=document.getElementById('weights');panel.hidden=!weighted;
    const n=Number(value('people'));
    const prior=Array.from(panel.querySelectorAll('input')).map(x=>x.value);
    panel.replaceChildren();
    if(!weighted || !Number.isInteger(n) || n<1 || n>100)return;
    for(let i=0;i<n;i++){
      const label=document.createElement('label');label.textContent='第 '+(i+1)+' 人权重';
      const input=document.createElement('input');input.type='number';input.min='0.01';input.max='10000';input.step='0.01';input.required=true;input.value=prior[i]||'1';input.id='weight-'+i;
      label.htmlFor=input.id;label.appendChild(input);panel.appendChild(label);
    }
  }
  if(form.dataset.tool==='split'){
    document.getElementById('mode').addEventListener('change',weightFields);
    document.getElementById('people').addEventListener('input',weightFields);weightFields();
  }
  form.addEventListener('submit',e=>{
    e.preventDefault();clear();
    try{
      if(form.dataset.tool==='date'){
        const inclusive=document.getElementById('inclusive').checked;
        const r=ErnziCalc.dateDiff(value('start'),value('end'),inclusive);
        line(r.days+' 天',true);line(r.weeks+' 周 '+r.remainder+' 天；按每天 24 小时换算为 '+r.hours+' 小时。');
        line(inclusive?'已将结束日期计入：起止两个日期均计数。':'按日期间隔计算：同一天为 0 天。');
      }else if(form.dataset.tool==='discount'){
        const r=ErnziCalc.discount(value('price'),value('first'),value('second'),value('coupon'));
        line('实付 '+money(r.final),true);line('折扣后 '+money(r.discounted)+'，总共节省 '+money(r.saved)+'。');
        if(r.original)line('实付占原价 '+r.rate.toFixed(2)+'%。');
        if(r.clipped)line('立减超过折后金额，实付按 0 元计，不计算返现。');
      }else{
        const n=Number(value('people'));if(!Number.isInteger(n)||n<1||n>100)throw new Error('人数应为 1 至 100 的整数。');
        const weights=value('mode')==='equal'?Array(n).fill('1'):Array.from(document.querySelectorAll('#weights input')).map(x=>x.value);
        const r=ErnziCalc.split(value('total'),value('tip'),weights);
        line('合计 '+money(r.total),true);line('账单 '+money(r.subtotal)+' + 小费 '+money(r.tip));
        const list=document.createElement('ol');list.className='shares';r.shares.forEach((s,i)=>{const li=document.createElement('li');li.textContent='第 '+(i+1)+' 人：'+money(s);list.appendChild(li);});result.appendChild(list);
        line('分摊合计与账单完全一致；不足 1 分的尾差按余数大小分配，同余数按人员顺序分配。');
      }
      result.hidden=false;
    }catch(err){error.textContent=err.message;}
  });
});
