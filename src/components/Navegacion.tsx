import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Menu, X, ShieldAlert, ChevronDown } from 'lucide-react';
import { CategoriaProducto } from '../types';
import { ESTRUCTURA_MENU, CategoriaMenu } from '../data/menu';
import { LogoMargarita } from './LogoMargarita';

type GeneroMenu = 'Nena' | 'Varón';

interface NavegacionProps {
  categoriaActiva: CategoriaProducto | 'Todas' | 'Home';
  generoActivo?: GeneroMenu;
  subcategoriaActiva?: string;
  alSeleccionarCategoria: (
    categoria: CategoriaProducto | 'Todas' | 'Home',
    genero?: GeneroMenu,
    subcategoria?: string
  ) => void;
  cantidadCarrito: number;
  alAbrirCarrito: () => void;
  modoAdmin: boolean;
  alSalirAdmin: () => void;
  busqueda: string;
  alCambiarBusqueda: (texto: string) => void;
}

/**
 * Navegación superior con la misma organización que margaritaindumentaria.com.ar:
 * Inicio · Bebé Otoño-Invierno · Bebé Primavera-Verano · Kids Otoño-Invierno · Kids Primavera-Verano,
 * y en cada una un desplegable con Nena / Varón y sus tipos de prenda.
 * La estructura sale de src/data/menu.ts.
 */
