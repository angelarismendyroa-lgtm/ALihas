/**
 * Alihas Telegram Bridge — Hermes Personal (Amo de Llaves)
 *
 * Puente entre Telegram y Hermes Agent.
 * Agent Tor enruta cada mensaje al modelo correcto:
 *   - Datos privados → Ollama local (nunca sale de la máquina)
 *   - Diseño → Gemini 2.5 Pro
 *   - Código → Claude Sonnet 4 vía OpenRouter
 *   - Chat general → Gemini 2.0 Flash Lite
 */

import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { Bot, Context, session, SessionFlavor } from "grammy";
import { routeMessage, type RoutedResponse } from "./agent-tor.js";
import { searchZumo } from "./zumo.js";

interface SessionData {
  mode: "default" | "private" | "design" | "code";
  history: { role: "user" | "assistant"; content: string }[];
}

type BotContext = Context & SessionFlavor<SessionData>;

const bot = new Bot<BotContext>(process.env.HERMES_TELEGRAM_TOKEN || "");

bot.use(
  session({
    initial: (): SessionData => ({
      mode: "default",
      history: [],
    }),
  })
);

bot.command("start", async (ctx) => {
  await ctx.reply(
    `**Hermes — Amo de Llaves**\n\n` +
    `Soy tu asistente personal ALiHaNeD. Puedo:\n\n` +
    `  • Gestionar tu vida personal y negocios\n` +
    `  • Proteger tus datos privados (modo local)\n` +
    `  • Diseñar soluciones y sistemas\n` +
    `  • Coordinar con el laboratorio (Científico)\n` +
    `  • Consultar el Zumo de Conocimiento\n\n` +
    `Comandos:\n` +
    `  /privado — Activar modo privado (datos locales)\n` +
    `  /zumo <tema> — Buscar en el Zumo de Conocimiento\n` +
    `  /ayuda — Ver esta ayuda`,
    { parse_mode: "Markdown" }
  );
});

bot.command("privado", async (ctx) => {
  ctx.session.mode = "private";
  await ctx.reply("Modo privado activado. Todo lo que digas se procesa localmente (Ollama) y no sale de tu máquina.");
});

bot.command("zumo", async (ctx) => {
  const query = ctx.match;
  if (!query) {
    await ctx.reply("Uso: /zumo <tema a buscar>");
    return;
  }
  await ctx.reply("Buscando en el Zumo de Conocimiento...");
  const results = await searchZumo(query);
  if (results.length === 0) {
    await ctx.reply("No encontré nada en el Zumo sobre ese tema.");
  } else {
    await ctx.reply(`**Zumo — ${query}**\n\n${results.slice(0, 3).join("\n\n")}`, { parse_mode: "Markdown" });
  }
});

bot.command("ayuda", async (ctx) => {
  await ctx.reply(
    `**Hermes — Comandos**\n\n` +
    `/start — Presentación\n` +
    `/privado — Modo privado (local)\n` +
    `/zumo <tema> — Buscar conocimiento\n` +
    `/ayuda — Esta lista`,
    { parse_mode: "Markdown" }
  );
});

bot.on("message:text", async (ctx) => {
  const userMessage = ctx.message.text;
  const userId = ctx.from.id.toString();

  console.log(`[Hermes] Mensaje de ${ctx.from.first_name}: "${userMessage.slice(0, 80)}..."`);

  await ctx.api.sendChatAction(ctx.chat.id, "typing");

  try {
    const response: RoutedResponse = await routeMessage(userMessage, {
      forceMode: ctx.session.mode === "private" ? "local" : undefined,
      history: ctx.session.history,
    });

    ctx.session.history.push({ role: "user", content: userMessage });
    ctx.session.history.push({ role: "assistant", content: response.reply });

    if (ctx.session.history.length > 20) {
      ctx.session.history = ctx.session.history.slice(-20);
    }

    const prefix = response.mode === "local"
      ? "(Procesado localmente)\n\n"
      : response.mode === "design"
        ? "(Modo diseño)\n\n"
        : "";

    await ctx.reply(prefix + response.reply, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("[Hermes] Error:", error);
    await ctx.reply("Lo siento, hubo un error procesando tu mensaje. Intenta de nuevo.");
  }
});

// Health check HTTP server (para Dokploy/Traefik)
const PORT = parseInt(process.env.PORT || "8080");
const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "alihas-hermes", timestamp: new Date().toISOString() }));
});
server.listen(PORT, () => {
  console.log(`[Health] HTTP server en puerto ${PORT}`);
});

// Start bot
console.log("=== Hermes Personal (Alihas) — Telegram Bridge ===");
console.log("Iniciando bot...");

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} iniciado como Hermes Personal`);
  },
});
