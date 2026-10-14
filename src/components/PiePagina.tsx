import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { CategoriaProducto } from '../types';
import { LogoMargarita } from './LogoMargarita';

interface PiePaginaProps {
  alSeleccionarCategoria: (cat: CategoriaProducto | 'Home') => void;
  alAbrirNotificaciones: () => void;
}

/**
 * Pie de Página de la Tienda
 */
export const PiePagina: React.FC<PiePaginaProps> = ({ alSeleccionarCategoria, alAbrirNotificaciones }) => {
  return (
    <footer className="bg-[#1e1b19] text-[#eee7e2] pt-12 pb-6 px-4 md:px-12 border-t border-[#4e453d]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#3a3430]">
        {/* Marca */}
        <div className="space-y-3">
          <LogoMargarita tamanoIcono={42} varianteTexto="blanco" />
          <p className="text-xs text-[#b1a89c] leading-relaxed">
            Ropa y accesorios para bebés y niños confeccionados artesanalmente en Argentina con materiales nobles, suaves e hipoalergénicos.
          </p>
          <div className="flex gap-3 pt-1">
            <a href="#" className="w-8 h-8 rounded-full bg-[#3a3430] flex items-center justify-center hover:bg-[#735a3e] transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#3a3430] flex items-center justify-center hover:bg-[#735a3e] transition-colors">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-2">
          <h4 className="font-display font-bold text-sm text-white">Catálogo</h4>
          <ul className="space-y-1.5 text-xs text-[#b1a89c]">
            <li>
              <button onClick={() => alSeleccionarCategoria('Bebé Otoño-Invierno')} className="hover:text-white transition-colors">
                Bebé Otoño-Invierno
              </button>
            </li>
            <li>
              <button onClick={() => alSeleccionarCategoria('Bebé Primavera-Verano')} className="hover:text-white transition-colors">
                Bebé Primavera-Verano
              </button>
            </li>
            <li>
              <button onClick={() => alSeleccionarCategoria('Kids')} className="hover:text-white transition-colors">
                Línea Kids (2-6 años)
              </button>
            </li>
            <li>
              <button onClick={() => alSeleccionarCategoria('Accesorios')} className="hover:text-white transition-colors">
                Accesorios & Mantas
              </button>
            </li>
          </ul>
        </div>

        {/* Ayuda y Cliente */}
        <div className="space-y-2">
          <h4 className="font-display font-bold text-sm text-white">Atención al Cliente</h4>
          <ul className="space-y-1.5 text-xs text-[#b1a89c]">
            <li>
              <button onClick={alAbrirNotificaciones} className="hover:text-white transition-colors">
                Seguimiento de Compras
              </button>
            </li>
            <li><a href="#" className="hover:text-white transition-colors">Guía de Talles Oficial</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Políticas de Cambios y Devoluciones</a></li>
          </ul>
        </div>

        {/* Contacto Local */}
        <div className="space-y-2 text-xs text-[#b1a89c]">
          <h4 className="font-display font-bold text-sm text-white">Local & Showroom</h4>
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D9B99B] shrink-0" />
            Av. Cabildo 2450, CABA, Argentina
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} className="text-[#D9B99B] shrink-0" />
            +54 11 4589 1234
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} className="text-[#D9B99B] shrink-0" />
            hola@margaritaindumentaria.com.ar
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#80756b] gap-2">
        <p>© {new Date().getFullYear()} Margarita Indumentaria. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          Hecho con <Heart size={12} className="text-[#E5989B] fill-[#E5989B]" /> para acompañar sus primeros pasos.
        </p>
      </div>
    </footer>
  );
};
