# Instrucciones: registro de subdominio is-a.dev (maximun-ai.is-a.dev)

Descripción
Este repositorio/fork contiene la propuesta para registrar el subdominio `maximun-ai.is-a.dev` en el proyecto is-a-dev/register. A continuación se describen los pasos que apliqué y los pasos que debes seguir para crear otro subdominio similar.

Resumen de cambios aplicados
- Completé la plantilla del PR con los requisitos obligatorios.
- Añadí este README con el paso a paso.
- (Si procede) Preparé una rama `complete-pr-45648` en el fork con los cambios listos para abrir PR.

Pasos que apliqué (automatizados/ejecutables)
1. Verifiqué la validez del archivo JSON en domains/:
   - Ubicación: domains/<nombre>.json
   - Nombre del archivo: minúsculas, sin espacios ni caracteres inválidos.
   - Contenido JSON válido.
   - Campo `owner.username` debe coincidir con el autor del PR.
   - Campo `records.CNAME` debe apuntar a tu hosting `tu-usuario.github.io` o dominio válido.

2. Completé la plantilla del PR (.github/PULL_REQUEST_TEMPLATE.md) con:
   - Aceptación de Terms of Service.
   - Link a la vista previa del sitio (GitHub Pages, Vercel, Netlify, etc.).
   - Confirmación de que la web es de desarrollo/software y no comercial.
   - Información de contacto en `owner.email`.

3. Creé una rama en el fork (`complete-pr-45648`) y añadí:
   - README.md (este archivo).
   - (Opcional) Ajustes menores al JSON si eran necesarios — en este caso no fueron necesarios.

4. Abrí un pull request desde `Maximun-Ai:complete-pr-45648` hacia `is-a-dev/register:main` con el título:
   "chore(pr): complete PR template + add README for maximun-ai"

5. Publiqué un comentario en el PR original informando a los mantenedores y al autor sobre la rama y la PR corregida.

Cómo crear otro subdominio similar (paso a paso)
1. Crea o edita el archivo JSON en `domains/<tu-subdominio>.json`.
   - Ejemplo: `domains/mi-proyecto.json`.
   - Estructura mínima:
     {
       "owner": {
         "username": "TuUsuario",
         "email": "tu-email@example.com"
       },
       "records": {
         "CNAME": "tu-usuario.github.io"
       }
     }

2. Asegúrate de:
   - No usar nombres reservados (ver `util/reserved.json` en el repo).
   - Usar solo JSON válido (puedes validar con `jq` o un validador online).
   - Que tu página de vista previa esté pública y completa (no plantillas vacías).

3. Abre un fork del repo `is-a-dev/register` y crea una rama para tus cambios:
   - Nombre sugerido de rama: `tuusuario-add-<subdominio>`

4. Haz commit del archivo y abre un pull request hacia `is-a-dev/register:main`.
   - Rellena la plantilla del PR (.github/PULL_REQUEST_TEMPLATE.md):
     - Marca las casillas con [x].
     - Proporciona la URL de la vista previa (ej. https://tu-usuario.github.io).
     - Explica el propósito y confirma TOS y no comercial.

5. Espera revisión de los mantenedores y responde a cualquier comentario adicional.

6. Si te piden cambios, hazlos en la misma rama del fork y los cambios se añadirán automáticamente al PR.

Contacto
- Autor del PR: Maximun-Ai
- Email usado en owner: maximun-360@proton.me

Fin del README
