import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Botón Flotante de WhatsApp para Atención Directa al Cliente
 */
export const BotonFlotanteWhatsapp: React.FC = () => {
  const numeroTelefono = '541145891234';
  const mensajePredeterminado = encodeURIComponent(
    '¡Hola Margarita Indumentaria! Quisiera consultar sobre los talles y productos disponibles.'
  );

  return (
    <a
      href={`https://wa.me/${numeroTelefono}?text=${mensajePredeterminado}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 hover:bg-[#20bd5a] transition-all flex items-center gap-2 group border-2 border-white"
      title="Consultar por WhatsApp"
    >
      <MessageCircle size={26} fill="white" className="text-[#25D366]" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-1">
        Consultas por WhatsApp
      </span>
    </a>
  );
};