export const Navegacion: React.FC<NavegacionProps> = ({
  categoriaActiva,
  generoActivo,
  subcategoriaActiva,
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
  const [desplegableAbierto, setDesplegableAbierto] = useState<CategoriaProducto | null>(null);
  const [categoriaExpandidaMovil, setCategoriaExpandidaMovil] = useState<CategoriaProducto | null>(null);

  // Cerrar el desplegable con Escape
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDesplegableAbierto(null);
    };
    window.addEventListener('keydown', alPresionarTecla);
    return () => window.removeEventListener('keydown', alPresionarTecla);
  }, []);

  const seleccionar = (categoria: CategoriaProducto | 'Home', genero?: GeneroMenu, subcategoria?: string) => {
    alSeleccionarCategoria(categoria, genero, subcategoria);
    setDesplegableAbierto(null);
    setMenuMovilAbierto(false);
  };

  const claseEnlaceSub = (activo: boolean) =>
    `block w-full text-left py-1.5 text-sm transition-colors ${
      activo ? 'text-[#735a3e] font-bold' : 'text-[#4e453d] hover:text-[#735a3e]'
    }`;

  /** Contenido del desplegable (desktop): columnas Nena y Varón */
  const ContenidoDesplegable = ({ item }: { item: CategoriaMenu }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-[#eee7e2] p-5 min-w-[340px]">
      <button
        onClick={() => seleccionar(item.categoria)}
        className="text-xs font-bold uppercase tracking-widest text-[#6B7D68] hover:text-[#735a3e] mb-3"
      >
        Ver todo {item.categoria} →
      </button>
      <div className="grid grid-cols-2 gap-6">
        {item.generos.map(grupo => {
          const generoEsActivo = categoriaActiva === item.categoria && generoActivo === grupo.genero;
          return (
            <div key={grupo.genero}>
              <button
                onClick={() => seleccionar(item.categoria, grupo.genero)}
                className={`font-display font-bold text-base mb-1 ${
                  generoEsActivo && !subcategoriaActiva ? 'text-[#735a3e]' : 'text-[#1e1b19] hover:text-[#735a3e]'
                }`}
              >
                {grupo.genero}
              </button>
              <ul>
                {grupo.subcategorias.map(sub => (
                  <li key={sub}>
                    <button
                      onClick={() => seleccionar(item.categoria, grupo.genero, sub)}
                      className={claseEnlaceSub(generoEsActivo && subcategoriaActiva === sub)}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <header className="bg-[#fff8f4]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#eee7e2]">
      {/* Banner de modo admin */}
      {modoAdmin && (
        <div className="bg-[#735a3e] text-white text-xs py-1 px-4 text-center font-medium flex justify-between items-center">
          <span className="flex items-center gap-1.5 mx-auto">
            <ShieldAlert size={14} className="text-[#D9B99B]" />
            MODO ADMINISTRADOR — Panel de Inventario, Ventas y Reportes PDF.
          </span>
          <button onClick={alSalirAdmin} className="underline hover:text-[#D9B99B] text-[11px] font-semibold">
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Fila 1: menú móvil · logo · búsqueda y carrito */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuMovilAbierto}
            className="p-2 -ml-2 text-[#4e453d] lg:hidden hover:bg-[#f4ece8] rounded-full"
          >
            {menuMovilAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button onClick={() => seleccionar('Home')} className="flex items-center text-left" aria-label="Ir al inicio">
            <LogoMargarita tamanoIcono={44} />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Búsqueda */}
          {busquedaVisible ? (
            <div className="flex items-center bg-[#eee7e2] rounded-full px-3 py-1.5 text-sm text-[#1e1b19]">
              <Search size={16} className="text-[#80756b] mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar prendas..."
                value={busqueda}
                onChange={(e) => alCambiarBusqueda(e.target.value)}
                aria-label="Buscar prendas"
                className="bg-transparent border-none outline-none text-sm w-28 md:w-48 text-[#1e1b19] placeholder-[#80756b]"
                autoFocus
              />
              <button
                onClick={() => {
                  alCambiarBusqueda('');
                  setBusquedaVisible(false);
                }}
                aria-label="Cerrar búsqueda"
                className="text-[#80756b] hover:text-[#1e1b19] ml-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setBusquedaVisible(true)}
              className="p-2 text-[#4e453d] hover:text-[#735a3e] hover:bg-[#f4ece8] rounded-full transition-colors"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </button>
          )}

          {/* Carrito */}
          <button
            onClick={alAbrirCarrito}
            className="p-2 text-[#4e453d] hover:text-[#735a3e] hover:bg-[#f4ece8] rounded-full transition-colors relative"
            aria-label={`Ver carrito (${cantidadCarrito} productos)`}
          >
            <ShoppingCart size={22} />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E5989B] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cantidadCarrito}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Fila 2 (desktop): categorías con desplegables */}
      <nav className="hidden lg:block border-t border-[#eee7e2]" aria-label="Categorías">
        <ul className="max-w-[1440px] mx-auto px-12 flex items-center justify-center gap-8">
          <li>
            <button
              onClick={() => seleccionar('Home')}
              className={`py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors ${
                categoriaActiva === 'Home' ? 'text-[#735a3e] border-[#735a3e]' : 'text-[#4e453d] border-transparent hover:text-[#735a3e]'
              }`}
            >
              Inicio
            </button>
          </li>
          {ESTRUCTURA_MENU.map(item => {
            const esActiva = categoriaActiva === item.categoria;
            const abierto = desplegableAbierto === item.categoria;
            return (
              <li
                key={item.categoria}
                className="relative"
                onMouseEnter={() => setDesplegableAbierto(item.categoria)}
                onMouseLeave={() => setDesplegableAbierto(null)}
              >
                <button
                  onClick={() => seleccionar(item.categoria)}
                  onFocus={() => setDesplegableAbierto(item.categoria)}
                  aria-expanded={abierto}
                  aria-haspopup="true"
                  className={`py-3 text-sm font-semibold tracking-wide border-b-2 flex items-center gap-1 transition-colors ${
                    esActiva ? 'text-[#735a3e] border-[#735a3e]' : 'text-[#4e453d] border-transparent hover:text-[#735a3e]'
                  }`}
                >
                  {item.categoria}
                  <ChevronDown size={14} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
                </button>
                {abierto && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-50">
                    <ContenidoDesplegable item={item} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Menú móvil: acordeón Categoría → Nena / Varón → tipo de prenda */}
      {menuMovilAbierto && (
        <nav
          className="lg:hidden bg-[#fff8f4] border-t border-[#eee7e2] px-4 py-3 shadow-lg max-h-[calc(100vh-72px)] overflow-y-auto"
          aria-label="Categorías"
        >
          <button
            onClick={() => seleccionar('Home')}
            className={`block w-full text-left font-semibold text-base py-3 px-3 rounded-lg ${
              categoriaActiva === 'Home' ? 'bg-[#c4a484]/20 text-[#735a3e]' : 'text-[#1e1b19]'
            }`}
          >
            Inicio
          </button>
          {ESTRUCTURA_MENU.map(item => {
            const expandida = categoriaExpandidaMovil === item.categoria;
            return (
              <div key={item.categoria} className="border-t border-[#eee7e2]">
                <button
                  onClick={() => setCategoriaExpandidaMovil(expandida ? null : item.categoria)}
                  aria-expanded={expandida}
                  className={`w-full flex items-center justify-between font-semibold text-base py-3 px-3 ${
                    categoriaActiva === item.categoria ? 'text-[#735a3e]' : 'text-[#1e1b19]'
                  }`}
                >
                  {item.categoria}
                  <ChevronDown size={18} className={`transition-transform ${expandida ? 'rotate-180' : ''}`} />
                </button>
                {expandida && (
                  <div className="pb-3 px-3 space-y-3">
                    <button onClick={() => seleccionar(item.categoria)} className="text-sm font-semibold text-[#6B7D68] py-1">
                      Ver todo →
                    </button>
                    {item.generos.map(grupo => (
                      <div key={grupo.genero} className="pl-3 border-l-2 border-[#eee7e2]">
                        <button
                          onClick={() => seleccionar(item.categoria, grupo.genero)}
                          className="font-bold text-sm text-[#1e1b19] py-1.5"
                        >
                          {grupo.genero}
                        </button>
                        {grupo.subcategorias.map(sub => (
                          <button
                            key={sub}
                            onClick={() => seleccionar(item.categoria, grupo.genero, sub)}
                            className={`${claseEnlaceSub(
                              categoriaActiva === item.categoria && generoActivo === grupo.genero && subcategoriaActiva === sub
                            )} pl-3 py-2`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </header>
  );
};
