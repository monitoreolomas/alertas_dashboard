import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import { createClient } from "@supabase/supabase-js";
import { T } from "./theme.js";
import ChatWidget from "./ChatWidget.jsx";


const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const APP_ENABLED = import.meta.env.VITE_APP_ENABLED !== "true";
const VECINOS_API = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

// ─── GEOJSON COMPLETO ─────────────────────────────────────────────────────────
const CGM_GEOJSON = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Ingeniero Budge"},"geometry":{"type":"Polygon","coordinates":[[[-58.4610056,-34.7053577],[-58.461048,-34.705404],[-58.461337,-34.705605],[-58.461474,-34.70584],[-58.471049,-34.715476],[-58.469986,-34.716167],[-58.469503,-34.716763],[-58.46918,-34.717555],[-58.468882,-34.718216],[-58.468333,-34.718757],[-58.467408,-34.719154],[-58.467152,-34.719734],[-58.466519,-34.720098],[-58.466293,-34.720573],[-58.466223,-34.721083],[-58.466949,-34.721578],[-58.46819,-34.722282],[-58.467838,-34.722883],[-58.467368,-34.723536],[-58.466803,-34.724126],[-58.466428,-34.724606],[-58.465618,-34.725637],[-58.464879,-34.726622],[-58.463908,-34.727342],[-58.463384,-34.727864],[-58.462947,-34.728421],[-58.462469,-34.728968],[-58.462076,-34.729393],[-58.461735,-34.730025],[-58.461382,-34.73044],[-58.46094,-34.730889],[-58.460557,-34.731589],[-58.460466,-34.731933],[-58.460373,-34.732074],[-58.460126,-34.731941],[-58.45573,-34.729741],[-58.450571,-34.727019],[-58.44655,-34.724922],[-58.444147,-34.723583],[-58.446535,-34.720601],[-58.450289,-34.715915],[-58.451869,-34.713954],[-58.455337,-34.709929],[-58.456351,-34.708729],[-58.457383,-34.707828],[-58.458158,-34.707197],[-58.458866,-34.706602],[-58.459806,-34.706079],[-58.460431,-34.705666],[-58.460993,-34.705321],[-58.4610056,-34.7053577]]]}},{"type":"Feature","properties":{"name":"Parque Barón"},"geometry":{"type":"Polygon","coordinates":[[[-58.4545316,-34.7577462],[-58.4442716,-34.7717582],[-58.4396026,-34.7781882],[-58.4384946,-34.7796862],[-58.4363085,-34.7827612],[-58.4342595,-34.7841672],[-58.4334956,-34.7844312],[-58.4324395,-34.7848152],[-58.4320715,-34.7846922],[-58.4314536,-34.7844922],[-58.4301565,-34.7840162],[-58.4274296,-34.7829812],[-58.4262025,-34.7825292],[-58.4248625,-34.7819132],[-58.4247975,-34.7809642],[-58.4247435,-34.7798442],[-58.4248375,-34.7790452],[-58.4250675,-34.7782292],[-58.4254465,-34.7775302],[-58.4266415,-34.7768222],[-58.4273806,-34.7759082],[-58.4278675,-34.7745382],[-58.4279465,-34.7741042],[-58.4281455,-34.7729772],[-58.4283085,-34.7720862],[-58.4287105,-34.7712082],[-58.4295056,-34.7697222],[-58.4298855,-34.7687662],[-58.4292426,-34.7672372],[-58.4286505,-34.7664422],[-58.4281405,-34.7656282],[-58.4285275,-34.7647422],[-58.4289005,-34.7637192],[-58.4293006,-34.7626412],[-58.4294216,-34.7624442],[-58.4308295,-34.7588662],[-58.4311596,-34.7583782],[-58.4321475,-34.7569352],[-58.4329566,-34.7559372],[-58.4334646,-34.7554792],[-58.4342755,-34.7548652],[-58.4344355,-34.7546622],[-58.4356822,-34.7552644],[-58.4364145,-34.7537462],[-58.4379765,-34.7530922],[-58.4390346,-34.7525922],[-58.4400165,-34.7521112],[-58.4405326,-34.7520762],[-58.4413806,-34.7524832],[-58.4426926,-34.7532452],[-58.4439826,-34.7538142],[-58.4443026,-34.7537682],[-58.4450386,-34.7527682],[-58.4522206,-34.7565752],[-58.4545316,-34.7577462]]]}},{"type":"Feature","properties":{"name":"Santa Catalina"},"geometry":{"type":"Polygon","coordinates":[[[-58.4841686,-34.7297412],[-58.4841713,-34.729743],[-58.4841685,-34.729743],[-58.4841683,-34.729747],[-58.4841683,-34.729761],[-58.4841653,-34.729763],[-58.4841703,-34.729765],[-58.4841673,-34.729767],[-58.4841733,-34.729765],[-58.4841673,-34.72977],[-58.4841623,-34.729826],[-58.4841113,-34.730079],[-58.4840493,-34.73038],[-58.4838683,-34.73126],[-58.4840633,-34.732016],[-58.4841713,-34.732239],[-58.4848943,-34.732337],[-58.4855243,-34.732259],[-58.4857373,-34.732019],[-58.4862803,-34.731024],[-58.4869113,-34.729845],[-58.4873573,-34.729585],[-58.4887883,-34.729005],[-58.4900523,-34.728598],[-58.4917993,-34.728222],[-58.4926553,-34.727548],[-58.4932703,-34.726738],[-58.4936153,-34.725573],[-58.4937813,-34.725032],[-58.4943433,-34.724817],[-58.4956823,-34.724925],[-58.4970033,-34.72389],[-58.4983033,-34.723209],[-58.4995113,-34.722992],[-58.5013503,-34.722971],[-58.4727613,-34.760736],[-58.4577923,-34.75321],[-58.4584863,-34.7522485],[-58.4591803,-34.751146],[-58.4603303,-34.749616],[-58.4612813,-34.74828],[-58.4625103,-34.74658],[-58.4631533,-34.7458],[-58.4636083,-34.745117],[-58.4646933,-34.743704],[-58.4653463,-34.742864],[-58.4657013,-34.742354],[-58.4667123,-34.741121],[-58.4678443,-34.739605],[-58.4689043,-34.738298],[-58.4702083,-34.736928],[-58.4714273,-34.735882],[-58.4727543,-34.734926],[-58.4739083,-34.734015],[-58.4750013,-34.73325],[-58.4762663,-34.732278],[-58.4773463,-34.731458],[-58.4787603,-34.730367],[-58.4800893,-34.729369],[-58.4811893,-34.728516],[-58.4821013,-34.727826],[-58.4832993,-34.726788],[-58.4842963,-34.727755],[-58.4839213,-34.728088],[-58.4835613,-34.728409],[-58.4839933,-34.729474],[-58.4841473,-34.729544],[-58.4841573,-34.729561],[-58.4841573,-34.729571],[-58.4841653,-34.729627],[-58.4841703,-34.729652],[-58.4841673,-34.729661],[-58.4841723,-34.72967],[-58.4841686,-34.7297412]]]}},{"type":"Feature","properties":{"name":"Santa Marta"},"geometry":{"type":"Polygon","coordinates":[[[-58.4546175,-34.7573194],[-58.4521905,-34.7560844],[-58.4499285,-34.7548894],[-58.4467325,-34.7531964],[-58.4451585,-34.7523624],[-58.4443705,-34.7533774],[-58.4440505,-34.7533844],[-58.4425125,-34.7526864],[-58.4413735,-34.7520144],[-58.4406165,-34.7516574],[-58.4401635,-34.7516744],[-58.4394595,-34.7520084],[-58.4384055,-34.7525204],[-58.4370795,-34.7531084],[-58.4360195,-34.7535134],[-58.4345326,-34.7542284],[-58.4354096,-34.7528324],[-58.4360005,-34.7519454],[-58.4360875,-34.7512474],[-58.4360815,-34.7510984],[-58.4359845,-34.7509704],[-58.4358895,-34.7508754],[-58.4353356,-34.7505094],[-58.4336236,-34.7496814],[-58.4322656,-34.7490294],[-58.4312296,-34.7483674],[-58.4304156,-34.7475624],[-58.4302146,-34.7463914],[-58.4299566,-34.7450004],[-58.4297486,-34.7442094],[-58.4296336,-34.7436274],[-58.4303676,-34.7425314],[-58.4308416,-34.7418044],[-58.4317966,-34.7404704],[-58.4326236,-34.7393264],[-58.4331806,-34.7385634],[-58.4336776,-34.7378174],[-58.4339576,-34.7373114],[-58.4344236,-34.7365444],[-58.4349836,-34.7357604],[-58.4422765,-34.7397124],[-58.4430555,-34.7401644],[-58.4458805,-34.7418284],[-58.4524265,-34.7454484],[-58.4535485,-34.7440114],[-58.4615355,-34.7481744],[-58.4546175,-34.7573194]]]}},{"type":"Feature","properties":{"name":"Turdera"},"geometry":{"type":"Polygon","coordinates":[[[-58.4100822,-34.7988914],[-58.3954082,-34.7909594],[-58.3959592,-34.7828934],[-58.3968172,-34.7838084],[-58.3969472,-34.7839384],[-58.3984662,-34.7852614],[-58.3994532,-34.7856874],[-58.4015772,-34.7865864],[-58.4037882,-34.7867804],[-58.4055792,-34.7865944],[-58.4084792,-34.7860554],[-58.4100182,-34.7857874],[-58.4111642,-34.7856524],[-58.4128902,-34.7855204],[-58.4170362,-34.7851994],[-58.4207902,-34.7849584],[-58.4100822,-34.7988914]]]}},{"type":"Feature","properties":{"name":"Villa Albertina"},"geometry":{"type":"Polygon","coordinates":[[[-58.47121,-34.73611],[-58.470389,-34.736762],[-58.469551,-34.737637],[-58.468846,-34.73841],[-58.468309,-34.739052],[-58.467795,-34.739678],[-58.46651,-34.741386],[-58.466881,-34.740932],[-58.466033,-34.74197],[-58.465547,-34.742594],[-58.464736,-34.743634],[-58.46418,-34.744343],[-58.463636,-34.745073],[-58.463078,-34.745859],[-58.462528,-34.746546],[-58.461787,-34.747542],[-58.461352,-34.748346],[-58.457844,-34.746579],[-58.454737,-34.744976],[-58.453396,-34.744241],[-58.452276,-34.745671],[-58.447409,-34.743039],[-58.442211,-34.739975],[-58.43695,-34.73713],[-58.434832,-34.735977],[-58.435478,-34.734881],[-58.436845,-34.73316],[-58.438985,-34.730444],[-58.439869,-34.729234],[-58.440401,-34.728532],[-58.441786,-34.726682],[-58.442728,-34.725417],[-58.444172,-34.723605],[-58.456083,-34.729919],[-58.460382,-34.73207],[-58.46094,-34.730889],[-58.46273,-34.731808],[-58.465402,-34.733236],[-58.469938,-34.73552],[-58.470633,-34.73585],[-58.47121,-34.73611]]]}},{"type":"Feature","properties":{"name":"Villa Centenario"},"geometry":{"type":"Polygon","coordinates":[[[-58.4275063,-34.713399],[-58.4360813,-34.717722],[-58.4409513,-34.720403],[-58.4448803,-34.72265],[-58.4421503,-34.726179],[-58.4386453,-34.73088],[-58.4354693,-34.734893],[-58.4348803,-34.735883],[-58.4341653,-34.736883],[-58.4332853,-34.738371],[-58.4318693,-34.74034],[-58.4310283,-34.741482],[-58.4301113,-34.742937],[-58.4294553,-34.743836],[-58.4293583,-34.743562],[-58.4292433,-34.743213],[-58.4289743,-34.742781],[-58.4286883,-34.742288],[-58.4281953,-34.741922],[-58.4274273,-34.741635],[-58.4266413,-34.74162],[-58.4254243,-34.741608],[-58.4253063,-34.74161],[-58.4259703,-34.738371],[-58.4245163,-34.73769],[-58.4180993,-34.734775],[-58.4160063,-34.733941],[-58.4132863,-34.732524],[-58.4200553,-34.7232],[-58.4275063,-34.713399]]]}},{"type":"Feature","properties":{"name":"Villa Fiorito"},"geometry":{"type":"Polygon","coordinates":[[[-58.4467687,-34.6882615],[-58.4517837,-34.6946655],[-58.4556937,-34.6993375],[-58.4612297,-34.7055165],[-58.4588387,-34.7069315],[-58.4580927,-34.7073745],[-58.4577607,-34.7074625],[-58.4574057,-34.7079395],[-58.4564557,-34.7087075],[-58.4533857,-34.7122025],[-58.4504247,-34.7158095],[-58.4473897,-34.7194795],[-58.4455617,-34.7218125],[-58.4448267,-34.7226995],[-58.4390907,-34.7194605],[-58.4356147,-34.7175615],[-58.4333947,-34.7163805],[-58.4274557,-34.7134565],[-58.4467687,-34.6882615]]]}},{"type":"Feature","properties":{"name":"Villa Lamadrid"},"geometry":{"type":"Polygon","coordinates":[[[-58.4712833,-34.7360621],[-58.4659003,-34.7334051],[-58.4611053,-34.7308741],[-58.4612103,-34.7306841],[-58.4617273,-34.7301171],[-58.4621533,-34.7293861],[-58.4624753,-34.7290451],[-58.4635533,-34.7277811],[-58.4636633,-34.7276131],[-58.4637703,-34.7275471],[-58.4644383,-34.7270081],[-58.4650143,-34.7264991],[-58.4663073,-34.7248631],[-58.4671123,-34.7238911],[-58.4678503,-34.7229671],[-58.4682953,-34.7222211],[-58.4677063,-34.7218931],[-58.4666693,-34.7213111],[-58.4663233,-34.7210301],[-58.4663853,-34.7205591],[-58.4666263,-34.7200681],[-58.4672563,-34.7196741],[-58.4675063,-34.7191081],[-58.4679923,-34.7188981],[-58.4687143,-34.7184461],[-58.4689573,-34.7182141],[-58.4696323,-34.7166711],[-58.4701483,-34.7161011],[-58.4711343,-34.7154221],[-58.4745333,-34.7185691],[-58.4834183,-34.7268051],[-58.4712833,-34.7360621]]]}},{"type":"Feature","properties":{"name":"San José"},"geometry":{"type":"Polygon","coordinates":[[[-58.3639498,-34.749648],[-58.3777278,-34.756942],[-58.3714548,-34.766477],[-58.3707818,-34.76615],[-58.3644808,-34.774739],[-58.3585148,-34.771679],[-58.3619018,-34.767691],[-58.3535708,-34.763385],[-58.3368167,-34.754568],[-58.3420837,-34.746568],[-58.3433697,-34.74266],[-58.3442387,-34.736811],[-58.3476628,-34.739888],[-58.3565258,-34.739987],[-58.3669788,-34.745587],[-58.3642868,-34.749186],[-58.3637478,-34.749894],[-58.3639498,-34.749648]]]}},{"type":"Feature","properties":{"name":"Temperley"},"geometry":{"type":"Polygon","coordinates":[[[-58.3959237,-34.782886],[-58.3952337,-34.790769],[-58.3642357,-34.774421],[-58.3705377,-34.76589],[-58.3712027,-34.766217],[-58.3774807,-34.756684],[-58.3976517,-34.767246],[-58.3976517,-34.767253],[-58.4236336,-34.781148],[-58.4207017,-34.78488],[-58.4162027,-34.785178],[-58.4098607,-34.785717],[-58.4052117,-34.786567],[-58.4035537,-34.786707],[-58.4014857,-34.786516],[-58.3983617,-34.7852],[-58.3967757,-34.783799],[-58.3959237,-34.782886]]]}},{"type":"Feature","properties":{"name":"Llavallol"},"geometry":{"type":"Polygon","coordinates":[[[-58.444374,-34.77136],[-58.459074,-34.779015],[-58.430373,-34.817235],[-58.404803,-34.804497],[-58.407703,-34.800901],[-58.408309,-34.800926],[-58.409666,-34.799307],[-58.412605,-34.795638],[-58.412621,-34.795639],[-58.423751,-34.781192],[-58.425866,-34.782214],[-58.43096,-34.784132],[-58.432361,-34.784612],[-58.434171,-34.783966],[-58.436212,-34.782561],[-58.438252,-34.779688],[-58.441021,-34.775944],[-58.444374,-34.77136]]]}},{"type":"Feature","properties":{"name":"Banfield"},"geometry":{"type":"Polygon","coordinates":[[[-58.3748696,-34.7424894],[-58.3801995,-34.7383504],[-58.3861425,-34.7366684],[-58.3898615,-34.7361034],[-58.3942925,-34.7354274],[-58.3942935,-34.7354354],[-58.3971425,-34.7348814],[-58.4018455,-34.7340724],[-58.4047055,-34.7336334],[-58.4128665,-34.7324894],[-58.4131165,-34.7322974],[-58.4154554,-34.7335174],[-58.4190074,-34.7349404],[-58.4206144,-34.7357424],[-58.4242664,-34.7373854],[-58.4259844,-34.7381824],[-58.4258144,-34.7385594],[-58.4253984,-34.7402724],[-58.4251804,-34.7413854],[-58.4248794,-34.7432434],[-58.4243414,-34.7460794],[-58.4228314,-34.7462904],[-58.4203784,-34.7466504],[-58.4169264,-34.7471424],[-58.4139295,-34.7475374],[-58.4118145,-34.7478364],[-58.4100125,-34.7481004],[-58.4068595,-34.7485474],[-58.4050855,-34.7488164],[-58.3999595,-34.7495754],[-58.3960045,-34.7501324],[-58.3912915,-34.7508724],[-58.3881385,-34.7513134],[-58.3868115,-34.7514674],[-58.3839835,-34.7499494],[-58.3785695,-34.7571124],[-58.3772045,-34.7564034],[-58.3698596,-34.7525384],[-58.3636706,-34.7492424],[-58.3660606,-34.7460774],[-58.3666636,-34.7452464],[-58.3719746,-34.7408634],[-58.3748696,-34.7424894]]]}},{"type":"Feature","properties":{"name":"Lomas de Zamora"},"geometry":{"type":"Polygon","coordinates":[[[-58.4123656,-34.7749541],[-58.3785716,-34.7571321],[-58.3839946,-34.7499661],[-58.3868096,-34.7514871],[-58.3882316,-34.7513191],[-58.3911216,-34.7509181],[-58.3959976,-34.7501461],[-58.4004596,-34.7495201],[-58.4060456,-34.7486611],[-58.4060466,-34.7486641],[-58.4243235,-34.7461061],[-58.4251685,-34.7414151],[-58.4272645,-34.7414331],[-58.4280495,-34.7417261],[-58.4285365,-34.7420901],[-58.4290035,-34.7428631],[-58.4291125,-34.7430491],[-58.4293305,-34.7436951],[-58.4294315,-34.7441671],[-58.4296505,-34.7450351],[-58.4297035,-34.7453101],[-58.4301045,-34.7475851],[-58.4308905,-34.7483651],[-58.4318775,-34.7490061],[-58.4328715,-34.7494911],[-58.4339325,-34.7499921],[-58.4349805,-34.7504961],[-58.4355215,-34.7508621],[-58.4356244,-34.7509341],[-58.4357805,-34.7511341],[-58.4357004,-34.7519311],[-58.4342275,-34.7542431],[-58.4340375,-34.7544801],[-58.4328865,-34.7553671],[-58.4322735,-34.7560731],[-58.4313225,-34.7573701],[-58.4305525,-34.7585671],[-58.4296395,-34.7610151],[-58.4289665,-34.7625341],[-58.4282455,-34.7644921],[-58.4279095,-34.7652311],[-58.4283495,-34.7659081],[-58.4290185,-34.7668241],[-58.4296725,-34.7683751],[-58.4294595,-34.7689301],[-58.4289845,-34.7698971],[-58.4284655,-34.7708341],[-58.4280905,-34.7716811],[-58.4278335,-34.7730291],[-58.4276445,-34.7741281],[-58.4271715,-34.7755091],[-58.4263715,-34.7764581],[-58.4252365,-34.7771251],[-58.4248315,-34.7778411],[-58.4246155,-34.7786421],[-58.4245225,-34.7794621],[-58.4245535,-34.7803601],[-58.4246145,-34.7810601],[-58.4246605,-34.7815281],[-58.4174206,-34.7776821],[-58.4145025,-34.7760351],[-58.4128525,-34.7752571],[-58.4122596,-34.7750341],[-58.4124395,-34.7748991],[-58.4124695,-34.7748581],[-58.4123656,-34.7749541]]]}}]};

