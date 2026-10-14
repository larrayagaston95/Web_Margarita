import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LogoMargarita } from './LogoMargarita';

interface SeccionHeroProps {
  alVerCatalogo: () => void;
  alVerHistoria: () => void;
}

/**
 * Banner Principal Estilo Referencia Margarita Indumentaria
 * Imagen cálida, tipografía artesanal, botones de acción rápida.
 */
export const SeccionHero: React.FC<SeccionHeroProps> = ({ alVerCatalogo, alVerHistoria }) => {
  return (
    <section className="relative w-full h-[520px] md:h-[680px] overflow-hidden bg-[#faf2ee]">
      {/* Fotografía de Fondo */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3EJfMHb-zJi7u8purNIKqiM43xBpH4IzGySMCMQrmOLAGGDrZ3Mb1N7iBkOU8spliR13bI1jMlV5QZwevTnZEFuOdRFlF68aMcIs8nZtGAyJRJURLDmi_OuBE2xAd0_c_GURSEkdkC470F7D0irVPG8z7l4rkt8vHURtMnzaAi1w1s6Pl5itr9ttMcldzZstXdv8rQPISiY5CtYyYU9dATvR3H779Zj8CCPpyCp2MOTDLaujNOfIY"
          alt="Bebé descansando en prenda de punto suave artesanal"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Degradado para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6]/80 via-[#FAF9F6]/40 to-transparent md:w-3/4" />
      </div>

      {/* Contenido flotante */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full flex items-center px-6 md:px-16">
        <div className="max-w-xl space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#e5d8cc] text-[#503a21] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider shadow-sm">
            <LogoMargarita tamanoIcono={22} soloIcono={true} />
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#735a3e]">
              Colección Oficial Margarita
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1e1b19] font-bold leading-tight">
            Suavidad en <br />
            <span className="text-[#735a3e] italic font-normal">cada puntada</span>
          </h1>

          <p className="text-[#4e453d] text-base md:text-lg leading-relaxed max-w-md">
            Prendas pensadas para acompañar el crecimiento de tus pequeños con la mayor comodidad y estilo. Telas nobles y diseños artesanales.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={alVerCatalogo}
              className="bg-[#735a3e] text-white px-7 py-3.5 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider hover:bg-[#5a4229] transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              Ver Catálogo
              <ArrowRight size={16} />
            </button>

            <button
              onClick={alVerHistoria}
              className="border-2 border-[#735a3e] text-[#735a3e] px-7 py-3.5 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider hover:bg-[#735a3e]/10 transition-all active:scale-95"
            >
              Nuestra Historia
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
