import { createClient } from "@supabase/supabase-js";
import { fetchTarimaData } from "../src/tarimaData.js";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// "openrouter/free" es un router automático: elige entre los modelos
// gratuitos disponibles que soporten tool calling, evitando que un solo
// proveedor saturado tire un 429. Se puede pisar con la env var
// OPENROUTER_MODEL en Vercel para fijar un modelo puntual si hiciera falta.
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const MAX_TOOL_ITERATIONS = 10;
const MAX_GROUP_ROWS = 20000;

const SYSTEM_PROMPT = `Sos el asistente de datos del sistema de monitoreo de Lomas de Zamora. Cubrís DOS reportes:
- ALERTAS (Centro de Gestión Municipal): ambulancia, policía, bomberos, sirena, violencia de género, y usuarios/vecinos registrados en la app. Herramientas: "consultar_alertas" y "consultar_usuarios".
- TARIMA (Centro de Operaciones Lomas): novedades por comisaría — robos, hurtos, conflictos, violencia, siniestros, incendios, accidentes, etc. Herramienta: "consultar_tarima".

Reglas:
- Nunca inventes cifras: todo número que menciones tiene que salir de lo que devolvieron las herramientas. Si necesitás un dato que no tenés, llamá a la herramienta correspondiente antes de responder.
- Los datos de alertas y usuarios disponibles llegan hasta el 30 de abril de 2026. No hay datos de mayo, junio ni julio de 2026. Si preguntan por esos meses, aclará que no tenés esa información. Los datos de Tarima, en cambio, se leen en vivo de la planilla y no tienen ese corte.
- Podés responder preguntas sobre cualquiera de los dos reportes en la misma conversación, aunque el usuario esté viendo uno de los dos en pantalla (te aviso cuál abajo). Si la pregunta es ambigua entre Alertas y Tarima, priorizá el reporte que el usuario tiene abierto, salvo que el texto de la pregunta indique claramente el otro.
- Para preguntas de cantidad, comparación o "cuál es la más común", usá el parámetro agrupar_por en vez de listar registros uno por uno.
- SÍ podés (y te lo van a pedir seguido) interpretar los datos, sacar conclusiones y armar recomendaciones o planes de acción operativos (ej. reforzar personal en una zona/turno, priorizar categorías, etc.). Para eso, primero consultá los datos que necesites (agrupando por zona, categoría, turno, hora, etc. según haga falta, incluso con varias llamadas a las herramientas) y después armá la recomendación explicando en qué números te basás. No es una tarea "sin relación con los datos": es el uso principal que le van a dar a este chat.
- Cuando la pregunta se preste a comparar cantidades, ver una tendencia en el tiempo, ver una distribución o cruzar dos dimensiones (ej. día × turno), además de responder en texto llamá a la herramienta "graficar" para acompañar la respuesta con un gráfico, usando los números que ya consultaste (nunca inventados). No grafiques respuestas de un solo dato puntual.
- Respondé siempre en español, de forma clara y estructurada (párrafos cortos o listas cuando ayude), citando los números que respaldan cada afirmación.
- Solo rechazá responder si la pregunta es genuinamente ajena a estos dos reportes (por ejemplo, temas personales o sin ninguna relación con los datos).`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "consultar_alertas",
      description:
        "Consulta la tabla de alertas del sistema de monitoreo (ambulancia, policía, bomberos, sirena, violencia de género, etc). Usar para cualquier pregunta sobre cantidad, distribución o detalle de alertas.",
      parameters: {
        type: "object",
        properties: {
          fecha_desde: { type: "string", description: "Fecha mínima en formato YYYY-MM-DD (inclusive)." },
          fecha_hasta: { type: "string", description: "Fecha máxima en formato YYYY-MM-DD (inclusive). Los datos llegan hasta 2026-04-30." },
          cgm: { type: "string", description: "Nombre exacto de la zona/localidad (CGM), por ejemplo 'Turdera' o 'Banfield'." },
          categoria: { type: "string", description: "Categoría de la alerta: 'Ambulancia', 'Policía', 'Bomberos', 'Sirena' o 'Violencia de Género'." },
          tipo: { type: "string", description: "Origen del registro: 'Sistema' o 'Botmarket'." },
          agrupar_por: {
            type: "string",
            enum: ["categoria", "cgm", "tipo", "fecha", "hora", "dia_semana"],
            description: "Si se especifica, devuelve un conteo agrupado por ese campo en vez de una lista de registros.",
          },
          limite: { type: "integer", description: "Cantidad máxima de registros a devolver cuando no se agrupa (por defecto 25, máximo 100)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_usuarios",
      description:
        "Consulta la base de usuarios/vecinos activos registrados en la app. Usar para preguntas sobre cantidad de usuarios, edad, sexo, plataforma (iOS/Android), localidad o verificación de DNI.",
      parameters: {
        type: "object",
        properties: {
          fecha_desde: { type: "string", description: "Fecha mínima de alta en formato YYYY-MM-DD." },
          fecha_hasta: { type: "string", description: "Fecha máxima de alta en formato YYYY-MM-DD." },
          localidad: { type: "string", description: "Nombre exacto de la localidad/CGM del usuario." },
          agrupar_por: {
            type: "string",
            enum: ["sexo", "plataforma", "localidad", "categoria", "edad"],
            description: "Si se especifica, devuelve un conteo agrupado por ese campo.",
          },
          limite: { type: "integer", description: "Cantidad máxima de registros a devolver cuando no se agrupa (por defecto 25, máximo 100)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultar_tarima",
      description:
        "Consulta las novedades del reporte Tarima (Centro de Operaciones Lomas): robos, hurtos, conflictos, violencia, heridos, persecuciones, óbitos, incendios, accidentes de tránsito, etc, por comisaría. Usar para cualquier pregunta sobre el reporte Tarima.",
      parameters: {
        type: "object",
        properties: {
          fecha_desde: { type: "string", description: "Fecha mínima en formato YYYY-MM-DD (inclusive)." },
          fecha_hasta: { type: "string", description: "Fecha máxima en formato YYYY-MM-DD (inclusive)." },
          cgm: { type: "string", description: "Nombre exacto de la zona/localidad (CGM), por ejemplo 'Turdera' o 'Banfield'." },
          categoria: {
            type: "string",
            description: "Categoría de la novedad: 'Robo', 'Hurto', 'Conflicto', 'Violencia', 'Heridos', 'Persecución', 'Obito', 'Incendios', 'Accidente de tránsito' u 'Otros'.",
          },
          comisaria: { type: "string", description: "Nombre exacto de la comisaría o destacamento, ej. 'Cria 5ta' o 'Dto Turdera'." },
          turno: { type: "string", enum: ["Mañana", "Tarde", "Noche"] },
          agrupar_por: {
            type: "string",
            enum: ["categoria", "cgm", "comisaria", "turno", "dia_semana", "fecha"],
            description: "Si se especifica, devuelve un conteo agrupado por ese campo en vez de una lista de registros.",
          },
          limite: { type: "integer", description: "Cantidad máxima de registros a devolver cuando no se agrupa (por defecto 25, máximo 100)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "graficar",
      description:
        "Genera un gráfico visual para acompañar tu respuesta en texto. Usalo cuando la pregunta se preste a comparar cantidades entre categorías, ver una tendencia en el tiempo, ver una distribución, o cruzar dos dimensiones (ej. día × turno). No lo uses para respuestas de un solo dato puntual. Llamalo DESPUÉS de haber consultado los datos reales con las otras herramientas: los valores del gráfico tienen que salir de esos resultados, nunca inventados.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["barras", "lineas", "torta", "heatmap"], description: "Tipo de gráfico." },
          titulo: { type: "string", description: "Título breve del gráfico." },
          etiquetas: {
            type: "array",
            items: { type: "string" },
            description: "Para barras/lineas/torta: las categorías del eje X (o los segmentos de la torta).",
          },
          series: {
            type: "array",
            description: "Para barras/lineas/torta: una o más series de datos numéricos, cada una con el mismo largo que 'etiquetas'.",
            items: {
              type: "object",
              properties: {
                nombre: { type: "string" },
                valores: { type: "array", items: { type: "number" } },
              },
              required: ["nombre", "valores"],
            },
          },
          filas: { type: "array", items: { type: "string" }, description: "Solo para heatmap: etiquetas de fila." },
          columnas: { type: "array", items: { type: "string" }, description: "Solo para heatmap: etiquetas de columna." },
          matriz: {
            type: "array",
            items: { type: "array", items: { type: "number" } },
            description: "Solo para heatmap: matriz de valores, una fila por cada elemento de 'filas', cada una con el mismo largo que 'columnas'.",
          },
        },
        required: ["tipo", "titulo"],
      },
    },
  },
];

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const fn = new Date(String(fechaNacimiento).slice(0, 10));
  if (isNaN(fn.getTime())) return null;
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad;
}

function normalizarSexo(s) {
  if (s === true || s === "true" || s === "Masculino" || s === "M") return "Masculino";
  if (s === false || s === "false" || s === "Femenino" || s === "F") return "Femenino";
  return "Sin dato";
}

function rangoEdad(edad) {
  if (edad == null || isNaN(edad)) return "Sin dato";
  if (edad < 18) return "Menor a 18";
  if (edad <= 25) return "18-25";
  if (edad <= 35) return "26-35";
  if (edad <= 45) return "36-45";
  if (edad <= 55) return "46-55";
  if (edad <= 65) return "56-65";
  if (edad <= 75) return "66-75";
  return "76+";
}

function topConteo(counts, n = 30) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([clave, cantidad]) => ({ clave, cantidad }));
}

function aplicarFiltrosAlertas(query, args) {
  const { fecha_desde, fecha_hasta, cgm, categoria, tipo } = args || {};
  if (fecha_desde) query = query.gte("fecha", fecha_desde);
  if (fecha_hasta) query = query.lte("fecha", fecha_hasta);
  if (cgm) query = query.eq("cgm", cgm);
  if (categoria) query = query.eq("categoria", categoria);
  if (tipo) query = query.eq("tipo", tipo);
  return query;
}

async function consultarAlertas(args) {
  const limite = Math.min(Math.max(parseInt(args?.limite, 10) || 25, 1), 100);

  const { count, error: countErr } = await aplicarFiltrosAlertas(
    supabase.from("alertas").select("*", { count: "exact", head: true }),
    args
  );
  if (countErr) throw countErr;

  if (args?.agrupar_por) {
    const { data, error } = await aplicarFiltrosAlertas(
      supabase.from("alertas").select("tipo,fecha,horario,cgm,categoria"),
      args
    ).limit(MAX_GROUP_ROWS);
    if (error) throw error;

    const counts = {};
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    for (const row of data) {
      let clave;
      if (args.agrupar_por === "hora") {
        const h = row.horario ? parseInt(String(row.horario).split(":")[0], 10) : null;
        clave = h === null || isNaN(h) ? "Sin dato" : `${String(h).padStart(2, "0")}:00`;
      } else if (args.agrupar_por === "dia_semana") {
        const d = row.fecha ? new Date(row.fecha) : null;
        clave = d && !isNaN(d.getTime()) ? dias[d.getDay()] : "Sin dato";
      } else {
        clave = row[args.agrupar_por] || "Sin dato";
      }
      counts[clave] = (counts[clave] || 0) + 1;
    }

    return {
      total_coincidencias: count,
      agrupado_por: args.agrupar_por,
      distribucion: topConteo(counts),
      nota: data.length < count ? `Se agruparon los primeros ${data.length} de ${count} registros coincidentes.` : undefined,
    };
  }

  const { data, error } = await aplicarFiltrosAlertas(
    supabase.from("alertas").select("tipo,fecha,horario,cgm,categoria"),
    args
  )
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw error;

  return { total_coincidencias: count, registros_mostrados: data.length, registros: data };
}

function aplicarFiltrosUsuarios(query, args) {
  const { fecha_desde, fecha_hasta, localidad } = args || {};
  query = query.eq("activo", true);
  if (fecha_desde) query = query.gte("fecha_creacion", fecha_desde);
  if (fecha_hasta) query = query.lte("fecha_creacion", `${fecha_hasta}T23:59:59`);
  if (localidad) query = query.eq("localidad", localidad);
  return query;
}

async function consultarUsuarios(args) {
  const limite = Math.min(Math.max(parseInt(args?.limite, 10) || 25, 1), 100);

  const { count, error: countErr } = await aplicarFiltrosUsuarios(
    supabase.from("usuarios_cache").select("*", { count: "exact", head: true }),
    args
  );
  if (countErr) throw countErr;

  if (args?.agrupar_por) {
    const { data, error } = await aplicarFiltrosUsuarios(
      supabase.from("usuarios_cache").select("sexo,app_type,localidad,categoria_nombre,fecha_nacimiento"),
      args
    ).limit(MAX_GROUP_ROWS);
    if (error) throw error;

    const counts = {};
    for (const row of data) {
      let clave;
      if (args.agrupar_por === "sexo") clave = normalizarSexo(row.sexo);
      else if (args.agrupar_por === "plataforma") clave = row.app_type || "Sin dato";
      else if (args.agrupar_por === "localidad") clave = row.localidad || "Sin dato";
      else if (args.agrupar_por === "categoria") clave = row.categoria_nombre || "Sin categoría";
      else if (args.agrupar_por === "edad") clave = rangoEdad(calcularEdad(row.fecha_nacimiento));
      else clave = "Sin dato";
      counts[clave] = (counts[clave] || 0) + 1;
    }

    return {
      total_coincidencias: count,
      agrupado_por: args.agrupar_por,
      distribucion: topConteo(counts),
      nota: data.length < count ? `Se agruparon los primeros ${data.length} de ${count} registros coincidentes.` : undefined,
    };
  }

  const { data, error } = await aplicarFiltrosUsuarios(
    supabase
      .from("usuarios_cache")
      .select("nombre,apellido,sexo,fecha_nacimiento,categoria_nombre,app_type,localidad,fecha_creacion,dni_escaneado"),
    args
  )
    .order("fecha_creacion", { ascending: false })
    .limit(limite);
  if (error) throw error;

  const registros = data.map((u) => ({
    nombre: [u.nombre, u.apellido].filter(Boolean).join(" ") || "Sin nombre",
    edad: calcularEdad(u.fecha_nacimiento),
    sexo: normalizarSexo(u.sexo),
    localidad: u.localidad || "Sin dato",
    plataforma: u.app_type || "Sin dato",
    categoria: u.categoria_nombre || "Sin categoría",
    dni_escaneado: !!u.dni_escaneado,
    fecha_alta: u.fecha_creacion,
  }));

  return { total_coincidencias: count, registros_mostrados: registros.length, registros };
}

const TARIMA_CAMPOS = { categoria: "Categoría", cgm: "CGM", comisaria: "Comisaría", turno: "Turno", dia_semana: "DiaNom", fecha: "fecha" };

async function consultarTarima(args) {
  const rows = await fetchTarimaData();
  let filtradas = rows;
  if (args?.fecha_desde) filtradas = filtradas.filter((r) => r.fecha >= args.fecha_desde);
  if (args?.fecha_hasta) filtradas = filtradas.filter((r) => r.fecha <= args.fecha_hasta);
  if (args?.cgm) filtradas = filtradas.filter((r) => r.CGM === args.cgm);
  if (args?.categoria) filtradas = filtradas.filter((r) => r.Categoría === args.categoria);
  if (args?.comisaria) filtradas = filtradas.filter((r) => r.Comisaría === args.comisaria);
  if (args?.turno) filtradas = filtradas.filter((r) => r.Turno === args.turno);

  const total = filtradas.length;

  if (args?.agrupar_por) {
    const campo = TARIMA_CAMPOS[args.agrupar_por];
    const counts = {};
    for (const r of filtradas) {
      const clave = (campo && r[campo]) || "Sin dato";
      counts[clave] = (counts[clave] || 0) + 1;
    }
    return { total_coincidencias: total, agrupado_por: args.agrupar_por, distribucion: topConteo(counts) };
  }

  const limite = Math.min(Math.max(parseInt(args?.limite, 10) || 25, 1), 100);
  const registros = filtradas
    .slice()
    .sort((a, b) => (b.fecha !== a.fecha ? b.fecha.localeCompare(a.fecha) : b.hora - a.hora))
    .slice(0, limite)
    .map((r) => ({
      fecha: r.fecha,
      hora: r.hora,
      turno: r.Turno,
      categoria: r.Categoría,
      subcategoria: r.Subcategoria,
      comisaria: r.Comisaría,
      cgm: r.CGM,
      con_camara: r.con_camara,
      riesgo: r.riesgo,
    }));

  return { total_coincidencias: total, registros_mostrados: registros.length, registros };
}

async function ejecutarHerramienta(nombre, args) {
  if (nombre === "consultar_alertas") return consultarAlertas(args);
  if (nombre === "consultar_usuarios") return consultarUsuarios(args);
  if (nombre === "consultar_tarima") return consultarTarima(args);
  return { error: `Herramienta desconocida: ${nombre}` };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Falta configurar OPENROUTER_API_KEY en las variables de entorno del servidor." });
    return;
  }

  const { messages, contexto } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Falta el campo 'messages'." });
    return;
  }

  const contextoNota =
    contexto === "tarima"
      ? "\n\nEl usuario está viendo ahora mismo el reporte TARIMA (Centro de Operaciones Lomas)."
      : contexto === "alertas"
      ? "\n\nEl usuario está viendo ahora mismo el reporte ALERTAS (Centro de Gestión Municipal)."
      : "";

  const historial = [{ role: "system", content: SYSTEM_PROMPT + contextoNota }, ...messages];
  const charts = [];

  try {
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      const respuesta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://alertas-estadisticas.vercel.app",
          "X-Title": "CGM Lomas de Zamora - Chat de datos",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: historial,
          tools: TOOLS,
          tool_choice: "auto",
          temperature: 0.2,
        }),
      });

      if (!respuesta.ok) {
        const texto = await respuesta.text();
        throw new Error(`OpenRouter respondió ${respuesta.status}: ${texto.slice(0, 500)}`);
      }

      const json = await respuesta.json();
      const msg = json.choices?.[0]?.message;
      if (!msg) throw new Error("Respuesta inesperada del modelo.");

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        historial.push(msg);
        for (const call of msg.tool_calls) {
          let resultado;
          try {
            const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
            if (call.function.name === "graficar") {
              charts.push(args);
              resultado = { ok: true };
            } else {
              resultado = await ejecutarHerramienta(call.function.name, args);
            }
          } catch (e) {
            resultado = { error: e.message || String(e) };
          }
          historial.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(resultado),
          });
        }
        continue;
      }

      res.status(200).json({ reply: msg.content || "", charts });
      return;
    }

    res.status(500).json({ error: "El modelo no llegó a una respuesta final después de varios pasos." });
  } catch (e) {
    console.error("Error en /api/chat:", e);
    res.status(500).json({ error: e.message || "Error interno." });
  }
}
