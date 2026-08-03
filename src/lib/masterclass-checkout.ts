/** Constantes del checkout de la grabación de la Masterclass. */

/** Precio principal de la grabación (COP). Este es el monto que se cobra en Bold. */
export const MASTERCLASS_PRICE_COP = 22500;
/** Etiqueta del precio principal para la UI. */
export const MASTERCLASS_PRICE_LABEL = "$22.500 COP";

/** Order bump: Kit de Ejecución. Se muestra en USD tal cual. */
export const KIT_PRICE_USD = 17;
/**
 * Bold procesa una sola moneda por transacción, así que el order bump se cobra
 * en COP aunque se muestre como USD 17.
 */
export const KIT_PRICE_COP = 20000;

export const PRODUCT_BASE = "Grabación Masterclass: De clientes a fans";
export const PRODUCT_WITH_KIT = "Grabación Masterclass: De clientes a fans + Kit de Ejecución";

/** Formatea un monto en pesos colombianos: 22500 → "$22.500 COP". */
export function formatCOP(value: number): string {
  return `$${value.toLocaleString("es-CO")} COP`;
}
