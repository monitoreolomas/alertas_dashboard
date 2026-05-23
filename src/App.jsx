import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VECINOS_API = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

const CGM_GEOJSON = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Ingeniero Budge"},"geometry":{"type":"Polygon","coordinates":[[[-58.4610056,-34.7053577],[-58.461048,-34.705404],[-58.461337,-34.705605],[-58.461474,-34.70584],[-58.471049,-34.715476],[-58.469986,-34.716167],[-58.469503,-34.716763],[-58.46918,-34.717555],[-58.468882,-34.718216],[-58.468333,-34.718757],[-58.467408,-34.719154],[-58.467152,-34.719734],[-58.466519,-34.720098],[-58.466293,-34.720573],[-58.466223,-34.721083],[-58.466949,-34.721578],[-58.46819,-34.722282],[-58.467838,-34.722883],[-58.467368,-34.723536],[-58.466803,-34.724126],[-58.466428,-34.724606],[-58.465618,-34.725637],[-58.464879,-34.726622],[-58.463908,-34.727342],[-58.463384,-34.727864],[-58.462947,-34.728421],[-58.462469,-34.728968],[-58.462076,-34.729393],[-58.461735,-34.730025],[-58.461382,-34.73044],[-58.46094,-34.730889],[-58.460557,-34.731589],[-58.460466,-34.731933],[-58.460373,-34.732074],[-58.460126,-34.731941],[-58.45573,-34.729741],[-58.450571,-34.727019],[-58.44655,-34.724922],[-58.444147,-34.723583],[-58.446535,-34.720601],[-58.450289,-34.715915],[-58.451869,-34.713954],[-58.455337,-34.709929],[-58.456351,-34.708729],[-58.457383,-34.707828],[-58.458158,-34.707197],[-58.458866,-34.706602],[-58.459806,-34.706079],[-58.460431,-34.705666],[-58.460993,-34.705321],[-58.4610056,-34.7053577]]]}},{"type":"Feature","properties":{"name":"Parque Barón"},"geometry":{"type":"Polygon","coordinates":[[[-58.4545316,-34.7577462],[-58.4442716,-34.7717582],[-58.4396026,-34.7781882],[-58.4384946,-34.7796862],[-58.4363085,-34.7827612],[-58.4342595,-34.7841672],[-58.4334956,-34.7844312],[-58.4324395,-34.7848152],[-58.4320715,-34.7846922],[-58.4314536,-34.7844922],[-58.4301565,-34.7840162],[-58.4274296,-34.7829812],[-58.4262025,-34.7825292],[-58.4248625,-34.7819132],[-58.4247975,-34.7809642],[-58.4247435,-34.7798442],[-58.4248375,-34.7790452],[-58.4250675,-34.7782292],[-58.4254465,-34.7775302],[-58.4266415,-34.7768222],[-58.4273806,-34.7759082],[-58.4278675,-34.7745382],[-58.4279465,-34.7741042],[-58.4281455,-34.7729772],[-58.4283085,-34.7720862],[-58.4287105,-34.7712082],[-58.4295056,-34.7697222],[-58.4298855,-34.7687662],[-58.4292426,-34.7672372],[-58.4286505,-34.7664422],[-58.4281405,-34.7656282],[-58.4285275,-34.7647422],[-58.4289005,-34.7637192],[-58.4293006,-34.7626412],[-58.4294216,-34.7624442],[-58.4308295,-34.7588662],[-58.4311596,-34.7583782],[-58.4321475,-34.7569352],[-58.4329566,-34.7559372],[-58.4334646,-34.7554792],[-58.4342755,-34.7548652],[-58.4344355,-34.7546622],[-58.4356822,-34.7552644],[-58.4364145,-34.7537462],[-58.4379765,-34.7530922],[-58.4390346,-34.7525922],[-58.4400165,-34.7521112],[-58.4405326,-34.7520762],[-58.4413806,-34.7524832],[-58.4426926,-34.7532452],[-58.4439826,-34.7538142],[-58.4443026,-34.7537682],[-58.4450386,-34.7527682],[-58.4522206,-34.7565752],[-58.4545316,-34.7577462]]]}},{"type":"Feature","properties":{"name":"Santa Catalina"},"geometry":{"type":"Polygon","coordinates":[[[-58.4841686,-34.7297412],[-58.5013503,-34.722971],[-58.4727613,-34.760736],[-58.4577923,-34.75321],[-58.4841686,-34.7297412]]]}},{"type":"Feature","properties":{"name":"Santa Marta"},"geometry":{"type":"Polygon","coordinates":[[[-58.4546175,-34.7573194],[-58.4521905,-34.7560844],[-58.4499285,-34.7548894],[-58.4467325,-34.7531964],[-58.4451585,-34.7523624],[-58.4443705,-34.7533774],[-58.4440505,-34.7533844],[-58.4425125,-34.7526864],[-58.4413735,-34.7520144],[-58.4406165,-34.7516574],[-58.4401635,-34.7516744],[-58.4394595,-34.7520084],[-58.4384055,-34.7525204],[-58.4370795,-34.7531084],[-58.4360195,-34.7535134],[-58.4345326,-34.7542284],[-58.4615355,-34.7481744],[-58.4546175,-34.7573194]]]}},{"type":"Feature","properties":{"name":"Turdera"},"geometry":{"type":"Polygon","coordinates":[[[-58.4100822,-34.7988914],[-58.3954082,-34.7909594],[-58.3959592,-34.7828934],[-58.4207902,-34.7849584],[-58.4100822,-34.7988914]]]}},{"type":"Feature","properties":{"name":"Villa Albertina"},"geometry":{"type":"Polygon","coordinates":[[[-58.47121,-34.73611],[-58.442211,-34.739975],[-58.43695,-34.73713],[-58.434832,-34.735977],[-58.444172,-34.723605],[-58.47121,-34.73611]]]}},{"type":"Feature","properties":{"name":"Villa Centenario"},"geometry":{"type":"Polygon","coordinates":[[[-58.4275063,-34.713399],[-58.4448803,-34.72265],[-58.4253063,-34.74161],[-58.4200553,-34.7232],[-58.4275063,-34.713399]]]}},{"type":"Feature","properties":{"name":"Villa Fiorito"},"geometry":{"type":"Polygon","coordinates":[[[-58.4467687,-34.6882615],[-58.4612297,-34.7055165],[-58.4448267,-34.7226995],[-58.4274557,-34.7134565],[-58.4467687,-34.6882615]]]}},{"type":"Feature","properties":{"name":"Villa Lamadrid"},"geometry":{"type":"Polygon","coordinates":[[[-58.4712833,-34.7360621],[-58.4834183,-34.7268051],[-58.4611053,-34.7308741],[-58.4712833,-34.7360621]]]}},{"type":"Feature","properties":{"name":"San José"},"geometry":{"type":"Polygon","coordinates":[[[-58.3639498,-34.749648],[-58.3777278,-34.756942],[-58.3368167,-34.754568],[-58.3639498,-34.749648]]]}},{"type":"Feature","properties":{"name":"Temperley"},"geometry":{"type":"Polygon","coordinates":[[[-58.3959237,-34.782886],[-58.3952337,-34.790769],[-58.3642357,-34.774421],[-58.3959237,-34.782886]]]}},{"type":"Feature","properties":{"name":"Llavallol"},"geometry":{"type":"Polygon","coordinates":[[[-58.444374,-34.77136],[-58.459074,-34.779015],[-58.404803,-34.804497],[-58.444374,-34.77136]]]}},{"type":"Feature","properties":{"name":"Banfield"},"geometry":{"type":"Polygon","coordinates":[[[-58.3748696,-34.7424894],[-58.4259844,-34.7381824],[-58.3636706,-34.7492424],[-58.3748696,-34.7424894]]]}},{"type":"Feature","properties":{"name":"Lomas de Zamora"},"geometry":{"type":"Polygon","coordinates":[[[-58.4123656,-34.7749541],[-58.3785716,-34.7571321],[-58.4246605,-34.7815281],[-58.4123656,-34.7749541]]]}},]};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  "Ambulancia":"#8b5cf6","Policía":"#10b981","Bomberos":"#f59e0b",
  "Sirena":"#38bdf8","Violencia de Género":"#ef4444","default":"#64748b",
};
const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function catColor(cat) { return CAT_COLORS[cat] || CAT_COLORS.default; }
function getHour(h) { if (!h) return null; return parseInt(h.split(":")[0], 10); }
function isFinde(f) {
  if (!f) return false;
  const [y, m, d] = f.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}
