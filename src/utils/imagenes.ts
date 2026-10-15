/**
 * Achica una foto en el navegador antes de subirla.
 * Las fotos del celular pesan 3-10 MB; así quedan en ~200-400 KB,
 * la tienda carga más rápido y la subida tarda menos.
 */
export async function prepararImagen(archivo: File, ladoMaximo = 1400, calidad = 0.85): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) {
    throw new Error('Formato no soportado. Usá fotos JPG, PNG o WEBP.');
  }

  const url = URL.createObjectURL(archivo);
  try {
    const imagen = await new Promise<HTMLImageElement>((resolver, rechazar) => {
      const img = new Image();
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error('No se pudo leer la imagen.'));
      img.src = url;
    });

    const escala = Math.min(1, ladoMaximo / Math.max(imagen.naturalWidth, imagen.naturalHeight));
    const ancho = Math.round(imagen.naturalWidth * escala);
    const alto = Math.round(imagen.naturalHeight * escala);

    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('El navegador no permite procesar imágenes.');

    // Fondo blanco: las partes transparentes de un PNG no quedan negras en JPG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(imagen, 0, 0, ancho, alto);

    return lienzo.toDataURL('image/jpeg', calidad);
  } finally {
    URL.revokeObjectURL(url);
  }
}
