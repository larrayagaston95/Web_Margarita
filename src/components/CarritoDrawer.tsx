import React, { useState } from 'react';
import { ItemCarrito } from '../types';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { calcularCostoEnvio } from '../config';

interface CarritoDrawerProps {
  abierto: boolean;
  alCerrar: () => void;
  items: ItemCarrito[];
  alActualizarCantidad: (idItem: string, delta: number) => void;
  alEliminarItem: (idItem: string) => void;
  alEnviarWhatsApp: (datosCliente: DatosCliente) => void;
  /** Error devuelto por el servidor al registrar el pedido (ej. sin stock). */
  errorPedido?: string;
}

export interface DatosCliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas?: string;
}

/**
 * Componente Carrito de Compras ("Tu Carrito")
 * Los pedidos se envían por WhatsApp para coordinar pago y envío.
 * (El pago online se agregará cuando se integre una pasarela real, ej. Mercado Pago.)
 */
export const CarritoDrawer: React.FC<CarritoDrawerProps> = ({
  abierto,
  alCerrar,
  items,
  alActualizarCantidad,
  alEliminarItem,
  alEnviarWhatsApp,
  errorPedido
}) => {

  const [modoCheckout, setModoCheckout] = useState(false);
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: 'CABA',
    notas: ''
  });
  const [errorForm, setErrorForm] = useState('');

  // Cálculos de totales
  const subtotal = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const costoEnvio = calcularCostoEnvio(subtotal);
  const total = subtotal + costoEnvio;

  const validarFormulario = (): boolean => {
    if (!datosCliente.nombre.trim() || !datosCliente.email.trim() || !datosCliente.telefono.trim() || !datosCliente.direccion.trim()) {
      setErrorForm('Por favor completa todos los campos requeridos para enviar el pedido.');
      return false;
    }
    setErrorForm('');
    return true;
  };

  const handleProcesarWhatsApp = () => {
    if (!validarFormulario()) return;
    alEnviarWhatsApp(datosCliente);
  };

  // Los hooks van siempre antes de cualquier return (reglas de hooks de React)
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-[#fff8f4] w-full max-w-xl h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
        {/* Header del Carrito */}
        <div className="p-4 md:p-6 bg-[#f4ece8] border-b border-[#eee7e2] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#735a3e]" size={24} />
            <h2 className="font-display font-bold text-xl text-[#1e1b19]">
              Tu Carrito de Compras
            </h2>
            <span className="bg-[#E5989B] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {items.reduce((sum, i) => sum + i.cantidad, 0)}
            </span>
          </div>

          <button
            onClick={alCerrar}
            aria-label="Cerrar carrito"
            className="p-2 text-[#4e453d] hover:text-[#1e1b19] hover:bg-[#e8e1dd] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Carrito */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f4ece8] flex items-center justify-center mx-auto text-[#80756b]">
                <ShoppingBag size={32} />
              </div>
              <p className="font-display font-semibold text-lg text-[#1e1b19]">Tu carrito está vacío</p>
              <p className="text-xs text-[#80756b] max-w-xs mx-auto">
                Estás a un paso de completar el look más tierno. ¡Explora nuestro catálogo!
              </p>
              <button
                onClick={alCerrar}
                className="mt-2 bg-[#735a3e] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Seguir comprando
              </button>
            </div>
          ) : !modoCheckout ? (
            /* Vista de lista de productos */
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.idItem}
                  className="bg-[#faf2ee] rounded-2xl p-4 flex gap-4 items-center cloud-shadow border border-[#eee7e2]"
                >
                  <img
                    src={item.producto.imagenPrincipal}
                    alt={item.producto.nombre}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 bg-[#e0d9d4]"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#6B7D68] tracking-wider block">
                      {item.producto.categoria}
                    </span>
                    <h3 className="font-display font-semibold text-sm text-[#1e1b19] truncate">
                      {item.producto.nombre}
                    </h3>
                    <p className="text-xs text-[#80756b] mt-0.5">
                      Talle: <strong>{item.talleSeleccionado}</strong> | Color:{' '}
                      <strong>{item.colorSeleccionado.nombre}</strong>
                    </p>
                    <p className="font-bold text-sm text-[#B08D57] mt-1">
                      ${(item.producto.precio * item.cantidad).toLocaleString('es-AR')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Control de cantidad */}
                    <div className="flex items-center bg-white rounded-full px-2 py-1 border border-[#d2c4b9]">
                      <button
                        onClick={() => alActualizarCantidad(item.idItem, -1)}
                        className="p-1 text-[#735a3e] hover:bg-[#f4ece8] rounded-full"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.cantidad}</span>
                      <button
                        onClick={() => alActualizarCantidad(item.idItem, 1)}
                        className="p-1 text-[#735a3e] hover:bg-[#f4ece8] rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => alEliminarItem(item.idItem)}
                      className="text-[#E5989B] hover:text-[#ba1a1a] p-1 flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vista de Formulario de Envío */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-[#1e1b19]">
                  Datos de Envío y Contacto
                </h3>
                <button
                  onClick={() => setModoCheckout(false)}
                  className="text-xs text-[#735a3e] underline font-semibold"
                >
                  Modificar Carrito
                </button>
              </div>

              {(errorForm || errorPedido) && (
                <div role="alert" className="p-3 bg-[#ffdad6] text-[#93000a] text-xs rounded-xl font-medium">
                  {errorForm || errorPedido}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#4e453d] block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila Rodriguez"
                    value={datosCliente.nombre}
                    onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#4e453d] block mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="camila@ejemplo.com"
                      value={datosCliente.email}
                      onChange={(e) => setDatosCliente({ ...datosCliente, email: e.target.value })}
                      className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4e453d] block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+54 11 1234 5678"
                      value={datosCliente.telefono}
                      onChange={(e) => setDatosCliente({ ...datosCliente, telefono: e.target.value })}
                      className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#4e453d] block mb-1">Dirección de Entrega *</label>
                    <input
                      type="text"
                      required
                      placeholder="Av. Cabildo 2450 4B"
                      value={datosCliente.direccion}
                      onChange={(e) => setDatosCliente({ ...datosCliente, direccion: e.target.value })}
                      className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#4e453d] block mb-1">Ciudad / Localidad</label>
                    <input
                      type="text"
                      value={datosCliente.ciudad}
                      onChange={(e) => setDatosCliente({ ...datosCliente, ciudad: e.target.value })}
                      className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4e453d] block mb-1">Notas del pedido (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones especiales para el embalaje o regalo..."
                    value={datosCliente.notas}
                    onChange={(e) => setDatosCliente({ ...datosCliente, notas: e.target.value })}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Carrito (Resumen de Compra) */}
        {items.length > 0 && (
          <div className="p-4 md:p-6 bg-[#f4ece8] border-t border-[#eee7e2] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#4e453d]">
                <span>Subtotal</span>
                <span className="font-bold text-[#1e1b19]">${subtotal.toLocaleString('es-AR')}</span>
              </div>

              <div className="flex justify-between text-[#4e453d] items-center">
                <span className="flex items-center gap-1">
                  Envío Correo Argentino:
                  {costoEnvio === 0 && (
                    <span className="bg-[#cfeaca] text-[#536a51] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                      ¡Gratis!
                    </span>
                  )}
                </span>
                <span className="font-bold text-[#1e1b19]">
                  {costoEnvio === 0 ? '$0' : `$${costoEnvio.toLocaleString('es-AR')}`}
                </span>
              </div>

              <div className="h-px bg-[#d2c4b9] my-2" />

              <div className="flex justify-between items-end">
                <span className="font-display font-bold text-base text-[#1e1b19]">Total</span>
                <div className="text-right">
                  <p className="font-display font-bold text-2xl text-[#735a3e]">
                    ${total.toLocaleString('es-AR')}
                  </p>
                  <span className="text-[10px] text-[#80756b]">IVA Incluido</span>
                </div>
              </div>
            </div>

            {/* Opciones de pago / checkout */}
            {!modoCheckout ? (
              <button
                onClick={() => setModoCheckout(true)}
                className="w-full bg-[#735a3e] text-white py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-[#5a4229] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                Continuar con el Pedido
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleProcesarWhatsApp}
                className="w-full bg-[#25D366] text-white py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <MessageCircle size={16} />
                Enviar pedido por WhatsApp
              </button>
            )}

            <p className="text-[11px] text-center text-[#80756b] flex items-center justify-center gap-1">
              Coordinamos el pago y el envío con vos por WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
