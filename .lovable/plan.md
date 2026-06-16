## Objetivo

Permitir aplicar un código fijo (ej. `VOZ-50`) en la página de la masterclass que reduzca el precio de **$20 USD a $10 USD** antes de abrir el checkout de Bold.

## Cómo va a funcionar

1. En la sección de compra agrego un campo "¿Tienes un código de descuento?" con input + botón **Aplicar**.
2. Al aplicar:
   - Si el código coincide (case-insensitive, sin espacios) → muestro "Código aplicado: -50%", el precio mostrado pasa a $10 USD tachando el $20, y el botón de pago usa el monto con descuento.
   - Si no coincide → toast de error "Código no válido".
3. Al hacer clic en "Pagar", se abre Bold con el monto correcto ($20 o $10).

## Seguridad (importante)

El monto y la firma de integridad de Bold se generan **en el servidor** (`src/lib/bold.functions.ts`). El cliente no puede falsificar el precio: si manda "tengo descuento", el servidor revalida el código antes de firmar el monto de $10. Si el código es inválido, devuelve error y no se abre el checkout.

El código vive en una variable de entorno del servidor (`MASTERCLASS_DISCOUNT_CODE`) — no queda hardcoded en el bundle del navegador, así no se filtra a quien inspeccione el código fuente.

## Cambios técnicos

- **`src/lib/bold.functions.ts`**: `createBoldOrder` acepta un `discountCode?: string` opcional. Si viene y coincide con `process.env.MASTERCLASS_DISCOUNT_CODE`, calcula el monto como `amount / 2`. La firma SHA-256 se calcula sobre el monto final.
- **`src/lib/bold-checkout.ts`**: `openBoldEmbeddedCheckout` recibe `discountCode?` y lo reenvía al server function.
- **`src/routes/masterclass-de-clientes-a-fans.tsx`**:
  - Estado `discountCode` y `discountApplied`.
  - UI del input + botón Aplicar (validación contra una constante pública sólo para feedback inmediato — la validación real ocurre en el servidor).
  - El precio mostrado cambia a "~~$20~~ **$10 USD**" cuando hay descuento.
  - `startBoldCheckout` pasa el código al checkout.
- **Secreto**: agrego `MASTERCLASS_DISCOUNT_CODE` como secret. Te pido el valor (sugiero `VOZ-50`) y también si quieres que la validación visual en el cliente conozca el código (más cómodo) o no (más seguro pero el usuario sólo ve el descuento aplicado al volver del checkout).

## Pregunta antes de implementar

¿Qué código quieres usar? (sugerencia: `VOZ-50`). Lo guardo como secreto del servidor.