// ─── CGM OPTIONS ──────────────────────────────────────────────────────────────
const CGM_OPTIONS = CGM_GEOJSON.features.map(f => f.properties.name).sort();

// ─── UTILS ────────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  "Ambulancia":"#8b5cf6","Policía":"#10b981","Bomberos":"#f59e0b",
  "Sirena":"#38bdf8","Violencia de Género":"#ef4444","default":"#64748b",
};
const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function catColor(cat) { return CAT_COLORS[cat] || CAT_COLORS.default; }
function getHour(h) { if (!h) return null; return parseInt(h.split(":")[0], 10); }

function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  return fecha;
}

function isFinde(f) {
  if (!f) return false;
  const dt = parseFecha(f);
  return dt.getDay() === 0 || dt.getDay() === 6;
}
function fmt(n) { if(n==null)return"—"; if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return(n/1000).toFixed(1)+"k"; return n.toString(); }
function pct(a,b) { if(!b)return null; return(((a-b)/b)*100).toFixed(1); }
function groupBy(arr,key) { return arr.reduce((acc,r)=>{const k=r[key]??"Sin dato";acc[k]=(acc[k]||0)+1;return acc},{}); }
function topN(obj,n=10) { return Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n); }
function getTurno(h, finde) {
  if (h === null) return "Sin dato";
  if (finde) return (h >= 6 && h < 18) ? "Mañana" : "Noche";
  if (h >= 6 && h < 14) return "Mañana";
  if (h >= 14 && h < 22) return "Tarde";
  return "Noche";
}

