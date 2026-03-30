# ALihas-v2 — Reglas de Seguridad del Agente

## Derivadas del SDK NVIDIA NemoClaw — Modo Estricto

---

## 1. Control de Tráfico (Egress Firewall)

Todo tráfico saliente **ESTÁ BLOQUEADO POR DEFECTO**. Solo se permiten las conexiones listadas explícitamente en `policies/openclaw-sandbox.yaml`.

### Proveedores LLM Autorizados
| Proveedor | Host | Puerto |
|---|---|---|
| NVIDIA NIM | `integrate.api.nvidia.com` | 443 |
| OpenAI | `api.openai.com` | 443 |
| Gemini | `generativelanguage.googleapis.com` | 443 |
| MiniMax | `api.minimax.chat` | 443 |
| OpenRouter | `openrouter.ai` | 443 |
| Anthropic | `api.anthropic.com` | 443 |
| Qwen/DashScope | `dashscope.aliyuncs.com` | 443 |
| Groq | `api.groq.com` | 443 |
| Moonshot | `api.moonshot.cn` | 443 |
| Mistral | `api.mistral.ai` | 443 |
| xAI | `api.x.ai` | 443 |

### Servicios Internos Autorizados
| Servicio | Host | Puerto | Protocolo |
|---|---|---|---|
| Neurogestor | `aliha-neurogestor` | 7437 | REST |

### Integraciones Externas Autorizadas
| Servicio | Host | Puerto |
|---|---|---|
| Telegram Bot | `api.telegram.org` | 443 |

---

## 2. Protección de Datos

### Reglas Absolutas
- ❌ **NUNCA** exponer API keys, tokens o passwords en logs o respuestas.
- ❌ **NUNCA** modificar el volumen `joseias-data` sin aprobación explícita del Arquitecto.
- ❌ **NUNCA** desactivar el modo `strict` de NemoClaw.
- ❌ **NUNCA** añadir hosts al firewall egress sin revisión del Arquitecto.

### Manejo de Credenciales
- Las API keys se inyectan únicamente vía variables de entorno (`${VAR}`).
- El archivo `.env` **NUNCA** se sube a GitHub (está en `.gitignore`).
- En producción (Dokploy), las variables van en la pestaña Environment.
- En Codespace, las variables van como Codespace Secrets.

---

## 3. Auditoría y Motor Dual NVIDIA

### Motor de Seguridad (Safety LLM)
- **Modelo**: `llama-3.1-nemotron-safety-guard-8b-v3`
- **Función**: Evalúa cada input/output del agente antes de procesarlo.
- **Acción en violación**: Bloquea la respuesta y notifica al Arquitecto.

### Motor Operativo (Primary LLM)
- **Modelo**: `meta/llama-3.1-70b-instruct`
- **Función**: Razonamiento, generación de código, análisis, automatización.
- **Endpoint**: `https://integrate.api.nvidia.com/v1`

### Flujo de Inferencia
```
Usuario → [Safety LLM: ¿es seguro?] → SÍ → [Primary LLM: procesar] → [Safety LLM: ¿respuesta segura?] → SÍ → Usuario
                                     → NO → Bloquear + Log
```

---

## 4. Compatibilidad de Despliegue

Estas reglas aplican en **ambos** entornos:
- **Dokploy** (Producción v1 — redes `dokploy-network` y `core-agentes-net` externas)
- **Codespace** (Testing v2 — mismas redes creadas por `post-create.sh`)

El `docker-compose.yml` es idéntico para ambos. La diferencia está en cómo se crean las redes:
- Dokploy: las crea automáticamente al desplegar.
- Codespace: las crea el script `.devcontainer/post-create.sh`.
