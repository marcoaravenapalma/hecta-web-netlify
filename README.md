# Hecta

Sitio web inicial de Hecta Corretaje de Propiedades, desarrollado con Next.js.

## Ejecutar localmente

1. Instala Node.js LTS.
2. Abre esta carpeta en Visual Studio Code.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre `http://localhost:3000`.

## Subir a GitHub

Sube directamente el contenido de esta carpeta al repositorio. No subas manualmente las carpetas `node_modules` ni `.next`; están excluidas mediante `.gitignore`.

## Publicar en Netlify

1. Importa el repositorio desde Netlify.
2. Netlify detectará Next.js.
3. Build command: `npm run build`.
4. El archivo `netlify.toml` ya fija Node.js 20.

## Estado actual

Esta versión incluye:

- Diseño responsive.
- Logo oficial de Hecta.
- Hero con paisaje de campos.
- Buscador visual por operación, tipo, ubicación y precio.
- Propiedades destacadas de ejemplo.
- Sección de beneficios.
- Propuesta de corretaje Hecta.
- CTA para publicar una propiedad.

Los formularios y propiedades todavía usan datos demostrativos y deben conectarse posteriormente a una base de datos.
