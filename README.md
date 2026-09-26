# Campus Video

Plataforma web responsive de videos educativos construida con React, TypeScript y Vite. Permite explorar y reproducir clases sin una cuenta; los estudiantes autenticados también pueden dar “me gusta”, comentar, responder y eliminar sus propios comentarios.

## Requisitos

- Node.js 20 o una versión posterior.
- npm 10 o una versión posterior.
- Conexión a internet para consumir la API compartida.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

Comandos de verificación y producción:

```bash
npm run lint
npm run build
npm run preview
```

La compilación lista para publicar se genera en `dist/`.

## Funcionalidades

- Registro de estudiantes con validación previa de carné, nombre, correo y PIN.
- Inicio de sesión mediante carné o correo, con persistencia en `localStorage` y cierre de sesión.
- Catálogo con póster, título, descripción, categoría, duración, likes y reproducción.
- Búsqueda en tiempo real por título y filtro local por categoría.
- Detalle en un modal accesible, navegable por teclado y cerrable con `Escape`.
- Likes de tipo toggle, comentarios, respuestas de un único nivel y eliminación de comentarios propios.
- Acciones protegidas para visitantes, manejo explícito de respuestas 401 y 403.
- Estados de carga, error de red, confirmación, operación en curso y resultados vacíos.
- Diseño adaptado a teléfonos, tabletas y escritorio, con soporte para movimiento reducido.

## Validaciones

- Carné obligatorio con formato exacto `9999-99-99999`.
- Correo obligatorio con estructura válida.
- PIN obligatorio y compuesto exclusivamente por números, sin espacios ni letras.
- Nombre completo obligatorio durante el registro.
- En el login, el identificador debe ser un carné válido o un correo válido.
- Comentarios y respuestas no pueden publicarse vacíos.

Las validaciones se realizan antes de llamar a la API. Los errores de validación del servidor y los errores de red se muestran en la interfaz.

## API

URL base:

```text
https://back-semprivado-umg-h6fkf2bng2avgrgw.westus3-01.azurewebsites.net
```

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/estudiantes/registrar` | Registrar estudiante |
| POST | `/api/login` | Iniciar sesión |
| GET | `/api/videos` | Obtener catálogo |
| GET | `/api/videos/{id}` | Obtener detalle actualizado |
| GET | `/api/videos/categorias` | Obtener categorías |
| GET | `/api/videos/categoria/{nombreCategoria}` | Obtener videos por categoría |
| POST | `/api/interaccionvideo/{videoId}/like` | Alternar like |
| POST | `/api/interaccionvideo/{videoId}/comentario` | Publicar comentario |
| POST | `/api/interaccionvideo/comentario/{comentarioId}/responder` | Responder comentario |
| DELETE | `/api/interaccionvideo/comentario/{comentarioId}?carne={carne}` | Eliminar comentario propio |

Las mutaciones solo se producen por una acción manual del usuario. Después de cada mutación, la aplicación vuelve a solicitar el detalle del video mediante GET para reflejar el estado confirmado por el servidor.

## Arquitectura

```text
src/
├── components/   Componentes reutilizables, autenticación y detalle del video
├── context/      Estado global de autenticación y persistencia de la sesión
├── pages/        Página del catálogo y coordinación de datos
├── services/     Cliente Fetch y adaptación del contrato de la API
├── types/        Modelos TypeScript del dominio
├── utils/        Validaciones, errores y formato de datos
├── App.tsx       Composición principal
└── index.css     Estilos base y variables visuales
```

No se utiliza un backend adicional ni dependencias de interfaz. El cliente HTTP está centralizado en `src/services/api.ts`.

## Sesión y seguridad

La sesión se guarda con la clave `campus-video-sesion` en `localStorage`. El cliente nunca almacena el PIN. Los permisos efectivos siempre dependen del backend; la interfaz oculta la eliminación de comentarios ajenos y presenta mensajes específicos para respuestas 401 y 403.

## Despliegue

1. Ejecutar `npm run build`.
2. Publicar el contenido de `dist/` en un alojamiento de archivos estáticos (Azure Static Web Apps, Netlify, Vercel o equivalente).
3. Configurar el sitio para servir `index.html` como documento principal.
4. Confirmar que el origen de producción esté permitido por la política CORS de la API.

La URL base está centralizada en `src/services/api.ts`; no requiere claves ni secretos.
