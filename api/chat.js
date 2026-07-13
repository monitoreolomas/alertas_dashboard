import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Se puede pisar con la env var OPENROUTER_MODEL en Vercel si este modelo
// gratuito deja de estar disponible. Verificar en https://openrouter.ai/models
// filtrando por "Free" y que soporte "tools" (function calling).
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const MAX_TOOL_ITERATIONS = 6;
const MAX_GROUP_ROWS = 20000;

const SYSTEM_PROMPT = `Sos el asistente de datos del Centro de Gestión Municipal de Lomas de Zamora.
Respondés preguntas sobre alertas (ambulancia, policía, bomberos, sirena, violencia de género) y sobre usuarios/vecinos registrados en la app, usando EXCLUSIVAMENTE los datos que te devuelven las herramientas "consultar_alertas" y "consultar_usuarios".

Reglas:
- Nunca inventes cifras. Si la pregunta necesita un dato que las herramientas no pueden traer, decilo con claridad.
- Los datos de alertas y usuarios disponibles llegan hasta el 30 de abril de 2026. No hay datos de mayo, junio ni julio de 2026. Si preguntan por esos meses, aclará que no tenés esa información.
- Para preguntas de cantidad, comparación o "cuál es la más común", usá el parámetro agrupar_por en vez de listar registros uno por uno.
- Respondé siempre en español, de forma breve y directa, citando los números que te devolvieron las herramientas.
- Si preguntan algo sin relación con estos datos, respondé amablemente que solo podés ayudar con información del sistema de monitoreo.`;

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

async function ejecutarHerramienta(nombre, args) {
  if (nombre === "consultar_alertas") return consultarAlertas(args);
  if (nombre === "consultar_usuarios") return consultarUsuarios(args);
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

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Falta el campo 'messages'." });
    return;
  }

  const historial = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

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
            resultado = await ejecutarHerramienta(call.function.name, args);
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

      res.status(200).json({ reply: msg.content || "" });
      return;
    }

    res.status(500).json({ error: "El modelo no llegó a una respuesta final después de varios pasos." });
  } catch (e) {
    console.error("Error en /api/chat:", e);
    res.status(500).json({ error: e.message || "Error interno." });
  }
}
