const API="https://fortnite-api.com/v2/shop?language=pt-BR";
let items=[], allRaw=[];
const $=id=>document.getElementById(id);
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function typeName(t){const x=(t||"").toLowerCase();return x.includes("outfit")?"SKIN":x.includes("emote")?"GESTO":x.includes("pickaxe")?"PICARETA":x.includes("backpack")?"MOCHILA":x.includes("glider")?"ASA-DELTA":x.includes("wrap")?"ENVOL": "ITEM"}
function normalize(data){
 const d=data?.data||data;
 let arr=d?.entries||d?.shop||[];
 if(!Array.isArray(arr)) arr=Object.values(arr||{}).flat();
 return arr.map((e,i)=>{
  const c=e.brItems?.[0]||e.items?.[0]||e;
  return {id:c.id||e.offerId||i,name:c.name||e.name||"Item",type:(c.type?.value||c.type||"").toLowerCase(),rarity:c.rarity?.displayValue||c.rarity?.value||c.rarity||"",price:e.finalPrice??e.price??c.price??0,img:c.images?.featured||c.images?.icon||e.image||"",section:e.section||e.category||""};
 }).filter(x=>x.img);
}
function card(x){
 return `<article class="card" data-id="${esc(x.id)}"><div class="pic"><img loading="lazy" src="${esc(x.img)}" alt="${esc(x.name)}"><span class="tag">${typeName(x.type)}</span></div><div class="body"><div class="name" title="${esc(x.name)}">${esc(x.name)}</div><div class="meta"><span>${esc(x.rarity||"")}</span><span class="price">◉ ${Number(x.price||0).toLocaleString("pt-BR")}</span></div></div></article>`;
}
function render(){
 const q=$("search").value.toLowerCase(), f=$("filter").value;
 const list=items.filter(x=>(!q||x.name.toLowerCase().includes(q))&&(!f||x.type.includes(f)));
 // A robust visual fallback: first ~1/3 is featured, remainder daily when API doesn't expose sections.
 const featured=list.filter(x=>/featured|destaque/i.test(x.section));
 const top=featured.length?featured:list.slice(0,Math.min(12,list.length));
 const daily=list.filter(x=>!top.includes(x));
 fill("featuredGrid",top);fill("dailyGrid",daily.slice(0,24));fill("allGrid",list);
 $("featuredCount").textContent=top.length+" itens";$("dailyCount").textContent=Math.min(24,daily.length)+" itens";$("allCount").textContent=list.length+" itens";
 document.querySelectorAll(".card").forEach(c=>c.onclick=()=>openModal(c.dataset.id));
}
function fill(id,list){$(id).innerHTML=list.length?list.map(card).join(""):'<div class="empty">Nenhum item encontrado.</div>'}
async function load(){
 $("status").textContent="● atualizando...";
 try{
  const r=await fetch(API,{cache:"no-store"});if(!r.ok)throw Error();
  const d=await r.json();items=normalize(d);
  $("status").textContent=`● ${items.length} itens`;
  $("updated").textContent="Atualizado "+new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  render();
 }catch(e){$("status").textContent="● erro ao conectar";$("allGrid").innerHTML='<div class="empty">Não foi possível carregar a loja. Verifique a conexão ou tente novamente.</div>'}
}
function openModal(id){const x=items.find(a=>String(a.id)===String(id));if(!x)return;$("modalImg").src=x.img;$("modalType").textContent=typeName(x.type);$("modalName").textContent=x.name;$("modalRarity").textContent=x.rarity||"Item da loja";$("modalPrice").textContent=`◉ ${Number(x.price||0).toLocaleString("pt-BR")} V-Bucks`;$("modal").classList.remove("hidden")}
$("close").onclick=()=>$("modal").classList.add("hidden");$("modal").onclick=e=>{if(e.target.id==="modal")$("modal").classList.add("hidden")};
$("search").oninput=render;$("filter").onchange=render;$("refresh").onclick=load;
function tick(){const n=new Date(),d=new Date(n);d.setHours(24,0,0,0);let ms=d-n;const h=String(Math.floor(ms/36e5)).padStart(2,"0"),m=String(Math.floor(ms%36e5/6e4)).padStart(2,"0"),s=String(Math.floor(ms%6e4/1e3)).padStart(2,"0");$("timer").textContent=`${h}:${m}:${s}`}
load();tick();setInterval(tick,1000);setInterval(load,5*60*1000);