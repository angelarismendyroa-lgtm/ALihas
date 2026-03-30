---
name: Configurar Inferencia LLM
description: Enseña al agente cómo configurar y cambiar los LLMs principales y proveedores de nube (OpenAI, Gemini, Anthropic, etc.) en ALihas.
---

# ALihas: Configuración de Inferencia (LLM)

En el entorno ALihas, a diferencia de los entornos CLI tradicionales, la inferencia no se configura mediante comandos, sino a través de variables de entorno montadas en un archivo `.env` o en la consola de **Dokploy**.

## 1. El Cerebro Activo Principal
El modelo que procesa las instrucciones genéricas (Joseias) se controla con estas variables:
- `ACTIVE_API_KEY`: Llave del proveedor.
- `ACTIVE_BASE_URL`: Endpoint de la API (ej: `https://api.openai.com/v1`).
- `ACTIVE_MODEL`: El modelo a invocar (ej: `gpt-4o` o `anthropic/claude-3-5-sonnet`).

## 2. Bóveda Multi-Proveedor
Las llaves individuales para modelos especializados y proveedores de nube (NVIDIA NIM, Groq, xAI, Qwen, Moonshot) viven en el bloque 3 del `.env`. Las llamadas desde el interior del contenedor hacia estas APIs saldrán siempre que el `host` esté certificado en `policies/openclaw-sandbox.yaml`.

## Instrucciones para el Agente
Si se te pide cambiar el modelo de IA base o agragar una clave nueva:
1. Edita el archivo `.env` localmente o indícale al usuario que actualice el campo en la pestaña de `Environment` en Dokploy.
2. Tras grabar los cambios, el contenedor se debe reiniciar para tomar el nuevo entorno (`docker-compose up -d`).
