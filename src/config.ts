/**
 * Datos de contacto y reglas comerciales de Margarita Indumentaria.
 *
 * ⚠️ REEMPLAZAR por los datos reales antes de publicar la tienda.
 * Todo lo que se muestra al cliente (WhatsApp, footer, envío) sale de acá,
 * así que alcanza con cambiarlo en este único archivo.
 */
export const CONFIG_TIENDA = {
  /** Número de WhatsApp en formato internacional, solo dígitos (ej: 5491123456789). */
  whatsappNumero: '541145891234',
  /** Teléfono tal como se muestra en el footer. */
  telefonoVisible: '+54 11 4589 1234',
  email: 'hola@margaritaindumentaria.com.ar',
  direccion: 'Av. Cabildo 2450, CABA, Argentina',
  /** Dejar vacío ('') para ocultar el ícono en el footer. */
  instagramUrl: '',
  facebookUrl: '',
};

/** Reglas de envío: se usan en el carrito y se recalculan en el servidor. */
export const ENVIO = {
  gratisDesde: 50000,
  costo: 2800,
};

export function calcularCostoEnvio(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.costo;
}

export function urlWhatsApp(mensaje: string): string {
  return `https://wa.me/${CONFIG_TIENDA.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
}