// ─── FIX FECHA AR ─────────────────────────────────────────────────────────────
// Siempre calcula la fecha en Argentina (UTC-3), sin depender del timezone del browser
function getArDate() {
  const now = new Date();
  // Offset de Argentina: UTC-3 = -180 minutos
  const AR_OFFSET_MS = -3 * 60 * 60 * 1000;
  const arMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000 + AR_OFFSET_MS;
  return new Date(arMs);
}

function todayStr() {
  const ar = getArDate();
  const y = ar.getFullYear();
  const m = String(ar.getMonth() + 1).padStart(2, "0");
  const d = String(ar.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function firstOfMonthStr() {
  const ar = getArDate();
  const y = ar.getFullYear();
  const m = String(ar.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const fn = parseFecha(fechaNacimiento.slice(0, 10));
  if (!fn || isNaN(fn)) return null;
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// (definidos en ./theme.js para que ChatWidget.jsx también pueda usarlos)

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Sparkline({ values, color=T.accent, w=90, h=26 }) {
  if(!values||values.length<2) return null;
  const max=Math.max(...values,1), min=Math.min(...values), range=max-min||1;
  const pts=values.map((v,i)=>`${((i/(values.length-1))*w).toFixed(1)},${(h-2-((v-min)/range)*(h-4)).toFixed(1)}`).join(" ");
  const lx=parseFloat(pts.split(" ").at(-1).split(",")[0]);
  const ly=parseFloat(pts.split(" ").at(-1).split(",")[1]);
  return (
    <svg width={w} height={h} style={{overflow:"visible",display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8"/>
      <circle cx={lx} cy={ly} r="2.5" fill={color}/>
    </svg>
  );
}

function KPI({ label, value, sub, delta, sparkValues, color=T.accent, icon, invertDelta=false }) {
  const dNum = parseFloat(delta);
  const isPos = dNum > 0, isNeg = dNum < 0;
  let deltaColor, deltaIcon;
  if (invertDelta) {
    deltaColor = isPos ? T.red : isNeg ? T.green : T.muted;
    deltaIcon  = isPos ? "▲" : isNeg ? "▼" : "●";
  } else {
    deltaColor = isNeg ? T.red : isPos ? T.green : T.muted;
    deltaIcon  = isPos ? "▲" : isNeg ? "▼" : "●";
  }
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
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
          <Fragment key={`row-${ri}`}>
            <div style={{fontSize:9,color:T.text2,display:"flex",alignItems:"center",fontFamily:"'Inter',sans-serif"}}>{row}</div>
            {colLabels.map((_,ci)=>{
              const v=matrix[ri][ci]; const intensity=v/max;
              const bg = intensity<0.01 ? "rgba(255,255,255,0.03)" : `rgba(139,92,246,${0.08+intensity*0.82})`;
              return <div key={`${ri}-${ci}`} style={{background:bg,borderRadius:2,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:intensity>0.5?"#e2e8f0":"#64748b",fontFamily:"'Inter',sans-serif",cursor:"default"}} title={`${row} ${colLabels[ci]}: ${v}`}>{v>0?v:""}</div>;
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── FILTROS (main dashboard) ─────────────────────────────────────────────────
function FiltersPanel({ filters, setFilters, options, open, setOpen }) {
  const baseInp = {
    background:"#0d0d1f",border:`1px solid ${T.border}`,color:T.text,
    borderRadius:10,padding:"7px 10px",fontSize:12,
    fontFamily:"'Inter',sans-serif",outline:"none",width:"100%",
  };
  const dateInp = { ...baseInp, colorScheme:"dark" };
  const lbl = {fontSize:11,color:T.text2,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Inter',sans-serif",display:"block"};
  const hasActive = filters.cgm||filters.categoria||filters.tipo||filters.turno;

  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,marginBottom:20,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"transparent",border:"none",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:T.text2}}>
        <span style={{fontSize:12,fontWeight:600,fontFamily:"'Inter',sans-serif",letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:8}}>
          <span>⚙</span> FILTROS
          {hasActive && <span style={{background:T.accent,color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700}}>activos</span>}
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
              onClick={()=>setFilters({fechaDesde:"2026-04-01",fechaHasta:"2026-04-30",cgm:"",categoria:"",tipo:"",turno:""})}
              style={{background:"rgba(139,92,246,0.12)",border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,padding:"7px 14px",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600,width:"100%",height:34}}
            >↺ Resetear</button>
          </div>
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
  const byDow=useMemo(()=>{const d=Array(7).fill(0);data.forEach(r=>{if(r.fecha)d[parseFecha(r.fecha).getDay()]++});return d},[data]);
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
        <KPI label="Total Alertas" value={fmt(total)} sub={`${uniqueDays} días con registros`} delta={pct(total,totalPrev)} sparkValues={byDay.slice(-14)} color={T.accent} icon="📡" invertDelta={true}/>
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
              const idx=i*step; const [fecha]=byDayEntries[idx]; const d=parseFecha(fecha);
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
  const heatmap=useMemo(()=>{
    const m=Array.from({length:7},()=>Array(24).fill(0));
    data.forEach(r=>{
      const h=getHour(r.horario);
      if(h===null||!r.fecha)return;
      m[parseFecha(r.fecha).getDay()][h]++;
    });
    return m;
  },[data]);

  const catFindeVsSem=useMemo(()=>{
    const d={};
    data.forEach(r=>{
      const cat=r.categoria||"Sin dato";
      if(!d[cat])d[cat]={sem:0,fin:0};
      if(isFinde(r.fecha))d[cat].fin++;
      else d[cat].sem++;
    });
    return Object.entries(d).sort((a,b)=>(b[1].sem+b[1].fin)-(a[1].sem+a[1].fin)).slice(0,8);
  },[data]);

  const colHours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));

  if (!data || data.length === 0) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300,color:T.muted,fontSize:13,fontFamily:"'Inter',sans-serif"}}>
        Sin datos para el período seleccionado
      </div>
    );
  }

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
    if (!count) return { fill:"rgba(139,92,246,0.08)", opacity:0.7 };
    const t = count / maxCount;
    if (t < 0.25) return { fill:`rgba(109,40,217,${0.2+t*1.2})`, opacity:0.85 };
    if (t < 0.5)  return { fill:`rgba(139,92,246,${0.3+t*0.8})`, opacity:0.88 };
    if (t < 0.75) return { fill:`rgba(245,158,11,${0.4+t*0.6})`, opacity:0.9 };
    return { fill:`rgba(239,68,68,${0.5+t*0.5})`, opacity:0.92 };
  }

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    if (!L) return;
    const map = L.map(mapRef.current, { center:[-34.762,-58.42], zoom:12, zoomControl:false, attributionControl:false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { className:"cgm-dark-tiles" }).addTo(map);
    L.control.zoom({ position:"bottomright" }).addTo(map);
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
        style:{ fillColor:fill, fillOpacity:opacity, color:"rgba(139,92,246,0.4)", weight:1.5, opacity:0.9 }
      });
      layer.on("mouseover", function() { this.setStyle({ color:"#8b5cf6", weight:2.5, fillOpacity:Math.min(opacity+0.1,1) }); });
      layer.on("mouseout",  function() { this.setStyle({ fillColor:fill, fillOpacity:opacity, color:"rgba(139,92,246,0.4)", weight:1.5 }); });
      layer.on("click", function() { setFilters(f=>({...f, cgm:name})); });
      const center = layer.getBounds().getCenter();
      const total = Object.values(countsByCgm).reduce((a,b)=>a+b,0);
      const pctVal = count>0?((count/total)*100).toFixed(1):"0";
      const label = L.divIcon({
        className:"",
        html:`<div style="font-family:Inter,sans-serif;font-size:10px;color:#e2e8f0;text-align:center;white-space:nowrap;text-shadow:0 1px 3px #000;pointer-events:none;"><div style="font-size:11px;font-weight:700;letter-spacing:0.03em">${name}</div><div style="font-size:9px;color:#94a3b8;">${count>0?fmt(count)+" ("+pctVal+"%)":"sin datos"}</div></div>`,
        iconAnchor:[0,0],
      });
      const marker = L.marker(center, { icon:label, interactive:false });
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
  { label:"18–25", min:18,  max:25,  color:"#38bdf8" },
  { label:"26–35", min:26,  max:35,  color:"#8b5cf6" },
  { label:"36–45", min:36,  max:45,  color:"#10b981" },
  { label:"46–55", min:46,  max:55,  color:"#f59e0b" },
  { label:"56–65", min:56,  max:65,  color:"#ef4444" },
  { label:"66–75", min:66,  max:75,  color:"#f472b6" },
  { label:"76–100",min:76,  max:100, color:"#a78bfa" },
];

function fmtNum(n) {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("es-AR");
}

function AgeBarChart({ ranges, total }) {
  if (!ranges || ranges.length === 0)
    return <div style={{color:T.muted,fontSize:11,fontFamily:"'Inter',sans-serif"}}>Sin datos de edad válidos</div>;
  const maxVal = Math.max(...ranges.map(r => r.value), 1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {ranges.map(r => {
        const pct = total > 0 ? ((r.value / total) * 100).toFixed(1) : 0;
        const barW = (r.value / maxVal) * 100;
        return (
          <div key={r.label}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:700,color:r.color,fontFamily:"'Inter',sans-serif",minWidth:60}}>{r.label}</span>
              <span style={{fontSize:11,color:T.text,fontFamily:"'Inter',sans-serif",fontWeight:600}}>{r.value.toLocaleString("es-AR")}</span>
              <span style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif",minWidth:40,textAlign:"right"}}>{pct}%</span>
            </div>
            <div style={{height:18,background:"rgba(255,255,255,0.04)",borderRadius:5,overflow:"hidden"}}>
              <div style={{
                height:"100%", width:`${barW}%`,
                background:`linear-gradient(90deg,${r.color}cc,${r.color})`,
                borderRadius:5, transition:"width 0.6s ease",
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ViewUsuarios() {
  const [estado, setEstado]                   = useState("idle");
  // todosActivos: todos los usuarios activos SIN filtro de fecha (para plataforma, sexo, edad global)
  const [todosActivos, setTodosActivos]       = useState([]);
  // usuariosFiltrados: solo los del período seleccionado (para KPI "Altas en período" y tabla)
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [totalSistema, setTotalSistema]       = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [paginaRecientes, setPaginaRecientes] = useState(0);
  const POR_PAGINA = 8;

  // ── Fecha AR correcta ──────────────────────────────────────────────────────
  const todayAR = useMemo(() => "2026-04-30", []);
  const firstOfMonthAR = useMemo(() => "2026-04-01", []);

  const [userFilters, setUserFilters] = useState({
    fechaDesde: firstOfMonthAR,
    fechaHasta: todayAR,
    cgm: "",
  });
  const [userFiltersOpen, setUserFiltersOpen] = useState(false);

  // ── Carga principal ────────────────────────────────────────────────────────
  // Se ejecuta UNA SOLA VEZ (o cuando cambia cgm) para traer TODOS los activos
  // La fecha se filtra localmente para no perder datos de plataforma/sexo/edad
  async function cargarUsuarios() {
    setEstado("cargando");
    try {
      // FIX 1: Total del sistema directo desde la tabla, sin vista
      const { count: totalCount, error: countErr } = await supabase
        .from("usuarios_cache")
        .select("*", { count: "exact", head: true })
        .eq("activo", true);

      if (!countErr && totalCount != null) {
        setTotalSistema(totalCount);
      }

      // FIX 2: Traer TODOS los activos sin filtro de fecha
      // (para que plataforma/sexo/edad muestren el universo completo)
      let query = supabase
        .from("usuarios_cache")
        .select("*")
        .eq("activo", true)
        .order("fecha_creacion", { ascending: false })
        .limit(50000);

      if (userFilters.cgm) query = query.eq("localidad", userFilters.cgm);

      const { data, error } = await query;
      if (error) throw error;

      setTodosActivos(data || []);
      setUltimaActualizacion(new Date().toLocaleTimeString("es-AR"));
      setEstado("ok");
    } catch (e) {
      console.error("Error cargando usuarios:", e);
      setEstado("error");
    }
  }

  // Solo recarga desde Supabase cuando cambia el filtro CGM
  useEffect(() => { cargarUsuarios(); }, [userFilters.cgm]);

  // Filtra por fecha localmente (rápido, sin nueva query)
  useEffect(() => {
    if (!todosActivos.length) { setUsuariosFiltrados([]); return; }
    const desde = userFilters.fechaDesde;
    const hasta = userFilters.fechaHasta;
    const filtrados = todosActivos.filter(u => {
      const f = u.fecha_creacion?.slice(0, 10);
      if (!f) return false;
      if (desde && f < desde) return false;
      if (hasta && f > hasta) return false;
      return true;
    });
    setUsuariosFiltrados(filtrados);
    setPaginaRecientes(0);
  }, [todosActivos, userFilters.fechaDesde, userFilters.fechaHasta]);

  // ── Normalización ──────────────────────────────────────────────────────────
  function normalizar(u) {
    return {
      ...u,
      nombre:   u.nombre   || "",
      apellido: u.apellido || "",
      sexo: (() => {
        const s = u.sexo;
        if (s === true  || s === "true"  || s === "Masculino" || s === "M") return "Masculino";
        if (s === false || s === "false" || s === "Femenino"  || s === "F") return "Femenino";
        return "Sin dato";
      })(),
      edad:            calcularEdad(u.fecha_nacimiento),
      categoriaFix:    u.categoria_nombre || "Sin categoría",
      plataforma: (() => {
        const p = u.app_type;
        if (!p || p === "null") return "Sin dato";
        return p;
      })(),
      localidadNombre: u.localidad || "Sin dato",
      fechaCreacion:   u.fecha_creacion,
      dniEscaneado:    u.dni_escaneado,
    };
  }

  // Todos activos normalizados (para plataforma, sexo, edad, localidad)
  const todosNorm = useMemo(() => todosActivos.map(normalizar), [todosActivos]);
  // Filtrados por fecha normalizados (para altas del período, tabla recientes)
  const filtradosNorm = useMemo(() => usuariosFiltrados.map(normalizar), [usuariosFiltrados]);

  const filteredCount = filtradosNorm.length;
  const totalActivos  = todosNorm.length; // universo completo para métricas globales

  // ── Métricas sobre TODOS los activos (sin filtro fecha) ───────────────────
  const edadesValidas = useMemo(() =>
    filtradosNorm.map(u => u.edad).filter(e => e != null && !isNaN(e) && e >= 18 && e <= 100),
    [filtradosNorm]
  );
  const edadProm = edadesValidas.length
    ? (edadesValidas.reduce((a,b)=>a+b,0) / edadesValidas.length).toFixed(1)
    : "—";
  const edadMin = edadesValidas.length ? Math.min(...edadesValidas) : "—";
  const edadMax = edadesValidas.length ? Math.max(...edadesValidas) : "—";

  const porRangoEdad = AGE_RANGES.map(r => ({
    label: r.label, color: r.color,
    value: edadesValidas.filter(e => e >= r.min && e <= r.max).length,
  })).filter(r => r.value > 0);

  // Sexo — sobre universo completo
  const porSexo = useMemo(() => {
    const acc = {};
    filtradosNorm.forEach(u => { acc[u.sexo] = (acc[u.sexo] || 0) + 1; });
    return acc;
  }, [filtradosNorm]);
  const sexoColors = { "Masculino":"#38bdf8", "Femenino":"#f472b6", "Sin dato":T.muted };
  const sexoMaxVal = Math.max(...Object.values(porSexo), 1);

  // FIX 2: Plataforma — sobre TODOS los activos (sin filtro fecha)
  const porPlataforma = useMemo(() => {
    const acc = {};
    filtradosNorm.forEach(u => { acc[u.plataforma] = (acc[u.plataforma] || 0) + 1; });
    return acc;
  }, [filtradosNorm]);
  const platMaxVal = Math.max(...Object.values(porPlataforma), 1);

  // Localidad — sobre universo completo
  const porLocalidad = useMemo(() => {
    const acc = {};
    filtradosNorm.forEach(u => { acc[u.localidadNombre] = (acc[u.localidadNombre] || 0) + 1; });
    return acc;
  }, [filtradosNorm]);
  const topLocalidades = topN(porLocalidad, 10);
  const locMax = Math.max(...topLocalidades.map(([,v])=>v), 1);

  // DNI — sobre universo completo
  const conDni = filtradosNorm.filter(u => u.dniEscaneado).length;
  const sinDni = filteredCount - conDni;

  // Categorías — sobre universo completo
  const categorias = useMemo(() => {
    const acc = {};
    filtradosNorm.forEach(u => { acc[u.categoriaFix] = (acc[u.categoriaFix] || 0) + 1; });
    return acc;
  }, [filtradosNorm]);
  const topCategorias = topN(categorias, 8);

  // Evolución de altas — sobre filtrados por fecha
  const altasPorFecha = useMemo(() => {
    const acc = {};
    filtradosNorm.forEach(u => {
      const f = u.fechaCreacion?.slice(0,10);
      if (f) acc[f] = (acc[f] || 0) + 1;
    });
    return acc;
  }, [filtradosNorm]);
  const altasEntries = Object.entries(altasPorFecha).sort((a,b) => a[0].localeCompare(b[0]));
  const altasVals    = altasEntries.map(([,v]) => v);

  // Recientes — sobre filtrados por fecha
  const recientes = useMemo(() =>
    [...filtradosNorm].sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)),
    [filtradosNorm]
  );
  const pageStart       = paginaRecientes * POR_PAGINA;
  const recientesPagina = recientes.slice(pageStart, pageStart + POR_PAGINA);
  const totalPaginas    = Math.ceil(recientes.length / POR_PAGINA);

  // Localidad options para el select
  const localidadOptions = useMemo(() => [...new Set(
    todosNorm.map(u => u.localidadNombre).filter(l => l && l !== "Sin dato")
  )].sort(), [todosNorm]);

  // Gráfico evolución altas
  const W=700, H=90, PAD=8;
  const altasMax = Math.max(...altasVals, 1);
  const altasPts = altasVals.map((v,i) => [
    PAD + (i/(altasVals.length-1||1))*(W-PAD*2),
    H - PAD - ((v/altasMax)*(H-PAD*2)),
  ]);
  const altasPolyline = altasPts.map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const altasArea = `${PAD},${H} ${altasPolyline} ${W-PAD},${H}`;
  const altasStep = Math.max(1, Math.floor(altasVals.length/6));

  // Estilos inputs
  const baseInp = {
    background:"#0d0d1f", border:`1px solid ${T.border}`, color:T.text,
    borderRadius:10, padding:"7px 10px", fontSize:12,
    fontFamily:"'Inter',sans-serif", outline:"none", width:"100%",
  };
  const dateInp = { ...baseInp, colorScheme:"dark" };
  const lbl = {
    fontSize:11, color:T.text2, fontWeight:600, letterSpacing:"0.05em",
    textTransform:"uppercase", marginBottom:5,
    fontFamily:"'Inter',sans-serif", display:"block",
  };
  const hasActiveFilters = userFilters.fechaDesde || userFilters.fechaHasta || userFilters.cgm;

  // ── Estados de carga / error ───────────────────────────────────────────────
  if (estado === "cargando") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:16}}>
      <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${T.accent},${T.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,opacity:0.6}}>👥</div>
      <div style={{fontSize:12,color:T.muted,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>Cargando usuarios…</div>
    </div>
  );

  if (estado === "error") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:12}}>
      <div style={{fontSize:32}}>⚠️</div>
      <div style={{fontSize:13,color:T.red,fontFamily:"'Inter',sans-serif"}}>Error al cargar usuarios</div>
      <button onClick={cargarUsuarios} style={{background:`rgba(139,92,246,0.15)`,border:`1px solid ${T.accent}`,color:T.accent,borderRadius:10,padding:"8px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600}}>
        ↺ Reintentar
      </button>
    </div>
  );

  return (
    <div>
      {/* ── Filtros ── */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,marginBottom:16,overflow:"hidden"}}>
        <button onClick={()=>setUserFiltersOpen(o=>!o)}
          style={{width:"100%",background:"transparent",border:"none",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",color:T.text2}}>
          <span style={{fontSize:12,fontWeight:600,fontFamily:"'Inter',sans-serif",letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:8}}>
            <span>⚙</span> FILTROS DE USUARIOS
            {hasActiveFilters && (
              <span style={{background:T.accent,color:"#fff",borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700}}>
                activos · {filteredCount.toLocaleString("es-AR")} altas en período
              </span>
            )}
          </span>
          <span style={{fontSize:12,color:T.muted,transition:"transform 0.2s",display:"inline-block",transform:userFiltersOpen?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
        </button>

        {userFiltersOpen && (
          <div style={{padding:"0 18px 16px",borderTop:`1px solid rgba(139,92,246,0.1)`}}>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif",marginBottom:12,marginTop:12}}>
              La fecha filtra solo el KPI "Altas en período" y la tabla de recientes. Plataforma, sexo, edad y localidad muestran el universo completo de activos.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr auto",gap:14,alignItems:"end"}}>
              <div>
                <label style={lbl}>Alta desde</label>
                <input type="date"
                  value={userFilters.fechaDesde}
                  max={todayAR}
                  onChange={e=>setUserFilters(f=>({...f,fechaDesde:e.target.value}))}
                  style={dateInp}/>
              </div>
              <div>
                <label style={lbl}>Alta hasta</label>
                <input type="date"
                  value={userFilters.fechaHasta}
                  max={todayAR}
                  onChange={e=>setUserFilters(f=>({...f,fechaHasta:e.target.value}))}
                  style={dateInp}/>
              </div>
              <div>
                <label style={lbl}>Localidad / CGM</label>
                <select value={userFilters.cgm}
                  onChange={e=>setUserFilters(f=>({...f,cgm:e.target.value}))}
                  style={baseInp}>
                  <option value="">Todas</option>
                  {localidadOptions.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button
                onClick={()=>setUserFilters({fechaDesde:firstOfMonthAR,fechaHasta:todayAR,cgm:""})}
                style={{background:"rgba(139,92,246,0.12)",border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,padding:"7px 14px",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600,height:34,whiteSpace:"nowrap"}}
              >↺ Resetear</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {ultimaActualizacion && <span>🕐 Actualizado: {ultimaActualizacion}</span>}
          {totalActivos > 0 && <span style={{color:"#475569"}}>· Total activos cargados: {totalActivos.toLocaleString("es-AR")}</span>}
        </div>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif",background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"4px 12px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:T.green}}>🔄</span>
          Los usuarios se actualizan todos los días a las 22hs (Argentina)
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:12,marginBottom:20}}>
        {/* FIX 1: Total real del sistema via count */}
        <KPI
          label="Usuarios Totales"
          value={totalSistema != null ? fmtNum(totalSistema) : "—"}
          sub="activos en el sistema"
          color={T.accent} icon="👥"
        />
        <KPI
          label={userFilters.fechaDesde || userFilters.fechaHasta ? "Altas en el Período" : "Altas Este Mes"}
          value={fmtNum(filteredCount)}
          sub={`${userFilters.fechaDesde || "–"} → ${userFilters.fechaHasta || "–"}`}
          color={T.green} icon="📈"
        />
        <KPI
          label="Edad Promedio"
          value={edadProm !== "—" ? `${edadProm} años` : "—"}
          sub={edadesValidas.length > 0
            ? `mín ${edadMin} · máx ${edadMax} · ${edadesValidas.length.toLocaleString("es-AR")} con edad`
            : "Solo 18–100 años"}
          color="#38bdf8" icon="🎂"
        />
        <KPI
          label="Con DNI Escaneado"
value={filteredCount > 0 ? `${((conDni/filteredCount)*100).toFixed(0)}%` : "—"}
sub={`${fmtNum(conDni)} de ${fmtNum(filteredCount)}`}
          color={T.amber} icon="🪪"
        />
      </div>

      {/* ── Fila 1: Localidad / Edad / Sexo + Plataforma ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr 0.7fr",gap:14,marginBottom:14}}>
        <Card title="Usuarios por Localidad" icon="📍">
          {topLocalidades.length === 0
            ? <div style={{color:T.muted,fontSize:11}}>Sin datos</div>
            : topLocalidades.map(([loc,val]) => (
                <HBar key={loc} label={loc} value={val} max={locMax} color={T.accent} total={filteredCount}/>
              ))
          }
        </Card>

        <Card title="Distribución por Edad (18–100 años)" icon="🎂">
          <div style={{fontSize:10,color:T.muted,marginBottom:12,fontFamily:"'Inter',sans-serif"}}>
            Edades fuera de rango o sin fecha se excluyen.
            {edadesValidas.length < totalActivos && (
              <span style={{color:T.amber,marginLeft:6}}>
                ⚠ {(totalActivos - edadesValidas.length).toLocaleString("es-AR")} sin dato
              </span>
            )}
          </div>
          <AgeBarChart ranges={porRangoEdad} total={edadesValidas.length}/>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card title="Sexo" icon="⚤" style={{flex:1}}>
            {Object.keys(porSexo).length === 0
              ? <div style={{color:T.muted,fontSize:11}}>Sin datos</div>
              : Object.entries(porSexo)
                  .sort((a,b) => b[1]-a[1])
                  .map(([s,v]) => (
                    <HBar key={s} label={s} value={v}
                      max={sexoMaxVal}
                      color={sexoColors[s] || T.muted}
                      total={filteredCount}/>
                  ))
            }
          </Card>
          {/* FIX 2: Plataforma sobre universo completo */}
          <Card title="Plataforma" icon="📱" style={{flex:1}}>
            {Object.keys(porPlataforma).length === 0
              ? <div style={{color:T.muted,fontSize:11}}>Sin datos</div>
              : Object.entries(porPlataforma)
                  .sort((a,b) => b[1]-a[1])
                  .map(([p,v]) => (
                    <HBar key={p} label={p} value={v}
                      max={platMaxVal}
                      color={
                        p.toLowerCase().includes("ios")     ? "#38bdf8" :
                        p.toLowerCase().includes("android") ? T.green   : T.muted
                      }
                      total={filteredCount}/>
                  ))
            }
          </Card>
        </div>
      </div>

      {/* ── Fila 2: Categorías / DNI ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card title="Categorías Especiales" icon="🏷️">
          {topCategorias.map(([cat,val],i) => {
            const colors=[T.accent,T.green,T.amber,T.red,"#38bdf8","#f472b6","#a78bfa","#34d399"];
            return <HBar key={cat} label={cat} value={val}
              max={Math.max(...topCategorias.map(([,v])=>v),1)}
              color={colors[i%colors.length]} total={filteredCount}/>;
          })}
        </Card>

        <Card title="Verificación de Identidad (DNI)" icon="🪪">
          <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:16}}>
            <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="11"/>
                {filteredCount > 0 && (
                  <circle cx="40" cy="40" r="28" fill="none" stroke={T.green} strokeWidth="11"
                    strokeDasharray={`${(conDni/filteredCount)*175.9} 175.9`}
                    strokeDashoffset="0"
                    style={{transform:"rotate(-90deg)",transformOrigin:"40px 40px"}}
                    opacity="0.85"/>
                )}
                <circle cx="40" cy="40" r="22" fill={T.card}/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:T.green,fontFamily:"'Inter',sans-serif",lineHeight:1}}>
                {filteredCount > 0 ? `${((conDni/filteredCount)*100).toFixed(1)}%` : "—"}
              </div>
              <div style={{fontSize:11,color:T.text2,marginTop:4,fontFamily:"'Inter',sans-serif"}}>con DNI escaneado</div>
            </div>
          </div>
          <HBar label="Con DNI" value={conDni} max={totalActivos} color={T.green} total={filteredCount}/>
          <HBar label="Sin DNI" value={sinDni} max={totalActivos} color={T.red}   total={filteredCount}/>
        </Card>
      </div>

      {/* ── Evolución de altas (filtrada por fecha) ── */}
      <Card title={`Evolución de Altas · ${userFilters.fechaDesde || "–"} → ${userFilters.fechaHasta || "–"}`} icon="📈" style={{marginBottom:14}}>
        {altasVals.length < 2 ? (
          <div style={{color:T.muted,fontSize:11,fontFamily:"'Inter',sans-serif"}}>Sin suficientes datos para el período seleccionado</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:90}}>
            <defs>
              <linearGradient id="altasGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.green} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={T.green} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polygon points={altasArea} fill="url(#altasGrad)"/>
            <polyline points={altasPolyline} fill="none" stroke={T.green} strokeWidth="2" strokeLinejoin="round"/>
            {altasPts.filter((_,i)=>i%altasStep===0).map(([x,y],i)=>{
              const idx = i * altasStep;
              const [fecha] = altasEntries[idx];
              const d = parseFecha(fecha);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="2.5" fill={T.green} opacity="0.8"/>
                  <text x={x} y={H-1} textAnchor="middle" fontSize="8" fill={T.muted} fontFamily="Inter">
                    {d.getDate()}/{d.getMonth()+1}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </Card>

      {/* ── Tabla últimos registrados (filtrada por fecha) ── */}
      <Card title="Últimos Usuarios Registrados en el Período" icon="🆕">
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'Inter',sans-serif"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {["Nombre","Edad","Sexo","Localidad","Plataforma","DNI","Alta","Categoría"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"5px 8px",color:T.muted,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recientesPagina.map((u,i) => {
                const nombre    = [u.nombre, u.apellido].filter(Boolean).join(" ") || "Sin nombre";
                const plat      = u.plataforma;
                const dniOk     = u.dniEscaneado;
                const fechaAlta = u.fechaCreacion
                  ? new Date(u.fechaCreacion).toLocaleDateString("es-AR")
                  : "—";
                const sexoIcon  = u.sexo === "Masculino" ? "♂" : u.sexo === "Femenino" ? "♀" : "";
                const sexoColor = u.sexo === "Masculino" ? "#38bdf8" : u.sexo === "Femenino" ? "#f472b6" : T.muted;
                return (
                  <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                    <td style={{padding:"6px 8px",color:T.text,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nombre}</td>
                    <td style={{padding:"6px 8px",color:T.text2}}>{u.edad ?? "—"}</td>
                    <td style={{padding:"6px 8px",color:sexoColor}}>{sexoIcon} {u.sexo}</td>
                    <td style={{padding:"6px 8px",color:T.text2,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.localidadNombre}</td>
                    <td style={{padding:"6px 8px"}}>
                      <span style={{
                        fontSize:9,
                        background: plat.toLowerCase().includes("ios")     ? "rgba(56,189,248,0.15)"  :
                                    plat.toLowerCase().includes("android") ? "rgba(16,185,129,0.15)"  :
                                    "rgba(255,255,255,0.06)",
                        color:      plat.toLowerCase().includes("ios")     ? "#38bdf8" :
                                    plat.toLowerCase().includes("android") ? T.green   : T.muted,
                        borderRadius:5, padding:"2px 7px", fontWeight:600,
                      }}>{plat}</span>
                    </td>
                    <td style={{padding:"6px 8px"}}>
                      <span style={{fontSize:10,color:dniOk?T.green:T.red}}>{dniOk?"✓":"✗"}</span>
                    </td>
                    <td style={{padding:"6px 8px",color:T.muted,whiteSpace:"nowrap"}}>{fechaAlta}</td>
                    <td style={{padding:"6px 8px",color:T.text2,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.categoriaFix}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:12}}>
            <button onClick={()=>setPaginaRecientes(p=>Math.max(0,p-1))} disabled={paginaRecientes===0}
              style={{background:"rgba(139,92,246,0.1)",border:`1px solid ${T.border}`,color:paginaRecientes===0?T.muted:T.text2,borderRadius:7,padding:"4px 12px",fontSize:11,cursor:paginaRecientes===0?"default":"pointer",fontFamily:"'Inter',sans-serif"}}>← Ant</button>
            <span style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif"}}>{paginaRecientes+1} / {totalPaginas}</span>
            <button onClick={()=>setPaginaRecientes(p=>Math.min(totalPaginas-1,p+1))} disabled={paginaRecientes>=totalPaginas-1}
              style={{background:"rgba(139,92,246,0.1)",border:`1px solid ${T.border}`,color:paginaRecientes>=totalPaginas-1?T.muted:T.text2,borderRadius:7,padding:"4px 12px",fontSize:11,cursor:paginaRecientes>=totalPaginas-1?"default":"pointer",fontFamily:"'Inter',sans-serif"}}>Sig →</button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── VISTA SIRENAS ────────────────────────────────────────────────────────────
// Agregar esta constante junto a las otras constantes de la API al inicio del archivo:
//
//   const NOVIT_TOKEN = "38ca1abbbd83712288d97e05fe7333d7b4544d98";
//   const SIRENAS_API = "https://apis2.novit.gpesistemas.ar/monitoreo/sirenas";
//
// Luego agregar el tab en el array TABS:
//   { id:"sirenas", label:"Sirenas", icon:"📡" }
//
// Y en el bloque de contenido agregar:
//   {view==="sirenas" && <ViewSirenas leafletReady={leafletReady}/>}
// ─────────────────────────────────────────────────────────────────────────────

const NOVIT_TOKEN = "38ca1abbbd83712288d97e05fe7333d7b4544d98";
const SIRENAS_API = "https://apis2.novit.gpesistemas.ar/monitoreo/sirenas";

function ViewSirenas({ leafletReady }) {
  // Junto a los otros useState de ViewSirenas:
const [filtroEstado, setFiltroEstado] = useState(""); // "" | "online" | "offline"
  const [estado, setEstado]       = useState("idle");
  const [sirenas, setSirenas]     = useState([]);
  const [ultimaAct, setUltimaAct] = useState(null);
  const [filtroCgm, setFiltroCgm] = useState("");
  const [vistaTab, setVistaTab]   = useState("resumen"); // resumen | mapa | tabla
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markersRef  = useRef([]);
  const polygonsRef = useRef([]);

  // ── Fetch en vivo ──────────────────────────────────────────────────────────
async function cargarSirenas() {
  setEstado("cargando");
  try {
    const PAGE = 15;
    const populate = encodeURIComponent(JSON.stringify([{ path: "localidad", select: "nombre" }]));
    const headers = { Authorization: `Bearer ${NOVIT_TOKEN}` };

    const firstRes = await fetch(`${SIRENAS_API}?limit=${PAGE}&page=1&populate=${populate}`, { headers });
    const firstJson = await firstRes.json();
    const total = firstJson.totalCount || 0;
    const totalPages = Math.ceil(total / PAGE);

    let all = [...(firstJson.datos || [])];

    const BATCH = 8; // Lotes más chicos para no saturar
    for (let i = 2; i <= totalPages; i += BATCH) {
      const batch = Array.from(
        { length: Math.min(BATCH, totalPages - i + 1) },
        (_, j) => i + j
      );
      const results = await Promise.all(
        batch.map(p =>
          fetch(`${SIRENAS_API}?limit=${PAGE}&page=${p}&populate=${populate}`, { headers })
            .then(r => r.json())
            .then(j => j.datos || [])
            .catch(() => [])
        )
      );
      all = [...all, ...results.flat()];
      // Pequeña pausa entre lotes para respetar rate limit
      if (i + BATCH <= totalPages) await new Promise(r => setTimeout(r, 150));
    }

    const unique = Array.from(new Map(all.map(s => [s._id, s])).values());
    setSirenas(unique);
    setUltimaAct(new Date().toLocaleTimeString("es-AR"));
    setEstado("ok");
  } catch (e) {
    console.error("Error cargando sirenas:", e);
    setEstado("error");
  }
}

  useEffect(() => { cargarSirenas(); }, []);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const t = setInterval(cargarSirenas, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // ── Normalizar ─────────────────────────────────────────────────────────────
// REEMPLAZAR sirenasNorm:
const sirenasNorm = useMemo(() => sirenas.map(s => ({
  id:           s._id,
  online:       s.online === true,
  activa:       s.activa !== false,
  modelo:       s.modeloSirena || s.tipo || "Sin modelo",
  localidad:    s.localidad?.nombre?.trim() || "Sin localidad",
  direccion:    s.direccionManual || s.direccionGps || "—",
  lat:          s.ubicacionGps?.lat ?? s.ubicacionManual?.lat ?? null,
  lng:          s.ubicacionGps?.lng ?? s.ubicacionManual?.lng ?? null,
  rssi:         typeof s.rssi === "number" ? s.rssi :
                typeof s.senal === "number" ? s.senal : null,
  firmware:     s.datosSw?.version || s.versionFirmware || "—",
  errorAct:     s.errorActualizacion === true,
  fechaOnline:  s.fechaOnline  || null,
  fechaOffline: s.fechaOffline || null,
})), [sirenas]);

  // ── Filtro por localidad ───────────────────────────────────────────────────
const sirenasFiltradas = useMemo(() => {
  return sirenasNorm.filter(s => {
    if (filtroCgm && s.localidad !== filtroCgm) return false;
    if (filtroEstado === "online"  && !s.online) return false;
    if (filtroEstado === "offline" &&  s.online) return false;
    return true;
  });
}, [sirenasNorm, filtroCgm, filtroEstado]);

  // ── Métricas globales (siempre sobre todas) ───────────────────────────────
const total   = sirenasFiltradas.length;
const online  = sirenasFiltradas.filter(s => s.online).length;
const offline = sirenasFiltradas.filter(s => !s.online).length;
const conError = sirenasFiltradas.filter(s => s.errorAct).length;
const dispPct = total > 0 ? ((online / total) * 100).toFixed(1) : "—";

const rssiValidos = sirenasFiltradas.map(s => s.rssi).filter(r => r != null);
const rssiProm = rssiValidos.length
  ? (rssiValidos.reduce((a,b) => a+b, 0) / rssiValidos.length).toFixed(0)
  : "—";

  // ── Por localidad ──────────────────────────────────────────────────────────
  const porLocalidad = useMemo(() => {
    const acc = {};
    sirenasNorm.forEach(s => {
      const l = s.localidad;
      if (!acc[l]) acc[l] = { total:0, online:0, offline:0 };
      acc[l].total++;
      if (s.online) acc[l].online++; else acc[l].offline++;
    });
    return Object.entries(acc).sort((a,b) => b[1].total - a[1].total);
  }, [sirenasNorm]);

  // ── Por modelo ─────────────────────────────────────────────────────────────
  const porModelo = useMemo(() => {
    const acc = {};
    sirenasNorm.forEach(s => { acc[s.modelo] = (acc[s.modelo]||0)+1; });
    return Object.entries(acc).sort((a,b) => b[1]-a[1]);
  }, [sirenasNorm]);

  // ── Por firmware ───────────────────────────────────────────────────────────
  const porFirmware = useMemo(() => {
    const acc = {};
    sirenasNorm.forEach(s => { acc[s.firmware] = (acc[s.firmware]||0)+1; });
    return Object.entries(acc).sort((a,b) => b[1]-a[1]).slice(0,6);
  }, [sirenasNorm]);

  // ── Calidad de señal RSSI ──────────────────────────────────────────────────
  const rssiGrupos = useMemo(() => {
    let excelente=0, buena=0, regular=0, mala=0, sinDato=0;
    sirenasNorm.forEach(s => {
      if (s.rssi == null)    sinDato++;
      else if (s.rssi >= -65) excelente++;
      else if (s.rssi >= -75) buena++;
      else if (s.rssi >= -85) regular++;
      else                    mala++;
    });
    return [
      { label:"Excelente (≥-65)", value:excelente, color:"#10b981" },
      { label:"Buena (-65 a -75)", value:buena,     color:"#38bdf8" },
      { label:"Regular (-75 a -85)", value:regular, color:"#f59e0b" },
      { label:"Mala (<-85)",       value:mala,      color:"#ef4444" },
      { label:"Sin dato",          value:sinDato,   color:"#475569" },
    ].filter(g => g.value > 0);
  }, [sirenasNorm]);

  // ── Mapa de puntos ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || vistaTab !== "mapa") return;
    const L = window.L;
    if (!L || !mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [-34.762, -58.42], zoom: 12,
        zoomControl: false, attributionControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        className: "cgm-dark-tiles",
      }).addTo(leafletMap.current);
      L.control.zoom({ position:"bottomright" }).addTo(leafletMap.current);
    }

    // Limpiar markers anteriores
    markersRef.current.forEach(m => leafletMap.current.removeLayer(m));
    markersRef.current = [];
    polygonsRef.current.forEach(p => leafletMap.current.removeLayer(p));
    polygonsRef.current = [];

    // Polígonos CGM coloreados por % online
    CGM_GEOJSON.features.forEach(feature => {
      const name = feature.properties.name;
      const datos = porLocalidad.find(([l]) => l === name)?.[1];
      let fillColor = "rgba(139,92,246,0.08)";
      if (datos) {
        const pct = datos.total > 0 ? datos.online / datos.total : 0;
        if (pct >= 0.95)     fillColor = "rgba(16,185,129,0.25)";
        else if (pct >= 0.80) fillColor = "rgba(245,158,11,0.25)";
        else                  fillColor = "rgba(239,68,68,0.28)";
      }
      const poly = L.geoJSON(feature, {
        style: { fillColor, fillOpacity:0.7, color:"rgba(139,92,246,0.35)", weight:1.5 },
      });
      poly.bindTooltip(
        datos
          ? `<b>${name}</b><br>${datos.online}/${datos.total} online (${((datos.online/datos.total)*100).toFixed(0)}%)`
          : `<b>${name}</b><br>Sin sirenas`,
        { className:"sirena-tooltip" }
      );
      poly.addTo(leafletMap.current);
      polygonsRef.current.push(poly);
    });

    // Puntos de sirenas
    const toShow = filtroCgm
      ? sirenasFiltradas.filter(s => s.lat && s.lng)
      : sirenasNorm.filter(s => s.lat && s.lng);

    toShow.forEach(s => {
      const color  = s.online ? "#10b981" : "#ef4444";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid ${s.online?"#6ee7b7":"#fca5a5"};box-shadow:0 0 6px ${color}88;"></div>`,
        iconAnchor: [5,5],
      });
      const m = L.marker([s.lat, s.lng], { icon });
      m.bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:11px;min-width:160px;">
          <div style="font-weight:700;margin-bottom:4px;">${s.modelo}</div>
          <div style="color:#64748b;margin-bottom:6px;">${s.direccion}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:${s.online?"#10b98120":"#ef444420"};color:${s.online?"#10b981":"#ef4444"};border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600;">${s.online?"● Online":"● Offline"}</span>
            ${s.rssi != null ? `<span style="color:#f59e0b;font-size:10px;">RSSI: ${s.rssi} dBm</span>` : ""}
          </div>
          ${s.firmware !== "—" ? `<div style="color:#475569;font-size:9px;margin-top:4px;">FW: ${s.firmware}</div>` : ""}
        </div>
      `);
      m.addTo(leafletMap.current);
      markersRef.current.push(m);
    });
    setTimeout(() => leafletMap.current?.invalidateSize(), 50);
  }, [leafletReady, vistaTab, sirenasFiltradas, sirenasNorm, porLocalidad, filtroCgm]);

  // ── Localidades para filtro ────────────────────────────────────────────────
  const localidadOpts = useMemo(() =>
    [...new Set(sirenasNorm.map(s => s.localidad))].sort(),
    [sirenasNorm]
  );

  // ── Colores ────────────────────────────────────────────────────────────────
  const modeloColors = ["#8b5cf6","#10b981","#38bdf8","#f59e0b","#ef4444","#f472b6"];

  // ── Estados de carga ───────────────────────────────────────────────────────
  if (estado === "cargando") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:16}}>
      <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,#38bdf8,#0ea5e9)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📡</div>
      <div style={{fontSize:12,color:T.muted,fontWeight:500,fontFamily:"'Inter',sans-serif"}}>Cargando sirenas en vivo…</div>
    </div>
  );

  if (estado === "error") return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,gap:12}}>
      <div style={{fontSize:32}}>⚠️</div>
      <div style={{fontSize:13,color:T.red,fontFamily:"'Inter',sans-serif"}}>Error al cargar sirenas</div>
      <button onClick={cargarSirenas} style={{background:`rgba(56,189,248,0.15)`,border:`1px solid #38bdf8`,color:"#38bdf8",borderRadius:10,padding:"8px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600}}>
        ↺ Reintentar
      </button>
    </div>
  );

  return (
    <div>
      {/* ── Header barra de estado ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {/* Filtro localidad */}
          <select
            value={filtroCgm}
            onChange={e => setFiltroCgm(e.target.value)}
            style={{background:"#0d0d1f",border:`1px solid ${T.border}`,color:T.text,borderRadius:10,padding:"7px 12px",fontSize:12,fontFamily:"'Inter',sans-serif",outline:"none",cursor:"pointer"}}
          >
            <option value="">Todas las localidades</option>
            {localidadOpts.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {filtroCgm && (
            <button onClick={() => { setFiltroCgm(""); setFiltroEstado(""); }}
              style={{background:"rgba(56,189,248,0.1)",border:`1px solid rgba(56,189,248,0.3)`,color:"#38bdf8",borderRadius:8,padding:"6px 12px",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600}}>
              ✕ Quitar filtro
            </button>
          )}
          <select
  value={filtroEstado}
  onChange={e => setFiltroEstado(e.target.value)}
  style={{background:"#0d0d1f",border:`1px solid ${T.border}`,color:T.text,borderRadius:10,padding:"7px 12px",fontSize:12,fontFamily:"'Inter',sans-serif",outline:"none",cursor:"pointer"}}
>
  <option value="">Todos los estados</option>
  <option value="online">🟢 Solo Online</option>
  <option value="offline">🔴 Solo Offline</option>
</select>
          <button onClick={cargarSirenas}
            style={{background:"rgba(16,185,129,0.1)",border:`1px solid rgba(16,185,129,0.3)`,color:T.green,borderRadius:8,padding:"6px 12px",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
            ↺ Actualizar
          </button>
        </div>
        <div style={{fontSize:10,color:T.muted,fontFamily:"'Inter',sans-serif",background:"rgba(56,189,248,0.07)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:8,padding:"4px 12px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:"#38bdf8"}}>⚡</span>
          Datos en vivo · actualización automática cada 60 min
          {ultimaAct && <span style={{color:"#475569",marginLeft:6}}>· {ultimaAct}</span>}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:20}}>
        <KPI label="Total Sirenas"    value={total.toLocaleString("es-AR")}  sub="en el sistema"             color="#38bdf8" icon="📡"/>
        <KPI label="Online"           value={online.toLocaleString("es-AR")} sub={`${dispPct}% disponibles`} color={T.green} icon="🟢"/>
        <KPI label="Offline"          value={offline.toLocaleString("es-AR")}sub="fuera de servicio"         color={T.red}   icon="🔴" invertDelta={true}/>
        <KPI label="Señal Promedio"   value={rssiProm !== "—" ? `${rssiProm} dBm` : "—"} sub="RSSI promedio" color={T.amber} icon="📶"/>
        <KPI label="Con Error"        value={conError.toLocaleString("es-AR")} sub="error de actualización"  color={conError>0?T.red:T.green} icon="⚠️" invertDelta={true}/>
        <KPI label="Disponibilidad"   value={`${dispPct}%`} sub={`${online} de ${total} operativas`}         color={parseFloat(dispPct)>=95?T.green:parseFloat(dispPct)>=80?T.amber:T.red} icon="✅"/>
      </div>

      {/* ── Sub-tabs ── */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[
          {id:"resumen", label:"Resumen", icon:"📊"},
          {id:"mapa",    label:"Mapa",    icon:"🗺"},
          {id:"tabla",   label:"Detalle", icon:"📋"},
        ].map(t => (
          <button key={t.id} onClick={()=>setVistaTab(t.id)} style={{
            background: vistaTab===t.id ? "rgba(56,189,248,0.15)" : "transparent",
            border: `1px solid ${vistaTab===t.id ? "#38bdf8" : T.border}`,
            color: vistaTab===t.id ? "#38bdf8" : T.text2,
            borderRadius:8, padding:"6px 14px", fontSize:11,
            fontFamily:"'Inter',sans-serif", fontWeight:600, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span>{t.icon}</span>{t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── VISTA RESUMEN ── */}
      {vistaTab === "resumen" && (
        <div>
          {/* Fila 1: Por localidad + Señal RSSI */}
          <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14,marginBottom:14}}>
            <Card title="Estado por Localidad / CGM" icon="📍">
              <div style={{marginBottom:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"0 12px",fontSize:9,color:T.muted,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",paddingBottom:6,borderBottom:`1px solid rgba(139,92,246,0.1)`,fontFamily:"'Inter',sans-serif"}}>
                  <span>Localidad</span><span style={{textAlign:"right"}}>Total</span><span style={{textAlign:"right",color:T.green}}>Online</span><span style={{textAlign:"right",color:T.red}}>Offline</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {(filtroCgm
                  ? porLocalidad.filter(([l]) => l === filtroCgm)
                  : porLocalidad
                ).map(([loc, d]) => {
                  const pct = d.total > 0 ? (d.online/d.total)*100 : 0;
                  const barColor = pct >= 95 ? T.green : pct >= 80 ? T.amber : T.red;
                  const isSelected = filtroCgm === loc;
                  return (
                    <div key={loc}
                      onClick={() => setFiltroCgm(isSelected ? "" : loc)}
                      style={{cursor:"pointer",background:isSelected?"rgba(56,189,248,0.07)":"transparent",borderRadius:8,padding:"5px 6px",borderLeft:isSelected?"2px solid #38bdf8":"2px solid transparent",transition:"all 0.15s"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",gap:"0 12px",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:11,color:isSelected?"#38bdf8":T.text2,fontFamily:"'Inter',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc}</span>
                        <span style={{fontSize:11,color:T.accent,fontWeight:700,fontFamily:"'Inter',sans-serif",textAlign:"right"}}>{d.total}</span>
                        <span style={{fontSize:11,color:T.green,fontFamily:"'Inter',sans-serif",textAlign:"right"}}>{d.online}</span>
                        <span style={{fontSize:11,color:d.offline>0?T.red:T.muted,fontFamily:"'Inter',sans-serif",textAlign:"right"}}>{d.offline}</span>
                      </div>
                      <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:2,transition:"width 0.5s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* Señal RSSI */}
              <Card title="Calidad de Señal (RSSI)" icon="📶" style={{flex:1}}>
                {rssiGrupos.map(g => (
                  <HBar key={g.label} label={g.label} value={g.value}
                    max={Math.max(...rssiGrupos.map(x=>x.value),1)}
                    color={g.color} total={total}/>
                ))}
              </Card>

              {/* Modelos */}
              <Card title="Por Modelo" icon="🔊" style={{flex:1}}>
                {porModelo.map(([modelo, val], i) => (
                  <HBar key={modelo} label={modelo} value={val}
                    max={Math.max(...porModelo.map(([,v])=>v),1)}
                    color={modeloColors[i % modeloColors.length]} total={total}/>
                ))}
              </Card>
            </div>
          </div>

          {/* Fila 2: Firmware + Offline críticas */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:14}}>
            <Card title="Versiones de Firmware" icon="💾">
              {porFirmware.map(([fw, val], i) => (
                <HBar key={fw} label={fw} value={val}
                  max={Math.max(...porFirmware.map(([,v])=>v),1)}
                  color={i===0?T.green:i===1?"#38bdf8":T.muted} total={total}/>
              ))}
              {porFirmware.length === 0 && <div style={{color:T.muted,fontSize:11,fontFamily:"'Inter',sans-serif"}}>Sin datos de firmware</div>}
            </Card>

            <Card title="Sirenas Offline · Detalle" icon="🔴">
              <div style={{overflowX:"auto",maxHeight:200,overflowY:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'Inter',sans-serif"}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${T.border}`}}>
                      {["Dirección","Localidad","Modelo","Últ. offline"].map(h=>(
                        <th key={h} style={{textAlign:"left",padding:"4px 8px",color:T.muted,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em",position:"sticky",top:0,background:T.card}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sirenasFiltradas.filter(s => !s.online).map(s => {
                      const fechaOff = s.fechaOffline
                        ? new Date(s.fechaOffline).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})
                        : "—";
                      return (
                        <tr key={s.id} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                          <td style={{padding:"5px 8px",color:T.text2,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.direccion}</td>
                          <td style={{padding:"5px 8px",color:T.muted,whiteSpace:"nowrap"}}>{s.localidad}</td>
                          <td style={{padding:"5px 8px"}}><span style={{background:"rgba(239,68,68,0.1)",color:T.red,borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:600}}>{s.modelo}</span></td>
                          <td style={{padding:"5px 8px",color:T.amber,whiteSpace:"nowrap",fontSize:9}}>{fechaOff}</td>
                        </tr>
                      );
                    })}
                    {sirenasFiltradas.filter(s => !s.online).length === 0 && (
                      <tr><td colSpan={4} style={{padding:"16px 8px",textAlign:"center",color:T.green,fontSize:11}}>✓ Todas las sirenas están online</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── VISTA MAPA ── */}
      {vistaTab === "mapa" && (
        <div style={{position:"relative",height:"calc(100vh - 320px)",minHeight:480,borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`}}>
          <style>{`
            .sirena-tooltip { background: #16162a; border: 1px solid rgba(139,92,246,0.3); color: #e2e8f0; font-family: Inter, sans-serif; font-size: 11px; border-radius: 8px; padding: 6px 10px; }
            .sirena-tooltip::before { display: none; }
            .leaflet-popup-content-wrapper { background: #16162a !important; border: 1px solid rgba(139,92,246,0.3) !important; border-radius: 10px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; }
            .leaflet-popup-tip { background: #16162a !important; }
            .leaflet-popup-close-button { color: #64748b !important; }
          `}</style>
          <div ref={mapRef} style={{width:"100%",height:"100%"}}/>
          {/* Leyenda */}
          <div style={{position:"absolute",bottom:40,left:12,background:"rgba(10,10,18,0.93)",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",zIndex:999,fontSize:10,fontFamily:"'Inter',sans-serif"}}>
            <div style={{color:T.muted,letterSpacing:"0.1em",fontWeight:600,textTransform:"uppercase",marginBottom:8,fontSize:9}}>Estado</div>
            {[["#10b981","● Online"],["#ef4444","● Offline"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 5px ${c}88`}}/>
                <span style={{color:T.text2}}>{l}</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:8,paddingTop:8,color:T.muted,fontSize:9,letterSpacing:"0.1em",fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Zonas (% online)</div>
            {[["#10b981","≥ 95%"],["#f59e0b","80–94%"],["#ef4444","< 80%"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:10,height:8,borderRadius:2,background:c,opacity:0.6}}/>
                <span style={{color:T.text2}}>{l}</span>
              </div>
            ))}
          </div>
          {/* Contador overlay */}
          <div style={{position:"absolute",top:12,left:12,background:"rgba(10,10,18,0.93)",border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",zIndex:999,fontSize:11,fontFamily:"'Inter',sans-serif",display:"flex",gap:16}}>
            <span style={{color:T.green,fontWeight:700}}>{sirenasFiltradas.filter(s=>s.online&&s.lat).length} online</span>
            <span style={{color:T.red,fontWeight:700}}>{sirenasFiltradas.filter(s=>!s.online&&s.lat).length} offline</span>
            {filtroCgm && <span style={{color:"#38bdf8",fontWeight:700}}>{filtroCgm}</span>}
          </div>
        </div>
      )}

      {/* ── VISTA TABLA ── */}
      {vistaTab === "tabla" && (
        <Card title={`Detalle Completo · ${sirenasFiltradas.length} sirenas`} icon="📋">
          <div style={{overflowX:"auto",maxHeight:520,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,fontFamily:"'Inter',sans-serif"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`}}>
                  {["Estado","Modelo","Localidad","Dirección","RSSI","Firmware","Últ. online","Últ. offline"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"5px 10px",color:T.muted,fontWeight:600,fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em",position:"sticky",top:0,background:T.card,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sirenasFiltradas.map(s => {
                  const rssiColor = s.rssi == null ? T.muted : s.rssi >= -65 ? T.green : s.rssi >= -75 ? "#38bdf8" : s.rssi >= -85 ? T.amber : T.red;
                  const fmtFecha = f => f ? new Date(f).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—";
                  return (
                    <tr key={s.id} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`,background:s.online?"transparent":"rgba(239,68,68,0.03)"}}>
                      <td style={{padding:"6px 10px"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.online?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:s.online?T.green:T.red,borderRadius:5,padding:"2px 8px",fontSize:9,fontWeight:700}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:s.online?T.green:T.red,display:"inline-block"}}/>
                          {s.online?"Online":"Offline"}
                        </span>
                      </td>
                      <td style={{padding:"6px 10px",color:T.text2,whiteSpace:"nowrap"}}>{s.modelo}</td>
                      <td style={{padding:"6px 10px",color:T.muted,whiteSpace:"nowrap"}}>{s.localidad}</td>
                      <td style={{padding:"6px 10px",color:T.text2,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.direccion}</td>
                      <td style={{padding:"6px 10px",color:rssiColor,fontWeight:600,whiteSpace:"nowrap"}}>{s.rssi != null ? `${s.rssi} dBm` : "—"}</td>
                      <td style={{padding:"6px 10px",color:T.muted,whiteSpace:"nowrap",fontSize:9}}>{s.firmware}</td>
                      <td style={{padding:"6px 10px",color:T.green, fontSize:9,whiteSpace:"nowrap"}}>{fmtFecha(s.fechaOnline)}</td>
                      <td style={{padding:"6px 10px",color:s.online?T.muted:T.red,fontSize:9,whiteSpace:"nowrap"}}>{fmtFecha(s.fechaOffline)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App({ onVolver }) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("mapa");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState({
    fechaDesde: "2026-04-01",
    fechaHasta: "2026-04-30",
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
    const d1=parseFecha(filters.fechaDesde), d2=parseFecha(filters.fechaHasta);
    const dur=d2-d1, pD2=new Date(d1-1), pD1=new Date(pD2-dur);
    return allData.filter(r=>r.fecha>=pD1.toISOString().slice(0,10)&&r.fecha<=pD2.toISOString().slice(0,10));
  },[allData,filters]);

  const TABS=[
    {id:"mapa",      label:"Mapa",      icon:"◎"},
    {id:"ejecutivo", label:"Ejecutivo", icon:"◈"},
    {id:"temporal",  label:"Temporal",  icon:"◷"},
    {id:"cgm",       label:"Por Zona",  icon:"◉"},
    {id:"usuarios",  label:"Usuarios",  icon:"◍"},
    { id:"sirenas", label:"Sirenas", icon:"📡" }
  ];

  const isUsuariosTab = view === "usuarios" || view === "sirenas";
  const now = getArDate();
  const dateLabel = now.toLocaleDateString("es-AR",{day:"2-digit",month:"short",year:"numeric"});

  if (!APP_ENABLED) return (
  <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"40px 36px",width:360,textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:16}}>🔒</div>
      <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:8}}>Acceso denegado</div>
      <div style={{fontSize:12,color:T.muted}}>No tiene los permisos para acceder</div>
    </div>
  </div>
);

  return (
    <>
      <style>{`
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

        {/* HEADER */}
        <div className="no-print" style={{
          background:`linear-gradient(90deg,${T.bg2} 0%,#1a1535 50%,${T.bg2} 100%)`,
          border:`1px solid ${T.border}`,borderRadius:16,
          margin:"14px 20px 0",padding:"14px 24px",
          display:"flex",alignItems:"center",gap:18,
          boxShadow:"0 4px 24px rgba(0,0,0,0.5)",
        }}>
          {onVolver && (
            <button onClick={onVolver} style={{background:"rgba(139,92,246,0.12)",border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>
              ← Volver
            </button>
          )}
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
                  ? "Dashboard de Vecinos/Usuarios"
                  : `${allData.length.toLocaleString()} registros · ${filteredData.length.toLocaleString()} filtrados`
                }
              </div>
              <div style={{fontSize:10,color:T.muted,marginTop:2}}>{dateLabel}</div>
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:100,padding:"5px 12px",fontSize:10,fontWeight:700,color:"#6ee7b7",letterSpacing:"0.06em"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block",animation:"livePulse 2s infinite"}}/>
              EN VIVO
            </div>
          </div>
        </div>

        <div style={{maxWidth:1440,margin:"0 auto",padding:"16px 20px"}}>

          {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",color:"#fca5a5",fontSize:12,marginBottom:14}}>⚠ Error Supabase: {error}</div>}

          {!isUsuariosTab && (
            <div className="no-print">
              <FiltersPanel filters={filters} setFilters={setFilters} options={options} open={filtersOpen} setOpen={setFiltersOpen}/>
            </div>
          )}

          {/* TABS */}
          <div className="no-print" style={{display:"flex",alignItems:"center",gap:6,marginBottom:20,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const isActive = view===t.id;
              const isUsers  = t.id==="usuarios";
              return (
                <button key={t.id} onClick={()=>setView(t.id)} style={{
                  background: isActive?"rgba(139,92,246,0.15)":"transparent",
                  border:`1px solid ${isActive?T.accent:isUsers?"rgba(16,185,129,0.35)":T.border}`,
                  color: isActive?T.text:isUsers?"#6ee7b7":T.text2,
                  borderRadius:10,padding:"8px 16px",fontSize:11,
                  fontFamily:"'Inter',sans-serif",fontWeight:600,
                  letterSpacing:"0.05em",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6,transition:"all 0.15s",
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
                <button className="no-print" onClick={()=>window.print()}
                  style={{background:`rgba(139,92,246,0.15)`,border:`1px solid ${T.accent}`,color:T.accent,borderRadius:10,padding:"8px 16px",fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,letterSpacing:"0.05em",transition:"all 0.15s"}}>
                  ⬇ EXPORTAR PDF
                </button>
              )}
            </div>
          </div>

          {/* CONTENIDO */}
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
              {view==="temporal"  && <ViewTemporal  data={filteredData}/>}
              {view==="cgm"       && <ViewCGM       data={filteredData}/>}
              {view==="usuarios"  && <ViewUsuarios/>}
              {view==="sirenas" && <ViewSirenas leafletReady={leafletReady}/>}
              {view==="mapa"      && (leafletReady
                ? <ViewMapa data={dataForMap} filters={filters} setFilters={setFilters}/>
                : <div style={{color:T.muted,fontSize:12,padding:20}}>Cargando mapa…</div>
              )}
            </>
          )}

          {/* ENCABEZADO PRINT */}
          <div className="print-header" style={{marginBottom:16,paddingBottom:10,borderBottom:"2px solid #8b5cf6"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#111"}}>Centro de Gestión Municipal · Lomas de Zamora</div>
            <div style={{fontSize:11,color:"#555",marginTop:4}}>
              Análisis Operativo de Alertas &nbsp;·&nbsp;
              Período: {filters.fechaDesde||"–"} → {filters.fechaHasta||"–"} &nbsp;·&nbsp;
              {filters.cgm       ? `Zona: ${filters.cgm} · `             : ""}
              {filters.categoria ? `Categoría: ${filters.categoria} · `  : ""}
              {filters.turno     ? `Turno: ${filters.turno} · `          : ""}
              {filters.tipo      ? `Tipo: ${filters.tipo} · `            : ""}
              {filteredData.length.toLocaleString()} registros &nbsp;·&nbsp;
              Generado: {new Date().toLocaleString("es-AR")}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{textAlign:"center",color:T.muted,fontSize:10,marginTop:24,padding:"8px 0",borderTop:`1px solid rgba(139,92,246,0.08)`}}>
            CGM · Análisis Operativo &nbsp;·&nbsp; {filters.fechaDesde||"–"} → {filters.fechaHasta||"–"} &nbsp;·&nbsp; {filteredData.length.toLocaleString()} registros
          </div>
        </div>

        <ChatWidget contexto="alertas"/>
      </div>
    </>
  );
}
