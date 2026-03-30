---
name: Monitoreo y Lectura de Sandbox
description: Cómo el Agente Inteligente debe depurar el estado y los errores del Sandbox de ALihas analizando Docker logs.
---

# ALihas: Monitoreo de Contenedores

Si el ecosistema ALihas experimenta un bloqueo, comportamientos irregulares, o si la jaula de seguridad expulsa a una conexión, la telemetría estará alojada en los Logs de Docker.

## Verificación de Salud
Como IA, si el usuario te pide investigar un fallo, solicita que ejecuten los binarios clásicos de administración de Docker o ejecútalos si tienes herramienta terminal local:
1. `docker-compose ps` (Verifica si el contenedor `openclaw` o `browser` están caídos).
2. `docker-compose logs --tail=100 openclaw` (Depura la razón exacta por la que falló NemoClaw).

Fíajte de manera crítica si el log arroja la advertencia de red *(Connection Refused / Egress Policy Blocked)*. Esto significa que la jaula del Sandbox está funcionando y detuvo un proceso no autorizado de internet.
