# Bizkaia · Atención Ciudadana

Maqueta web navegable de una consola unificada de atención ciudadana para una demostración funcional. Simula una capa de experiencia de usuario construida sobre Microsoft Dynamics 365; no realiza integraciones reales ni envía datos a sistemas externos.

**Demo publicada:** <https://leopoldosalceda.github.io/lantikatenci-n/>

## Arranque

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local de desarrollo. Para verificar una compilación de producción:

```bash
npm run build
```

## Arquitectura

- React + TypeScript + Vite.
- Estado local de React; sin backend, autenticación ni APIs externas.
- `src/data.ts`: fixtures de personas, trámites, servicios y casos.
- `src/App.tsx`: componentes y flujo funcional de la maqueta.
- `src/styles.css`: sistema visual institucional, optimizado para escritorio.

## Datos mock

Todos los datos son ficticios. El identificador recomendado para el recorrido guiado es `16000001A`, correspondiente a Petra Llop Arana. Hay cinco personas, diez trámites y ocho tipos de servicio de ejemplo.

## Pantallas principales

- Consola de agente presencial y telefónico.
- Identificación de persona atendida e interesada.
- Selector de trámite con búsqueda y filtros.
- Caso activo, servicios, recursos y observaciones.
- Navegación entre varios casos de una misma atención.
- Derivación y ficha secundaria Laguntzaile.
- Revisión y cierre administrativo.

El menú de usuario incluye escenarios precargados para saltar a momentos relevantes de la presentación. Consulta [DEMO.md](./DEMO.md) para un guion de 5–7 minutos.
