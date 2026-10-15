/**
 * Datos de contacto y reglas comerciales de Margarita Indumentaria.
 *
 * ⚠️ REEMPLAZAR por los datos reales antes de publicar la tienda.
 * Todo lo que se muestra al cliente (WhatsApp, footer, envío) sale de acá,
 * así que alcanza con cambiarlo en este único archivo.
 */
export const CONFIG_TIENDA = {
  // Datos tomados de margaritaindumentaria.com.ar (confirmá que sigan vigentes)
  /** Número de WhatsApp en formato internacional, solo dígitos (54 9 + característica + número). */
  whatsappNumero: '5493532404742',
  /** Teléfono tal como se muestra en el footer. */
  telefonoVisible: '+54 9 3532 404742',
  /** Dejar vacío ('') para ocultarlo. */
  email: '',
  direccion: 'Neuquén esq. Pueyrredón',
  /** Dejar vacío ('') para ocultar el ícono en el footer. */
  instagramUrl: 'https://www.instagram.com/margarita_tienda_bb/',
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

/** Precio que se cobra: el de oferta si está cargado y es menor al normal. */
export function precioFinal(producto: { precio: number; precioOferta?: number }): number {
  const oferta = Number(producto.precioOferta);
  return oferta > 0 && oferta < producto.precio ? oferta : producto.precio;
}

export function tieneOferta(producto: { precio: number; precioOferta?: number }): boolean {
  return precioFinal(producto) < producto.precio;
}
