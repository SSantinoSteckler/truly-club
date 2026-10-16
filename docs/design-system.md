# Truly — sistema visual

## Filosofía

Truly reúne dos productos con un mismo ADN visual: fondo nocturno, superficies táctiles, fotografía, tipografía clara y violeta como acción. La experiencia social es inmersiva y personal; Truly Business usa el mismo sistema con mayor densidad de información.

## Tipografía

- **Display — Bricolage Grotesque:** marca, títulos, nombres de personas y números protagonistas.
- **UI — Instrument Sans:** navegación, interacción, formularios, tablas y texto de lectura.
- La escala incluye `display`, `hero`, `headline`, `title`, `body`, `caption` y `micro`.
- Los números que cambian o se comparan usan cifras tabulares.

## Color

- `night #070707`: base compartida por Truly y Truly Business.
- `social-panel #151515`: agrupación táctil de bajo contraste.
- `brand-violet #7938ed`: likes, CTA, foco y acciones principales.
- `brand-violet-strong #8d55f4`: hover y respuesta activa.
- El rojo queda reservado para errores y acciones destructivas; el verde, para presencia en vivo o confirmaciones.
- No se usan gradientes cromáticos decorativos. El degradado oscuro sobre fotografías sólo existe para asegurar legibilidad.

## Espaciado y composición

- Escala compartida: `6 / 12 / 18 / 28 / 44 / 72 / 112`.
- Espacios pequeños unen datos relacionados; espacios grandes separan ideas.
- Truly usa un canvas de hasta `480px`, controles al alcance del pulgar y respeto por safe areas.
- Business usa la misma lógica de paneles y controles, adaptada a grillas más amplias.
- Business prioriza densidad útil: listas agrupadas con divisores antes que una card por registro, KPIs de altura contenida y títulos que no compiten con los datos.

## Radios y bordes

- En Truly los retratos protagonistas usan `28px`, paneles `24px`, campos `14px` y controles circulares `999px`.
- En Business predominan `0–10px`, líneas y superficies abiertas.
- Los radios altos están reservados a elementos móviles y táctiles; no son el default de la marca completa.

## Truly — producto social

- Negro, blanco y violeta; interfaz de baja densidad y fotografía dominante.
- Header compacto con wordmark y estado de sala.
- Navegación inferior persistente de cuatro iconos: descubrir, likes, avisos y perfil. El label sigue disponible para lectores de pantalla.
- Discovery presenta una persona por viewport: retrato grande, nombre/edad, bio breve e intereses superpuestos.
- El like es un control violeta circular con respuesta de escala, confirmación visual y vibración cuando el navegador la admite.
- Onboarding secuencial con progreso segmentado, una decisión principal por paso y CTA fijo cerca del pulgar.
- Likes se muestran como una grilla fotográfica; actividad y ajustes usan listas móviles compactas.
- Los iconos son mínimos y funcionales. No aparecen como decoración.

## Truly Business

- Oscuro, preciso y operativo; debe sentirse parte de la misma app.
- Sidebar con iconos mínimos en desktop y tab bar inferior en mobile.
- Coral para acciones principales y blanco para métricas protagonistas.
- KPIs con jerarquías distintas: un dato domina y los secundarios viven en paneles compactos.
- Listas, tablas y formularios usan superficies `#151515`, bordes de bajo contraste y radios táctiles.

## Landing

- Comparte el fondo `night`, violeta, tipografía, marca y controles de los productos.
- El hero presenta la propuesta y una vista realista de discovery sin superar deliberadamente la escala de la interfaz.
- Las explicaciones usan filas, divisores y espacio negativo; las cards quedan reservadas a previews concretas del producto.
- La landing no introduce una tercera identidad visual: funciona como la puerta pública al mismo sistema.

## Motion

- `160ms`: feedback táctil y hover.
- `280ms`: cambios de estado.
- `420ms`: entrada de pantalla.
- Dar like usa un pulso breve; cambiar de perfil anima la fotografía una sola vez.
- Siempre se respeta `prefers-reduced-motion`.

## Regla de mantenimiento

Antes de agregar un patrón, verificar que conserve el lenguaje nocturno compartido. Social prioriza fotografía y una acción por pantalla; Business puede aumentar la densidad, pero no debe volver al lenguaje de dashboard claro, navegación numerada o controles editoriales lineales.
