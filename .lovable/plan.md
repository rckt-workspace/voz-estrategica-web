## Objetivo
Redirigir cualquier pagina no encontrada (404) automaticamente a la landing de la masterclass (`/masterclass-de-clientes-a-fans`), tanto en navegacion SPA como en acceso directo (SSR).

## Implementacion

### `src/routes/__root.tsx`
- Reemplazar el `NotFoundComponent` actual (que muestra el mensaje de "Pagina no encontrada") por un componente que redirija automaticamente a `/masterclass-de-clientes-a-fans`.
- Usar `useNavigate` de `@tanstack/react-router` dentro de un `useEffect` para realizar la redireccion.
- Mantener la estructura del return para que no haya parpadeo visible (puede mostrarse un minimo loader o nada mientras redirige).

## Criterios de aceptacion
- Cualquier URL inexistente (ej: `/pagina-que-no-existe`) redirige inmediatamente a `/masterclass-de-clientes-a-fans`.
- No se muestra la pantalla de error 404 actual.
- Funciona tanto al navegar dentro del SPA como al acceder directamente a una URL invalida.