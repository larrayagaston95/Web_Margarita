import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

/**
 * Sección Newsletter para Suscripción y Ofertas
 */
export const SeccionNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSuscrito(true);
      setTimeout(() => {
        setSuscrito(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <section className="bg-[#735a3e] text-white py-12 px-4 md:px-12">
      <div className="max-w-[1440px] mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#D9B99B]">
          <Mail size={24} />
        </div>

        <h2 className="font-display font-bold text-2xl md:text-3xl">
          Sumate al Club Margarita
        </h2>

        <p className="text-xs md:text-sm text-[#eee7e2] max-w-md mx-auto">
          Recibí un 10% OFF en tu primera compra, acceso anticipado a los lanzamientos de temporada y consejos sobre el cuidado de prendas infantiles.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
          <input
            type="email"
            required
            placeholder="Ingresá tu correo electrónico..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-[#D9B99B]"
          />
          <button
            type="submit"
            className="bg-[#D9B99B] text-[#503a21] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shrink-0"
          >
            {suscrito ? <Check size={18} className="mx-auto" /> : 'Suscribirme'}
          </button>
        </form>

        {suscrito && (
          <p className="text-xs text-[#cfeaca] font-semibold animate-fade-in">
            ¡Gracias por suscribirte! Te enviamos tu cupón de descuento por correo.
          </p>
        )}
      </div>
    </section>
  );
};
