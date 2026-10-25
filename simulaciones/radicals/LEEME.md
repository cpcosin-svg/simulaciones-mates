# Radicals · 4t ESO (proyecto estático)

Carpeta autocontenida: no necesita servidor ni internet (todo está incluido).

## Cómo ponerlo en tu web de GitHub
1. Copia la carpeta `radicals/` en la raíz de tu repositorio (al lado de tu `index.html`).
2. Añade en tu `index.html` un enlace, por ejemplo el de `snippet-index.html`.
3. Haz commit y push. La URL será `https://<usuario>.github.io/<repo>/radicals/`.

## Contenido
- `index.html`: portada del proyecto con todos los enlaces.
- `apunts.html`, `simplificacio.html`, `extraccio.html`, `suma-resta.html`, `mcm.html`, `aniuats.html`, `racionalitzacio.html`: apuntes y simuladores (niveles 1 y 2).
- `nivell3.html`: repte sin pistas con editor de expresiones (acepta `#simplificacio`, `#extraccio`, `#suma`, `#mcm`, `#aniuats`, `#racionalitzacio`).
- `examen.html` y `examen-avancat.html`: generadores de examen con código de modelo y descarga de PDF (examen y soluciones).
- `fonts/`: Latin Modern Math (licencia GUST) para dibujar bien los índices de las raíces en cualquier móvil.
- `lib/pdf-lib.min.js` (MIT) y `pdf-math.js`: generación de PDF en el navegador.

Todas las páginas llevan la barra de navegación superior. El enlace "← Totes les simulacions" apunta a `../index.html` (tu portada); cámbialo en el `<nav class="pnav">` si tu estructura es otra.
