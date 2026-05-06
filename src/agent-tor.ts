/**
 * Agent Tor — Closet de Roles para Hermes Personal
 *
 * Cada ROL = un traje que Hermes se viste para una tarea profesional.
 * Cada rol mapea al mejor modelo disponible según las APIs configuradas.
 */

export interface RoutedResponse {
  reply: string;
  role: string;
  model: string;
}

export interface RouteOptions {
  forceRole?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

// ─── CATÁLOGO DE MODELOS POR PROVEEDOR ────────────────────────

export const PROVIDERS: Record<string, {
  name: string;
  enabled: boolean;
  models: Record<string, string>;
}> = {
  google: {
    name: "Google AI Studio",
    enabled: true,
    models: {
      "flash-lite": "gemini-3.1-flash-lite-preview",   // Barato ($0.25/$1.50)
      "flash": "gemini-3-flash-preview",               // Balanceado ($0.50/$3.00)
      "pro": "gemini-3.1-pro-preview",                 // SOTA ($2.00/$12.00)
      "gemma": "gemma-4-26b-a4b-it",                   // MoE, eficiente
      "gemma-31b": "gemma-4-31b-it",                   // Flagship denso
      "deep-research": "deep-research-preview-04-2026",
    },
  },
  openrouter: {
    name: "OpenRouter",
    enabled: false,  // Se activa cuando HERMES_OPENROUTER_KEY existe
    models: {
      "claude-opus": "anthropic/claude-opus-4",         // Revisión de código, análisis
      "claude-sonnet": "anthropic/claude-sonnet-4",     // Desarrollo general
      "deepseek": "deepseek/deepseek-chat",             // Programación barata
      "kimi": "moonshotai/kimi-k2",                     // Programación, matemáticas
      "minimax": "minimax/minimax-m1",                  // General
      "qwen": "qwen/qwen-3-235b-a22b",                  // Alibaba cloud
    },
  },
};

// ─── CATÁLOGO DE ROLES ────────────────────────────────────────
// Cada rol asigna al mejor modelo disponible

export interface Role {
  id: string;
  label: string;
  icon: string;
  category: string;
  // Orden de preferencia: [proveedor/modelo, ...]
  // Se usa el primero que esté habilitado
  models: string[];  // ["provider/modelKey", ...]
}

export const ROLES: Role[] = [
  // ── DEFAULT ──────────────────────────────────────────────
  {
    id: "calle",
    label: "Ropa de Calle",
    icon: "👕",
    category: "default",
    models: ["google/gemma", "google/flash-lite"],
  },
  {
    id: "asistente",
    label: "Asistente Personal",
    icon: "🤵",
    category: "default",
    models: ["google/flash-lite", "google/flash", "openrouter/qwen"],
  },

  // ── DISEÑO & CREATIVIDAD ─────────────────────────────────
  {
    id: "disenador-web",
    label: "Diseñador Web / 3D",
    icon: "🎨",
    category: "design",
    models: ["google/pro", "openrouter/minimax", "google/flash"],
  },
  {
    id: "ui-ux",
    label: "UI/UX Designer",
    icon: "🖌️",
    category: "design",
    models: ["google/pro", "google/flash"],
  },
  {
    id: "branding",
    label: "Branding & Identidad",
    icon: "✨",
    category: "design",
    models: ["google/pro", "openrouter/minimax"],
  },

  // ── PROGRAMACIÓN & DESARROLLO ─────────────────────────────
  {
    id: "fullstack",
    label: "Full Stack Developer",
    icon: "⚡",
    category: "dev",
    models: ["openrouter/claude-sonnet", "openrouter/deepseek", "google/pro"],
  },
  {
    id: "arquitecto",
    label: "Ingeniero de Software / Arquitecto",
    icon: "🏗️",
    category: "dev",
    models: ["openrouter/claude-opus", "openrouter/deepseek", "google/pro"],
  },
  {
    id: "qa",
    label: "QA & Code Review",
    icon: "🔍",
    category: "dev",
    models: ["openrouter/claude-opus", "openrouter/deepseek"],
  },

  // ── CLOUD & INFRAESTRUCTURA ───────────────────────────────
  {
    id: "cloud",
    label: "Cloud Engineer (AWS/GCP/Oracle)",
    icon: "☁️",
    category: "infra",
    models: ["openrouter/claude-sonnet", "google/pro"],
  },
  {
    id: "devops",
    label: "DevOps / CI-CD",
    icon: "⚙️",
    category: "infra",
    models: ["openrouter/deepseek", "google/pro"],
  },

  // ── FINANZAS & CONTABILIDAD ───────────────────────────────
  {
    id: "contador",
    label: "Contador / Finanzas",
    icon: "📊",
    category: "finance",
    models: ["google/pro", "openrouter/kimi", "openrouter/claude-sonnet"],
  },
  {
    id: "tributario",
    label: "Tributario / Impuestos",
    icon: "📋",
    category: "finance",
    models: ["google/pro", "openrouter/claude-opus"],
  },
  {
    id: "viabilidad",
    label: "Analista de Viabilidad Financiera",
    icon: "📈",
    category: "finance",
    models: ["google/pro", "google/deep-research", "openrouter/claude-opus"],
  },
  {
    id: "proyecciones",
    label: "Proyecciones & Forecasting",
    icon: "🔮",
    category: "finance",
    models: ["google/pro", "openrouter/kimi", "openrouter/deepseek"],
  },

  // ── INVESTIGACIÓN & ANÁLISIS ──────────────────────────────
  {
    id: "investigador",
    label: "Investigador de Mercado",
    icon: "🔬",
    category: "research",
    models: ["google/deep-research", "google/pro", "openrouter/claude-sonnet"],
  },
  {
    id: "analista-datos",
    label: "Analista de Datos",
    icon: "📐",
    category: "research",
    models: ["openrouter/deepseek", "openrouter/kimi", "google/pro"],
  },

  // ── PROJECT MANAGEMENT ────────────────────────────────────
  {
    id: "project-manager",
    label: "Project Manager",
    icon: "📋",
    category: "management",
    models: ["google/pro", "openrouter/claude-sonnet", "google/flash"],
  },
  {
    id: "estrategia",
    label: "Estratega de Negocio",
    icon: "🧠",
    category: "management",
    models: ["google/pro", "openrouter/claude-opus", "google/deep-research"],
  },

  // ── ERP & GESTIÓN EMPRESARIAL ─────────────────────────────
  {
    id: "odoo",
    label: "ERP / Odoo Specialist",
    icon: "🏢",
    category: "erp",
    models: ["openrouter/claude-sonnet", "google/pro"],
  },
  {
    id: "sage",
    label: "ERP / Sage Specialist",
    icon: "📚",
    category: "erp",
    models: ["openrouter/claude-sonnet", "google/pro"],
  },
];

// ─── ROL POR DEFECTO ─────────────────────────────────────────

export const DEFAULT_ROLE = "calle";

// ─── RESOLVER MODELO PARA UN ROL ─────────────────────────────

export function getRoleById(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export function resolveModelForRole(roleId: string): { provider: string; modelKey: string; modelName: string } | null {
  const role = getRoleById(roleId);
  if (!role) return null;

  for (const entry of role.models) {
    const [provider, modelKey] = entry.split("/");
    const p = PROVIDERS[provider];
    if (!p || !p.enabled) continue;
    const modelName = p.models[modelKey];
    if (modelName) {
      return { provider, modelKey, modelName };
    }
  }
  // Fallback: Google flash-lite
  return { provider: "google", modelKey: "flash-lite", modelName: "gemini-3.1-flash-lite-preview" };
}

export function getRolesByCategory(): Map<string, Role[]> {
  const map = new Map<string, Role[]>();
  for (const role of ROLES) {
    const list = map.get(role.category) || [];
    list.push(role);
    map.set(role.category, list);
  }
  return map;
}

export function formatRoleList(): string {
  const categories = getRolesByCategory();
  const names: Record<string, string> = {
    default: "Diario",
    design: "Diseño & Creatividad",
    dev: "Programación & Desarrollo",
    infra: "Cloud & Infraestructura",
    finance: "Finanzas & Contabilidad",
    research: "Investigación & Análisis",
    management: "Gestión & Estrategia",
    erp: "ERP & Gestión Empresarial",
  };
  let out = "";
  for (const [cat, roles] of categories) {
    out += `\n*${names[cat] || cat}*\n`;
    for (const r of roles) {
      out += `  /vestir ${r.id} — ${r.icon} ${r.label}\n`;
    }
  }
  return out;
}

// ─── ROUTER ───────────────────────────────────────────────────

function detectRoleFromMessage(message: string): string {
  const patterns: Record<string, RegExp[]> = {
    "disenador-web": [/diseñ[ao].*web/i, /diseñ[ao].*3d/i, /web.*design/i],
    "ui-ux": [/ui\s*\/\s*ux/i, /interfaz/i, /experiencia de usuario/i],
    "fullstack": [/full.?stack/i, /crear.*app/i, /m[oó]dulo.*facturaci[oó]n/i, /programar/i],
    "arquitecto": [/arquitect[uo]r/i, /ingenier[oi].*software/i, /sistema.*complejo/i],
    qa: [/revisar.*c[oó]digo/i, /code.?review/i, /test/i, /bug/i],
    cloud: [/aws/i, /oracle/i, /google cloud/i, /gcp/i, /infraestructura/i, /servidor/i],
    contador: [/contabilidad/i, /balance/i, /factura/i, /n[oó]mina/i],
    tributario: [/impuesto/i, /tributari/i, /declaraci[oó]n/i, /fiscal/i],
    viabilidad: [/viabilidad/i, /viable/i, /inversi[oó]n/i, /retorno/i, /roi/i, /proyecto.*financi/i],
    proyecciones: [/proyecci[oó]n/i, /forecast/i, /presupuesto/i],
    investigador: [/investig.*mercado/i, /competencia/i, /target/i, /p[uú]blico objetivo/i],
    "analista-datos": [/datos/i, /anal[ií]tica/i, /m[eé]trica/i, /estad[ií]stica/i],
    "project-manager": [/gesti[oó]n.*proyecto/i, /cronograma/i, /planificaci[oó]n/i],
    estrategia: [/estrategia/i, /negocio/i, /plan.*negocio/i, /startup/i],
    odoo: [/odoo/i, /m[oó]dulo.*odoo/i],
    sage: [/sage/i, /sage.*erp/i],
  };

  for (const [roleId, regexes] of Object.entries(patterns)) {
    for (const re of regexes) {
      if (re.test(message)) return roleId;
    }
  }
  return "asistente";
}

// ─── API PUBLICA ──────────────────────────────────────────────

export async function routeMessage(
  message: string,
  options: RouteOptions = {}
): Promise<RoutedResponse> {
  const roleId = options.forceRole || detectRoleFromMessage(message);
  const role = getRoleById(roleId);
  const resolved = resolveModelForRole(roleId);

  if (!resolved) {
    return {
      reply: "No tengo un modelo configurado para ese rol. Usa /modelos para ver opciones.",
      role: roleId,
      model: "none",
    };
  }

  if (resolved.provider === "google") {
    return callGoogle(message, resolved.modelName, roleId, role?.label || roleId);
  }
  if (resolved.provider === "openrouter") {
    return callOpenRouter(message, resolved.modelName, roleId, role?.label || roleId);
  }

  return {
    reply: `Proveedor ${resolved.provider} no implementado aún.`,
    role: roleId,
    model: resolved.modelName,
  };
}

// ─── GOOGLE AI STUDIO ─────────────────────────────────────────

async function callGoogle(
  message: string,
  modelName: string,
  roleId: string,
  roleLabel: string,
): Promise<RoutedResponse> {
  const apiKey = process.env.HERMES_GEMINI_KEY;
  if (!apiKey) {
    return {
      reply: "Hermes en modo offline — configura HERMES_GEMINI_KEY.",
      role: roleId,
      model: "none",
    };
  }
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        `Eres Hermes, Amo de Llaves de ALiHaNeD. Rol actual: ${roleLabel}. ` +
        `Corres sobre Google ${modelName}. Responde en español, breve y directo (2-3 frases). ` +
        `Si te preguntan qué modelo eres: "Estoy vestido de ${roleLabel}, usando ${modelName}".`,
    });
    const result = await genModel.generateContent(message);
    return {
      reply: result.response.text(),
      role: roleId,
      model: `google/${modelName}`,
    };
  } catch (error: any) {
    const errMsg = error?.message || "error desconocido";
    console.error("[Google]", errMsg);

    // Fallback si el modelo falla
    if (modelName !== "gemini-3.1-flash-lite-preview") {
      console.error("[Google] Fallback → flash-lite");
      return callGoogle(message, "gemini-3.1-flash-lite-preview", roleId, roleLabel);
    }

    return { reply: `Error: ${errMsg}`, role: roleId, model: "error" };
  }
}

// ─── OPENROUTER ───────────────────────────────────────────────

async function callOpenRouter(
  message: string,
  modelName: string,
  roleId: string,
  roleLabel: string,
): Promise<RoutedResponse> {
  const apiKey = process.env.HERMES_OPENROUTER_KEY;
  if (!apiKey) {
    // Fallback a Google
    return callGoogle(message, "gemini-3.1-flash-lite-preview", roleId, roleLabel);
  }
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content:
              `Eres Hermes, Amo de Llaves de ALiHaNeD. Rol: ${roleLabel}. ` +
              `Modelo: ${modelName} vía OpenRouter. Responde en español, breve y directo.`,
          },
          { role: "user", content: message },
        ],
      }),
    });
    const data = await response.json() as any;
    return {
      reply: data.choices?.[0]?.message?.content || "Sin respuesta",
      role: roleId,
      model: `openrouter/${modelName}`,
    };
  } catch (error: any) {
    console.error("[OpenRouter]", error?.message);
    return callGoogle(message, "gemini-3.1-flash-lite-preview", roleId, roleLabel);
  }
}
