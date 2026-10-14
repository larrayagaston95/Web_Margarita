import React from 'react';
import { CategoriaProducto } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface BentoCategoriasProps {
  alSeleccionarCategoria: (cat: CategoriaProducto) => void;
}

/**
 * Bento Grid de Categorías Principales
 * Basado en la maqueta visual del diseño de Margarita Indumentaria
 */
export const BentoCategorias: React.FC<BentoCategoriasProps> = ({ alSeleccionarCategoria }) => {
  return (
    <section className="py-12 bg-[#faf2ee]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[#1e1b19]">
            Nuestras Categorías
          </h2>
          <p className="text-[#4e453d] text-sm max-w-md mx-auto mt-2">
            Explorá nuestras colecciones diseñadas con amor y dedicación para cada etapa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-1 md:grid-rows-2 gap-4 h-auto md:h-[580px]">
          {/* Categoría Bebé (Ocupa 2 columnas y 2 filas en Desktop) */}
          <div
            onClick={() => alSeleccionarCategoria('Bebé Otoño-Invierno')}
            className="md:col-span-2 md:row-span-2 relative min-h-[300px] rounded-3xl overflow-hidden group cursor-pointer cloud-shadow"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU9Hs5zYuXgYvpGrFjzjqQ8rSvubNVDIWvVGm5kE2JaOs58XFIFFb1uysY7emIgQfwaHElrxdW_biRByxz1gmikzUMbtKSOhLvRv5uk0-HZX8VpAYKrkzIaIoethoUoNu7sIOvm0b5f4GhYu2cw4iFqCKbcZ8SAkIiKrIlSLVXD9kfSPHf9KS623CQEVNX7jsXD-TDiZ9EsGxAMajjEE9JNm9Ud6qARxBANYWw6sxyrHyAPHeRehE0"
              alt="Línea de ropa Bebé doblada delicadamente"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:bg-black/30 transition-colors" />

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D9B99B] font-bold block mb-1">
                  Desde Recién Nacidos
                </span>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-white">
                  Línea Bebé
                </h3>
              </div>
              <button className="bg-white/90 text-[#735a3e] px-5 py-2 rounded-full font-semibold text-xs hover:bg-[#735a3e] hover:text-white transition-all flex items-center gap-1 shadow-md">
                Explorar
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Categoría Kids (2 cols, 1 fila) */}
          <div
            onClick={() => alSeleccionarCategoria('Kids')}
            className="md:col-span-2 md:row-span-1 relative min-h-[200px] rounded-3xl overflow-hidden group cursor-pointer cloud-shadow"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvyhfUEfzwF7OMuAf26KBQfZuRxHvScjAKhAbrxDpskqO4V1-wowEtnfwCc022b2C-LNzM3LtvXBocTAEY3alKlxJP73GCtfevdYMvPmVsxjbAXUilNDp1G5Xlx5Lb_6F9x5DnuEy6BocCz8dMnH_6jA7GZOxlnJrggi_92v_8i3Yp1xl0DRPRYo5j_uopjvPknrogJJn7A2SJRc9LJshVZk00quNVItRJAaaOHfoog0kd__YcadTy"
              alt="Niños jugando felices al aire libre con indumentaria Kids"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:bg-black/30 transition-colors" />

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#cfeaca] font-bold block mb-1">
                  2 a 6 Años
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Colección Kids
                </h3>
              </div>
              <button className="bg-white/90 text-[#735a3e] px-5 py-2 rounded-full font-semibold text-xs hover:bg-[#735a3e] hover:text-white transition-all flex items-center gap-1 shadow-md">
                Explorar
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Categoría Accesorios (2 cols, 1 fila) */}
          <div
            onClick={() => alSeleccionarCategoria('Accesorios')}
            className="md:col-span-2 md:row-span-1 relative min-h-[200px] rounded-3xl overflow-hidden group cursor-pointer cloud-shadow"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-NZ054oopdz5zW1eWm17xr2DN-JNmnGZaW59nM8CZ81oas8rafM_FkGT3L9qSHE2v7Ycqcqq4ah-Q6gfO737ZHjlRtSwKTn509pQOmb1zkqz9P_GIGOFbvThgv-DAd3dYoAbAliETTrrUciqaRJ44aZEvktkhPW6XlMGxJe0CKwKnn9zT5etUBHrwn0GKqQr6kJFxDMIYLczN9ke9S6aSiRaEG-OCxRQy9YbiQjEI02iaPzfuv2nS"
              alt="Accesorios para bebés, mantas, escarpines y gorritos"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:bg-black/30 transition-colors" />

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#ffddbb] font-bold block mb-1">
                  Mantas, Gorritos y Calzado
                </span>
                <h3 className="font-display font-bold text-2xl text-white">
                  Accesorios Artesanales
                </h3>
              </div>
              <button className="bg-white/90 text-[#735a3e] px-5 py-2 rounded-full font-semibold text-xs hover:bg-[#735a3e] hover:text-white transition-all flex items-center gap-1 shadow-md">
                Explorar
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
