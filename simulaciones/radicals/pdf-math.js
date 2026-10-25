/* Generador de PDF per als exàmens de radicals: maqueta les fórmules MathML de la pàgina
   (mn, mi, mo, mtext, mrow, mfrac, msup, msqrt, mroot) com a SVG, les rasteritza i les posa en un PDF (pdf-lib). */
(function(){
const FONT="'Times New Roman',Times,'Liberation Serif',serif";
const ctx=document.createElement('canvas').getContext('2d');
const tw=(s,z,it)=>{ctx.font=(it?'italic ':'')+z+'px '+FONT;return ctx.measureText(s).width;};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const T=(s,z,it)=>({w:tw(s,z,it),h:z*.72,d:z*.2,s:`<text x="0" y="0" font-size="${z}" font-family="${FONT.replace(/'/g,'&apos;')}"${it?' font-style="italic"':''} fill="#000">${esc(s)}</text>`});
const G=(b,dx,dy)=>`<g transform="translate(${dx.toFixed(2)},${dy.toFixed(2)})">${b.s}</g>`;
function row(bs,z){
  let H=0,D=0;bs.forEach(b=>{if(!b.paren){H=Math.max(H,b.h);D=Math.max(D,b.d);}});
  let x=0,s='';
  bs.forEach(b=>{
    if(b.paren){b=parenBox(b.paren,H,D,z);}
    s+=G(b,x,0);x+=b.w;H=Math.max(H,b.h);D=Math.max(D,b.d);
  });
  return {w:x,h:H||z*.72,d:D||z*.2,s};
}
function parenBox(ch,H,D,z){
  const tall=H+D>z*1.15;
  if(!tall){const t=T(ch,z);t.w+=z*.04;return t;}
  const w=z*.32,top=-H-z*.05,bot=D+z*.05,l=ch==='(';
  const x0=l?w*.85:w*.15,x1=l?w*.2:w*.8;
  return {w,h:H+z*.05,d:D+z*.05,s:`<path d="M${x0},${top} Q${x1},${(top+bot)/2} ${x0},${bot}" fill="none" stroke="#000" stroke-width="${z*.06}"/>`};
}
function sqrtBox(c,z){
  const pw=z*.55,H=c.h+z*.2,B=c.d+z*.06,ym=B-(B+H)*.4,cw=c.w+z*.12;
  const sw=z*.06;
  const s=`<path d="M0,${ym.toFixed(2)} L${(pw*.2).toFixed(2)},${(ym-z*.07).toFixed(2)} L${(pw*.55).toFixed(2)},${B.toFixed(2)} L${pw.toFixed(2)},${(-H).toFixed(2)} L${(pw+cw).toFixed(2)},${(-H).toFixed(2)}" fill="none" stroke="#000" stroke-width="${sw}" stroke-linejoin="miter"/>`+G(c,pw+z*.06,0);
  return {w:pw+cw,h:H+sw,d:B,s,ym,pw};
}
function lay(n,z){
  if(n.nodeType===3){const t=n.textContent.trim();return t?T(t,z):{w:0,h:0,d:0,s:''};}
  const k=[...n.childNodes].filter(c=>c.nodeType===1||c.textContent.trim());
  const ln=n.localName,tx=n.textContent.trim();
  switch(ln){
    case 'mn':return T(tx,z);
    case 'mi':return T(tx,z,tx.length===1);
    case 'mtext':return T(tx,z);
    case 'mo':{
      if(tx==='('||tx===')')return {paren:tx,w:0,h:0,d:0,s:''};
      const t=T(tx==='·'?'·':tx,z),p=/^[+−=×-]$/.test(tx)?z*.22:tx==='·'?z*.14:z*.05;
      return {w:t.w+2*p,h:t.h,d:t.d,s:G(t,p,0)};}
    case 'mfrac':{
      const a=lay(k[0],z*.92),b=lay(k[1],z*.92),ax=z*.28,g=z*.12,w=Math.max(a.w,b.w)+z*.2;
      const s=G(a,(w-a.w)/2,-(ax+g+a.d))+G(b,(w-b.w)/2,-ax+g+b.h)+`<line x1="0" x2="${w}" y1="${-ax}" y2="${-ax}" stroke="#000" stroke-width="${z*.05}"/>`;
      return {w,h:ax+g+a.h+a.d,d:b.h+b.d+g-ax,s};}
    case 'msup':{
      const b=lay(k[0],z),e=lay(k[1],z*.7),up=Math.max(z*.38,b.h*.55+z*.05);
      return {w:b.w+e.w+z*.03,h:Math.max(b.h,up+e.h),d:b.d,s:G(b,0,0)+G(e,b.w+z*.03,-up)};}
    case 'msqrt':return sqrtBox(row(k.map(c=>lay(c,z)),z),z);
    case 'mroot':{
      const r=sqrtBox(row([lay(k[0],z)],z),z),i=lay(k[1],z*.55),off=Math.max(0,i.w-r.pw*.3);
      return {w:r.w+off,h:Math.max(r.h,-(r.ym-z*.12)+i.h),d:r.d,s:G(r,off,0)+G(i,off+r.pw*.3-i.w,r.ym-z*.12)};}
    default:return row(k.map(c=>lay(c,z)),z);
  }
}
function svgOf(math,z){
  const b=lay(math,z),pad=3,W=Math.ceil(b.w+2*pad),Hh=Math.ceil(b.h+b.d+2*pad);
  return {W,H:Hh,b,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}"><g transform="translate(${pad},${(pad+b.h).toFixed(2)})">${b.s}</g></svg>`,base:pad+b.h};
}
function png(svg,W,H,sc){
  return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=W*sc;c.height=H*sc;const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b.arrayBuffer().then(a=>res(new Uint8Array(a))),'image/png');};im.onerror=rej;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});
}
const clean=s=>(s||'').replace(/[^\x20-\x7E\xA0-\xFF’‘“”–—…•]/g,'?').replace(/\s+/g,' ').trim();

