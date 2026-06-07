# Vértice Seguridad Industrial (Demo Angular Front-end Only)

## Requisitos
- Node.js 20+
- npm 10+

## Ejecutar
```bash
npm install
npm run start
```

## Build
```bash
npm run build
```

## Acceso
- Sin login: al abrir la app se entra directamente al dashboard con el perfil **GERENCIA** (acceso completo).
- Desde el menú de usuario (esquina superior derecha) se puede alternar entre **GERENCIA** y **OPERADOR** al instante.

## Notas
- Persistencia en sesión: memoria + `sessionStorage`.
- Botón `Reset demo` en el topbar restaura todos los seeds.
- Exportaciones PDF/Excel son simuladas con feedback UX.
- POD de despacho requiere firma + foto guía + nombre para pasar a `Entregado`.
