# ALihas (NemoClaw Architect Edition)

Este repositorio unifica la agilidad del framework de automatización **ALihas** con el núcleo de seguridad restrictivo de **NVIDIA NemoClaw**. 

## Novedades Arquitectónicas
1. Reemplazado el modelo abierto `custom` por la jaula estructurada de NemoClaw (`NEMOCLAW_POLICY_MODE=strict`).
2. Se incluye el archivo `policies/openclaw-sandbox.yaml` que bloquea todas las peticiones externas, permitiendo únicamente el tráfico a la red interna y a los proveedores LLM y APIs pre-aprobados:
   - `aliha-neurogestor:7437`
   - Gemini, MiniMax, OpenRouter, Anthropic, Qwen/DashScope, Groq, NVIDIA, Moonshot, Mistral, xAI, Telegram
3. El archivo `docker-compose.yml` sigue encajando sin fricción en la red SRE de `dokploy-network` mientras monta este control de seguridad internamente en `/data/.openclaw/policies`.

## Guía de Despliegue Local (Docker Desktop)
1. Carga un archivo `.env` en la raíz (usa `.env.example` como plantilla).
2. Abre la terminal en esta carpeta.
3. Ejecuta `docker-compose up -d`.

## Guía de Despliegue en Producción (Dokploy)
Este flujo está diseñado para desplegar directamente desde GitHub a Dokploy, cargando las políticas como Data Volume.

1. Añade este repositorio a tu panel de Dokploy seleccionando la opción **Compose**.
2. Vincula el **Git Repository** a la URL de GitHub (o escoge *Compose Text*).
3. Asegúrate de conservar el Path correcto al Compose file (`docker-compose.yml`).
4. Ve a la pestaña de **Environment** en Dokploy.
5. Copia todo el contenido del archivo `.env.example`, pégalo allí y **rellena con tus verdaderas claves API**.
6. Realiza un **Deploy**.

Dokploy montará automáticamente los volúmenes configurados, leerá la regla "strict" desde las políticas e instanciará los contenedores blindados inmediatamente.
