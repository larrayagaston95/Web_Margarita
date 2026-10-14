import React from 'react';
import { Truck, CreditCard, MessageCircle } from 'lucide-react';

/**
 * Tira de Beneficios de Marca
 * Resalta envíos a todo el país, 3 cuotas sin interés y atención directa por WhatsApp.
 */
export const TiraValores: React.FC = () => {
  const valores = [
    {
      icono: <Truck className="text-[#536a51]" size={24} />,
      bgColor: 'bg-[#cfeaca]',
      titulo: 'Envíos a todo el país',
      descripcion: 'Llegamos a cada rincón de Argentina con Correo Argentino.'
    },
    {
      icono: <CreditCard className="text-[#503a21]" size={24} />,
      bgColor: 'bg-[#c4a484]/30',
      titulo: 'Formas de Pago',
      descripcion: '3 cuotas sin interés y descuentos en efectivo o transferencia.'
    },
    {
      icono: <MessageCircle className="text-[#433d34]" size={24} />,
      bgColor: 'bg-[#b1a89c]/30',
      titulo: 'Contacto Directo',
      descripcion: 'Atención personalizada inmediata por WhatsApp.'
    }
  ];

  return (
    <section className="bg-[#f4ece8] py-8 border-y border-[#eee7e2]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {valores.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl cloud-shadow hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-full ${v.bgColor} flex items-center justify-center shrink-0`}>
              {v.icono}
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-[#1e1b19]">
                {v.titulo}
              </h3>
              <p className="text-xs text-[#4e453d] mt-0.5 leading-relaxed">
                {v.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
