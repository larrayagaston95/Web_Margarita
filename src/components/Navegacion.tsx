import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { CategoriaProducto } from '../types';
import { LogoMargarita } from './LogoMargarita';

interface NavegacionProps {
  categoriaActiva: CategoriaProducto | 'Todas' | 'Home';
  alSeleccionarCategoria: (categoria: CategoriaProducto | 'Todas' | 'Home') => void;
  cantidadCarrito: number;
  alAbrirCarrito: () => void;
  modoAdmin: boolean;
  alSalirAdmin: () => void;
  busqueda: string;
  alCambiarBusqueda: (texto: string) => void;
}

/**
 * Componente de Navegación Superior
 * Soporta selección de categorías, búsqueda en tiempo real,
 * y acceso al carrito. El panel de administración se abre desde /admin (no hay botón público).
 */
export const Navegacion: React.FC<NavegacionProps> = ({
  categoriaActiva,
  alSeleccionarCategoria,
  cantidadCarrito,
  alAbrirCarrito,
  modoAdmin,
  alSalirAdmin,
  busqueda,
  alCambiarBusqueda
}) => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [busquedaVisible, setBusquedaVisible] = useState(false);

  const categoriasMenu: (CategoriaProducto | 'Home')[] = [
    'Home',
    'Bebé Otoño-Invierno',
    'Bebé Primavera-Verano',
    'Kids',
    'Accesorios'
  ];

  return (
    <header className="bg-[#fff8f4]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#eee7e2] transition-all">
      {/* Banner superior de aviso o modo admin */}
      {modoAdmin && (
        <div className="bg-[#735a3e] text-white text-xs py-1 px-4 text-center font-medium flex justify-between items-center">
          <span className="flex items-center gap-1.5 mx-auto">
            <ShieldAlert size={14} className="text-[#D9B99B]" />
            MODO ADMINISTRADOR — Panel de Inventario, Ventas y Reportes PDF.
          </span>
          <button 
            onClick={alSalirAdmin}
            className="underline hover:text-[#D9B99B] text-[11px] font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center justify-between gap-4">
        {/* Logo de la marca */}
        <button 
          onClick={() => {
            alSeleccionarCategoria('Home');
            setMenuMovilAbierto(false);
          }}
          className="flex items-center text-left group"
        >
          <LogoMargarita tamanoIcono={44} />
        </button>

        {/* Links de Categorías para Desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {categoriasMenu.map((cat) => {
            const esActivo = categoriaActiva === cat;
            return (
              <button
                key={cat}
                onClick={() => alSeleccionarCategoria(cat)}
                className={`font-semibold text-xs md:text-sm tracking-wide transition-all relative py-1 ${
                  esActivo 
                    ? 'text-[#735a3e] font-bold' 
                    : 'text-[#4e453d] hover:text-[#735a3e]'
                }`}
              >
                {cat === 'Home' ? 'Inicio' : cat}
                {esActivo && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#735a3e] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Acciones del Encabezado */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Búsqueda interactiva */}
          <div className="relative">
            {busquedaVisible ? (
              <div className="flex items-center bg-[#eee7e2] rounded-full px-3 py-1 text-xs text-[#1e1b19]">
                <Search size={16} className="text-[#80756b] mr-1" />
                <input
                  type="text"
                  placeholder="Buscar prendas..."
                  value={busqueda}
                  onChange={(e) => alCambiarBusqueda(e.target.value)}
                  aria-label="Buscar prendas"
                  className="bg-transparent border-none outline-none text-xs w-28 md:w-44 text-[#1e1b19] placeholder-[#80756b]"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    alCambiarBusqueda('');
                    setBusquedaVisible(false);
                  }}
                  className="text-[#80756b] hover:text-[#1e1b19] ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setBusquedaVisible(true)}
                className="p-2 text-[#4e453d] hover:text-[#735a3e] hover:bg-[#f4ece8] rounded-full transition-colors"
                title="Buscar productos"
                aria-label="Buscar productos"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          {/* Carrito de Compras */}
          <button
            onClick={alAbrirCarrito}
            className="p-2 text-[#4e453d] hover:text-[#735a3e] hover:bg-[#f4ece8] rounded-full transition-colors relative"
            title="Ver Carrito de Compras"
            aria-label={`Ver carrito (${cantidadCarrito} productos)`}
          >
            <ShoppingCart size={22} />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E5989B] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cantidadCarrito}
              </span>
            )}
          </button>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
            className="p-2 text-[#4e453d] lg:hidden hover:bg-[#f4ece8] rounded-full"
          >
            {menuMovilAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuMovilAbierto && (
        <div className="lg:hidden bg-[#fff8f4] border-t border-[#eee7e2] px-6 py-4 space-y-3 shadow-lg animate-fade-in">
          {categoriasMenu.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                alSeleccionarCategoria(cat);
                setMenuMovilAbierto(false);
              }}
              className={`block w-full text-left font-semibold text-sm py-2 px-3 rounded-lg ${
                categoriaActiva === cat
                  ? 'bg-[#c4a484]/20 text-[#735a3e]'
                  : 'text-[#4e453d] hover:bg-[#f4ece8]'
              }`}
            >
              {cat === 'Home' ? 'Inicio' : cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
