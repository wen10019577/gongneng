document.addEventListener('DOMContentLoaded',()=>{
const form=document.querySelector('[data-calculator]');if(!form)return;
const kind=form.dataset.calculator,result=document.getElementById('result'),error=document.getElementById('error');let last=null;
const $=id=>document.getElementById(id);
const today=new Date(),local=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
form.querySelectorAll('[data-today]').forEach(el=>el.value=local);
function clear(){result.hidden=true;error.textContent='';last=null;}
function reveal(){
if(kind==='tip'){
 const panel=$('participants'),count=Number($('people').value),old=[...panel.querySelectorAll('.person')].map(row=>[row.querySelector('[data-weight]').value,row.querySelector('[data-paid]').value]);
 panel.replaceChildren();const weighted=$('mode').value==='weighted',settle=$('settle').checked;panel.hidden=!weighted&&!settle;
 if(!Number.isInteger(count)||count<1||count>50)return;
 for(let j=0;j<count;j++){const row=document.createElement('div');row.className='person';const title=document.createElement('h3');title.textContent='第 '+(j+1)+' 人';row.append(title);
 for(const [type,label,min,max] of [['weight','权重',.01,10000],['paid','已付金额（元）',0,10000000]]){const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement('input');input.type='number';input.step='.01';input.min=min;input.max=max;input.required=true;input.dataset[type]='';input.value=old[j]?.[type==='weight'?0:1]||(type==='weight'?'1':'0');input.disabled=type==='weight'?!weighted:!settle;wrap.hidden=input.disabled;wrap.append(input);row.append(wrap);}panel.append(row);}
}
if(kind==='area-calc'){const shape=$('shape').value;const labels={rectangle:['长（米）','宽（米）'],circle:['半径（米）'],triangle:['底边（米）','垂直高度（米）'],trapezoid:['上底（米）','下底（米）','垂直高度（米）']}[shape];['a','b','c'].forEach((id,j)=>{const input=$(id),label=input.closest('label');label.querySelector('span').textContent=labels[j]||'';label.hidden=j>=labels.length;input.disabled=j>=labels.length;});}
}
function unitOptions(){const u=ReviewCalc.units[$('category').value];['from','to'].forEach((id,j)=>{$(id).replaceChildren();Object.entries(u).forEach(([key,val])=>{const option=document.createElement('option');option.value=key;option.textContent=val[0];$(id).append(option);});$(id).selectedIndex=j;});}
if(kind==='unit'){unitOptions();$('category').addEventListener('change',unitOptions);}
if(kind==='tip'){$('people').addEventListener('change',reveal);$('mode').addEventListener('change',reveal);$('settle').addEventListener('change',reveal);}
if(kind==='area-calc')$('shape').addEventListener('change',reveal);
reveal();form.addEventListener('input',clear);form.addEventListener('change',clear);
function run(e){if(e)e.preventDefault();clear();if(!form.reportValidity())return;try{
 const v=Object.fromEntries(new FormData(form));form.querySelectorAll('input[type=checkbox]').forEach(el=>v[el.id]=el.checked);
 if(kind==='tip'){v.weights=[...form.querySelectorAll('[data-weight]')].map(el=>el.value);v.paid=[...form.querySelectorAll('[data-paid]')].map(el=>el.value);}
 const rng=window.crypto?.getRandomValues?()=>window.crypto.getRandomValues(new Uint32Array(1))[0]:null;
 last=ReviewCalc.evaluate(kind,v,rng);$('answer').textContent=last.headline;const text=$('result-lines');text.replaceChildren();for(const line of last.lines){const p=document.createElement('p');p.textContent=line;text.append(p);}
 const table=$('result-table');table.replaceChildren();if(last.rows.length){const caption=document.createElement('caption');caption.textContent='计算明细';table.append(caption);const head=document.createElement('thead'),tr=document.createElement('tr');last.headers.forEach(value=>{const th=document.createElement('th');th.scope='col';th.textContent=value;tr.append(th);});head.append(tr);table.append(head);const body=document.createElement('tbody');last.rows.forEach(row=>{const tr=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});body.append(tr);});table.append(body);}
 $('download').hidden=!last.rows.length;result.hidden=false;result.focus();
}catch(e){error.textContent=e.message;}}
form.addEventListener('submit',run);
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{const data=JSON.parse(button.dataset.example);for(const [id,value] of Object.entries(data)){const el=$(id);if(!el)continue;if(el.type==='checkbox')el.checked=value;else el.value=value;}if(kind==='unit'){unitOptions();if(data.from)$('from').value=data.from;if(data.to)$('to').value=data.to;}reveal();run();}));
$('download').addEventListener('click',()=>{if(!last)return;const encode=x=>'"'+String(x).replace(/"/g,'""')+'"';const csv='\uFEFF'+[last.headers,...last.rows].map(row=>row.map(encode).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='ernzi-'+kind+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
});
