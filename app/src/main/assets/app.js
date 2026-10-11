(function () {
'use strict';
const {ODUS,calcularOdu,validarDataISO}=window.AXE_DADOS;
const byId=id=>document.getElementById(id);
const key='caminhos-do-axe-consultas-v1';
const consultaForm=byId('consultaForm'),notesForm=byId('notesForm'),birth=byId('nascimento'),name=byId('nome'),section=byId('resultado');
let current=null,recordId=null,installPrompt=null,records=read();
const now=new Date();
birth.max=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
birth.min='1900-01-01';
function fmt(iso){const [y,m,d]=iso.split('-');return d+'/'+m+'/'+y;}
function clean(s,n){return String(s||'').trim().replace(/\s+/g,' ').slice(0,n);}
function el(tag,cls,str){const x=document.createElement(tag);if(cls)x.className=cls;if(str!==undefined)x.textContent=String(str);return x;}
function read(){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a.filter(r=>r&&typeof r.id==='string'&&validarDataISO(r.dataISO)).slice(0,100):[];}catch(e){return [];}}
function persist(){try{localStorage.setItem(key,JSON.stringify(records));return true;}catch(e){return false;}}
function notice(s){byId('saveMessage').textContent=s;}
function error(s){byId('formError').textContent=s;byId('formError').hidden=!s;}
function renderCatalog(q=''){
const out=byId('catalogList');out.replaceChildren();
const norm=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const items=ODUS.filter(x=>norm([x.numero,x.nome,x.orixas.join(' ')].join(' ')).includes(norm(q.trim())));
byId('catalogCount').textContent=items.length+' de 16 Odus';
if(!items.length){out.append(el('p','catalog-empty','Nenhum Odu encontrado.'));return;}
for(const item of items){
const card=el('article','catalog-entry'),hd=el('div','catalog-head');
hd.append(el('span','catalog-num',String(item.numero).padStart(2,'0')),el('h3','',item.nome));
card.append(hd,el('p','', 'Associações: '+item.orixas.join(', ')));out.append(card);
}}
function exuView(){
if(!current)return;
const x=clean(byId('exuPessoal').value,90);
byId('exuName').textContent=x||'Não identificado pela data';
byId('exuRelation').textContent=x?'Nome registrado conforme sua tradição, não calculado.':current.odu.orixas.includes('Exu')?'Exu consta como Orixá associado nesta tabela, mas isso não identifica seu Exu pessoal.':'O Exu pessoal ou guardião não pode ser identificado por esta data.';
}
function renderResult(keep){
if(!current)return;
const {odu,numero,steps,dataISO}=current;
byId('result-date').textContent=(clean(name.value,80)?clean(name.value,80)+' · ':'')+fmt(dataISO);
byId('oduNumber').textContent=String(numero).padStart(2,'0');
byId('oduName').textContent=odu.nome;
byId('oduTheme').textContent=odu.tema;
byId('orixaNames').textContent=odu.orixas.join(' · ');
byId('calcDescription').textContent='Data informada: '+fmt(dataISO)+'. Somam-se todos os algarismos e o resultado é reduzido até ficar entre 1 e 16.';
const calc=byId('calcSteps');calc.replaceChildren();
steps.forEach((step,j)=>{const line=el('div','calc-step');line.append(el('strong','',j===0?'Soma inicial: ':'Redução '+j+': '),document.createTextNode(step.terms.join(' + ')+' = '+step.total));calc.append(line);});
section.hidden=false;
if(!keep){notesForm.reset();notice('');}
exuView();
}
consultaForm.addEventListener('submit',e=>{
e.preventDefault();error('');
if(!validarDataISO(birth.value)){error('Informe uma data válida entre 01/01/1900 e hoje.');birth.focus();return;}
try{current=calcularOdu(birth.value);recordId=null;renderResult(false);section.scrollIntoView({behavior:'smooth'});}
catch(x){error(x.message||'Erro ao calcular o Odu.');}
});
consultaForm.addEventListener('reset',()=>{current=null;recordId=null;section.hidden=true;notesForm.reset();error('');notice('');});
byId('exuPessoal').addEventListener('input',exuView);
notesForm.addEventListener('submit',e=>{
e.preventDefault();if(!current)return;
const r={id:recordId||Date.now()+'-'+Math.random().toString(36).slice(2),dataISO:current.dataISO,nome:clean(name.value,80),orixaPessoal:clean(byId('orixaPessoal').value,90),exuPessoal:clean(byId('exuPessoal').value,90),observacoes:clean(byId('observacoes').value,800),updatedAt:new Date().toISOString()};
const previous=records.slice();records=[r,...records.filter(x=>x.id!==r.id)].slice(0,100);
if(persist()){recordId=r.id;notice('Consulta salva neste aparelho.');renderHistory();exuView();}
else{records=previous;notice('Não foi possível salvar no aparelho.');}
});
function renderHistory(){
const out=byId('historyList');out.replaceChildren();
byId('historyEmpty').hidden=records.length>0;byId('clearHistoryButton').hidden=!records.length;
for(const r of records){
let calc;try{calc=calcularOdu(r.dataISO);}catch(e){continue;}
const card=el('div','history-item'),info=el('div','history-meta'),acts=el('div','history-actions'),open=el('button','','Ver'),del=el('button','delete-item','Excluir');
info.append(el('strong','',r.nome||'Consulta sem nome'),el('span','',fmt(r.dataISO)+' · '+calc.odu.nome));
card.append(el('span','history-number',calc.numero),info);open.type=del.type='button';
open.addEventListener('click',()=>{current=calc;recordId=r.id;birth.value=r.dataISO;name.value=r.nome||'';byId('orixaPessoal').value=r.orixaPessoal||'';byId('exuPessoal').value=r.exuPessoal||'';byId('observacoes').value=r.observacoes||'';renderResult(true);notice('Consulta carregada do histórico.');section.scrollIntoView({behavior:'smooth'});});
del.addEventListener('click',()=>{if(!confirm('Excluir esta consulta?'))return;const prev=records.slice();records=records.filter(x=>x.id!==r.id);if(!persist()){records=prev;alert('Erro ao excluir.');}else{if(recordId===r.id)recordId=null;renderHistory();}});
acts.append(open,del);card.append(acts);out.append(card);
}}
byId('clearHistoryButton').addEventListener('click',()=>{if(!confirm('Apagar todo o histórico neste aparelho?'))return;const prev=records.slice();records=[];if(!persist()){records=prev;alert('Não foi possível apagar.');}else{recordId=null;renderHistory();}});
byId('catalogSearch').addEventListener('input',e=>renderCatalog(e.target.value));
function report(){
if(!current)return'';
const {odu,numero,steps,dataISO}=current;
return [
'CAMINHOS DO AXÉ — CONSULTA EDUCATIVA',
clean(name.value,80)?'Nome: '+clean(name.value,80):null,
'Nascimento: '+fmt(dataISO),
'Odu numerológico: '+numero+' — '+odu.nome,
'Orixás associados na tabela: '+odu.orixas.join(', '),
'Exu pessoal: não é determinado por data de nascimento.',
'Cálculo: '+steps.map(s=>s.terms.join(' + ')+' = '+s.total).join(' → '),
clean(byId('orixaPessoal').value,90)?'Orixá informado: '+clean(byId('orixaPessoal').value,90):null,
clean(byId('exuPessoal').value,90)?'Exu informado: '+clean(byId('exuPessoal').value,90):null,
'Consulta educativa. Não substitui orientação religiosa.'
].filter(Boolean).join('\n');
}
byId('copyButton').addEventListener('click',async()=>{
const value=report();if(!value)return;
try{
if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);
else{const t=el('textarea');t.value=value;document.body.append(t);t.select();if(!document.execCommand('copy'))throw Error();t.remove();}
byId('copyButton').textContent='Resultado copiado!';
}catch(e){alert('Não foi possível copiar automaticamente.');}
});
byId('printButton').addEventListener('click',()=>{if(!current)return;if(window.AndroidApp&&typeof window.AndroidApp.printPage==='function')window.AndroidApp.printPage();else window.print();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;byId('installButton').hidden=false;});
byId('installButton').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();try{await installPrompt.userChoice;}catch(e){}installPrompt=null;byId('installButton').hidden=true;});
if(!window.AndroidApp&&'serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderCatalog();renderHistory();
})();
