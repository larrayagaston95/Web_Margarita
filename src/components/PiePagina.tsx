import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { CategoriaProducto } from '../types';
import { LogoMargarita } from './LogoMargarita';
import { CONFIG_TIENDA, urlWhatsApp } from '../config';
import { CATEGORIAS } from '../data/menu';

interface PiePaginaProps {
  alSeleccionarCategoria: (cat: CategoriaProducto | 'Home') => void;
}

/**
 * Pie de Página de la Tienda
 */
export const PiePagina: React.FC<PiePaginaProps> = ({ alSeleccionarCategoria }) => {
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
            {CONFIG_TIENDA.instagramUrl && (
              <a href={CONFIG_TIENDA.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-[#3a3430] flex items-center justify-center hover:bg-[#735a3e] transition-colors">
                <Instagram size={16} />
              </a>
            )}
            {CONFIG_TIENDA.facebookUrl && (
              <a href={CONFIG_TIENDA.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-[#3a3430] flex items-center justify-center hover:bg-[#735a3e] transition-colors">
                <Facebook size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-2">
          <h4 className="font-display font-bold text-sm text-white">Catálogo</h4>
          <ul className="space-y-1.5 text-xs text-[#b1a89c]">
            {CATEGORIAS.map(cat => (
              <li key={cat}>
                <button onClick={() => alSeleccionarCategoria(cat)} className="hover:text-white transition-colors">
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Ayuda y Cliente */}
        <div className="space-y-2">
          <h4 className="font-display font-bold text-sm text-white">Atención al Cliente</h4>
          <ul className="space-y-1.5 text-xs text-[#b1a89c]">
            {/* Por ahora estas consultas van por WhatsApp; más adelante pueden ser páginas propias */}
            <li>
              <a href={urlWhatsApp('¡Hola! Quisiera consultar por el estado de mi pedido.')} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Consultar por mi pedido
              </a>
            </li>
            <li>
              <a href={urlWhatsApp('¡Hola! Quisiera consultar por la guía de talles.')} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Guía de talles
              </a>
            </li>
            <li>
              <a href={urlWhatsApp('¡Hola! Quisiera consultar por cambios y devoluciones.')} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Cambios y devoluciones
              </a>
            </li>
          </ul>
        </div>

        {/* Contacto Local */}
        <div className="space-y-2 text-xs text-[#b1a89c]">
          <h4 className="font-display font-bold text-sm text-white">Local & Showroom</h4>
          <p className="flex items-center gap-2">
            <MapPin size={16} className="text-[#D9B99B] shrink-0" />
            {CONFIG_TIENDA.direccion}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} className="text-[#D9B99B] shrink-0" />
            {CONFIG_TIENDA.telefonoVisible}
          </p>
          {CONFIG_TIENDA.email && (
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-[#D9B99B] shrink-0" />
              {CONFIG_TIENDA.email}
            </p>
          )}
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
