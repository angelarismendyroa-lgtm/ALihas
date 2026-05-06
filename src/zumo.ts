/**
 * Zumo de Conocimiento — Reader para Hermes Personal
 *
 * Lee la vault de Obsidian (Doc-Arismendy) y busca documentos relevantes.
 * Solo lectura — Hermes Personal no modifica el Zumo.
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, extname } from "path";

const ZUMO_PATH = "C:/Users/dell/Desktop/ECOSYSTEM_AlianeD/ALiHaneD";

interface ZumoDoc {
  title: string;
  path: string;
  snippet: string;
}

export function getZumoSummary(): string {
  return `Zumo de Conocimiento: ${ZUMO_PATH}\nSolo lectura. Vault Obsidian ALiHaneD.`;
}

export async function searchZumo(query: string): Promise<string[]> {
  try {
    const results: ZumoDoc[] = [];
    const keywords = query.toLowerCase().split(/\s+/);

    await scanDirectory(ZUMO_PATH, keywords, results, 3);

    if (results.length === 0) {
      return [];
    }

    return results.map((doc) => {
      const title = doc.title.replace(/\.md$|\.txt$/i, "");
      return `**${title}**\n${doc.snippet}...\n_${doc.path.replace(ZUMO_PATH, "")}_`;
    });
  } catch (error) {
    console.error("[Zumo] Error buscando:", error);
    return [];
  }
}

async function scanDirectory(
  dir: string,
  keywords: string[],
  results: ZumoDoc[],
  maxDepth: number,
  currentDepth = 0
): Promise<void> {
  if (currentDepth >= maxDepth || results.length >= 5) return;

  // Skip node_modules, .git, dist, etc.
  const skipDirs = new Set([
    "node_modules", ".git", "dist", ".next", "neurogestor-armor",
    "__pycache__", ".vercel", "drizzle"
  ]);

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= 5) return;
      if (entry.name.startsWith(".") && entry.name !== ".agent") continue;
      if (skipDirs.has(entry.name)) continue;

      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath, keywords, results, maxDepth, currentDepth + 1);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (![".md", ".txt"].includes(ext)) continue;

        try {
          const fileStat = await stat(fullPath);
          if (fileStat.size > 500_000) continue; // skip large files

          const content = await readFile(fullPath, "utf-8");
          const contentLower = content.toLowerCase();

          const matchCount = keywords.filter((kw) => contentLower.includes(kw)).length;
          if (matchCount >= 1) {
            const snippet = content.slice(0, 200).replace(/\n/g, " ");
            results.push({
              title: entry.name,
              path: fullPath,
              snippet: snippet + (content.length > 200 ? "..." : ""),
            });
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  } catch {
    // skip inaccessible directories
  }
}
