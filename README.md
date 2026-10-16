# Truly

Truly transforma un lugar físico o evento en una red social temporal. El organizador crea una sala y comparte un QR; los asistentes entran desde el navegador, se registran con email, crean su perfil, descubren a las personas presentes y pueden dar likes, bloquear y reportar.

Esta implementación fue creada desde cero. No contiene URLs, IDs, secretos, APIs ni código de una versión anterior. Usa exclusivamente un proyecto Supabase que vos controles y un frontend desplegable en Vercel.

## Stack y arquitectura

- Next.js 16 con App Router, React 19 y TypeScript estricto.
- Tailwind CSS 4.
- Supabase PostgreSQL, Auth, Storage y Realtime.
- React Hook Form + Zod para formularios.
- Vitest para lógica crítica y contrato básico de seguridad.
- Sin backend Express, Redis, colas ni microservicios.

```text
src/
  app/                    rutas públicas, dashboard, salas, APIs server-only y dev tools
  components/             UI, experiencia social y dashboard
  hooks/                  presencia y Realtime
  lib/                    Auth, Supabase, salas, analytics y logging
  types/                  contrato tipado de la base
  utils/                  helpers puros
supabase/
  migrations/             schema completo, RLS, Storage, triggers y RPCs
  config.toml             configuración reproducible del stack local
scripts/
  seed.mjs                seed opcional vía Admin API, solo desarrollo
```

La autorización real vive en PostgreSQL. El cliente no decide quién puede leer un perfil, dar un like o moderar una sala.

## Requisitos

