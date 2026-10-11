/* Correspondências divulgadas em uma tabela numerológica; não são consenso ritual. */
(function(root) {
  'use strict';
  const ODUS = Object.freeze([
    { numero: 1, nome: 'Okanran', orixas: ['Exu'], tema: 'Iniciativa, autonomia e movimento.' },
    { numero: 2, nome: 'Ejiokô', orixas: ['Ibejis', 'Ogum'], tema: 'Escuta, diálogo e reflexão.' },
    { numero: 3, nome: 'Eta Ogundá', orixas: ['Ogum', 'Obaluayê'], tema: 'Persistência, coragem e ação.' },
    { numero: 4, nome: 'Irosun', orixas: ['Iansã', 'Iemanjá'], tema: 'Clareza, serenidade e discernimento.' },
    { numero: 5, nome: 'Oxé', orixas: ['Oxum', 'Logun Edé'], tema: 'Sensibilidade, alegria e criatividade.' },
    { numero: 6, nome: 'Obará', orixas: ['Oxóssi', 'Xangô'], tema: 'Determinação, realização e equilíbrio.' },
    { numero: 7, nome: 'Odi', orixas: ['Omolu', 'Exu'], tema: 'Foco, firmeza e conquistas.' },
    { numero: 8, nome: 'Ejionile', orixas: ['Oxaguiã', 'Ogum', 'Xangô Airá'], tema: 'Expressão, iniciativa e senso de justiça.' },
    { numero: 9, nome: 'Osá', orixas: ['Iemanjá', 'Iansã'], tema: 'Observação, cuidado e compreensão.' },
    { numero: 10, nome: 'Ofun', orixas: ['Oxalá'], tema: 'Sensibilidade, serenidade e adaptação.' },
    { numero: 11, nome: 'Owonrin', orixas: ['Iansã', 'Ogum', 'Exu'], tema: 'Coragem, movimento e versatilidade.' },
    { numero: 12, nome: 'Ejilaxeborá', orixas: ['Xangô'], tema: 'Justiça, dedicação e responsabilidade.' },
    { numero: 13, nome: 'Eji-Ologbon', orixas: ['Nanã', 'Obaluayê'], tema: 'Memória, intuição e transformação.' },
    { numero: 14, nome: 'Iká', orixas: ['Oxumarê'], tema: 'Paciência, renovação e flexibilidade.' },
    { numero: 15, nome: 'Obeogundá', orixas: ['Ogum', 'Iemanjá', 'Omolu', 'Obá'], tema: 'Convicção, movimento e aprendizado.' },
    { numero: 16, nome: 'Alafiá', orixas: ['Oxalá', 'Orunmilá'], tema: 'Harmonia, tranquilidade e equilíbrio.' }
  ]);
  function validarDataISO(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y,m,d]=s.split('-').map(Number);
    if(y<1900||y>9999||m<1||m>12) return false;
    const dt=new Date(0); dt.setFullYear(y,m-1,d); dt.setHours(12,0,0,0);
    const now=new Date(), today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
    return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d&&s<=today;
  }
  function calcularOdu(iso) {
    if(!validarDataISO(iso)) throw new RangeError('Informe uma data de nascimento válida entre 1900 e hoje.');
    const nums=iso.replace(/\D/g,'').split('').map(Number), steps=[];
    let total=nums.reduce((a,b)=>a+b,0); steps.push({terms:nums,total});
    while(total>16) {const terms=String(total).split('').map(Number); total=terms.reduce((a,b)=>a+b,0); steps.push({terms,total});}
    return {dataISO:iso,numero:total,odu:ODUS[total-1],steps};
  }
  root.AXE_DADOS=Object.freeze({ODUS,validarDataISO,calcularOdu});
})(typeof globalThis!=='undefined'?globalThis:this);