async function buildPdf(o){
  const {PDFDocument,StandardFonts,rgb}=PDFLib;
  const pdf=await PDFDocument.create(),f=await pdf.embedFont(StandardFonts.Helvetica),fb=await pdf.embedFont(StandardFonts.HelveticaBold);
  const PW=595.28,PH=841.89,M=50,CW=PW-2*M,Z=14;
  let page,y;
  const np=()=>{page=pdf.addPage([PW,PH]);y=PH-M;};
  np();
  page.drawText(clean(o.title),{x:M,y:y-14,size:17,font:fb,color:rgb(.1,.2,.7)});y-=34;
  if(o.fields){
    [['Nom:','Grup:'],['Data:','Nota:']].forEach(r=>{r.forEach((l,i)=>{const x=M+i*CW/2;page.drawText(l,{x,y:y-10,size:10,font:f});page.drawLine({start:{x:x+34,y:y-12},end:{x:x+CW/2-14,y:y-12},thickness:.6,color:rgb(.5,.5,.5)});});y-=24;});
  }
  page.drawText(clean(o.model),{x:M,y:y-10,size:9,font:f,color:rgb(.4,.4,.4)});y-=22;
  for(const sec of o.sections){
    if(y<M+110)np();
    page.drawText(clean(sec.h),{x:M,y:y-11,size:11.5,font:fb});y-=22;
    for(const it of sec.items){
      const sv=svgOf(it.math,Z);let sc=1;if(sv.W>CW-24)sc=(CW-24)/sv.W;
      const iw=sv.W*sc,ih=sv.H*sc,tl=clean(it.t||''),tlw=f.widthOfTextAtSize(tl,10);
      const same=!tl||(24+tlw+10+iw<=CW),up=Math.max(12,sv.base*sc),down=ih-sv.base*sc;
      const need=up+down+(tl&&!same?16:0)+(o.work||8);
      if(y-need<M+16)np();
      let ix=M+24;
      if(tl&&!same){page.drawText(tl,{x:M+24,y:y-12,size:10,font:f,color:rgb(.3,.3,.3)});y-=16;}
      const by=y-up;
      page.drawText(it.label+' ',{x:M,y:by,size:10.5,font:fb});
      if(tl&&same){page.drawText(tl,{x:M+24,y:by,size:10,font:f,color:rgb(.3,.3,.3)});ix=M+24+tlw+10;}
      const im=await pdf.embedPng(await png(sv.svg,sv.W,sv.H,4));
      page.drawImage(im,{x:ix,y:by-down,width:iw,height:ih});
      y=by-down-(o.work||8);
    }
    y-=8;
  }
  const n=pdf.getPageCount();
  pdf.getPages().forEach((p,i)=>p.drawText(clean(o.model)+'  ·  pàgina '+(i+1)+' de '+n,{x:M,y:24,size:8,font:f,color:rgb(.5,.5,.5)}));
  return pdf.save();
}
function collect(sel){
  return [...document.querySelectorAll(sel+' .ex')].map(s=>({h:s.querySelector('h2').textContent,items:[...s.querySelectorAll('.it')].map(i=>({label:i.querySelector('b').textContent,t:(i.querySelector('.t')||{}).textContent,math:i.querySelector('math')}))}));
}
window.downloadPdf=async function(kind){
  const exam=kind==='exam',title=document.querySelector(exam?'#exam h1':'#sols h1').textContent;
  const bytes=await buildPdf({title,model:document.querySelector('#model1').textContent,fields:exam,work:exam?64:6,sections:collect(exam?'#exbody':'#solbody')});
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  a.download=(exam?'examen':'solucions')+'-radicals-'+document.querySelector('#model1').textContent.replace(/\D/g,'')+'.pdf';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
};
})();