- Node.js 22 o superior.
- npm 10 o superior.
- Una cuenta propia de [Supabase](https://supabase.com/).
- Supabase CLI (`npx supabase ...` funciona sin instalación global).
- Docker Desktop únicamente si querés ejecutar Supabase local.
- Una cuenta propia de Vercel para producción.

## 1. Instalación

```powershell
npm install
Copy-Item .env.example .env.local
```

Completá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_O_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

`NEXT_PUBLIC_*` llega al navegador. `SUPABASE_SERVICE_ROLE_KEY` nunca debe tener ese prefijo ni importarse en un Client Component. En Truly solo se usa en el seed, el simulador de desarrollo y la eliminación completa de una cuenta Auth.

## 2. Crear y preparar un Supabase nuevo

Creá un proyecto vacío desde tu propia cuenta. En Project Settings → API copiá la Project URL, la anon/publishable key y la service role key.

Vinculá este repositorio y aplicá las migrations:

```powershell
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

`db push` aplica, en orden, todo lo que existe en `supabase/migrations/`: tablas, enums, lookup data, índices, foreign keys, constraints, triggers, funciones, RPCs, RLS, policies, bucket privado `avatars` y publicaciones Realtime. No crees tablas manualmente desde el Dashboard.

La referencia oficial del flujo está en [Supabase CLI workflows](https://supabase.com/docs/guides/local-development/cli-workflows).

## 3. Configurar Supabase Auth

En Authentication → Providers / Sign In:

1. Habilitá Email.
2. Elegí si querés exigir confirmación de email. Truly soporta tanto confirmación obligatoria como alta inmediata.
3. Mantené **Allow anonymous sign-ins** deshabilitado: los asistentes usan email y contraseña.
4. En URL Configuration establecé `http://localhost:3000` como Site URL durante desarrollo.
5. Agregá `http://localhost:3000/auth/callback` a Redirect URLs.

El flujo de asistentes es QR/link → registro o inicio de sesión → confirmación de email cuando esté habilitada → onboarding social → sala. El email permanece en Supabase Auth y no se expone al organizador ni a otros asistentes mediante las tablas públicas.

### Google OAuth

1. En Google Auth Platform creá un OAuth Client ID de tipo Web.
2. Agregá `http://localhost:3000` como Authorized JavaScript origin.
3. Agregá como Authorized redirect URI la callback exacta que muestra Supabase, normalmente `https://TU_PROJECT_REF.supabase.co/auth/v1/callback`.
4. Copiá Client ID y Client Secret en Authentication → Providers → Google dentro de tu proyecto Supabase.
5. Conservá `/auth/callback` en la allow list de redirects de Supabase.

Para producción agregá también tu dominio HTTPS. La guía vigente está en [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 4. Levantar la aplicación

```powershell
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El recorrido principal es:

1. `/signup`: crear un organizador.
2. `/dashboard/organization`: crear la organización.
3. `/dashboard/venues`: crear un lugar.
4. `/dashboard/rooms/new`: crear la sala.
5. `/dashboard/rooms/[id]`: revisar el estado, copiar link y descargar o imprimir QR.
6. `/r/[slug]`: registrarse o iniciar sesión y entrar como asistente.

Las salas nuevas quedan `scheduled`: pasan automáticamente a `live` al llegar `start_at` y a `ended` al llegar `end_at`. El dashboard y la bienvenida del QR actualizan el estado cada 15 segundos mientras están visibles. Las funciones SQL siempre validan la ventana temporal, por lo que al finalizar se corta discovery, presencia y nuevos likes aunque nadie tenga el dashboard abierto. La migration `202608260006_automatic_room_lifecycle.sql` contiene estas reglas y debe aplicarse con `npx supabase db push` en proyectos ya creados.

### Probar el QR desde un celular en desarrollo

`http://localhost:3000` sólo apunta al dispositivo que abre el link. Para escanear desde otro teléfono conectado a la misma red Wi-Fi:

1. Iniciá Next.js y usá la dirección **Network** que muestra la terminal, por ejemplo `http://192.168.1.50:3000`.
2. Definí esa dirección en `NEXT_PUBLIC_SITE_URL` y reiniciá Next.js, o reemplazá el link directamente debajo del QR en el dashboard.
3. Agregá también `http://192.168.1.50:3000/auth/callback` a Redirect URLs de Supabase para que la confirmación de email vuelva a Truly.
4. Verificá que el firewall permita conexiones entrantes a Node.js en la red privada.

En producción configurá siempre `NEXT_PUBLIC_SITE_URL` con el dominio HTTPS público. El dashboard muestra una advertencia visible si intenta generar un QR con `localhost`.

## 5. Desarrollo local completo con Supabase CLI

Con Docker activo:

```powershell
npx supabase start
npx supabase db reset
```

Usá los valores que imprime `supabase start` en `.env.local` y reiniciá Next.js. `db reset` reconstruye la base desde cero; es destructivo únicamente para la base local.

Para generar tipos desde la base vinculada:

```powershell
npm run types:supabase
```

El proyecto incluye `src/types/database.ts`, mantenido junto al schema para poder compilar antes de que exista un project ref. El archivo generado sirve para auditar drift después de cada migration.

## 6. Datos demo y simulador

Nunca ejecutes el seed contra producción. En un proyecto local o de staging vacío:

```powershell
npm run seed
```

Crea:

- organización `Truly Demo`;
- venue `Club Demo`;
- sala live `Friday Night` con slug `friday-night-demo`;
- owner `owner.demo@truly.local`;
- 10 perfiles con `is_demo = true`, intereses y presencia.

Credencial de desarrollo: `owner.demo@truly.local` / `TrulyDemo123!`.

Con `NODE_ENV=development` también existe `/dev/room/[roomId]`. Usa la service role solo en el servidor y permite generar asistentes Auth, likes y alternar presencia. La ruta devuelve 404 en un build de producción.

## Modelo y reglas de seguridad

Tablas principales:

- `profiles`, `profile_intents`, `interests`, `profile_interests`.
- `organizations`, `organization_members`, `venues`, `rooms`.
- `room_presence`, separada del perfil global.
- `likes`, `notifications`.
- `blocks`, `reports`, `report_reasons`.

Invariantes importantes:

- `room_id + from_user_id + to_user_id` es único en likes y no acepta self-like.
- Un trigger crea una notificación de like para la persona destinataria.
- El esquema conserva la tabla histórica `matches` para una posible evolución futura, pero el MVP actual no crea ni expone matches.
- Discovery exige misma sala, presencia efectiva menor a 90 segundos, sala activa, perfil completo y ausencia de bloqueo en ambos sentidos.
- La tabla `rooms` y su `access_code` solo son legibles por miembros de la organización; el QR público usa una RPC que devuelve columnas seguras.
- Los avatares son privados. La ruta es `{auth.uid()}/{uuid}.webp`; una signed URL solo puede crearse para el owner, una persona que comparte sala activa o un moderador que revisa un reporte.
- Analytics requiere membresía en la organización y devuelve agregados, nunca email, UUID de asistentes ni bios.
- El organizador solo ve reportes de sus salas.
- La service role no existe en el bundle del navegador.

Los perfiles demo no se confunden con producción porque se marcan explícitamente en `profiles.is_demo`.

## Realtime y presencia

`useRoomRealtime(roomId)` mantiene una sola capa reutilizable para cambios relevantes en presencia, likes y notificaciones. No se replica toda la base por Realtime.

`useRoomPresence(roomId)` envía heartbeat cada 30 segundos mientras la pestaña es visible. Se considera online a quien tenga `last_seen_at` dentro de 90 segundos. Cerrar o abandonar el navegador no requiere un evento confiable: la presencia expira sola. Salir manualmente llama `leave_room`.

## Calidad

```powershell
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
```

Los tests cubren ventana de sala activa, filtro bidireccional por bloqueo y un contrato estático que exige RLS/constraints/Storage privado en la migration.

Después de `npm run seed`, y únicamente contra local/staging, `npm run smoke` prueba con cuentas reales de email, perfil, entrada, discovery, likes, notificaciones y bloqueo.

## Deploy en Vercel

1. Creá un repositorio nuevo en tu propia cuenta de GitHub/GitLab/Bitbucket.
2. Hacé commit de este proyecto y subilo al repositorio nuevo.
3. En Vercel elegí Add New → Project e importá ese repositorio.
4. Framework Preset: Next.js. No hace falta cambiar Build Command ni Output Directory.
5. Configurá las cuatro variables de `.env.example` para Production (y Preview si corresponde).
6. Cambiá `NEXT_PUBLIC_SITE_URL` por `https://tu-dominio.com`.
7. Desplegá.
8. En Supabase Auth cambiá Site URL al dominio final y agregá `https://tu-dominio.com/auth/callback` a Redirect URLs.
9. Agregá el dominio final como origin en Google OAuth. La redirect URI de Google continúa siendo la callback `/auth/v1/callback` de tu propio Supabase.

Vercel permite configurar variables al importar el repositorio, según [Deploying Git Repositories](https://vercel.com/docs/git). No pegues secretos en el repositorio ni en un Deploy Button URL.

## Checklist de producción

- [ ] Proyecto Supabase creado en tu cuenta y migrations aplicadas.
- [ ] Email/password habilitado y Anonymous Sign-ins deshabilitado.
- [ ] Site URL y redirects limitados a tus dominios.
- [ ] Google OAuth usa credenciales creadas por vos.
- [ ] Variables configuradas en Vercel; ningún `.env.local` versionado.
- [ ] Service role presente solo si necesitás seed/dev tools o eliminación completa de cuenta.
- [ ] Seed demo no ejecutado en producción.
- [ ] Textos de `/privacy` y `/terms` reemplazados tras revisión legal local.
- [ ] Requisitos de edad, retención y procedimiento de moderación definidos.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` pasan.

## Límites conscientes del MVP

- Los roles owner/admin/staff y sus policies existen; la invitación de nuevos miembros todavía no tiene flujo de email.
- Analytics usa intervalos de presencia para estimar concurrencia máxima. Si en el futuro necesitás sesiones múltiples por persona, se puede separar un historial de sesiones sin cambiar el perfil global.
- No hay chat: no forma parte del alcance inicial.
- Privacidad y términos son placeholders visibles y deben recibir revisión legal antes de publicar.

## Independencia

No hay hostname, project ref, bucket externo, credencial OAuth, service key, ID de usuario ni endpoint heredado en el código. `.env.example` contiene sólo placeholders, el bucket `avatars` se crea por migration y todos los links sociales se generan desde `NEXT_PUBLIC_SITE_URL`. Si cualquier infraestructura anterior desaparece, este repositorio sigue siendo reconstruible sobre un Supabase nuevo.
