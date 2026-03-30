---
name: Overview Técnico de ALihas
description: El mapa arquitectónico fundamental (Big Picture) del framework ALihas.
---

# ALihas: Visión General (Overview)

Bienvenido, Agente. Estás operando en una derivación híbrida del proyecto Nvidia NemoClaw, reconstruida por el equipo de ALiaNeD bajo un enfoque *Lightweight* administrable vía Docker-Compose.

## Hitos de la Arquitectura
1. **Infraestructura Ágil**: Hemos descartado herramientas CLI restrictivas de NVIDIA (OpenShell) y compilamos la arquitectura directamente contra la imagen pública (`coollabsio/openclaw:2026.2.6`), reduciendo un 90% el peso.
2. **Seguridad Irrompible**: A pesar de la ligereza, ALihas conserva el corazón de la bestia. El cortafuegos `Egress` y el parámetro `NEMOCLAW_POLICY_MODE=strict` actúan como una trituradora impenetrable, forzando a todo tráfico a someterse a la "Lista Blanca".
3. **Producción Integrada**: Preparado *out-of-the-box* para acoplarse y mapearse en el panel "Compose" de `Dokploy` hacia la red `dokploy-network`.

Como Agente, tu deber al auditar o mejorar este código es mantener esa dualidad inviolable: Mantenlo liviano y compatible con Docker-Compose, y mantén la política estricta de NemoClaw intocable.
