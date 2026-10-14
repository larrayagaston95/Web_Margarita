import React from 'react';
import { NotificacionCliente } from '../types';
import { X, Bell, ShoppingBag, Truck, Check, Sparkles } from 'lucide-react';

interface ModalNotificacionesClienteProps {
  abierto: boolean;
  alCerrar: () => void;
  notificaciones: NotificacionCliente[];
  alMarcarComoLeida: (idNotificacion: string) => void;
}

/**
 * Modal del Sistema de Notificaciones de Clientes
 * Muestra alertas e información en tiempo real tras realizar compras
 */
export const ModalNotificacionesCliente: React.FC<ModalNotificacionesClienteProps> = ({
  abierto,
  alCerrar,
  notificaciones,
  alMarcarComoLeida
}) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#fff8f4] text-[#1e1b19] w-full max-w-lg rounded-3xl cloud-shadow p-6 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eee7e2]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#E5989B]/20 flex items-center justify-center text-[#E5989B]">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#1e1b19]">
                Notificaciones de Compras
              </h3>
              <p className="text-[11px] text-[#80756b]">
                Historial de alertas y estado de tus pedidos
              </p>
            </div>
          </div>

          <button
            onClick={alCerrar}
            className="p-1 text-[#80756b] hover:text-[#1e1b19] rounded-full hover:bg-[#eee7e2]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notificaciones.length === 0 ? (
            <div className="text-center py-10 text-[#80756b]">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No tienes notificaciones recientes.</p>
              <p className="text-[11px] mt-1">Realiza un pedido para recibir actualizaciones automáticas.</p>
            </div>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                onClick={() => alMarcarComoLeida(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.leida
                    ? 'bg-[#faf2ee]/60 border-[#eee7e2] text-[#4e453d]'
                    : 'bg-white border-[#c4a484] shadow-sm text-[#1e1b19]'
                }`}
              >
                {!notif.leida && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#E5989B] rounded-full animate-ping" />
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#f4ece8] text-[#735a3e] shrink-0 mt-0.5">
                    {notif.tipo === 'compra' ? (
                      <ShoppingBag size={18} />
                    ) : notif.tipo === 'envio' ? (
                      <Truck size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center pr-4">
                      <h4 className="font-display font-bold text-xs text-[#1e1b19]">
                        {notif.titulo}
                      </h4>
                      <span className="text-[10px] text-[#80756b]">
                        {new Date(notif.fecha).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[#4e453d] mt-1 leading-relaxed">
                      {notif.mensaje}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#735a3e]">
                        Pedido #{notif.pedidoNumero}
                      </span>
                      {notif.leida && (
                        <span className="text-[#6B7D68] flex items-center gap-1 font-semibold">
                          <Check size={12} /> Leída
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#eee7e2] text-center">
          <button
            onClick={alCerrar}
            className="w-full bg-[#f4ece8] text-[#735a3e] py-2.5 rounded-full font-semibold text-xs hover:bg-[#e8e1dd]"
          >
            Cerrar Notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};
