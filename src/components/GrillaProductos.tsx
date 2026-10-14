import React, { useState } from 'react';
import { Producto, CategoriaProducto } from '../types';
import { ShoppingBag, Eye, AlertTriangle, Sparkles } from 'lucide-react';

interface GrillaProductosProps {
  productos: Producto[];
  categoriaSeleccionada: CategoriaProducto | 'Todas' | 'Home';
  alSeleccionarProducto: (producto: Producto) => void;
  alAgregarAlCarrito: (producto: Producto, talle: string, e: React.MouseEvent) => void;
}

/**
 * Componente Grilla de Productos
 * Muestra el catálogo de prendas infantiles con tarjetas, badges de stock en tiempo real,
 * selector de ordenamiento y filtrado dinámico.
 */
export const GrillaProductos: React.FC<GrillaProductosProps> = ({
  productos,
  categoriaSeleccionada,
  alSeleccionarProducto,
  alAgregarAlCarrito
}) => {
  const [criterioOrden, setCriterioOrden] = useState<'destacados' | 'precio-asc' | 'precio-desc' | 'nuevos'>('destacados');

  // Filtrado por categoría
  const productosFiltrados = productos.filter((p) => {
    if (categoriaSeleccionada === 'Home' || categoriaSeleccionada === 'Todas') return true;
    return p.categoria === categoriaSeleccionada;
  });

  // Ordenamiento
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (criterioOrden === 'precio-asc') return a.precio - b.precio;
    if (criterioOrden === 'precio-desc') return b.precio - a.precio;
    if (criterioOrden === 'nuevos') return (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0);
    return (b.esDestacado ? 1 : 0) - (a.esDestacado ? 1 : 0);
  });

  return (
    <section className="py-12 max-w-[1440px] mx-auto px-4 md:px-12">
      {/* Encabezado de Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <span className="text-[#6B7D68] text-xs font-bold tracking-widest uppercase block mb-1">
            Nuestra Colección
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-[#1e1b19]">
            {categoriaSeleccionada === 'Home' || categoriaSeleccionada === 'Todas'
              ? 'Nuevos Ingresos'
              : categoriaSeleccionada}
          </h2>
          <div className="w-20 h-1 bg-[#735a3e] rounded-full mt-2" />
        </div>

        {/* Filtros de Ordenamiento */}
        <div className="flex items-center gap-2 self-end">
          <label htmlFor="orden" className="text-xs text-[#4e453d] font-medium hidden sm:inline">
            Ordenar por:
          </label>
          <select
            id="orden"
            value={criterioOrden}
            onChange={(e) => setCriterioOrden(e.target.value as any)}
            className="bg-[#f4ece8] border border-[#d2c4b9] text-[#1e1b19] text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#735a3e]"
          >
            <option value="destacados">Destacados</option>
            <option value="nuevos">Nuevos lanzamientos</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Si no hay productos */}
      {productosOrdenados.length === 0 ? (
        <div className="text-center py-16 bg-[#faf2ee] rounded-2xl border border-dashed border-[#d2c4b9]">
          <p className="text-[#4e453d] font-medium text-base">No se encontraron productos en esta categoría.</p>
          <p className="text-[#80756b] text-xs mt-1">Intenta seleccionar otra categoría o cambiar el filtro de búsqueda.</p>
        </div>
      ) : (
        /* Grilla de productos (2 cols móvil, 3-4 cols desktop) */
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {productosOrdenados.map((producto) => (
            <div
              key={producto.id}
              onClick={() => alSeleccionarProducto(producto)}
              className="group relative bg-white rounded-2xl overflow-hidden cloud-shadow cloud-shadow-hover flex flex-col justify-between cursor-pointer border border-[#eee7e2]/60"
            >
              {/* Imagen y Badges */}
              <div className="relative aspect-square overflow-hidden bg-[#e8e1dd]">
                <img
                  src={producto.imagenPrincipal}
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Badge Nuevo / Destacado */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {producto.esNuevo && (
                    <span className="bg-[#E5989B] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      NUEVO
                    </span>
                  )}
                  {producto.stock <= producto.stockMinimo && producto.stock > 0 && (
                    <span className="bg-[#B08D57] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <AlertTriangle size={10} />
                      ¡Últimas {producto.stock}!
                    </span>
                  )}
                  {producto.stock === 0 && (
                    <span className="bg-[#ba1a1a] text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      AGOTADO
                    </span>
                  )}
                </div>

                {/* Botón rápido Ver Detalle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alSeleccionarProducto(producto);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 text-[#735a3e] p-2.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#735a3e] hover:text-white transform translate-y-2 group-hover:translate-y-0"
                  title="Ver Detalle"
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Información del Producto */}
              <div className="p-4 flex flex-col flex-grow text-center">
                <span className="text-[#80756b] font-semibold text-[11px] uppercase tracking-widest block mb-1">
                  {producto.categoria}
                </span>

                <h3 className="font-display font-semibold text-sm md:text-base text-[#1e1b19] group-hover:text-[#735a3e] transition-colors line-clamp-1">
                  {producto.nombre}
                </h3>

                <p className="font-bold text-base md:text-lg text-[#B08D57] mt-1 mb-3">
                  ${producto.precio.toLocaleString('es-AR')}
                </p>

                {/* Acceso rápido a Agregar al Carrito */}
                <button
                  disabled={producto.stock === 0}
                  onClick={(e) => alAgregarAlCarrito(producto, producto.talles[0] || 'Unico', e)}
                  className={`w-full mt-auto py-2.5 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    producto.stock === 0
                      ? 'bg-[#e0d9d4] text-[#80756b] cursor-not-allowed'
                      : 'bg-[#f4ece8] text-[#735a3e] hover:bg-[#735a3e] hover:text-white active:scale-95'
                  }`}
                >
                  <ShoppingBag size={15} />
                  {producto.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
