import React, { useState } from 'react';
import { DatosCliente } from './CarritoDrawer';
import { ItemCarrito, Pedido } from '../types';
import { X, Lock, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

interface ModalPagoPasarelaProps {
  abierto: boolean;
  alCerrar: () => void;
  items: ItemCarrito[];
  datosCliente: DatosCliente;
  alConfirmarPago: (datosModal: any) => Promise<Pedido | null>;
}

/**
 * Modal Simulación de Pasarela de Pago Segura (Visa/Mastercard/Mercado Pago)
 */
export const ModalPagoPasarela: React.FC<ModalPagoPasarelaProps> = ({
  abierto,
  alCerrar,
  items,
  datosCliente,
  alConfirmarPago
}) => {

  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState(datosCliente.nombre);
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [cuotas, setCuotas] = useState('1');
  const [procesando, setProcesando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [pedidoResultado, setPedidoResultado] = useState<Pedido | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  const costoEnvio = subtotal >= 50000 ? 0 : 2800;
  const total = subtotal + costoEnvio;

  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    // Simular latencia de pasarela bancaria
    setTimeout(async () => {
      const pedidoCreado = await alConfirmarPago({
        tarjetaUltimos4: numeroTarjeta.slice(-4) || '4242',
        cuotas,
        marca: 'Visa'
      });

      setProcesando(false);
      setCompletado(true);
      setPedidoResultado(pedidoCreado);
    }, 1800);
  };

  // Los hooks van siempre antes de cualquier return (reglas de hooks de React)
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#fff8f4] text-[#1e1b19] w-full max-w-md rounded-3xl cloud-shadow p-6 relative overflow-hidden">
        <button
          onClick={alCerrar}
          disabled={procesando}
          className="absolute top-4 right-4 text-[#80756b] hover:text-[#1e1b19] p-1 rounded-full hover:bg-[#eee7e2]"
        >
          <X size={20} />
        </button>

        {!completado ? (
          <div>
            {/* Header Pasarela */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#eee7e2]">
              <div className="w-10 h-10 rounded-full bg-[#c4a484]/20 flex items-center justify-center text-[#735a3e]">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#1e1b19]">
                  Pasarela de Pago Segura
                </h3>
                <p className="text-[11px] text-[#6B7D68] flex items-center gap-1 font-semibold">
                  <Lock size={12} /> Cifrado de 256 bits
                </p>
              </div>
            </div>

            {/* Resumen express de monto */}
            <div className="bg-[#f4ece8] p-3 rounded-xl mb-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[#80756b] block">Total a cobrar:</span>
                <span className="font-bold text-sm text-[#735a3e]">${total.toLocaleString('es-AR')}</span>
              </div>
              <span className="bg-[#cfeaca] text-[#536a51] text-[10px] font-bold px-2 py-1 rounded">
                Margarita Checkout
              </span>
            </div>

            {/* Formulario de tarjeta */}
            <form onSubmit={handleSubmitPago} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#4e453d] block mb-1">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4509 •••• •••• 8812"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4e453d] block mb-1">
                  Nombre en la Tarjeta
                </label>
                <input
                  type="text"
                  required
                  placeholder="CAMILA RODRIGUEZ"
                  value={nombreTitular}
                  onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#4e453d] block mb-1">
                    Vencimiento (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={vencimiento}
                    onChange={(e) => setVencimiento(e.target.value)}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#4e453d] block mb-1">
                    Código CVC / CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#4e453d] block mb-1">
                  Planes de Financiación
                </label>
                <select
                  value={cuotas}
                  onChange={(e) => setCuotas(e.target.value)}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                >
                  <option value="1">1 pago de ${total.toLocaleString('es-AR')} (Sin interés)</option>
                  <option value="3">3 cuotas sin interés de ${(Math.round(total / 3)).toLocaleString('es-AR')}</option>
                  <option value="6">6 cuotas fijas de ${(Math.round((total * 1.1) / 6)).toLocaleString('es-AR')}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={procesando}
                className="w-full mt-4 bg-[#735a3e] text-white py-3 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-[#5a4229] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {procesando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Confirmar Pago de ${total.toLocaleString('es-AR')}
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Pantalla de éxito de compra */
          <div className="text-center py-6 space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#cfeaca] text-[#536a51] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-display font-bold text-2xl text-[#1e1b19]">
              ¡Pago Aprobado con Éxito!
            </h3>

            <p className="text-xs text-[#4e453d] max-w-xs mx-auto">
              Muchas gracias <strong>{datosCliente.nombre}</strong>. Hemos generado el pedido{' '}
              <strong className="text-[#735a3e]">{pedidoResultado?.numeroPedido || 'MAG-104'}</strong>.
            </p>

            <div className="p-3 bg-[#faf2ee] rounded-xl text-left text-xs space-y-1 text-[#4e453d]">
              <p>• Comprobante enviado a: <strong>{datosCliente.email}</strong></p>
              <p>• Dirección de envío: <strong>{datosCliente.direccion}</strong></p>
              <p>• Notificación de estado registrada en el panel del cliente.</p>
            </div>

            <button
              onClick={alCerrar}
              className="w-full bg-[#735a3e] text-white py-3 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-[#5a4229]"
            >
              Entendido / Volver a la Tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
