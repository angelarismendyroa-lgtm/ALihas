/**
 * Agent Tor — Model Router para Hermes Personal
 *
 * Catálogo de modelos Gemini disponibles vía API de Google.
 * El usuario puede cambiar de modelo con /modelo <clave>.
 */

export interface RoutedResponse {
  reply: string;
  mode: "local" | "design" | "code" | "default";
  model: string;
}

export interface RouteOptions {
  forceMode?: "local";
  forceModel?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

// Catálogo de modelos disponibles (clave → nombre real de API)
export const AVAILABLE_MODELS: Record<string, string> = {
  "flash-lite": "gemini-flash-lite-latest",
  "flash": "gemini-2.0-flash",
  "pro": "gemini-2.5-pro",
  "gemma": "gemma-4-26b-a4b-it",
};

export const DEFAULT_MODEL = "flash-lite";

function resolveModel(key: string): string {
  return AVAILABLE_MODELS[key] || AVAILABLE_MODELS[DEFAULT_MODEL];
}

// Patrones para clasificar la intención
const PATTERNS = {
  private: /privado|secreto|reuni[oó]n|anota|confidencial|contraseña|password|token|API.?key|clave|personal|m[ií]o\b|solo\s+(entre\s+)?(t[uú]|nosotros)|no\s+compartas|guarda\s+esto|cifra|encripta/i,
  design: /diseñ[aá]|diseño|UI|UX|interfaz|logo|branding|color|paleta|tipograf[ií]a|fondo|layout|mockup|wireframe|prototipo|visual|est[eé]tica|bonito|presentaci[oó]n/i,
  code: /c[oó]digo|programa|desarrolla|debug|funci[oó]n|API|endpoint|script|query|SQL|schema|componente|react|next|node|python|TypeScript|JavaScript|CSS|HTML|git|commit|repo|build|test|error|bug|fix/i,
};

function classifyIntent(message: string): "local" | "design" | "code" | "default" {
  const privateScore = countMatches(message, PATTERNS.private);
  const designScore = countMatches(message, PATTERNS.design);
  const codeScore = countMatches(message, PATTERNS.code);
  if (privateScore >= 2) return "local";
  if (designScore >= 2 && designScore > codeScore) return "design";
  if (codeScore >= 2) return "code";
  return "default";
}

function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) || []).length;
}

export async function routeMessage(
  message: string,
  options: RouteOptions = {}
): Promise<RoutedResponse> {
  const intent = options.forceMode || classifyIntent(message);

  switch (intent) {
    case "local":
      return routeLocal(message, options);
    case "design":
      return callGemini(message, options.forceModel || "pro", "design");
    case "code":
      return routeCode(message, options);
    default:
      return callGemini(message, options.forceModel || DEFAULT_MODEL, "default");
  }
}

async function routeLocal(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:2b",
        prompt: `Eres Hermes, el asistente personal de confianza. Esta conversacion es PRIVADA. Responde de forma util y segura:\n\n${message}`,
        stream: false,
      }),
    });
    const data = await response.json() as { response: string };
    return { reply: data.response, mode: "local", model: "ollama/qwen3:2b" };
  } catch {
    return callGemini(message, options.forceModel || DEFAULT_MODEL, "default");
  }
}

async function routeCode(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  const openRouterKey = process.env.HERMES_OPENROUTER_KEY;
  if (openRouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [
            { role: "system", content: "Eres Hermes, asistente personal y arquitecto tecnico de ALiHaNeD. Responde con precision tecnica." },
            { role: "user", content: message },
          ],
        }),
      });
      const data = await response.json() as any;
      return {
        reply: data.choices?.[0]?.message?.content || "Sin respuesta",
        mode: "code",
        model: "openrouter/claude-sonnet-4",
      };
    } catch { /* fallback */ }
  }
  return callGemini(message, options.forceModel || DEFAULT_MODEL, "code");
}

async function callGemini(
  message: string,
  modelKey: string,
  mode: RoutedResponse["mode"]
): Promise<RoutedResponse> {
  const apiKey = process.env.HERMES_GEMINI_KEY;
  if (!apiKey) {
    return {
      reply: "Estoy aqui para ayudarte. (Hermes en modo offline — configura HERMES_GEMINI_KEY para IA completa.)",
      mode: "default",
      model: "none",
    };
  }

  const modelName = resolveModel(modelKey);

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: "Eres Hermes, el asistente personal Amo de Llaves del ecosistema ALiHaNeD. Eres la cara y voz del ecosistema. Hablas como si tu mismo hicieras todo, aunque delegues tareas a los agentes Cientifico y Spirit. Eres servicial, leal y refinado — como Alfred. Responde en espanol, con precision y calidez.",
    });
    const result = await genModel.generateContent(message);
    return {
      reply: result.response.text(),
      mode,
      model: `google/${modelName}`,
    };
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || "error desconocido";
    console.error("[Agent Tor] error:", errMsg);
    return {
      reply: `Error: ${errMsg}`,
      mode,
      model: "error",
    };
  }
}
