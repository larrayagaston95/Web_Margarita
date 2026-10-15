import React, { useState } from 'react';
import { Producto, ColorProducto } from '../types';
import { X, Star, ShoppingBag, Truck, RefreshCw, ChevronDown, Heart, Check, AlertCircle } from 'lucide-react';

interface DetalleProductoModalProps {
  producto: Producto | null;
  alCerrar: () => void;
  alAgregarAlCarrito: (producto: Producto, talle: string, color: ColorProducto, cantidad: number) => void;
  productosRelacionados: Producto[];
  alSeleccionarProductoRelacionado: (producto: Producto) => void;
}

/**
 * Modal Vista de Detalle de Producto
 * Replica fielmente el diseño de la pantalla de detalle de producto en la maqueta
 */
export const DetalleProductoModal: React.FC<DetalleProductoModalProps> = ({
  producto,
  alCerrar,
  alAgregarAlCarrito,
  productosRelacionados,
  alSeleccionarProductoRelacionado
}) => {
  const [talleSeleccionado, setTalleSeleccionado] = useState<string>(
    producto?.talles[0] || 'Unico'
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<ColorProducto>(
    producto?.colores[0] || { nombre: 'Crudo', hex: '#FAF9F6' }
  );
  const [cantidad, setCantidad] = useState<number>(1);
  const [imagenActiva, setImagenActiva] = useState<string>(
    producto?.imagenPrincipal || ''
  );
  const [detallesAbiertos, setDetallesAbiertos] = useState(true);
  const [cuidadosAbiertos, setCuidadosAbiertos] = useState(false);
  const [agregadoConfirmado, setAgregadoConfirmado] = useState(false);
  const [guiaTallesAbierta, setGuiaTallesAbierta] = useState(false);

  const handleAgregar = () => {
    if (!producto) return;
    alAgregarAlCarrito(producto, talleSeleccionado, colorSeleccionado, cantidad);
    setAgregadoConfirmado(true);
    setTimeout(() => setAgregadoConfirmado(false), 2500);
  };

  // Los hooks van siempre antes de cualquier return (reglas de hooks de React)
  if (!producto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#fff8f4] text-[#1e1b19] w-full max-w-4xl rounded-3xl cloud-shadow overflow-hidden relative my-auto max-h-[92vh] flex flex-col">
        {/* Botón de cierre */}
        <button
          onClick={alCerrar}
          className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full hover:bg-[#735a3e] hover:text-white transition-colors shadow-sm"
          title="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8">
          {/* Contenido Superior: Galería (Izq) + Info (Der) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Galería de Imágenes (7 columnas en md) */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#faf2ee] border border-[#eee7e2] group">
                <img
                  src={imagenActiva}
                  alt={producto.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-sm hover:text-[#E5989B] transition-colors"
                  title="Guardar en favoritos"
                >
                  <Heart size={18} />
                </button>
              </div>

              {/* Miniaturas de imágenes */}
              {producto.imagenesSecundarias.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  <button
                    onClick={() => setImagenActiva(producto.imagenPrincipal)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                      imagenActiva === producto.imagenPrincipal
                        ? 'border-[#735a3e] ring-2 ring-[#735a3e]/20'
                        : 'border-[#d2c4b9]'
                    }`}
                  >
                    <img
                      src={producto.imagenPrincipal}
                      alt="Vista Principal"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {producto.imagenesSecundarias.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImagenActiva(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                        imagenActiva === img
                          ? 'border-[#735a3e] ring-2 ring-[#735a3e]/20'
                          : 'border-[#d2c4b9]'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del Producto (5 columnas en md) */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              <div>
                <span className="text-[#6B7D68] text-xs font-bold tracking-widest uppercase block mb-1">
                  {producto.categoria}
                </span>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-[#1e1b19]">
                  {producto.nombre}
                </h1>

                {/* Calificación y reseñas */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-[#B08D57]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(producto.calificacion || 5) ? '#B08D57' : 'none'}
                        className="text-[#B08D57]"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#80756b] font-medium">
                    ({producto.resenasCount || 12} reseñas verificadas)
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="py-2 border-y border-[#eee7e2]">
                <p className="font-display font-bold text-2xl md:text-3xl text-[#735a3e]">
                  ${producto.precio.toLocaleString('es-AR')}
                </p>
                <p className="text-[11px] text-[#6B7D68] font-semibold mt-0.5">
                  3 cuotas sin interés de ${(Math.round(producto.precio / 3)).toLocaleString('es-AR')}
                </p>
              </div>

              {/* Indicador de Stock en Tiempo Real */}
              <div className="flex items-center gap-2">
                {producto.stock > producto.stockMinimo ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#536a51] font-semibold bg-[#cfeaca]/40 px-3 py-1 rounded-full">
                    <Check size={14} /> Stock disponible en tienda ({producto.stock} un.)
                  </span>
                ) : producto.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#B08D57] font-bold bg-[#ffddbb]/40 px-3 py-1 rounded-full animate-pulse">
                    <AlertCircle size={14} /> ¡Atención! Solo quedan {producto.stock} unidades en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#ba1a1a] font-bold bg-[#ffdad6] px-3 py-1 rounded-full">
                    Agotado temporalmente
                  </span>
                )}
              </div>

              {/* Selector de Talles */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#1e1b19]">Seleccionar Talle:</label>
                  <button
                    onClick={() => setGuiaTallesAbierta(!guiaTallesAbierta)}
                    className="text-[#735a3e] underline font-semibold hover:text-[#503a21]"
                  >
                    Guía de talles
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {producto.talles.map((talle) => (
                    <button
                      key={talle}
                      onClick={() => setTalleSeleccionado(talle)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        talleSeleccionado === talle
                          ? 'bg-[#735a3e] text-white shadow-sm ring-2 ring-[#735a3e]/30'
                          : 'bg-[#f4ece8] text-[#4e453d] hover:bg-[#e8e1dd]'
                      }`}
                    >
                      {talle}
                    </button>
                  ))}
                </div>

                {guiaTallesAbierta && (
                  <div className="p-3 bg-[#faf2ee] rounded-xl text-xs text-[#4e453d] border border-[#d2c4b9] animate-fade-in space-y-1">
                    <p className="font-bold text-[#735a3e]">Medidas recomendadas por edad:</p>
                    <p>• 0-3m: Hasta 60 cm (3.5 a 5.5 kg)</p>
                    <p>• 3-6m: 60 - 67 cm (5.5 a 7.5 kg)</p>
                    <p>• 6-9m: 67 - 72 cm (7.5 a 9 kg)</p>
                    <p>• 9-12m: 72 - 78 cm (9 a 11 kg)</p>
                  </div>
                )}
              </div>

              {/* Selector de Colores */}
              <div className="space-y-2 pt-1">
                <label className="font-semibold text-xs text-[#1e1b19] block">
                  Color: <span className="font-normal text-[#4e453d]">{colorSeleccionado.nombre}</span>
                </label>
                <div className="flex items-center gap-2">
                  {producto.colores.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => setColorSeleccionado(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        colorSeleccionado.nombre === col.nombre
                          ? 'border-[#735a3e] scale-110 ring-2 ring-[#735a3e]/30'
                          : 'border-[#d2c4b9] hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.nombre}
                    />
                  ))}
                </div>
              </div>

              {/* Selector de Cantidad y Botón de Agregar */}
              <div className="flex items-center gap-3 pt-3">
                <div className="flex items-center bg-[#f4ece8] rounded-full px-3 py-1.5 border border-[#d2c4b9]">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-[#735a3e] hover:bg-[#e8e1dd] rounded-full"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-[#1e1b19]">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-[#735a3e] hover:bg-[#e8e1dd] rounded-full"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={producto.stock === 0}
                  onClick={handleAgregar}
                  className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    agregadoConfirmado
                      ? 'bg-[#4d644b] text-white'
                      : producto.stock === 0
                      ? 'bg-[#e0d9d4] text-[#80756b] cursor-not-allowed'
                      : 'bg-[#735a3e] text-white hover:bg-[#5a4229]'
                  }`}
                >
                  {agregadoConfirmado ? (
                    <>
                      <Check size={18} />
                      ¡Añadido al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      {producto.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </>
                  )}
                </button>
              </div>

              {/* Información de Envíos y Cambios */}
              <div className="pt-3 border-t border-[#eee7e2] space-y-2 text-xs text-[#4e453d]">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#735a3e]" />
                  <span>Envío Gratis en compras superiores a $50.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-[#735a3e]" />
                  <span>Primer cambio gratis sin cargo en nuestro local de CABA</span>
                </div>
              </div>

              {/* Acordeones de Detalles del Producto */}
              <div className="pt-2 border-t border-[#eee7e2] space-y-2">
                <div className="border-b border-[#eee7e2] pb-2">
                  <button
                    onClick={() => setDetallesAbiertos(!detallesAbiertos)}
                    className="w-full flex justify-between items-center text-xs font-bold text-[#1e1b19] py-1"
                  >
                    <span>Detalles del producto y descripción</span>
                    <ChevronDown size={16} className={`transition-transform ${detallesAbiertos ? 'rotate-180' : ''}`} />
                  </button>
                  {detallesAbiertos && (
                    <p className="text-xs text-[#4e453d] leading-relaxed pt-2">
                      {producto.descripcion}
                    </p>
                  )}
                </div>

                <div className="border-b border-[#eee7e2] pb-2">
                  <button
                    onClick={() => setCuidadosAbiertos(!cuidadosAbiertos)}
                    className="w-full flex justify-between items-center text-xs font-bold text-[#1e1b19] py-1"
                  >
                    <span>Composición y Cuidados de la prenda</span>
                    <ChevronDown size={16} className={`transition-transform ${cuidadosAbiertos ? 'rotate-180' : ''}`} />
                  </button>
                  {cuidadosAbiertos && (
                    <div className="text-xs text-[#4e453d] leading-relaxed pt-2 space-y-1">
                      <p>• <strong>Composición:</strong> {producto.composicion}</p>
                      <p>• <strong>Cuidados:</strong> {producto.cuidados}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección Inferior: Te Puede Interesar */}
          {productosRelacionados.length > 0 && (
            <div className="pt-8 border-t border-[#eee7e2]">
              <h3 className="font-display font-bold text-xl text-[#1e1b19] mb-4">
                Te puede interesar
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productosRelacionados.slice(0, 4).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => alSeleccionarProductoRelacionado(rel)}
                    className="bg-white rounded-2xl p-3 border border-[#eee7e2] cloud-shadow-hover cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#faf2ee] mb-2">
                      <img
                        src={rel.imagenPrincipal}
                        alt={rel.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-[#1e1b19] line-clamp-1 group-hover:text-[#735a3e]">
                        {rel.nombre}
                      </h4>
                      <p className="font-bold text-xs text-[#B08D57] mt-1">
                        ${rel.precio.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
