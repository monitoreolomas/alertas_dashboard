import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CGM_GEOJSON = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Ingeniero Budge"},"geometry":{"type":"Polygon","coordinates":[[[-58.4610056,-34.7053577],[-58.461048,-34.705404],[-58.461337,-34.705605],[-58.461474,-34.70584],[-58.471049,-34.715476],[-58.469986,-34.716167],[-58.469503,-34.716763],[-58.46918,-34.717555],[-58.468882,-34.718216],[-58.468333,-34.718757],[-58.467408,-34.719154],[-58.467152,-34.719734],[-58.466519,-34.720098],[-58.466293,-34.720573],[-58.466223,-34.721083],[-58.466949,-34.721578],[-58.46819,-34.722282],[-58.467838,-34.722883],[-58.467368,-34.723536],[-58.466803,-34.724126],[-58.466428,-34.724606],[-58.465618,-34.725637],[-58.464879,-34.726622],[-58.463908,-34.727342],[-58.463384,-34.727864],[-58.462947,-34.728421],[-58.462469,-34.728968],[-58.462076,-34.729393],[-58.461735,-34.730025],[-58.461382,-34.73044],[-58.46094,-34.730889],[-58.460557,-34.731589],[-58.460466,-34.731933],[-58.460373,-34.732074],[-58.460126,-34.731941],[-58.45573,-34.729741],[-58.450571,-34.727019],[-58.44655,-34.724922],[-58.444147,-34.723583],[-58.446535,-34.720601],[-58.450289,-34.715915],[-58.451869,-34.713954],[-58.455337,-34.709929],[-58.456351,-34.708729],[-58.457383,-34.707828],[-58.458158,-34.707197],[-58.458866,-34.706602],[-58.459806,-34.706079],[-58.460431,-34.705666],[-58.460993,-34.705321],[-58.4610056,-34.7053577]]]}},{"type":"Feature","properties":{"name":"Parque Barón"},"geometry":{"type":"Polygon","coordinates":[[[-58.4545316,-34.7577462],[-58.4442716,-34.7717582],[-58.4396026,-34.7781882],[-58.4384946,-34.7796862],[-58.4363085,-34.7827612],[-58.4342595,-34.7841672],[-58.4334956,-34.7844312],[-58.4324395,-34.7848152],[-58.4320715,-34.7846922],[-58.4314536,-34.7844922],[-58.4301565,-34.7840162],[-58.4274296,-34.7829812],[-58.4262025,-34.7825292],[-58.4248625,-34.7819132],[-58.4247975,-34.7809642],[-58.4247435,-34.7798442],[-58.4248375,-34.7790452],[-58.4250675,-34.7782292],[-58.4254465,-34.7775302],[-58.4266415,-34.7768222],[-58.4273806,-34.7759082],[-58.4278675,-34.7745382],[-58.4279465,-34.7741042],[-58.4281455,-34.7729772],[-58.4283085,-34.7720862],[-58.4287105,-34.7712082],[-58.4295056,-34.7697222],[-58.4298855,-34.7687662],[-58.4292426,-34.7672372],[-58.4286505,-34.7664422],[-58.4281405,-34.7656282],[-58.4285275,-34.7647422],[-58.4289005,-34.7637192],[-58.4293006,-34.7626412],[-58.4294216,-34.7624442],[-58.4308295,-34.7588662],[-58.4311596,-34.7583782],[-58.4321475,-34.7569352],[-58.4329566,-34.7559372],[-58.4334646,-34.7554792],[-58.4342755,-34.7548652],[-58.4344355,-34.7546622],[-58.4356822,-34.7552644],[-58.4364145,-34.7537462],[-58.4379765,-34.7530922],[-58.4390346,-34.7525922],[-58.4400165,-34.7521112],[-58.4405326,-34.7520762],[-58.4413806,-34.7524832],[-58.4426926,-34.7532452],[-58.4439826,-34.7538142],[-58.4443026,-34.7537682],[-58.4450386,-34.7527682],[-58.4522206,-34.7565752],[-58.4545316,-34.7577462]]]}},{"type":"Feature","properties":{"name":"Santa Catalina"},"geometry":{"type":"Polygon","coordinates":[[[-58.4841686,-34.7297412],[-58.4841713,-34.729743],[-58.4841685,-34.729743],[-58.4841683,-34.729747],[-58.4841683,-34.729761],[-58.4841653,-34.729763],[-58.4841703,-34.729765],[-58.4841673,-34.729767],[-58.4841733,-34.729765],[-58.4841673,-34.72977],[-58.4841623,-34.729826],[-58.4841113,-34.730079],[-58.4840493,-34.73038],[-58.4838683,-34.73126],[-58.4840633,-34.732016],[-58.4841713,-34.732239],[-58.4848943,-34.732337],[-58.4855243,-34.732259],[-58.4857373,-34.732019],[-58.4862803,-34.731024],[-58.4869113,-34.729845],[-58.4873573,-34.729585],[-58.4887883,-34.729005],[-58.4900523,-34.728598],[-58.4917993,-34.728222],[-58.4926553,-34.727548],[-58.4932703,-34.726738],[-58.4936153,-34.725573],[-58.4937813,-34.725032],[-58.4943433,-34.724817],[-58.4956823,-34.724925],[-58.4970033,-34.72389],[-58.4983033,-34.723209],[-58.4995113,-34.722992],[-58.5013503,-34.722971],[-58.4727613,-34.760736],[-58.4577923,-34.75321],[-58.4584863,-34.7522485],[-58.4591803,-34.751146],[-58.4603303,-34.749616],[-58.4612813,-34.74828],[-58.4625103,-34.74658],[-58.4631533,-34.7458],[-58.4636083,-34.745117],[-58.4646933,-34.743704],[-58.4653463,-34.742864],[-58.4657013,-34.742354],[-58.4667123,-34.741121],[-58.4678443,-34.739605],[-58.4689043,-34.738298],[-58.4702083,-34.736928],[-58.4714273,-34.735882],[-58.4727543,-34.734926],[-58.4739083,-34.734015],[-58.4750013,-34.73325],[-58.4762663,-34.732278],[-58.4773463,-34.731458],[-58.4787603,-34.730367],[-58.4800893,-34.729369],[-58.4811893,-34.728516],[-58.4821013,-34.727826],[-58.4832993,-34.726788],[-58.4842963,-34.727755],[-58.4839213,-34.728088],[-58.4835613,-34.728409],[-58.4839933,-34.729474],[-58.4841473,-34.729544],[-58.4841573,-34.729561],[-58.4841573,-34.729571],[-58.4841653,-34.729627],[-58.4841703,-34.729652],[-58.4841673,-34.729661],[-58.4841723,-34.72967],[-58.4841686,-34.7297412]]]}},{"type":"Feature","properties":{"name":"Santa Marta"},"geometry":{"type":"Polygon","coordinates":[[[-58.4546175,-34.7573194],[-58.4521905,-34.7560844],[-58.4499285,-34.7548894],[-58.4467325,-34.7531964],[-58.4451585,-34.7523624],[-58.4443705,-34.7533774],[-58.4440505,-34.7533844],[-58.4425125,-34.7526864],[-58.4413735,-34.7520144],[-58.4406165,-34.7516574],[-58.4401635,-34.7516744],[-58.4394595,-34.7520084],[-58.4384055,-34.7525204],[-58.4370795,-34.7531084],[-58.4360195,-34.7535134],[-58.4345326,-34.7542284],[-58.4354096,-34.7528324],[-58.4360005,-34.7519454],[-58.4360875,-34.7512474],[-58.4360815,-34.7510984],[-58.4359845,-34.7509704],[-58.4358895,-34.7508754],[-58.4353356,-34.7505094],[-58.4336236,-34.7496814],[-58.4322656,-34.7490294],[-58.4312296,-34.7483674],[-58.4304156,-34.7475624],[-58.4302146,-34.7463914],[-58.4299566,-34.7450004],[-58.4297486,-34.7442094],[-58.4296336,-34.7436274],[-58.4303676,-34.7425314],[-58.4308416,-34.7418044],[-58.4317966,-34.7404704],[-58.4326236,-34.7393264],[-58.4331806,-34.7385634],[-58.4336776,-34.7378174],[-58.4339576,-34.7373114],[-58.4344236,-34.7365444],[-58.4349836,-34.7357604],[-58.4422765,-34.7397124],[-58.4430555,-34.7401644],[-58.4458805,-34.7418284],[-58.4524265,-34.7454484],[-58.4535485,-34.7440114],[-58.4615355,-34.7481744],[-58.4546175,-34.7573194]]]}},{"type":"Feature","properties":{"name":"Turdera"},"geometry":{"type":"Polygon","coordinates":[[[-58.4100822,-34.7988914],[-58.3954082,-34.7909594],[-58.3959592,-34.7828934],[-58.3968172,-34.7838084],[-58.3969472,-34.7839384],[-58.3984662,-34.7852614],[-58.3994532,-34.7856874],[-58.4015772,-34.7865864],[-58.4037882,-34.7867804],[-58.4055792,-34.7865944],[-58.4084792,-34.7860554],[-58.4100182,-34.7857874],[-58.4111642,-34.7856524],[-58.4128902,-34.7855204],[-58.4170362,-34.7851994],[-58.4207902,-34.7849584],[-58.4100822,-34.7988914]]]}},{"type":"Feature","properties":{"name":"Villa Albertina"},"geometry":{"type":"Polygon","coordinates":[[[-58.47121,-34.73611],[-58.470389,-34.736762],[-58.469551,-34.737637],[-58.468846,-34.73841],[-58.468309,-34.739052],[-58.467795,-34.739678],[-58.46651,-34.741386],[-58.466881,-34.740932],[-58.466033,-34.74197],[-58.465547,-34.742594],[-58.464736,-34.743634],[-58.46418,-34.744343],[-58.463636,-34.745073],[-58.463078,-34.745859],[-58.462528,-34.746546],[-58.461787,-34.747542],[-58.461352,-34.748346],[-58.457844,-34.746579],[-58.454737,-34.744976],[-58.453396,-34.744241],[-58.452276,-34.745671],[-58.447409,-34.743039],[-58.442211,-34.739975],[-58.43695,-34.73713],[-58.434832,-34.735977],[-58.435478,-34.734881],[-58.436845,-34.73316],[-58.438985,-34.730444],[-58.439869,-34.729234],[-58.440401,-34.728532],[-58.441786,-34.726682],[-58.442728,-34.725417],[-58.444172,-34.723605],[-58.456083,-34.729919],[-58.460382,-34.73207],[-58.46094,-34.730889],[-58.46273,-34.731808],[-58.465402,-34.733236],[-58.469938,-34.73552],[-58.470633,-34.73585],[-58.47121,-34.73611]]]}},{"type":"Feature","properties":{"name":"Villa Centenario"},"geometry":{"type":"Polygon","coordinates":[[[-58.4275063,-34.713399],[-58.4360813,-34.717722],[-58.4409513,-34.720403],[-58.4448803,-34.72265],[-58.4421503,-34.726179],[-58.4386453,-34.73088],[-58.4354693,-34.734893],[-58.4348803,-34.735883],[-58.4341653,-34.736883],[-58.4332853,-34.738371],[-58.4318693,-34.74034],[-58.4310283,-34.741482],[-58.4301113,-34.742937],[-58.4294553,-34.743836],[-58.4293583,-34.743562],[-58.4292433,-34.743213],[-58.4289743,-34.742781],[-58.4286883,-34.742288],[-58.4281953,-34.741922],[-58.4274273,-34.741635],[-58.4266413,-34.74162],[-58.4254243,-34.741608],[-58.4253063,-34.74161],[-58.4259703,-34.738371],[-58.4245163,-34.73769],[-58.4180993,-34.734775],[-58.4160063,-34.733941],[-58.4132863,-34.732524],[-58.4200553,-34.7232],[-58.4275063,-34.713399]]]}},{"type":"Feature","properties":{"name":"Villa Fiorito"},"geometry":{"type":"Polygon","coordinates":[[[-58.4467687,-34.6882615],[-58.4517837,-34.6946655],[-58.4556937,-34.6993375],[-58.4612297,-34.7055165],[-58.4588387,-34.7069315],[-58.4580927,-34.7073745],[-58.4577607,-34.7074625],[-58.4574057,-34.7079395],[-58.4564557,-34.7087075],[-58.4533857,-34.7122025],[-58.4504247,-34.7158095],[-58.4473897,-34.7194795],[-58.4455617,-34.7218125],[-58.4448267,-34.7226995],[-58.4390907,-34.7194605],[-58.4356147,-34.7175615],[-58.4333947,-34.7163805],[-58.4274557,-34.7134565],[-58.4467687,-34.6882615]]]}},{"type":"Feature","properties":{"name":"Villa Lamadrid"},"geometry":{"type":"Polygon","coordinates":[[[-58.4712833,-34.7360621],[-58.4659003,-34.7334051],[-58.4611053,-34.7308741],[-58.4612103,-34.7306841],[-58.4617273,-34.7301171],[-58.4621533,-34.7293861],[-58.4624753,-34.7290451],[-58.4635533,-34.7277811],[-58.4636633,-34.7276131],[-58.4637703,-34.7275471],[-58.4644383,-34.7270081],[-58.4650143,-34.7264991],[-58.4663073,-34.7248631],[-58.4671123,-34.7238911],[-58.4678503,-34.7229671],[-58.4682953,-34.7222211],[-58.4677063,-34.7218931],[-58.4666693,-34.7213111],[-58.4663233,-34.7210301],[-58.4663853,-34.7205591],[-58.4666263,-34.7200681],[-58.4672563,-34.7196741],[-58.4675063,-34.7191081],[-58.4679923,-34.7188981],[-58.4687143,-34.7184461],[-58.4689573,-34.7182141],[-58.4696323,-34.7166711],[-58.4701483,-34.7161011],[-58.4711343,-34.7154221],[-58.4745333,-34.7185691],[-58.4834183,-34.7268051],[-58.4712833,-34.7360621]]]}},{"type":"Feature","properties":{"name":"San José"},"geometry":{"type":"Polygon","coordinates":[[[-58.3639498,-34.749648],[-58.3777278,-34.756942],[-58.3714548,-34.766477],[-58.3707818,-34.76615],[-58.3644808,-34.774739],[-58.3585148,-34.771679],[-58.3619018,-34.767691],[-58.3535708,-34.763385],[-58.3368167,-34.754568],[-58.3420837,-34.746568],[-58.3433697,-34.74266],[-58.3442387,-34.736811],[-58.3476628,-34.739888],[-58.3565258,-34.739987],[-58.3669788,-34.745587],[-58.3642868,-34.749186],[-58.3637478,-34.749894],[-58.3639498,-34.749648]]]}},{"type":"Feature","properties":{"name":"Temperley"},"geometry":{"type":"Polygon","coordinates":[[[-58.3959237,-34.782886],[-58.3952337,-34.790769],[-58.3642357,-34.774421],[-58.3705377,-34.76589],[-58.3712027,-34.766217],[-58.3774807,-34.756684],[-58.3976517,-34.767246],[-58.3976517,-34.767253],[-58.4236336,-34.781148],[-58.4207017,-34.78488],[-58.4162027,-34.785178],[-58.4098607,-34.785717],[-58.4052117,-34.786567],[-58.4035537,-34.786707],[-58.4014857,-34.786516],[-58.3983617,-34.7852],[-58.3967757,-34.783799],[-58.3959237,-34.782886]]]}},{"type":"Feature","properties":{"name":"Llavallol"},"geometry":{"type":"Polygon","coordinates":[[[-58.444374,-34.77136],[-58.459074,-34.779015],[-58.430373,-34.817235],[-58.404803,-34.804497],[-58.407703,-34.800901],[-58.408309,-34.800926],[-58.409666,-34.799307],[-58.412605,-34.795638],[-58.412621,-34.795639],[-58.423751,-34.781192],[-58.425866,-34.782214],[-58.43096,-34.784132],[-58.432361,-34.784612],[-58.434171,-34.783966],[-58.436212,-34.782561],[-58.438252,-34.779688],[-58.441021,-34.775944],[-58.444374,-34.77136]]]}},{"type":"Feature","properties":{"name":"Banfield"},"geometry":{"type":"Polygon","coordinates":[[[-58.3748696,-34.7424894],[-58.3801995,-34.7383504],[-58.3861425,-34.7366684],[-58.3898615,-34.7361034],[-58.3942925,-34.7354274],[-58.3942935,-34.7354354],[-58.3971425,-34.7348814],[-58.4018455,-34.7340724],[-58.4047055,-34.7336334],[-58.4128665,-34.7324894],[-58.4131165,-34.7322974],[-58.4154554,-34.7335174],[-58.4190074,-34.7349404],[-58.4206144,-34.7357424],[-58.4242664,-34.7373854],[-58.4259844,-34.7381824],[-58.4258144,-34.7385594],[-58.4253984,-34.7402724],[-58.4251804,-34.7413854],[-58.4248794,-34.7432434],[-58.4243414,-34.7460794],[-58.4228314,-34.7462904],[-58.4203784,-34.7466504],[-58.4169264,-34.7471424],[-58.4139295,-34.7475374],[-58.4118145,-34.7478364],[-58.4100125,-34.7481004],[-58.4068595,-34.7485474],[-58.4050855,-34.7488164],[-58.3999595,-34.7495754],[-58.3960045,-34.7501324],[-58.3912915,-34.7508724],[-58.3881385,-34.7513134],[-58.3868115,-34.7514674],[-58.3839835,-34.7499494],[-58.3785695,-34.7571124],[-58.3772045,-34.7564034],[-58.3698596,-34.7525384],[-58.3636706,-34.7492424],[-58.3660606,-34.7460774],[-58.3666636,-34.7452464],[-58.3719746,-34.7408634],[-58.3748696,-34.7424894]]]}},{"type":"Feature","properties":{"name":"Lomas de Zamora"},"geometry":{"type":"Polygon","coordinates":[[[-58.4123656,-34.7749541],[-58.3785716,-34.7571321],[-58.3839946,-34.7499661],[-58.3868096,-34.7514871],[-58.3882316,-34.7513191],[-58.3911216,-34.7509181],[-58.3959976,-34.7501461],[-58.4004596,-34.7495201],[-58.4060456,-34.7486611],[-58.4060466,-34.7486641],[-58.4243235,-34.7461061],[-58.4251685,-34.7414151],[-58.4272645,-34.7414331],[-58.4280495,-34.7417261],[-58.4285365,-34.7420901],[-58.4290035,-34.7428631],[-58.4291125,-34.7430491],[-58.4293305,-34.7436951],[-58.4294315,-34.7441671],[-58.4296505,-34.7450351],[-58.4297035,-34.7453101],[-58.4301045,-34.7475851],[-58.4308905,-34.7483651],[-58.4318775,-34.7490061],[-58.4328715,-34.7494911],[-58.4339325,-34.7499921],[-58.4349805,-34.7504961],[-58.4355215,-34.7508621],[-58.4356244,-34.7509341],[-58.4357805,-34.7511341],[-58.4357004,-34.7519311],[-58.4342275,-34.7542431],[-58.4340375,-34.7544801],[-58.4328865,-34.7553671],[-58.4322735,-34.7560731],[-58.4313225,-34.7573701],[-58.4305525,-34.7585671],[-58.4296395,-34.7610151],[-58.4289665,-34.7625341],[-58.4282455,-34.7644921],[-58.4279095,-34.7652311],[-58.4283495,-34.7659081],[-58.4290185,-34.7668241],[-58.4296725,-34.7683751],[-58.4294595,-34.7689301],[-58.4289845,-34.7698971],[-58.4284655,-34.7708341],[-58.4280905,-34.7716811],[-58.4278335,-34.7730291],[-58.4276445,-34.7741281],[-58.4271715,-34.7755091],[-58.4263715,-34.7764581],[-58.4252365,-34.7771251],[-58.4248315,-34.7778411],[-58.4246155,-34.7786421],[-58.4245225,-34.7794621],[-58.4245535,-34.7803601],[-58.4246145,-34.7810601],[-58.4246605,-34.7815281],[-58.4174206,-34.7776821],[-58.4145025,-34.7760351],[-58.4128525,-34.7752571],[-58.4122596,-34.7750341],[-58.4124395,-34.7748991],[-58.4124695,-34.7748581],[-58.4123656,-34.7749541]]]}}]};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  "Ambulancia":"#8b5cf6","Policía":"#10b981","Bomberos":"#f59e0b",
  "Sirena":"#38bdf8","Violencia de Género":"#ef4444","default":"#64748b",
};
const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function catColor(cat) { return CAT_COLORS[cat] || CAT_COLORS.default; }
function getHour(h) { if (!h) return null; return parseInt(h.split(":")[0], 10); }
function isFinde(f) { if (!f) return false; const d = new Date(f+"T00:00:00"); return d.getDay()===0||d.getDay()===6; }
function fmt(n) { if(n==null)return"—"; if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return(n/1000).toFixed(1)+"k"; return n.toString(); }
function pct(a,b) { if(!b)return null; return(((a-b)/b)*100).toFixed(1); }
function groupBy(arr,key) { return arr.reduce((acc,r)=>{const k=r[key]??"Sin dato";acc[k]=(acc[k]||0)+1;return acc},{}); }
function topN(obj,n=10) { return Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n); }
function getTurno(h, finde) {
  if (h === null) return "Sin dato";
  if (finde) {
    // Finde: turnos de 12hs — Mañana 06-18, Noche 18-06
    return (h >= 6 && h < 18) ? "Mañana" : "Noche";
  }
  // Semana: turnos de 8hs — Mañana 06-14, Tarde 14-22, Noche 22-06
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
  // color-scheme:dark hace que el ícono del calendario se vea en fondos oscuros
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

            {/* Desde */}
            <div>
              <label style={lbl}>Desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={e=>setFilters(f=>({...f,fechaDesde:e.target.value}))}
                style={dateInp}
              />
            </div>

            {/* Hasta */}
            <div>
              <label style={lbl}>Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={e=>setFilters(f=>({...f,fechaHasta:e.target.value}))}
                style={dateInp}
              />
            </div>

            {/* Turno */}
            <div>
              <label style={lbl}>
                Turno
                <span style={{fontSize:9,color:T.muted,fontWeight:400,letterSpacing:0,textTransform:"none",marginLeft:6}}>
                  sem 8hs · finde 12hs
                </span>
              </label>
              <select value={filters.turno} onChange={e=>setFilters(f=>({...f,turno:e.target.value}))} style={baseInp}>
                <option value="">Todos</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label style={lbl}>Categoría</label>
              <select value={filters.categoria} onChange={e=>setFilters(f=>({...f,categoria:e.target.value}))} style={baseInp}>
                <option value="">Todas</option>
                {(options.categorias||[]).map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label style={lbl}>Tipo</label>
              <select value={filters.tipo} onChange={e=>setFilters(f=>({...f,tipo:e.target.value}))} style={baseInp}>
                <option value="">Todos</option>
                {(options.tipos||[]).map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Reset — alignItems:"end" en el grid lo alinea al fondo igual que los inputs */}
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

// Argentina es UTC-3. Convierte una fecha local YYYY-MM-DD + hora local HH a ISO UTC.
function localToUTC(fechaStr, horaLocal) {
  // horaLocal en horas (ej: 6, 14, 22)
  // Argentina UTC-3: hora UTC = hora local + 3
  const horaUTC = horaLocal + 3;
  if (horaUTC < 24) {
    return `${fechaStr}T${String(horaUTC).padStart(2,"0")}:00:00.000Z`;
  } else {
    // cruza medianoche UTC → siguiente día
    const d = new Date(fechaStr + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    const nextDay = d.toISOString().slice(0,10);
    return `${nextDay}T${String(horaUTC-24).padStart(2,"0")}:00:00.000Z`;
  }
}

// Resta un día a una fecha YYYY-MM-DD
function prevDay(fechaStr) {
  const d = new Date(fechaStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0,10);
}

// Suma un día
function nextDay(fechaStr) {
  const d = new Date(fechaStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0,10);
}

function esFinde(fechaStr) {
  const d = new Date(fechaStr + "T12:00:00Z");
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

// Dado un rango de fechas (desde/hasta YYYY-MM-DD), devuelve los turnos agrupados
// con sus rangos UTC correctos, cruzando medianoche cuando corresponde.
// Agrupa todos los días del período sumando por nombre de turno.
function getTurnosRango(fechaDesde, fechaHasta) {
  // Iteramos cada día del rango
  const turnos = { Mañana: null, Tarde: null, Noche: null };

  let cursor = fechaDesde;
  while (cursor <= fechaHasta) {
    const fin = esFinde(cursor);

    if (fin) {
      // Finde: Mañana 06-18 local, Noche 18-06 local del día siguiente
      if (!turnos.Mañana) turnos.Mañana = [];
      turnos.Mañana.push({
        desde: localToUTC(cursor, 6),
        hasta: localToUTC(cursor, 18),
        fecha: cursor,
      });
      if (!turnos.Noche) turnos.Noche = [];
      turnos.Noche.push({
        desde: localToUTC(cursor, 18),
        hasta: localToUTC(nextDay(cursor), 6),
        fecha: cursor,
      });
    } else {
      // Semana: Mañana 06-14, Tarde 14-22, Noche 22-06 del día siguiente
      if (!turnos.Mañana) turnos.Mañana = [];
      turnos.Mañana.push({
        desde: localToUTC(cursor, 6),
        hasta: localToUTC(cursor, 14),
        fecha: cursor,
      });
      if (!turnos.Tarde) turnos.Tarde = [];
      turnos.Tarde.push({
        desde: localToUTC(cursor, 14),
        hasta: localToUTC(cursor, 22),
        fecha: cursor,
      });
      if (!turnos.Noche) turnos.Noche = [];
      turnos.Noche.push({
        desde: localToUTC(cursor, 22),
        hasta: localToUTC(nextDay(cursor), 6),
        fecha: cursor,
      });
    }

    cursor = nextDay(cursor);
  }

  return Object.entries(turnos)
    .filter(([, v]) => v !== null)
    .map(([nombre, bloques]) => ({ nombre, bloques }));
}

// Para el turno Noche necesitamos también incluir el tramo 00:00-06:00
// que pertenece al turno Noche del día ANTERIOR.
// Esta función cuenta en Supabase los registros de un turno dado dentro de un rango de fechas.
function contarEnSupabase(allData, fechaDesde, fechaHasta, nombreTurno) {
  // El turno Noche incluye registros de la madrugada (00-06) que tienen
  // fecha del día siguiente pero pertenecen al turno de la noche anterior.
  // Por eso expandimos el rango un día en cada extremo para capturarlos.
  const desdeExt = prevDay(fechaDesde);
  const hastaExt = nextDay(fechaHasta);

  return allData.filter(r => {
    if (!r.fecha || !r.horario) return false;
    if (r.fecha < desdeExt || r.fecha > hastaExt) return false;
    const h = getHour(r.horario);
    if (h === null) return false;
    const fin = isFinde(r.fecha);
    const turnoReal = getTurno(h, fin);
    if (turnoReal !== nombreTurno) return false;

    // Para Noche: si es 00-06 pertenece a la noche anterior,
    // verificamos que la noche "padre" caiga en el rango de fechas
    if (nombreTurno === "Noche" && h < 6) {
      const fechaPadre = prevDay(r.fecha);
      return fechaPadre >= fechaDesde && fechaPadre <= fechaHasta;
    }
    // Para otros turnos: la fecha del registro debe estar en rango
    return r.fecha >= fechaDesde && r.fecha <= fechaHasta;
  }).length;
}

async function fetchNovitTotal(token, bloques) {
  // Suma los totalCount de cada bloque horario
  let total = 0;
  for (const b of bloques) {
    const filtro = {
      estadoActual: "Finalizada",
      fechaCreacion: { $gte: b.desde, $lt: b.hasta },
    };
    const url = `${API_NOVIT}?limit=1&filter=${encodeURIComponent(JSON.stringify(filtro))}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    total += data.totalCount ?? 0;
  }
  return total;
}

function AlertaDiscrepancia({ allData, filters }) {
  const [estado, setEstado] = useState("idle");
  const [resultados, setResultados] = useState([]);
  const [ultimaCheck, setUltimaCheck] = useState(null);
  const [expandido, setExpandido] = useState(true);

  // Fechas efectivas: si hay filtro las usamos, si no usamos hoy
  const fechaDesde = filters.fechaDesde || todayStr();
  const fechaHasta = filters.fechaHasta || todayStr();

  useEffect(() => {
    if (allData.length === 0) return;

    async function verificar() {
      const token =
        window._novitToken ||
        localStorage.getItem("novit_token") ||
        sessionStorage.getItem("novit_token");

      if (!token) { setEstado("sin_token"); return; }

      setEstado("cargando");
      setResultados([]);

      const turnosRango = getTurnosRango(fechaDesde, fechaHasta);

      // Filtramos por turno activo en el filtro del dashboard
      const turnosFiltrados = filters.turno
        ? turnosRango.filter(t => t.nombre === filters.turno)
        : turnosRango;

      try {
        const checks = await Promise.all(turnosFiltrados.map(async (turno) => {
          const enSupabase = contarEnSupabase(allData, fechaDesde, fechaHasta, turno.nombre);

          let enNovit = null;
          let errorNovit = null;
          try {
            enNovit = await fetchNovitTotal(token, turno.bloques);
          } catch(e) {
            errorNovit = e.message;
          }

          const discrepancia = enNovit !== null && enSupabase < enNovit;
          const faltantes = enNovit !== null ? enNovit - enSupabase : null;

          return { nombre: turno.nombre, enSupabase, enNovit, discrepancia, faltantes, errorNovit };
        }));

        setResultados(checks);
        setUltimaCheck(new Date().toLocaleTimeString("es-AR"));
        setEstado(checks.some(c => c.discrepancia) ? "alerta" : "ok");
      } catch(e) {
        setEstado("error");
      }
    }

    verificar();
  }, [allData, fechaDesde, fechaHasta, filters.turno]);

  if (estado === "idle") return null;

  if (estado === "sin_token") return (
    <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:12,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:12}}>
      <span style={{fontSize:20,flexShrink:0}}>🔑</span>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:T.amber,marginBottom:4}}>Token de Novit no configurado</div>
        <div style={{fontSize:11,color:T.text2,lineHeight:1.6}}>
          Abrí la consola del browser y ejecutá en el dashboard:
        </div>
        <code style={{display:"block",marginTop:6,background:"rgba(0,0,0,0.3)",padding:"6px 10px",borderRadius:6,fontSize:10,color:"#a5f3fc",lineHeight:1.8}}>
          localStorage.setItem('novit_token', 'TU_TOKEN_AQUÍ')
        </code>
        <div style={{fontSize:10,color:T.muted,marginTop:4}}>Después recargá la página.</div>
      </div>
    </div>
  );

  const hayAlerta = estado === "alerta";
  const cargando  = estado === "cargando";
  const borderColor = cargando ? T.border : hayAlerta ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.35)";
  const bgColor     = cargando ? "rgba(139,92,246,0.05)" : hayAlerta ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.05)";
  const iconoPrin   = cargando ? "⏳" : hayAlerta ? "🚨" : "✅";
  const periodo     = fechaDesde === fechaHasta ? fechaDesde : `${fechaDesde} → ${fechaHasta}`;
  const tituloPrin  = cargando
    ? "Verificando discrepancias con Novit…"
    : hayAlerta
    ? `Discrepancia detectada — ${resultados.filter(r=>r.discrepancia).length} turno(s) con alertas faltantes en Supabase`
    : "Sin discrepancias — Supabase coincide con Novit en todos los turnos";

  return (
    <div style={{background:bgColor,border:`1px solid ${borderColor}`,borderRadius:12,marginBottom:16,overflow:"hidden"}}>
      <div
        onClick={() => !cargando && setExpandido(e => !e)}
        style={{padding:"12px 18px",display:"flex",alignItems:"center",gap:10,cursor:cargando?"default":"pointer"}}
      >
        <span style={{fontSize:18,flexShrink:0}}>{iconoPrin}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,fontFamily:"'Inter',sans-serif",color:cargando?T.text2:hayAlerta?"#fca5a5":"#6ee7b7"}}>
            {tituloPrin}
          </div>
          {ultimaCheck && (
            <div style={{fontSize:10,color:T.muted,marginTop:2,fontFamily:"'Inter',sans-serif"}}>
              Verificado: {ultimaCheck} · Período: {periodo}
              {filters.turno ? ` · Turno: ${filters.turno}` : ""}
            </div>
          )}
        </div>
        {!cargando && (
          <span style={{fontSize:11,color:T.muted,transform:expandido?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
        )}
      </div>

      {!cargando && expandido && resultados.length > 0 && (
        <div style={{borderTop:`1px solid ${borderColor}`,padding:"12px 18px",display:"grid",gridTemplateColumns:`repeat(${resultados.length},1fr)`,gap:10}}>
          {resultados.map(r => {
            const ok = !r.discrepancia && !r.errorNovit;
            const color = r.errorNovit ? T.amber : ok ? T.green : T.red;
            const bg    = r.errorNovit ? "rgba(245,158,11,0.08)" : ok ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.08)";
            const emojiTurno = r.nombre==="Mañana"?"🌅":r.nombre==="Tarde"?"🌇":"🌙";
            const rangoLabel = r.nombre==="Mañana"?"06:00–14:00":r.nombre==="Tarde"?"14:00–22:00":"22:00–06:00";
            return (
              <div key={r.nombre} style={{background:bg,border:`1px solid ${color}33`,borderRadius:10,padding:"10px 14px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color,fontFamily:"'Inter',sans-serif"}}>
                    {emojiTurno} {r.nombre}
                  </span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:9,color:T.muted,fontFamily:"'Inter',sans-serif"}}>{rangoLabel}</span>
                    {r.errorNovit
                      ? <span style={{fontSize:9,color:T.amber,background:"rgba(245,158,11,0.15)",padding:"2px 7px",borderRadius:10,fontWeight:600}}>ERROR</span>
                      : ok
                      ? <span style={{fontSize:9,color:T.green,background:"rgba(16,185,129,0.12)",padding:"2px 7px",borderRadius:10,fontWeight:600}}>OK</span>
                      : <span style={{fontSize:9,color:T.red,background:"rgba(239,68,68,0.15)",padding:"2px 7px",borderRadius:10,fontWeight:600}}>FALTANTES</span>
                    }
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:r.discrepancia||r.errorNovit?8:0}}>
                  {[
                    ["Novit (esperado)", r.enNovit!==null?r.enNovit.toLocaleString():"—", T.text],
                    ["Supabase (cargado)", r.enSupabase.toLocaleString(), r.discrepancia?T.red:T.text],
                  ].map(([lbl,val,col])=>(
                    <div key={lbl} style={{background:"rgba(0,0,0,0.2)",borderRadius:7,padding:"6px 10px"}}>
                      <div style={{fontSize:9,color:T.muted,fontFamily:"'Inter',sans-serif",marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{lbl}</div>
                      <div style={{fontSize:18,fontWeight:800,color:col,fontFamily:"'Inter',sans-serif",lineHeight:1}}>{val}</div>
                    </div>
                  ))}
                </div>
                {r.discrepancia && r.faltantes!==null && (
                  <div style={{padding:"5px 10px",background:"rgba(239,68,68,0.12)",borderRadius:7,fontSize:11,color:"#fca5a5",fontWeight:600,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                    ⚠ {r.faltantes.toLocaleString()} alertas sin cargar
                  </div>
                )}
                {r.errorNovit && (
                  <div style={{fontSize:10,color:T.amber,fontFamily:"'Inter',sans-serif"}}>Error: {r.errorNovit}</div>
                )}
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

  // Daily chart
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
    {id:"mapa",    label:"Mapa",      icon:"◎"},
    {id:"ejecutivo",label:"Ejecutivo", icon:"◈"},
    {id:"temporal", label:"Temporal",  icon:"◷"},
    {id:"cgm",     label:"Por Zona",  icon:"◉"},
  ];

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
          /* forzar colores de fondo en cards y KPIs */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* encabezado de impresión con resumen de filtros */
          .print-header { display: block !important; }
          /* ocultar mapa leaflet en print (no renderiza bien) */
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
                {loading?`Cargando… ${loadProgress.toLocaleString()} reg.`:`${allData.length.toLocaleString()} registros · ${filteredData.length.toLocaleString()} filtrados`}
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

          {/* ── ALERTA DISCREPANCIA NOVIT vs SUPABASE ── */}
          {!loading && <AlertaDiscrepancia allData={allData} filters={filters}/>}

          {/* ── FILTROS ── */}
          <div className="no-print">
            <FiltersPanel filters={filters} setFilters={setFilters} options={options} open={filtersOpen} setOpen={setFiltersOpen}/>
          </div>

          {/* ── TABS + ZONA ACTIVA + PDF ── */}
          <div className="no-print" style={{display:"flex",alignItems:"center",gap:6,marginBottom:20,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const isActive = view===t.id;
              return (
                <button key={t.id} onClick={()=>setView(t.id)} style={{
                  background: isActive ? `rgba(139,92,246,0.15)` : "transparent",
                  border: `1px solid ${isActive?T.accent:T.border}`,
                  color: isActive ? T.text : T.text2,
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
                  <span style={{color:isActive?T.accent:T.muted,fontSize:13}}>{t.icon}</span>
                  {t.label.toUpperCase()}
                </button>
              );
            })}

            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              {filters.cgm && (
                <>
                  <span style={{fontSize:10,color:T.muted,fontWeight:600}}>ZONA:</span>
                  <span style={{fontSize:11,color:T.accent,fontWeight:700,background:"rgba(139,92,246,0.15)",padding:"3px 12px",borderRadius:20,border:`1px solid rgba(139,92,246,0.3)`}}>{filters.cgm}</span>
                  <button onClick={()=>setFilters(f=>({...f,cgm:""}))} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:14,lineHeight:1,padding:"2px 4px"}}>✕</button>
                </>
              )}
              {/* PDF export */}
              <button
                className="no-print"
                onClick={()=>window.print()}
                style={{
                  background:`rgba(139,92,246,0.15)`,
                  border:`1px solid ${T.accent}`,
                  color:T.accent,
                  borderRadius:10,
                  padding:"8px 16px",
                  fontSize:11,
                  fontFamily:"'Inter',sans-serif",
                  fontWeight:700,
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  letterSpacing:"0.05em",
                  transition:"all 0.15s",
                }}
              >
                ⬇ EXPORTAR PDF
              </button>
            </div>
          </div>

          {/* ── CONTENIDO ── */}
          {loading?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:0.6}}>⚡</div>
              <div style={{fontSize:12,color:T.muted,fontWeight:500}}>Cargando {loadProgress.toLocaleString()} registros…</div>
              <div style={{width:200,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:"60%",background:`linear-gradient(90deg,${T.accent},${T.green})`,borderRadius:2}}/>
              </div>
            </div>
          ):(
            <>
              {view==="ejecutivo" && <ViewEjecutivo data={filteredData} prevData={prevData}/>}
              {view==="temporal"  && <ViewTemporal data={filteredData}/>}
              {view==="cgm"       && <ViewCGM data={filteredData}/>}
              {view==="mapa"      && (leafletReady
                ? <ViewMapa data={dataForMap} filters={filters} setFilters={setFilters}/>
                : <div style={{color:T.muted,fontSize:12,padding:20}}>Cargando mapa…</div>
              )}
            </>
          )}

          {/* ── ENCABEZADO SOLO VISIBLE AL IMPRIMIR ── */}
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