function fmt(n) { if(n==null)return"—"; if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return(n/1000).toFixed(1)+"k"; return n.toString(); }
function pct(a,b) { if(!b)return null; return(((a-b)/b)*100).toFixed(1); }
function groupBy(arr,key) { return arr.reduce((acc,r)=>{const k=r[key]??"Sin dato";acc[k]=(acc[k]||0)+1;return acc},{}); }
function topN(obj,n=10) { return Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n); }
function getTurno(h, finde) {
  if (h === null) return "Sin dato";
  if (finde) {
    return (h >= 6 && h < 18) ? "Mañana" : "Noche";
  }
  if (h >= 6 && h < 14) return "Mañana";
  if (h >= 14 && h < 22) return "Tarde";
  return "Noche";
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}
function firstOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:      "#0a0a12",
  bg2:     "#111120",
  card:    "#16162a",
  border:  "rgba(139,92,246,0.22)",
  accent:  "#8b5cf6",
  accent2: "#6d28d9",
  green:   "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  muted:   "#64748b",
  text:    "#e2e8f0",
  text2:   "#94a3b8",
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Sparkline({ values, color=T.accent, w=90, h=26 }) {
  if(!values||values.length<2) return null;
  const max=Math.max(...values,1), min=Math.min(...values), range=max-min||1;
  const pts=values.map((v,i)=>`${((i/(values.length-1))*w).toFixed(1)},${(h-2-((v-min)/range)*(h-4)).toFixed(1)}`).join(" ");
  const last=values[values.length-1];
  const lx=parseFloat(pts.split(" ").at(-1).split(",")[0]);
  const ly=parseFloat(pts.split(" ").at(-1).split(",")[1]);
  return (
    <svg width={w} height={h} style={{overflow:"visible",display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8"/>
      <circle cx={lx} cy={ly} r="2.5" fill={color}/>
    </svg>
  );
}

function KPI({ label, value, sub, delta, sparkValues, color=T.accent, icon }) {
  const dNum = parseFloat(delta);
  const isPos = dNum > 0, isNeg = dNum < 0;
  const deltaColor = isNeg ? T.red : isPos ? T.green : T.muted;
  const deltaIcon = isPos ? "▲" : isNeg ? "▼" : "●";
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "16px 18px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:"16px 16px 0 0"}}/>
      <div style={{fontSize:11,color:T.text2,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4,fontFamily:"'Inter',sans-serif"}}>
        {icon && <span style={{marginRight:5}}>{icon}</span>}{label}
      </div>
      <div style={{fontSize:28,fontWeight:800,color:T.text,lineHeight:1.1,marginBottom:4,fontFamily:"'Inter',sans-serif"}}>{value}</div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <div>
          {delta != null && (
            <div style={{fontSize:11,fontWeight:600,color:deltaColor,fontFamily:"'Inter',sans-serif"}}>
              {deltaIcon} {Math.abs(dNum)}% vs anterior
            </div>
          )}
          {sub && <div style={{fontSize:11,color:T.muted,marginTop:1,fontFamily:"'Inter',sans-serif"}}>{sub}</div>}
        </div>
        {sparkValues && <Sparkline values={sparkValues} color={color}/>}
      </div>
    </div>
  );
}

function Card({ title, icon, children, style={} }) {
  return (
    <div style={{background:T.card,border:`1px solid rgba(139,92,246,0.14)`,borderRadius:16,padding:"16px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",...style}}>
      <div style={{fontSize:11,fontWeight:700,color:T.text,letterSpacing:"0.05em",textTransform:"uppercase",borderBottom:`1px solid rgba(139,92,246,0.15)`,paddingBottom:8,marginBottom:12,display:"flex",alignItems:"center",gap:7,fontFamily:"'Inter',sans-serif"}}>
        {icon && <span>{icon}</span>}{title}
      </div>
      {children}
    </div>
  );
}

function HBar({ label, value, max, color, total }) {
  const pv = max>0?(value/max)*100:0;
  const pt = total>0?((value/total)*100).toFixed(1):0;
  return (
    <div style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:11,color:T.text2,fontFamily:"'Inter',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{label}</span>
        <span style={{fontSize:11,color:T.muted,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap"}}>{fmt(value)} <span style={{color:"#475569"}}>({pt}%)</span></span>
      </div>
      <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pv}%`,background:color,borderRadius:3,transition:"width 0.5s ease"}}/>
      </div>
    </div>
  );
}

function Heatmap({ matrix, rowLabels, colLabels }) {
  const max = Math.max(...matrix.flat(),1);
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:`52px repeat(${colLabels.length},1fr)`,gap:2,minWidth:400}}>
        <div/>
        {colLabels.map(l=><div key={l} style={{fontSize:8,color:T.muted,textAlign:"center",paddingBottom:3,fontFamily:"'Inter',sans-serif"}}>{l}</div>)}
        {rowLabels.map((row,ri)=>(
          <>
            <div key={`lbl-${ri}`} style={{fontSize:9,color:T.text2,display:"flex",alignItems:"center",fontFamily:"'Inter',sans-serif"}}>{row}</div>
            {colLabels.map((_,ci)=>{
              const v=matrix[ri][ci]; const intensity=v/max;
              const bg = intensity<0.01 ? "rgba(255,255,255,0.03)" : `rgba(139,92,246,${0.08+intensity*0.82})`;
              return <div key={`${ri}-${ci}`} style={{background:bg,borderRadius:2,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:intensity>0.5?"#e2e8f0":"#64748b",fontFamily:"'Inter',sans-serif",cursor:"default"}} title={`${row} ${colLabels[ci]}: ${v}`}>{v>0?v:""}</div>
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────
function FiltersPanel({ filters, setFilters, options, open, setOpen }) {
  const baseInp = {
    background:"#0d0d1f",
    border:`1px solid ${T.border}`,
    color:T.text,
    borderRadius:10,
    padding:"7px 10px",
    fontSize:12,
    fontFamily:"'Inter',sans-serif",
    outline:"none",
    width:"100%",
  };
  const dateInp = { ...baseInp, colorScheme:"dark" };
  const lbl = {fontSize:11,color:T.text2,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Inter',sans-serif",display:"block"};

  const hasActive = filters.cgm||filters.categoria||filters.tipo||filters.turno;

  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,marginBottom:20,overflow:"hidden"}}>
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",background:"transparent",border:"none",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:T.text2}}
      >
        <span style={{fontSize:12,fontWeight:600,fontFamily:"'Inter',sans-serif",letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:8}}>
          <span>⚙</span> FILTROS
          {hasActive && (
            <span style={{background:T.accent,color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700}}>activos</span>
          )}
        </span>
        <span style={{fontSize:12,color:T.muted,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
      </button>
      {open && (
        <div style={{padding:"0 18px 16px",borderTop:`1px solid rgba(139,92,246,0.1)`}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,paddingTop:14,alignItems:"end"}}>
            <div>
              <label style={lbl}>Desde</label>
              <input type="date" value={filters.fechaDesde} onChange={e=>setFilters(f=>({...f,fechaDesde:e.target.value}))} style={dateInp}/>
            </div>
            <div>
              <label style={lbl}>Hasta</label>
              <input type="date" value={filters.fechaHasta} onChange={e=>setFilters(f=>({...f,fechaHasta:e.target.value}))} style={dateInp}/>
            </div>
            <div>
              <label style={lbl}>Turno <span style={{fontSize:9,color:T.muted,fontWeight:400,letterSpacing:0,textTransform:"none",marginLeft:6}}>sem 8hs · finde 12hs</span></label>
              <select value={filters.turno} onChange={e=>setFilters(f=>({...f,turno:e.target.value}))} style={baseInp}>
                <option value="">Todos</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Categoría</label>
              <select value={filters.categoria} onChange={e=>setFilters(f=>({...f,categoria:e.target.value}))} style={baseInp}>
                <option value="">Todas</option>
                {(options.categorias||[]).map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Tipo</label>
              <select value={filters.tipo} onChange={e=>setFilters(f=>({...f,tipo:e.target.value}))} style={baseInp}>
                <option value="">Todos</option>
                {(options.tipos||[]).map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button
              onClick={()=>setFilters({fechaDesde:firstOfMonthStr(),fechaHasta:todayStr(),cgm:"",categoria:"",tipo:"",turno:""})}
              style={{background:"rgba(139,92,246,0.12)",border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,padding:"7px 14px",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600,width:"100%",height:34}}
            >
              ↺ Resetear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALERTA DISCREPANCIA ─────────────────────────────────────────────────────
const API_NOVIT = "https://apis2.novit.gpesistemas.ar/monitoreo/alertas";

function disc_getDow(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}
function disc_esFinde(fechaStr) {
  const dow = disc_getDow(fechaStr);
  return dow === 0 || dow === 6;
}
function disc_prevDay(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function disc_nextDay(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function disc_toUTC(fechaStr, horaLocal) {
  const horaUTC = horaLocal + 3;
  if (horaUTC < 24) return `${fechaStr}T${String(horaUTC).padStart(2, "0")}:00:00.000Z`;
  return `${disc_nextDay(fechaStr)}T${String(horaUTC - 24).padStart(2, "0")}:00:00.000Z`;
}

const DISC_SHIFTS = [
  { id: "TM-Hab", label: "Mañana Hábil", emoji: "🌅", rango: "06:00–14:00" },
  { id: "TT-Hab", label: "Tarde Hábil",  emoji: "🌇", rango: "14:00–22:00" },
  { id: "TN-Hab", label: "Noche Hábil",  emoji: "🌙", rango: "22:00–06:00" },
  { id: "TM-Fin", label: "Mañana Finde", emoji: "🌅", rango: "06:00–18:00" },
  { id: "TN-Fin", label: "Noche Finde",  emoji: "🌙", rango: "18:00–06:00" },
];
const DISC_TURNO_MAP = {
  "Mañana": ["TM-Hab", "TM-Fin"],
  "Tarde":  ["TT-Hab"],
  "Noche":  ["TN-Hab", "TN-Fin"],
};

function disc_shiftDeRegistro(r, desde, hasta, desdeExt) {
  if (!r.fecha || !r.horario) return null;
  const h = parseInt(r.horario.split(":")[0], 10);
  if (isNaN(h)) return null;
  if (h < 6) {
    const padre = disc_prevDay(r.fecha);
    if (padre < desde || padre > hasta) return null;
    return disc_esFinde(padre) ? "TN-Fin" : "TN-Hab";
  }
  if (r.fecha < desde || r.fecha > hasta) return null;
  if (disc_esFinde(r.fecha)) return h < 18 ? "TM-Fin" : "TN-Fin";
  if (h < 14) return "TM-Hab";
  if (h < 22) return "TT-Hab";
  return "TN-Hab";
}

function disc_contarSupa(allData, desde, hasta) {
  const c = { "TM-Hab": 0, "TT-Hab": 0, "TN-Hab": 0, "TM-Fin": 0, "TN-Fin": 0 };
  const desdeExt = disc_prevDay(desde);
  allData.forEach(r => {
    if (!r.fecha || r.fecha < desdeExt || r.fecha > hasta) return;
    const s = disc_shiftDeRegistro(r, desde, hasta, desdeExt);
    if (s) c[s]++;
  });
  return c;
}

function disc_bloquesNovit(desde, hasta) {
  const b = { "TM-Hab": [], "TT-Hab": [], "TN-Hab": [], "TM-Fin": [], "TN-Fin": [] };
  let cur = desde;
  while (cur <= hasta) {
    const sig = disc_nextDay(cur);
    if (disc_esFinde(cur)) {
      b["TM-Fin"].push([disc_toUTC(cur, 6),  disc_toUTC(cur, 18)]);
      b["TN-Fin"].push([disc_toUTC(cur, 18), disc_toUTC(sig, 6)]);
    } else {
      b["TM-Hab"].push([disc_toUTC(cur, 6),  disc_toUTC(cur, 14)]);
      b["TT-Hab"].push([disc_toUTC(cur, 14), disc_toUTC(cur, 22)]);
      b["TN-Hab"].push([disc_toUTC(cur, 22), disc_toUTC(sig, 6)]);
    }
    cur = sig;
  }
  return b;
}

async function disc_fetchNovit(token, desde, hasta) {
  const filtro = { estadoActual: "Finalizada", fechaCreacion: { $gte: desde, $lt: hasta } };
  const url = `${API_NOVIT}?limit=1000&filter=${encodeURIComponent(JSON.stringify(filtro))}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.totalCount ?? json.datos?.length ?? 0;
}

async function disc_novitPorTurno(token, bloques) {
  if (!bloques.length) return 0;
  const counts = await Promise.all(bloques.map(([d, h]) => disc_fetchNovit(token, d, h)));
  return counts.reduce((a, b) => a + b, 0);
}

function AlertaDiscrepancia({ allData, filters }) {
  const [estado, setEstado] = useState("idle");
  const [resultados, setResultados] = useState([]);
  const [ultimaCheck, setUltimaCheck] = useState(null);
  const [expandido, setExpandido] = useState(true);

  const desde = filters.fechaDesde || todayStr();
  const hasta  = filters.fechaHasta || todayStr();

  useEffect(() => {
    if (!allData.length) return;
    let cancelado = false;
    async function run() {
      const token = window._novitToken || localStorage.getItem("novit_token") || sessionStorage.getItem("novit_token");
      if (!token) { setEstado("sin_token"); return; }
      setEstado("cargando"); setResultados([]);
      const supaCounts = disc_contarSupa(allData, desde, hasta);
      const bloques = disc_bloquesNovit(desde, hasta);
      let shiftsDef = DISC_SHIFTS;
      if (filters.turno) {
        const ids = DISC_TURNO_MAP[filters.turno] || [];
        shiftsDef = shiftsDef.filter(s => ids.includes(s.id));
      }
      shiftsDef = shiftsDef.filter(s => bloques[s.id].length > 0 || supaCounts[s.id] > 0);
      try {
        const checks = await Promise.all(shiftsDef.map(async (s) => {
          const supaTotal = supaCounts[s.id];
          const blsDelTurno = bloques[s.id];
          let novit = null, errorMsg = null;
          try { novit = await disc_novitPorTurno(token, blsDelTurno); } catch (e) { errorMsg = e.message; }
          const faltantes = novit !== null ? novit - supaTotal : null;
          const discrepancia = faltantes !== null && faltantes > 0;
          return { ...s, supabase: supaTotal, novit, faltantes, discrepancia, error: errorMsg, dias: blsDelTurno.length };
        }));
        if (cancelado) return;
        setResultados(checks);
        setUltimaCheck(new Date().toLocaleTimeString("es-AR"));
        setEstado(checks.some(c => c.discrepancia) ? "alerta" : "ok");
      } catch (e) {
        if (!cancelado) setEstado("error");
      }
    }
    run();
    return () => { cancelado = true; };
  }, [allData, desde, hasta, filters.turno]);

  if (estado === "idle") return null;

  if (estado === "sin_token") return (
    <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:12,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:12}}>
      <span style={{fontSize:20,flexShrink:0}}>🔑</span>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:4,fontFamily:"'Inter',sans-serif"}}>Token de Novit no configurado</div>
        <div style={{fontSize:11,color:T.text2,lineHeight:1.6,fontFamily:"'Inter',sans-serif"}}>Abrí la consola del browser y ejecutá:</div>
        <code style={{display:"block",marginTop:6,background:"rgba(0,0,0,0.3)",padding:"6px 10px",borderRadius:6,fontSize:10,color:"#a5f3fc",lineHeight:1.8,fontFamily:"monospace"}}>
          localStorage.setItem('novit_token', 'TU_TOKEN_AQUÍ')
        </code>
        <div style={{fontSize:10,color:T.muted,marginTop:4,fontFamily:"'Inter',sans-serif"}}>Después recargá la página.</div>
      </div>
    </div>
  );

  const cargando  = estado === "cargando";
  const hayAlerta = estado === "alerta";
  const borderC   = cargando ? T.border : hayAlerta ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.35)";
  const bgC       = cargando ? "rgba(139,92,246,0.05)" : hayAlerta ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.05)";
  const icono     = cargando ? "⏳" : hayAlerta ? "🚨" : "✅";
  const periodo   = desde === hasta ? desde : `${desde} → ${hasta}`;
  const totalNovit = resultados.reduce((a, r) => a + (r.novit ?? 0), 0);
  const totalSupa  = resultados.reduce((a, r) => a + r.supabase, 0);
  const totalFalt  = resultados.filter(r => !r.error).reduce((a, r) => a + Math.max(r.faltantes ?? 0, 0), 0);
  const tituloMensaje = cargando ? "Verificando discrepancias con Novit…" : hayAlerta ? `Discrepancia detectada — ${resultados.filter(r => r.discrepancia).length} turno(s) con alertas sin cargar en Supabase` : "Sin discrepancias — Supabase coincide con Novit en todos los turnos";

  return (
    <div style={{background:bgC,border:`1px solid ${borderC}`,borderRadius:12,marginBottom:16,overflow:"hidden"}}>
      <div onClick={()=>!cargando&&setExpandido(e=>!e)} style={{padding:"12px 18px",display:"flex",alignItems:"center",gap:10,cursor:cargando?"default":"pointer"}}>
        <span style={{fontSize:18,flexShrink:0}}>{icono}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Inter',sans-serif",color:cargando?T.text2:hayAlerta?"#fca5a5":"#6ee7b7"}}>{tituloMensaje}</div>
          {ultimaCheck && (
            <div style={{fontSize:10,color:T.muted,marginTop:3,fontFamily:"'Inter',sans-serif",display:"flex",gap:14,flexWrap:"wrap"}}>
              <span>🕐 {ultimaCheck}</span>
              <span>📅 {periodo}</span>
              {filters.turno && <span>🔄 Turno: {filters.turno}</span>}
              {!cargando && resultados.length > 0 && (
                <span>Novit: <b style={{color:T.text}}>{totalNovit.toLocaleString()}</b> · Supa: <b style={{color:T.text}}>{totalSupa.toLocaleString()}</b>{totalFalt>0&&<b style={{color:T.red}}> · ⚠ Faltantes: {totalFalt.toLocaleString()}</b>}</span>
              )}
            </div>
          )}
        </div>
        {!cargando && resultados.length > 0 && <span style={{fontSize:11,color:T.muted,flexShrink:0,transform:expandido?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>}
      </div>
      {!cargando && expandido && resultados.length > 0 && (
        <div style={{borderTop:`1px solid ${borderC}`,padding:"12px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(195px, 1fr))",gap:10}}>
          {resultados.map(r => {
            const ok = !r.discrepancia && !r.error;
            const color = r.error ? T.amber : ok ? T.green : T.red;
            const bg = r.error ? "rgba(245,158,11,0.07)" : ok ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)";
            return (
              <div key={r.id} style={{background:bg,border:`1px solid ${color}33`,borderRadius:10,padding:"10px 14px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color,fontFamily:"'Inter',sans-serif"}}>{r.emoji} {r.label}</span>
                  <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,fontWeight:600,fontFamily:"'Inter',sans-serif",background:r.error?"rgba(245,158,11,0.15)":ok?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.15)",color:r.error?T.amber:ok?T.green:T.red}}>{r.error?"ERROR":ok?"OK":"FALTANTES"}</span>
                </div>
                <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,color:T.muted,fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:5}}>{r.rango}</span>
                  <span style={{fontSize:9,color:T.muted,fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:5}}>{r.dias} {r.dias===1?"día":"días"}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                  {[["Novit (esperado)", r.novit!==null?r.novit.toLocaleString():"—", T.text],["Supabase (cargado)", r.supabase.toLocaleString(), r.discrepancia?T.red:T.text]].map(([lbl,val,col])=>(
                    <div key={lbl} style={{background:"rgba(0,0,0,0.22)",borderRadius:7,padding:"6px 9px"}}>
                      <div style={{fontSize:8,color:T.muted,fontFamily:"'Inter',sans-serif",marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{lbl}</div>
                      <div style={{fontSize:18,fontWeight:800,color:col,fontFamily:"'Inter',sans-serif",lineHeight:1}}>{val}</div>
                    </div>
                  ))}
                </div>
                {r.discrepancia && r.faltantes > 0 && (
                  <div style={{marginTop:7,padding:"5px 9px",background:"rgba(239,68,68,0.12)",borderRadius:7,fontSize:11,color:"#fca5a5",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                    ⚠ {r.faltantes.toLocaleString()} alertas sin cargar
                  </div>
                )}
                {r.error && <div style={{marginTop:6,fontSize:10,color:T.amber,fontFamily:"'Inter',sans-serif"}}>Error: {r.error}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── VISTA EJECUTIVO ──────────────────────────────────────────────────────────
function ViewEjecutivo({ data, prevData }) {
  const total=data.length, totalPrev=prevData.length;
  const byDay=useMemo(()=>{const c={};data.forEach(r=>{c[r.fecha]=(c[r.fecha]||0)+1});return Object.entries(c).sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v)},[data]);
  const byCat=useMemo(()=>groupBy(data,"categoria"),[data]);
  const topCats=topN(byCat,15); const catMax=Math.max(...topCats.map(([,v])=>v),1);
  const bySistema=data.filter(r=>r.tipo==="Sistema").length, byBot=data.filter(r=>r.tipo==="Botmarket").length;
  const byHour=useMemo(()=>{const h=Array(24).fill(0);data.forEach(r=>{const hh=getHour(r.horario);if(hh!==null)h[hh]++});return h},[data]);
  const horaPico=byHour.indexOf(Math.max(...byHour));
  const byTurno=useMemo(()=>{const t={Mañana:0,Tarde:0,Noche:0};data.forEach(r=>{const h=getHour(r.horario);const tn=getTurno(h,isFinde(r.fecha));t[tn]=(t[tn]||0)+1});return t},[data]);
  const turnoMax=Object.entries(byTurno).sort((a,b)=>b[1]-a[1])[0];
  const byDow=useMemo(()=>{const d=Array(7).fill(0);data.forEach(r=>{if(r.fecha)d[new Date(r.fecha+"T00:00:00").getDay()]++});return d},[data]);
  const dowMax=byDow.indexOf(Math.max(...byDow));
  const uniqueDays=new Set(data.map(r=>r.fecha)).size;
  const promDiario=uniqueDays>0?(total/uniqueDays).toFixed(1):"—";
  const finde=data.filter(r=>isFinde(r.fecha)).length, semana=total-finde;
  const kc=[T.accent,T.green,T.amber,T.red,"#38bdf8","#f472b6"];

  const byDayEntries=useMemo(()=>{const c={};data.forEach(r=>{if(r.fecha)c[r.fecha]=(c[r.fecha]||0)+1});return Object.entries(c).sort((a,b)=>a[0].localeCompare(b[0]))},[data]);
  const dailyVals=byDayEntries.map(([,v])=>v);
  const dailyMax=Math.max(...dailyVals,1);
  const W=800,H=110,PAD=8;
  const pts=dailyVals.map((v,i)=>[PAD+(i/(dailyVals.length-1||1))*(W-PAD*2), H-PAD-((v/dailyMax)*(H-PAD*2))]);
  const polyline=pts.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area=`${PAD},${H} ${polyline} ${W-PAD},${H}`;
  const step=Math.max(1,Math.floor(dailyVals.length/7));

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12,marginBottom:20}}>
        <KPI label="Total Alertas" value={fmt(total)} sub={`${uniqueDays} días con registros`} delta={pct(total,totalPrev)} sparkValues={byDay.slice(-14)} color={T.accent} icon="📡"/>
        <KPI label="Promedio Diario" value={promDiario} sub="alertas por día activo" color="#38bdf8" icon="📊"/>
        <KPI label="Hora Pico" value={`${String(horaPico).padStart(2,"0")}:00`} sub={`${byHour[horaPico]} alertas`} color={T.amber} icon="⏰"/>
        <KPI label="Turno Líder" value={turnoMax?.[0]||"—"} sub={`${fmt(turnoMax?.[1])} · ${total>0?((turnoMax?.[1]/total)*100).toFixed(0):0}%`} color={T.green} icon="🔄"/>
        <KPI label="Día Más Activo" value={DIAS[dowMax]} sub={`${fmt(byDow[dowMax])} alertas`} color="#f472b6" icon="📅"/>
        <KPI label="Finde vs Hábil" value={`${total>0?((finde/total)*100).toFixed(0):0}% finde`} sub={`${fmt(finde)} finde · ${fmt(semana)} hábil`} color={T.red} icon="🗓"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Distribución por Categoría" icon="📂">
          {topCats.map(([cat,val])=><HBar key={cat} label={cat} value={val} max={catMax} color={catColor(cat)} total={total}/>)}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card title="Origen" icon="🔌" style={{flex:1}}>
            {[["Sistema",bySistema,T.accent],["Botmarket",byBot,T.amber]].map(([t,v,c])=><HBar key={t} label={t} value={v} max={Math.max(bySistema,byBot,1)} color={c} total={total}/>)}
          </Card>
          <Card title="Por Turno" icon="🌙" style={{flex:1}}>
            {Object.entries(byTurno).map(([t,v],i)=><HBar key={t} label={t} value={v} max={Math.max(...Object.values(byTurno),1)} color={kc[i]} total={total}/>)}
          </Card>
        </div>
      </div>
      <Card title="Evolución Diaria" icon="📈">
        {dailyVals.length<2?<div style={{color:T.muted,fontSize:11}}>Sin datos</div>:(
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:110}}>
            <defs>
              <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.18"/>
                <stop offset="100%" stopColor={T.accent} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polygon points={area} fill="url(#evGrad)"/>
            <polyline points={polyline} fill="none" stroke={T.accent} strokeWidth="2" strokeLinejoin="round"/>
            {pts.filter((_,i)=>i%step===0).map(([x,y],i)=>{
              const idx=i*step; const [fecha]=byDayEntries[idx]; const d=new Date(fecha+"T00:00:00");
              return <g key={i}><circle cx={x} cy={y} r="2.5" fill={T.accent} opacity="0.8"/><text x={x} y={H-1} textAnchor="middle" fontSize="8" fill={T.muted} fontFamily="Inter">{DIAS[d.getDay()]} {d.getDate()}</text></g>;
            })}
          </svg>
        )}
      </Card>
    </div>
  );
}

// ─── VISTA TEMPORAL ───────────────────────────────────────────────────────────
function ViewTemporal({ data }) {
  const heatmap=useMemo(()=>{const m=Array.from({length:7},()=>Array(24).fill(0));data.forEach(r=>{const h=getHour(r.horario);if(h===null||!r.fecha)return;m[new Date(r.fecha+"T00:00:00").getDay()][h]++});return m},[data]);
  const catFindeVsSem=useMemo(()=>{
    const d={};
    data.forEach(r=>{const cat=r.categoria||"Sin dato";if(!d[cat])d[cat]={sem:0,fin:0};if(isFinde(r.fecha))d[cat].fin++;else d[cat].sem++;});
    return Object.entries(d).sort((a,b)=>(b[1].sem+b[1].fin)-(a[1].sem+a[1].fin)).slice(0,8);
  },[data]);
  const colHours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
  return (
    <div>
      <Card title="Heatmap · Día de Semana × Hora" icon="🌡️" style={{marginBottom:14}}>
        <div style={{fontSize:10,color:T.muted,marginBottom:12,fontFamily:"'Inter',sans-serif"}}>Mayor intensidad = más alertas en ese cruce horario</div>
        <Heatmap matrix={heatmap} rowLabels={DIAS} colLabels={colHours}/>
      </Card>
      <Card title="Semana Hábil vs. Fin de Semana · Por Categoría" icon="📅">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {catFindeVsSem.map(([cat,{sem,fin}])=>{
            const tot=sem+fin; const pf=tot>0?((fin/tot)*100).toFixed(0):0; const c=catColor(cat);
            return (
              <div key={cat} style={{background:"rgba(0,0,0,0.25)",border:`1px solid rgba(139,92,246,0.1)`,borderRadius:10,padding:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:2,background:c,flexShrink:0}}/>
                  <span style={{fontSize:11,color:T.text2,fontFamily:"'Inter',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat}</span>
                </div>
                <div style={{display:"flex",height:5,borderRadius:3,overflow:"hidden",marginBottom:7}}>
                  <div style={{width:`${100-pf}%`,background:c}}/><div style={{width:`${pf}%`,background:`${c}44`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif"}}>
                  <span>Hábil: {fmt(sem)}</span><span>Finde: {fmt(fin)} ({pf}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── VISTA CGM ────────────────────────────────────────────────────────────────
function ViewCGM({ data }) {
  const byCgm=useMemo(()=>groupBy(data,"cgm"),[data]);
  const topCgms=topN(byCgm,15); const cgmMax=Math.max(...topCgms.map(([,v])=>v),1);
  const cgmCatPrincipal=useMemo(()=>{const d={};data.forEach(r=>{const g=r.cgm||"Sin dato",c=r.categoria||"Sin dato";if(!d[g])d[g]={};d[g][c]=(d[g][c]||0)+1});const res={};Object.entries(d).forEach(([g,cats])=>{res[g]=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]});return res},[data]);
  const cgmHoraPico=useMemo(()=>{const d={};data.forEach(r=>{const g=r.cgm||"Sin dato",h=getHour(r.horario);if(h===null)return;if(!d[g])d[g]=Array(24).fill(0);d[g][h]++});const res={};Object.entries(d).forEach(([g,hrs])=>{res[g]=hrs.indexOf(Math.max(...hrs))});return res},[data]);
  const cgmPromDiario=useMemo(()=>{const bd={};data.forEach(r=>{if(!r.cgm||!r.fecha)return;bd[`${r.cgm}|${r.fecha}`]=true});const dias={};Object.keys(bd).forEach(k=>{const[g]=k.split("|");dias[g]=(dias[g]||0)+1});const res={};Object.entries(byCgm).forEach(([g,tot])=>{res[g]=dias[g]?(tot/dias[g]).toFixed(1):tot});return res},[data,byCgm]);
  const cgmCatDist=useMemo(()=>{const d={};data.forEach(r=>{const g=r.cgm||"Sin dato",c=r.categoria||"Sin dato";if(!d[g])d[g]={};d[g][c]=(d[g][c]||0)+1});return d},[data]);
  const total=data.length;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Ranking de Zonas · Top 15" icon="🏘️">
          {topCgms.map(([cgm,val],i)=><HBar key={cgm} label={`${String(i+1).padStart(2,"0")}. ${cgm}`} value={val} max={cgmMax} color={T.accent} total={total}/>)}
        </Card>
        <Card title="Detalle por Zona" icon="📋">
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'Inter',sans-serif"}}>
              <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["Zona","Total","Pr/día","Principal","H.Pico"].map(h=><th key={h} style={{textAlign:"left",padding:"4px 6px",color:T.muted,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {topCgms.map(([cgm,val])=>{
                  const[catMain]=cgmCatPrincipal[cgm]||["—"]; const c=catColor(catMain);
                  return <tr key={cgm} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                    <td style={{padding:"5px 6px",color:T.text2,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cgm}</td>
                    <td style={{padding:"5px 6px",color:T.accent,fontWeight:600}}>{fmt(val)}</td>
                    <td style={{padding:"5px 6px",color:T.muted}}>{cgmPromDiario[cgm]}</td>
                    <td style={{padding:"5px 6px"}}><span style={{background:`${c}22`,color:c,borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:600}}>{catMain}</span></td>
                    <td style={{padding:"5px 6px",color:T.amber}}>{cgmHoraPico[cgm]!==undefined?`${String(cgmHoraPico[cgm]).padStart(2,"0")}:00`:"—"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card title="Composición por Categoría · Top 10 Zonas" icon="📊">
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {topCgms.slice(0,10).map(([cgm,tot])=>{
            const sorted=Object.entries(cgmCatDist[cgm]||{}).sort((a,b)=>b[1]-a[1]);
            return <div key={cgm} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:10,color:T.text2,width:110,flexShrink:0,fontFamily:"'Inter',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cgm}</span>
              <div style={{flex:1,height:12,borderRadius:3,overflow:"hidden",display:"flex",gap:1}}>
                {sorted.map(([cat,val])=><div key={cat} style={{flex:val,background:catColor(cat)}} title={`${cat}: ${val}`}/>)}
              </div>
              <span style={{fontSize:9,color:T.muted,width:36,textAlign:"right",fontFamily:"'Inter',sans-serif"}}>{fmt(tot)}</span>
            </div>;
          })}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:14}}>
          {Object.entries(CAT_COLORS).filter(([k])=>k!=="default").map(([cat,c])=>(
            <div key={cat} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:2,background:c}}/><span style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif"}}>{cat}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── VISTA MAPA ───────────────────────────────────────────────────────────────
function ViewMapa({ data, filters, setFilters }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layersRef = useRef({});
  const countsByCgm = useMemo(() => groupBy(data, "cgm"), [data]);
  const maxCount = Math.max(...Object.values(countsByCgm), 1);

  function getZoneColor(count) {
    if (!count) return { fill: "rgba(139,92,246,0.08)", opacity: 0.7 };
    const t = count / maxCount;
    if (t < 0.25) return { fill: `rgba(109,40,217,${0.2+t*1.2})`, opacity: 0.85 };
    if (t < 0.5)  return { fill: `rgba(139,92,246,${0.3+t*0.8})`, opacity: 0.88 };
    if (t < 0.75) return { fill: `rgba(245,158,11,${0.4+t*0.6})`, opacity: 0.9 };
    return { fill: `rgba(239,68,68,${0.5+t*0.5})`, opacity: 0.92 };
  }

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    if (!L) return;
    const map = L.map(mapRef.current, { center: [-34.762, -58.42], zoom: 12, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { className: "cgm-dark-tiles" }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    leafletMapRef.current = map;
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = leafletMapRef.current;
    if (!L || !map) return;
    Object.values(layersRef.current).forEach(l => map.removeLayer(l));
    layersRef.current = {};
    CGM_GEOJSON.features.forEach(feature => {
      const name = feature.properties.name;
      const count = countsByCgm[name] || 0;
      const { fill, opacity } = getZoneColor(count);
      const layer = L.geoJSON(feature, {
        style: { fillColor: fill, fillOpacity: opacity, color: "rgba(139,92,246,0.4)", weight: 1.5, opacity: 0.9 }
      });
      layer.on("mouseover", function() { this.setStyle({ color: "#8b5cf6", weight: 2.5, fillOpacity: Math.min(opacity+0.1,1) }); });
      layer.on("mouseout", function() { this.setStyle({ fillColor: fill, fillOpacity: opacity, color: "rgba(139,92,246,0.4)", weight: 1.5 }); });
      layer.on("click", function() { setFilters(f=>({...f, cgm: name })); });
      const center = layer.getBounds().getCenter();
      const total = Object.values(countsByCgm).reduce((a,b)=>a+b,0);
      const pctVal = count>0?((count/total)*100).toFixed(1):"0";
      const label = L.divIcon({
        className: "",
        html: `<div style="font-family:Inter,sans-serif;font-size:10px;color:#e2e8f0;text-align:center;white-space:nowrap;text-shadow:0 1px 3px #000;pointer-events:none;"><div style="font-size:11px;font-weight:700;letter-spacing:0.03em">${name}</div><div style="font-size:9px;color:#94a3b8;">${count>0?fmt(count)+" ("+pctVal+"%)":"sin datos"}</div></div>`,
        iconAnchor: [0,0],
      });
      const marker = L.marker(center, { icon: label, interactive: false });
      layer.addTo(map);
      marker.addTo(map);
      layersRef.current[name] = layer;
      layersRef.current[name+"_label"] = marker;
    });
  }, [countsByCgm]);

  const sortedZones = useMemo(() => Object.entries(countsByCgm).sort((a,b)=>b[1]-a[1]), [countsByCgm]);
  const total = data.length;

  return (
    <div style={{display:"flex",gap:14,height:"calc(100vh - 240px)",minHeight:500}}>
      <div style={{flex:1,position:"relative",borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`}}>
        <style>{`.cgm-dark-tiles{filter:brightness(0.25) saturate(0.2) hue-rotate(220deg)}`}</style>
        <div ref={mapRef} style={{width:"100%",height:"100%"}}/>
        <div style={{position:"absolute",bottom:40,left:12,background:"rgba(10,10,18,0.93)",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",zIndex:999}}>
          <div style={{fontSize:9,color:T.muted,letterSpacing:"0.12em",marginBottom:7,fontFamily:"'Inter',sans-serif",fontWeight:600,textTransform:"uppercase"}}>Intensidad</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:9,color:T.muted}}>0</span>
            <div style={{width:100,height:7,borderRadius:3,background:`linear-gradient(90deg,rgba(109,40,217,0.3),${T.accent},${T.amber},${T.red})`}}/>
            <span style={{fontSize:9,color:T.muted}}>{fmt(maxCount)}</span>
          </div>
          {filters.cgm && (
            <button onClick={()=>setFilters(f=>({...f,cgm:""}))} style={{marginTop:8,width:"100%",background:`rgba(139,92,246,0.15)`,border:`1px solid ${T.border}`,color:T.text2,borderRadius:6,padding:"3px 0",fontSize:9,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600}}>
              ✕ Quitar filtro
            </button>
          )}
        </div>
      </div>
      <div style={{width:216,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${T.border}`,fontSize:9,color:T.muted,letterSpacing:"0.12em",fontFamily:"'Inter',sans-serif",fontWeight:600,textTransform:"uppercase"}}>
          Ranking · {sortedZones.length} zonas
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
          {sortedZones.map(([zone,count],i)=>{
            const pctVal=total>0?((count/total)*100):0;
            const isActive=filters.cgm===zone;
            return (
              <div key={zone} onClick={()=>setFilters(f=>({...f,cgm:isActive?"":zone}))}
                style={{padding:"7px 12px",cursor:"pointer",background:isActive?"rgba(139,92,246,0.12)":"transparent",borderLeft:isActive?`2px solid ${T.accent}`:"2px solid transparent",transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:isActive?T.text:T.text2,fontFamily:"'Inter',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>
                    <span style={{color:T.muted,marginRight:4,fontSize:9}}>{String(i+1).padStart(2,"0")}.</span>{zone}
                  </span>
                  <span style={{fontSize:10,color:T.accent,fontFamily:"'Inter',sans-serif",marginLeft:6,fontWeight:600}}>{fmt(count)}</span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pctVal/((sortedZones[0]?.[1]||1)/total)*100}%`,background:isActive?T.accent:"rgba(139,92,246,0.3)",borderRadius:2,transition:"width 0.3s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── VISTA USUARIOS ───────────────────────────────────────────────────────────
const AGE_RANGES = [
  { label: "< 18",   min: 0,   max: 17,  color: "#38bdf8" },
  { label: "18–30",  min: 18,  max: 30,  color: "#8b5cf6" },
  { label: "31–45",  min: 31,  max: 45,  color: "#10b981" },
  { label: "46–60",  min: 46,  max: 60,  color: "#f59e0b" },
  { label: "61–75",  min: 61,  max: 75,  color: "#ef4444" },
  { label: "> 75",   min: 76,  max: 999, color: "#f472b6" },
];

function getAgeRange(age) {
  if (age == null || isNaN(age)) return "Sin dato";
  for (const r of AGE_RANGES) {
    if (age >= r.min && age <= r.max) return r.label;
  }
  return "Sin dato";
}

function MiniDonut({ segments, size = 80 }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (!total) return null;
  const r = 28, cx = size / 2, cy = size / 2, strokeW = 11;
  let offset = 0;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => {
        const frac = s.value / total;
        const dash = frac * circ;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}
            opacity="0.85"
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - strokeW / 2 - 2} fill={T.card} />
    </svg>
  );
}

function ViewUsuarios() {
  const [estado, setEstado] = useState("idle"); // idle | sin_token | cargando | ok | error
  const [usuarios, setUsuarios] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [paginaRecientes, setPaginaRecientes] = useState(0);
  const POR_PAGINA = 8;

  // Fetch desde la API de Novit
  async function cargarUsuarios() {
    const token =
      window._novitToken ||
      localStorage.getItem("novit_token") ||
      sessionStorage.getItem("novit_token");

    if (!token) { setEstado("sin_token"); return; }

    setEstado("cargando");
    try {
      // Traemos hasta 500 usuarios activos para análisis
      const populate = JSON.stringify([
        { path: "cliente", select: "idCategoriaDefault categoriaDefault", populate: { path: "categoriaDefault", select: "nombre" } },
        { path: "categoria.categoria", select: "nombre" },
        { path: "categoria.usuario", select: "usuario" },
        { path: "direccion.localidad", select: "nombre" },
        { path: "direccion.barrio", select: "nombre" },
      ]);
      const filter = JSON.stringify({ $and: [{ activo: "true" }] });
      const url = `${VECINOS_API}?limit=500&sort=-fechaCreacion&populate=${encodeURIComponent(populate)}&filter=${encodeURIComponent(filter)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setTotalCount(json.totalCount ?? json.datos?.length ?? 0);
      setUsuarios(json.datos || []);
      setUltimaActualizacion(new Date().toLocaleTimeString("es-AR"));
      setEstado("ok");
    } catch (e) {
      setEstado("error");
    }
  }

  useEffect(() => { cargarUsuarios(); }, []);

  // ── Sin token ────────────────────────────────────────────────────────────────
  if (estado === "sin_token") return (
    <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 32 }}>🔑</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.amber, fontFamily: "'Inter',sans-serif" }}>Token de Novit no configurado</div>
      <code style={{ background: "rgba(0,0,0,0.4)", padding: "8px 14px", borderRadius: 8, fontSize: 11, color: "#a5f3fc", fontFamily: "monospace" }}>
        localStorage.setItem('novit_token', 'TU_TOKEN_AQUÍ')
      </code>
    </div>
  );

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (estado === "cargando") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, opacity: 0.6 }}>👥</div>
      <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, fontFamily: "'Inter',sans-serif" }}>Cargando usuarios desde Novit…</div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (estado === "error") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 13, color: T.red, fontFamily: "'Inter',sans-serif" }}>Error al cargar usuarios</div>
      <button onClick={cargarUsuarios} style={{ background: `rgba(139,92,246,0.15)`, border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 10, padding: "8px 20px", fontSize: 12, fontFamily: "'Inter',sans-serif", cursor: "pointer", fontWeight: 600 }}>
        ↺ Reintentar
      </button>
    </div>
  );

  // ── Derivaciones ─────────────────────────────────────────────────────────────
  const total = totalCount ?? usuarios.length;
  const muestra = usuarios.length;

  // Edad
  const edades = usuarios.map(u => u.edad).filter(e => e != null && !isNaN(e));
  const edadProm = edades.length ? (edades.reduce((a, b) => a + b, 0) / edades.length).toFixed(1) : "—";
  const edadMin = edades.length ? Math.min(...edades) : "—";
  const edadMax = edades.length ? Math.max(...edades) : "—";

  const porRangoEdad = AGE_RANGES.map(r => ({
    label: r.label,
    color: r.color,
    value: edades.filter(e => e >= r.min && e <= r.max).length,
  })).filter(r => r.value > 0);

  // Sexo
  const porSexo = usuarios.reduce((acc, u) => {
    const s = u.sexo || "Sin dato";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const sexoColors = { M: "#38bdf8", F: "#f472b6", "Sin dato": T.muted };

  // Localidad/CGM
  const porLocalidad = {};
  usuarios.forEach(u => {
    const loc = u.direccion?.localidad?.nombre || u.localidad || "Sin dato";
    porLocalidad[loc] = (porLocalidad[loc] || 0) + 1;
  });
  const topLocalidades = topN(porLocalidad, 10);
  const locMax = Math.max(...topLocalidades.map(([, v]) => v), 1);

  // Plataforma
  const porPlataforma = usuarios.reduce((acc, u) => {
    const p = u.tipoDispositivo || u.dispositivo || "Sin dato";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  // DNI escaneado
  const conDni = usuarios.filter(u => u.dniEscaneado === true || u.dniEscaneado === "true").length;
  const sinDni = muestra - conDni;

  // Categoría especial
  const categorias = {};
  usuarios.forEach(u => {
    const rawCat = u.categoria;
    const cats = Array.isArray(rawCat) ? rawCat : (rawCat ? [rawCat] : []);
    if (!cats.length) {
      categorias["Sin categoría"] = (categorias["Sin categoría"] || 0) + 1;
    } else {
      cats.forEach(c => {
        const nombre = c?.categoria?.nombre || c?.nombre || "Sin dato";
        categorias[nombre] = (categorias[nombre] || 0) + 1;
      });
    }
  });
  const topCategorias = topN(categorias, 8);

  // Altas por fecha (evolución)
  const altasPorFecha = {};
  usuarios.forEach(u => {
    const f = u.fechaCreacion?.slice(0, 10);
    if (f) altasPorFecha[f] = (altasPorFecha[f] || 0) + 1;
  });
  const altasEntries = Object.entries(altasPorFecha).sort((a, b) => a[0].localeCompare(b[0]));
  const altasVals = altasEntries.map(([, v]) => v);

  // Últimos registrados
  const recientes = [...usuarios].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  const pageStart = paginaRecientes * POR_PAGINA;
  const recientesPagina = recientes.slice(pageStart, pageStart + POR_PAGINA);
  const totalPaginas = Math.ceil(recientes.length / POR_PAGINA);

  // ── Gráfico de evolución SVG ──────────────────────────────────────────────
  const W = 700, H = 90, PAD = 8;
  const altasMax = Math.max(...altasVals, 1);
  const altasPts = altasVals.map((v, i) => [
    PAD + (i / (altasVals.length - 1 || 1)) * (W - PAD * 2),
    H - PAD - ((v / altasMax) * (H - PAD * 2)),
  ]);
  const altasPolyline = altasPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const altasArea = `${PAD},${H} ${altasPolyline} ${W - PAD},${H}`;
  const altasStep = Math.max(1, Math.floor(altasVals.length / 6));

  // Mes actual
  const ahora = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  const altasMes = usuarios.filter(u => u.fechaCreacion?.startsWith(mesActual)).length;

  return (
    <div>
      {/* Header de actualización */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, fontFamily: "'Inter',sans-serif" }}>
          {ultimaActualizacion && <>🕐 Actualizado: {ultimaActualizacion} · Muestra: {muestra.toLocaleString()} de {total.toLocaleString()} usuarios activos</>}
        </div>
        <button onClick={cargarUsuarios} style={{ background: "rgba(139,92,246,0.12)", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 8, padding: "5px 14px", fontSize: 10, fontFamily: "'Inter',sans-serif", cursor: "pointer", fontWeight: 600 }}>
          ↺ Actualizar
        </button>
      </div>

      {/* KPIs principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPI label="Usuarios Activos" value={fmt(total)} sub="en el sistema" color={T.accent} icon="👥"/>
        <KPI label="Altas Este Mes" value={fmt(altasMes)} sub={`de ${muestra} en muestra`} color={T.green} icon="📈"/>
        <KPI label="Edad Promedio" value={edadProm !== "—" ? `${edadProm} años` : "—"} sub={`mín ${edadMin} · máx ${edadMax}`} color="#38bdf8" icon="🎂"/>
        <KPI label="Con DNI Escaneado" value={muestra > 0 ? `${((conDni / muestra) * 100).toFixed(0)}%` : "—"} sub={`${fmt(conDni)} de ${fmt(muestra)}`} color={T.amber} icon="🪪"/>
        <KPI label="Sin Categoría" value={fmt(categorias["Sin categoría"] || 0)} sub={`${muestra > 0 ? (((categorias["Sin categoría"] || 0) / muestra) * 100).toFixed(0) : 0}% del total`} color={T.red} icon="📂"/>
      </div>

      {/* Fila 1: Localidad + Rango edad + Sexo */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.8fr", gap: 14, marginBottom: 14 }}>

        {/* Localidades */}
        <Card title="Usuarios por Localidad / CGM" icon="📍">
          {topLocalidades.map(([loc, val]) => (
            <HBar key={loc} label={loc} value={val} max={locMax} color={T.accent} total={muestra} />
          ))}
        </Card>

        {/* Rango de edad */}
        <Card title="Rango de Edad" icon="🎂">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <MiniDonut segments={porRangoEdad} size={80} />
            <div style={{ flex: 1 }}>
              {porRangoEdad.map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: T.text2, flex: 1, fontFamily: "'Inter',sans-serif" }}>{r.label}</span>
                  <span style={{ fontSize: 11, color: T.text, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{fmt(r.value)}</span>
                  <span style={{ fontSize: 9, color: T.muted, fontFamily: "'Inter',sans-serif" }}>{edades.length > 0 ? ((r.value / edades.length) * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Sexo + Plataforma */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card title="Sexo" icon="⚤" style={{ flex: 1 }}>
            {Object.entries(porSexo).map(([s, v]) => (
              <HBar key={s} label={s === "M" ? "Masculino" : s === "F" ? "Femenino" : s} value={v} max={Math.max(...Object.values(porSexo), 1)} color={sexoColors[s] || T.muted} total={muestra} />
            ))}
          </Card>
          <Card title="Plataforma" icon="📱" style={{ flex: 1 }}>
            {Object.entries(porPlataforma).slice(0, 4).map(([p, v]) => (
              <HBar key={p} label={p} value={v} max={Math.max(...Object.values(porPlataforma), 1)} color={p.toLowerCase().includes("ios") ? "#38bdf8" : p.toLowerCase().includes("android") ? "#10b981" : T.muted} total={muestra} />
            ))}
          </Card>
        </div>
      </div>

      {/* Fila 2: Categorías especiales + DNI + Evolución */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        <Card title="Categorías Especiales" icon="🏷️">
          {topCategorias.map(([cat, val], i) => {
            const colors = [T.accent, T.green, T.amber, T.red, "#38bdf8", "#f472b6", "#a78bfa", "#34d399"];
            return <HBar key={cat} label={cat} value={val} max={Math.max(...topCategorias.map(([, v]) => v), 1)} color={colors[i % colors.length]} total={muestra} />;
          })}
        </Card>

        <Card title="Verificación de Identidad (DNI)" icon="🪪">
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
            <MiniDonut segments={[{ value: conDni, color: T.green }, { value: sinDni, color: "rgba(255,255,255,0.08)" }]} size={80} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.green, fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>
                {muestra > 0 ? `${((conDni / muestra) * 100).toFixed(1)}%` : "—"}
              </div>
              <div style={{ fontSize: 11, color: T.text2, marginTop: 4, fontFamily: "'Inter',sans-serif" }}>con DNI escaneado</div>
            </div>
          </div>
          <HBar label="Con DNI" value={conDni} max={muestra} color={T.green} total={muestra} />
          <HBar label="Sin DNI" value={sinDni} max={muestra} color={T.red} total={muestra} />
        </Card>
      </div>

      {/* Evolución de altas */}
      <Card title="Evolución de Altas (muestra)" icon="📈" style={{ marginBottom: 14 }}>
        {altasVals.length < 2 ? (
          <div style={{ color: T.muted, fontSize: 11, fontFamily: "'Inter',sans-serif" }}>Sin suficientes datos para el gráfico</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 90 }}>
            <defs>
              <linearGradient id="altasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.green} stopOpacity="0.2" />
                <stop offset="100%" stopColor={T.green} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={altasArea} fill="url(#altasGrad)" />
            <polyline points={altasPolyline} fill="none" stroke={T.green} strokeWidth="2" strokeLinejoin="round" />
            {altasPts.filter((_, i) => i % altasStep === 0).map(([x, y], i) => {
              const idx = i * altasStep;
              const [fecha] = altasEntries[idx];
              const d = new Date(fecha + "T00:00:00");
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="2.5" fill={T.green} opacity="0.8" />
                  <text x={x} y={H - 1} textAnchor="middle" fontSize="8" fill={T.muted} fontFamily="Inter">
                    {d.getDate()}/{d.getMonth() + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </Card>

      {/* Últimos registrados */}
      <Card title="Últimos Usuarios Registrados" icon="🆕">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'Inter',sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Nombre", "Edad", "Sexo", "Localidad", "Plataforma", "DNI", "Alta", "Categoría"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "5px 8px", color: T.muted, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recientesPagina.map((u, i) => {
                const nombre = [u.nombre, u.apellido].filter(Boolean).join(" ") || u.usuario || "Sin nombre";
                const localidad = u.direccion?.localidad?.nombre || u.localidad || "—";
                const plat = u.tipoDispositivo || u.dispositivo || "—";
                const dniOk = u.dniEscaneado === true || u.dniEscaneado === "true";
                const fechaAlta = u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString("es-AR") : "—";
                const rawCatRow = u.categoria;
                const catsArr = Array.isArray(rawCatRow) ? rawCatRow : (rawCatRow ? [rawCatRow] : []);
                const cats = catsArr.map(c => c?.categoria?.nombre || c?.nombre).filter(Boolean).join(", ") || "—";
                const sexoLabel = u.sexo === "M" ? "♂ M" : u.sexo === "F" ? "♀ F" : u.sexo || "—";
                return (
                  <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: "background 0.1s" }}>
                    <td style={{ padding: "6px 8px", color: T.text, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombre}</td>
                    <td style={{ padding: "6px 8px", color: T.text2 }}>{u.edad ?? "—"}</td>
                    <td style={{ padding: "6px 8px", color: u.sexo === "M" ? "#38bdf8" : u.sexo === "F" ? "#f472b6" : T.muted }}>{sexoLabel}</td>
                    <td style={{ padding: "6px 8px", color: T.text2, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{localidad}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{ fontSize: 9, background: plat.toLowerCase().includes("ios") ? "rgba(56,189,248,0.15)" : plat.toLowerCase().includes("android") ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", color: plat.toLowerCase().includes("ios") ? "#38bdf8" : plat.toLowerCase().includes("android") ? T.green : T.muted, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>
                        {plat}
                      </span>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{ fontSize: 10, color: dniOk ? T.green : T.red }}>{dniOk ? "✓" : "✗"}</span>
                    </td>
                    <td style={{ padding: "6px 8px", color: T.muted, whiteSpace: "nowrap" }}>{fechaAlta}</td>
                    <td style={{ padding: "6px 8px", color: T.text2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cats}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setPaginaRecientes(p => Math.max(0, p - 1))}
              disabled={paginaRecientes === 0}
              style={{ background: "rgba(139,92,246,0.1)", border: `1px solid ${T.border}`, color: paginaRecientes === 0 ? T.muted : T.text2, borderRadius: 7, padding: "4px 12px", fontSize: 11, cursor: paginaRecientes === 0 ? "default" : "pointer", fontFamily: "'Inter',sans-serif" }}
            >← Ant</button>
            <span style={{ fontSize: 10, color: T.muted, fontFamily: "'Inter',sans-serif" }}>{paginaRecientes + 1} / {totalPaginas}</span>
            <button
              onClick={() => setPaginaRecientes(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={paginaRecientes >= totalPaginas - 1}
              style={{ background: "rgba(139,92,246,0.1)", border: `1px solid ${T.border}`, color: paginaRecientes >= totalPaginas - 1 ? T.muted : T.text2, borderRadius: 7, padding: "4px 12px", fontSize: 11, cursor: paginaRecientes >= totalPaginas - 1 ? "default" : "pointer", fontFamily: "'Inter',sans-serif" }}
            >Sig →</button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("mapa");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState({
    fechaDesde: firstOfMonthStr(),
    fechaHasta: todayStr(),
    cgm: "",
    categoria: "",
    tipo: "",
    turno: "",
  });
  const [loadProgress, setLoadProgress] = useState(0);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(()=>{
    if(window.L){setLeafletReady(true);return;}
    const css=document.createElement("link");
    css.rel="stylesheet";css.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload=()=>setLeafletReady(true);
    document.head.appendChild(script);
  },[]);

  useEffect(()=>{
    async function load(){
      setLoading(true);setError(null);
      const PAGE=10000; let offset=0,all=[];
      try{
        while(true){
          const{data,error:err}=await supabase.from("alertas").select("tipo,fecha,horario,cgm,categoria").range(offset,offset+PAGE-1).order("fecha",{ascending:false});
          if(err)throw err;
          if(!data||data.length===0)break;
          all=all.concat(data);setLoadProgress(all.length);
          if(data.length<PAGE)break;offset+=PAGE;
        }
        setAllData(all);
      }catch(e){setError(e.message);}
      setLoading(false);
    }
    load();
  },[]);

  const options=useMemo(()=>({
    cgms:[...new Set(allData.map(r=>r.cgm).filter(Boolean))].sort(),
    categorias:[...new Set(allData.map(r=>r.categoria).filter(Boolean))].sort(),
    tipos:[...new Set(allData.map(r=>r.tipo).filter(Boolean))].sort(),
  }),[allData]);

  const filteredData=useMemo(()=>allData.filter(r=>{
    if(filters.fechaDesde&&r.fecha<filters.fechaDesde)return false;
    if(filters.fechaHasta&&r.fecha>filters.fechaHasta)return false;
    if(filters.cgm&&r.cgm!==filters.cgm)return false;
    if(filters.categoria&&r.categoria!==filters.categoria)return false;
    if(filters.tipo&&r.tipo!==filters.tipo)return false;
    if(filters.turno){const h=getHour(r.horario);if(getTurno(h,isFinde(r.fecha))!==filters.turno)return false;}
    return true;
  }),[allData,filters]);

  const dataForMap=useMemo(()=>allData.filter(r=>{
    if(filters.fechaDesde&&r.fecha<filters.fechaDesde)return false;
    if(filters.fechaHasta&&r.fecha>filters.fechaHasta)return false;
    if(filters.categoria&&r.categoria!==filters.categoria)return false;
    if(filters.tipo&&r.tipo!==filters.tipo)return false;
    if(filters.turno){const h=getHour(r.horario);if(getTurno(h,isFinde(r.fecha))!==filters.turno)return false;}
    return true;
  }),[allData,filters]);

  const prevData=useMemo(()=>{
    if(!filters.fechaDesde||!filters.fechaHasta)return[];
    const d1=new Date(filters.fechaDesde+"T00:00:00"),d2=new Date(filters.fechaHasta+"T00:00:00");
    const dur=d2-d1,pD2=new Date(d1-1),pD1=new Date(pD2-dur);
    return allData.filter(r=>r.fecha>=pD1.toISOString().slice(0,10)&&r.fecha<=pD2.toISOString().slice(0,10));
  },[allData,filters]);

  const TABS=[
    {id:"mapa",      label:"Mapa",      icon:"◎"},
    {id:"ejecutivo", label:"Ejecutivo", icon:"◈"},
    {id:"temporal",  label:"Temporal",  icon:"◷"},
    {id:"cgm",       label:"Por Zona",  icon:"◉"},
    {id:"usuarios",  label:"Usuarios",  icon:"◍"},
  ];

  const isUsuariosTab = view === "usuarios";
  const now = new Date();
  const dateLabel = now.toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${T.bg};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(139,92,246,0.5);}
        @media print {
          @page { size: A4 landscape; margin: 12mm 10mm; }
          body { background: #fff !important; color: #111 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-header { display: block !important; }
          .cgm-dark-tiles { display: none; }
        }
        .print-header { display: none; }
      `}</style>

      <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter',sans-serif"}}>

        {/* ── HEADER ── */}
        <div className="no-print" style={{
          background:`linear-gradient(90deg,${T.bg2} 0%,#1a1535 50%,${T.bg2} 100%)`,
          border:`1px solid ${T.border}`,
          borderRadius:16,
          margin:"14px 20px 0",
          padding:"14px 24px",
          display:"flex",
          alignItems:"center",
          gap:18,
          boxShadow:"0 4px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>⚡</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:T.text,letterSpacing:"-0.3px"}}>Centro de Gestión Municipal</div>
            <div style={{fontSize:11,color:T.text2,marginTop:2}}>Análisis Operativo de Alertas · Partido de Lomas de Zamora</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:16}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:T.text2,fontWeight:500}}>
                {loading
                  ? `Cargando… ${loadProgress.toLocaleString()} reg.`
                  : isUsuariosTab
                  ? `Dashboard de Vecinos/Usuarios`
                  : `${allData.length.toLocaleString()} registros · ${filteredData.length.toLocaleString()} filtrados`
                }
              </div>
              <div style={{fontSize:10,color:T.muted,marginTop:2}}>{dateLabel}</div>
            </div>
            <div style={{
              display:"inline-flex",alignItems:"center",gap:6,
              background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",
              borderRadius:100,padding:"5px 12px",
              fontSize:10,fontWeight:700,color:"#6ee7b7",letterSpacing:"0.06em",
            }}>
              <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block",boxShadow:`0 0 6px ${T.green}`}}/>
              EN VIVO
            </div>
          </div>
        </div>

        <div style={{maxWidth:1440,margin:"0 auto",padding:"16px 20px"}}>

          {error&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",color:"#fca5a5",fontSize:12,marginBottom:14}}>⚠ Error Supabase: {error}</div>}

          {/* Alerta discrepancia — solo en tabs de alertas */}
          {!loading && !isUsuariosTab && <AlertaDiscrepancia allData={allData} filters={filters}/>}

          {/* Filtros — ocultos en tab usuarios */}
          {!isUsuariosTab && (
            <div className="no-print">
              <FiltersPanel filters={filters} setFilters={setFilters} options={options} open={filtersOpen} setOpen={setFiltersOpen}/>
            </div>
          )}

          {/* ── TABS ── */}
          <div className="no-print" style={{display:"flex",alignItems:"center",gap:6,marginBottom:20,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const isActive = view===t.id;
              const isUsers = t.id === "usuarios";
              return (
                <button key={t.id} onClick={()=>setView(t.id)} style={{
                  background: isActive ? `rgba(139,92,246,0.15)` : "transparent",
                  border: `1px solid ${isActive ? T.accent : isUsers ? "rgba(16,185,129,0.35)" : T.border}`,
                  color: isActive ? T.text : isUsers ? "#6ee7b7" : T.text2,
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 11,
                  fontFamily: "'Inter',sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}>
                  <span style={{color:isActive?T.accent:isUsers?T.green:T.muted,fontSize:13}}>{t.icon}</span>
                  {t.label.toUpperCase()}
                </button>
              );
            })}

            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              {filters.cgm && !isUsuariosTab && (
                <>
                  <span style={{fontSize:10,color:T.muted,fontWeight:600}}>ZONA:</span>
                  <span style={{fontSize:11,color:T.accent,fontWeight:700,background:"rgba(139,92,246,0.15)",padding:"3px 12px",borderRadius:20,border:`1px solid rgba(139,92,246,0.3)`}}>{filters.cgm}</span>
                  <button onClick={()=>setFilters(f=>({...f,cgm:""}))} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:14,lineHeight:1,padding:"2px 4px"}}>✕</button>
                </>
              )}
              {!isUsuariosTab && (
                <button
                  className="no-print"
                  onClick={()=>window.print()}
                  style={{background:`rgba(139,92,246,0.15)`,border:`1px solid ${T.accent}`,color:T.accent,borderRadius:10,padding:"8px 16px",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,letterSpacing:"0.05em",transition:"all 0.15s"}}
                >
                  ⬇ EXPORTAR PDF
                </button>
              )}
            </div>
          </div>

          {/* ── CONTENIDO ── */}
          {loading && !isUsuariosTab ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:0.6}}>⚡</div>
              <div style={{fontSize:12,color:T.muted,fontWeight:500}}>Cargando {loadProgress.toLocaleString()} registros…</div>
              <div style={{width:200,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:"60%",background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:2}}/>
              </div>
            </div>
          ) : (
            <>
              {view==="ejecutivo" && <ViewEjecutivo data={filteredData} prevData={prevData}/>}
              {view==="temporal"  && <ViewTemporal data={filteredData}/>}
              {view==="cgm"       && <ViewCGM data={filteredData}/>}
              {view==="usuarios"  && <ViewUsuarios />}
              {view==="mapa"      && (leafletReady
                ? <ViewMapa data={dataForMap} filters={filters} setFilters={setFilters}/>
                : <div style={{color:T.muted,fontSize:12,padding:20}}>Cargando mapa…</div>
              )}
            </>
          )}

          {/* ── ENCABEZADO SOLO PARA IMPRIMIR ── */}
          <div className="print-header" style={{marginBottom:16,paddingBottom:10,borderBottom:"2px solid #8b5cf6"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Centro de Gestión Municipal · Lomas de Zamora</div>
            <div style={{fontSize:11,color:"#555",marginTop:4}}>
              Análisis Operativo de Alertas &nbsp;·&nbsp;
              Período: {filters.fechaDesde||"–"} → {filters.fechaHasta||"–"} &nbsp;·&nbsp;
              {filters.cgm ? `Zona: ${filters.cgm} · ` : ""}
              {filters.categoria ? `Categoría: ${filters.categoria} · ` : ""}
              {filters.turno ? `Turno: ${filters.turno} · ` : ""}
              {filters.tipo ? `Tipo: ${filters.tipo} · ` : ""}
              {filteredData.length.toLocaleString()} registros &nbsp;·&nbsp;
              Generado: {new Date().toLocaleString("es-AR")}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{textAlign:"center",color:T.muted,fontSize:10,marginTop:24,padding:"8px 0",borderTop:`1px solid rgba(139,92,246,0.08)`}}>
            CGM · Análisis Operativo &nbsp;·&nbsp; {filters.fechaDesde||"–"} → {filters.fechaHasta||"–"} &nbsp;·&nbsp; {filteredData.length.toLocaleString()} registros
          </div>
        </div>
      </div>
    </>
  );
}
