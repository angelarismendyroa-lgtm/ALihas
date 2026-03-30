---
name: Despliegue Remoto en Dokploy
description: Instrucciones operativas para que el Agente guíe al usuario al llevar ALihas desde local hacia la nube.
---

# ALihas: Despliegue Remoto (Dokploy)

Este framework está preparado operativamente para encajar en el ecosistema **SRE (Site Reliability Engineering)** a través de Dokploy, no vía SSH directo.

## Procedimiento de Despliegue Producción
1. **Verificar Redes**: Revisa que el `docker-compose.yml` declara las redes externas `dokploy-network` y `core-agentes-net`. Estas nunca deben ser borradas.
2. **Control de Versiones**: Enseña al usuario a comitear todos los cambios (Git Commit).
3. **Plataforma Dokploy**: El usuario debe añadir el repositorio GitHub en su instancia Dokploy usando la opción "Compose".
4. **Environment**: Recuerda al usuario trasladar el archivo `.env` por completo (sobre todo el Token de API `OPENCLAW_GATEWAY_TOKEN`) a la GUI de Dokploy antes de encender el servidor.

Si el Agente recibe una solicitud como *"Despliega esto"*, no intentes compilar Dockerfiles, simplemente da la instrucción al usuario de que la arquitectura está empaquetada y lista para inyectarse en el panel Dokploy vía Compose.
