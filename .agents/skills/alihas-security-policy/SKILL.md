---
name: ALihas Security Policy Overview
description: Guía de arquitectura de seguridad para Agentes y LLMs operando dentro del sandbox estricto de NemoClaw en el entorno ALihas.
---

# ALihas: NemoClaw Security Layer

## 1. Contexto Operativo del Agente
Estás operando dentro del entorno **ALihas**, un framework de agentes empaquetado y orquestado a través de Docker Compose (`docker-compose.yml`).
Actualmente, el contenedor en el que operas (OpenClaw) NO tiene acceso irrestricto a Internet ni a la red local. Estás resguardado por el módulo de seguridad de **NVIDIA NemoClaw** en modo `strict`.

## 2. El Firewall y la Jaula (Sandbox)
La propiedad `NEMOCLAW_POLICY_MODE=strict` intercepta todo el tráfico saliente (*Egress*) de tus procesos.
Si intentas comunicarte con una API, descargar una librería o hacer un ping a un host que **no esté explícitamente autorizado**, la conexión fallará silenciosamente o devolverá un error de "Conexión Rechazada".

## 3. Lista Blanca (Egress Policy)
El único archivo que dicta tus permisos de salida a internet es:
`ALihas/policies/openclaw-sandbox.yaml`

Dentro de ese archivo YAML, encontrarás dos bloques vitales:
- `allow_internal`: Servicios de red local a los que tienes acceso (Por defecto, únicamente `aliha-neurogestor` en el puerto `7437`).
- `allow_llm_providers`: Los hosts públicos a los que estás enlazado a través del puerto seguro 443 (Ej. OpenAI, Gemini, Anthropic, OpenRouter, Qwen, etc.).

## 4. Instrucciones de Troubleshooting para el Agente
Si experimentas problemas de red (Ej. intentas usar una herramienta web y la petición hace *timeout* o es rechazada):
1. **NO asumas que la herramienta está rota:** Primero verifica si la URL de destino está listada en `policies/openclaw-sandbox.yaml`.
2. Si el host no está en la lista blanca, tú **NO** puedes modificar la política por ti mismo si no tienes los permisos de montaje del volumen host. 
3. Debes informar al usuario (El Arquitecto del Sistema) e indicarle exactamente qué línea (`host` y `port`) necesita añadir bajo la sección `allow_integrations` del archivo `openclaw-sandbox.yaml` y pedirle que reinicie los contenedores con `docker-compose down && docker-compose up -d`.

### Regla Fundamental
Bajo ninguna circunstancia intentes evadir la red de Dokploy o modificar el puente del `docker-compose.yml` para obtener privilegios altos. El aislamiento es el estándar de oro de esta agencia.
