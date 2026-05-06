/**
 * Agent Tor — Model Router para Hermes Personal
 *
 * Decide qué modelo usar según el contenido del mensaje:
 *   - Patrones de privacidad → modelo local (Ollama Qwen 3 2B)
 *   - Patrones de diseño → Gemini 2.5 Pro
 *   - Patrones de código → Claude Sonnet 4 (OpenRouter)
 *   - Chat general → Gemini 2.0 Flash Lite (default)
 */

export interface RoutedResponse {
  reply: string;
  mode: "local" | "design" | "code" | "default";
  model: string;
}

export interface RouteOptions {
  forceMode?: "local";
  history?: { role: "user" | "assistant"; content: string }[];
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
      return routeGeminiPro(message, options);
    case "code":
      return routeCode(message, options);
    default:
      return routeDefault(message, options);
  }
}

async function routeLocal(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  // Usa Ollama local para datos privados
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:2b",
        prompt: `Eres Hermes, el asistente personal de confianza. Esta conversación es PRIVADA. Responde de forma útil y segura:\n\n${message}`,
        stream: false,
      }),
    });
    const data = await response.json() as { response: string };
    return { reply: data.response, mode: "local", model: "ollama/qwen3:2b" };
  } catch {
    // Fallback a Gemini si Ollama no está disponible
    return routeDefault(message, options);
  }
}

async function routeGeminiPro(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  return callGemini(message, "gemini-2.5-pro", "design");
}

async function routeCode(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  // Intenta OpenRouter con Claude, fallback a Gemini
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
            { role: "system", content: "Eres Hermes, asistente personal y arquitecto técnico de ALiHaNeD. Responde con precisión técnica." },
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
    } catch {
      // fallback
    }
  }
  return callGemini(message, "gemini-2.0-flash-lite", "code");
}

async function routeDefault(
  message: string,
  options: RouteOptions
): Promise<RoutedResponse> {
  return callGemini(message, "gemini-2.0-flash-lite", "default");
}

async function callGemini(
  message: string,
  model: string,
  mode: RoutedResponse["mode"]
): Promise<RoutedResponse> {
  const apiKey = process.env.HERMES_GEMINI_KEY;
  if (!apiKey) {
    return {
      reply: "Estoy aquí para ayudarte. (Hermes en modo offline — configura HERMES_GEMINI_KEY para IA completa.)",
      mode: "default",
      model: "none",
    };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    // Usar modelos válidos de Gemini
    const modelName = model === "gemini-2.5-pro" ? "gemini-2.5-pro" : "gemma-4-31b-it";
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: "Eres Hermes, el asistente personal Amo de Llaves del ecosistema ALiHaNeD. Eres la cara y voz del ecosistema. Hablas como si tú mismo hicieras todo, aunque delegues tareas a los agentes Científico y Spirit. Eres servicial, leal y refinado — como Alfred. Responde en español, con precisión y calidez.",
    });
    const result = await genModel.generateContent(message);
    return {
      reply: result.response.text(),
      mode,
      model: `google/${modelName}`,
    };
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || "error desconocido";
    console.error("[Agent Tor] Gemini error:", errMsg);
    return {
      reply: `Error Gemini: ${errMsg}`,
      mode,
      model: "google/error",
    };
  }
}
