---
name: Administración de Políticas de Seguridad (Sandbox)
description: Skill de alto riesgo. Enseña a la IA cómo administrar el muro de fuego saliente y manipular openclaw-sandbox.yaml responsablemente.
---

# ALihas: Gestión de Políticas NemoClaw (Egress)

El aislamiento de ALihas recae en el archivo de política YAML ubicado en:
`policies/openclaw-sandbox.yaml`

El contenedor trabaja en `NEMOCLAW_POLICY_MODE=strict`.
Cualquier URL o dominio que no se especifique debajo del grupo `allow_llm_providers` o `allow_integrations` será bloqueado.

## Reglas para el Agente (IA)
1. **Nunca abras puertos indiscriminados** (Ej. un '*' a todos los dominios o el puerto 22 a internet).
2. Si un usuario o sub-agente intentó hacer `curl` o conectarse vía Python a una API y fue rechazado, analiza inmediatamente el YAML.
3. Para añadir una nueva vía:
   - Identifica el host de la nueva API (Ej. `api.mi-proveedor.com`).
   - El puerto por defecto para tráfico cifrado es el `443`.
   - Modifica el archivo `policies/openclaw-sandbox.yaml` añadiendo una nueva entrada bajo `allow_integrations`.
4. Avisa al dueño para ejecutar `docker-compose restart openclaw` ya que las reglas Strict de Egress se cargan al iniciar el servicio.
