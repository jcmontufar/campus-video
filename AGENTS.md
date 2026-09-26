\# AGENTS.md



\## Objetivo



Desarrollar un catálogo web de videos educativos que cumpla el examen proporcionado.



\## Tecnologías



\- React

\- TypeScript

\- Vite

\- Fetch API

\- CSS

\- localStorage para conservar la sesión



\## API



URL base:



https://back-semprivado-umg-h6fkf2bng2avgrgw.westus3-01.azurewebsites.net



\## Comandos



\- Desarrollo: `npm run dev`

\- Linter: `npm run lint`

\- Compilación: `npm run build`



\## Reglas



\- Mantener la interfaz completamente en español.

\- No crear un backend adicional.

\- No agregar claves ni secretos.

\- No instalar dependencias sin una necesidad clara.

\- Separar componentes, páginas, contexto, servicios, tipos y utilidades.

\- Validar carné, correo y PIN antes de llamar a la API.

\- Conservar la sesión en localStorage.

\- Los visitantes pueden consultar y reproducir videos.

\- Likes, comentarios, respuestas y eliminación requieren autenticación.

\- Mostrar estados de carga, error, éxito y resultados vacíos.

\- Diseñar una interfaz responsive y accesible.

\- No ejecutar automáticamente peticiones POST o DELETE contra la API compartida.

\- Verificar cambios con lint y build.



\## Terminado cuando



\- Registro y login están implementados.

\- El login acepta carné o correo.

\- Existe catálogo, búsqueda y filtro por categoría.

\- Los videos pueden reproducirse.

\- El like funciona como toggle para usuarios autenticados.

\- Se pueden publicar comentarios y respuestas.

\- Cada usuario puede eliminar únicamente sus comentarios.

\- Las acciones restringidas redirigen o muestran el login.

\- `npm run lint` y `npm run build` finalizan correctamente.

\- El README documenta instalación, API, funcionalidades y despliegue.

