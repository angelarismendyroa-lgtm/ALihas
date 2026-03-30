---
name: Manejo del Workspace (Espacio de Trabajo)
description: Reglas sobre qué puede tocar y qué NO puede tocar el Agente en el contexto de almacenamiento de ALihas.
---

# ALihas: Workspace y Volúmenes de Retención

ALihas se divide en lo volátil (El Sandbox en memoria RAM) y lo persistente (Tus volúmenes locales montados hacia la arquitectura interna).

## Control de Volúmenes en Docker-Compose
- `joseias-data:/data`: Aquí reside el estado interior del agente, su base de datos vectora y sus perfiles locales de actuación. NUNCA sugieras borrar este volumen a menos que estés reconstruyendo la agencia desde cero.
- `./policies:/data/.openclaw/policies:ro`: Esta regla `:ro` significa *Read-Only* en el contenedor. El Agente Inteligente OpenClaw no puede manipular las llaves del cerrojo desde adentro. Sólo a través del Workspace local (VSCode / MCP local) se editan las políticas.
- `browser-data:/config`: Almacena las firmas de navegación anti-bot del contenedor de `browser`. Imprescindible para no perder sesiones al reiniciar la arquitectura.

## Regla de Oro
La carpeta Workspace está destinada para ser manipulada por humanos o agentes externos (Tú), mientras que dentro de Docker la manipulación está blindada y en aislamiento para protección contra la inyección de código.
