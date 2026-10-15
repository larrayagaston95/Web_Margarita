import React, { useState, useMemo } from 'react';
import { Producto, CategoriaProducto, SubcategoriaProducto } from '../types';
import { CATEGORIAS, TODAS_SUBCATEGORIAS, subcategoriasPara } from '../data/menu';
import { 
  DollarSign, Percent, ArrowUpRight, ArrowDownRight, RefreshCw, 
  Check, AlertCircle, Layers, Filter, Eye, X, HelpCircle
} from 'lucide-react';

interface ModalCambioMasivoPreciosProps {
  abierto: boolean;
  alCerrar: () => void;
  productos: Producto[];
  alConfirmarActualizacionMasiva: (
    datos: {
      categoria: CategoriaProducto | 'Todas';
      subcategoria: SubcategoriaProducto | 'Todas';
      tipoOperacion: 'aumento_porcentaje' | 'descuento_porcentaje' | 'aumento_monto' | 'descuento_monto' | 'fijar_precio';
      valor: number;
      redondeo: 'ninguno' | '100' | '500' | '1000';
    }
  ) => Promise<boolean>;
}

/**
 * Modal e Interfaz para la Actualización Masiva de Precios por Categoría y Subcategoría
 * Permite ajustar precios en lote por porcentaje o monto fijo, con previsualización en tiempo real
 * y estrategias de redondeo automático.
 */
export const ModalCambioMasivoPrecios: React.FC<ModalCambioMasivoPreciosProps> = ({
  abierto,
  alCerrar,
  productos,
  alConfirmarActualizacionMasiva
}) => {

  // Estados de Configuración
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaProducto | 'Todas'>('Todas');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<SubcategoriaProducto | 'Todas'>('Todas');
  
  const [tipoOperacion, setTipoOperacion] = useState<'aumento_porcentaje' | 'descuento_porcentaje' | 'aumento_monto' | 'descuento_monto' | 'fijar_precio'>('aumento_porcentaje');
  const [valorIngresado, setValorIngresado] = useState<number>(15); // Por defecto +15%
  const [estrategiaRedondeo, setEstrategiaRedondeo] = useState<'ninguno' | '100' | '500' | '1000'>('100');
  
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Categorías y Subcategorías disponibles
  const categoriasLista: (CategoriaProducto | 'Todas')[] = ['Todas', ...CATEGORIAS];

  // Tipos de prenda de la categoría elegida (o todos)
  const subcategoriasLista: (SubcategoriaProducto | 'Todas')[] = [
    'Todas',
    ...(categoriaSeleccionada === 'Todas' ? TODAS_SUBCATEGORIAS : subcategoriasPara(categoriaSeleccionada))
  ];

  // Cálculo en tiempo real de productos afectados y precios nuevos
  const calculoPrevisualizacion = useMemo(() => {
    const filtrados = productos.filter(p => {
      const coincideCat = categoriaSeleccionada === 'Todas' || p.categoria === categoriaSeleccionada;
      const coincideSub = subcategoriaSeleccionada === 'Todas' || p.subcategoria === subcategoriaSeleccionada;
      return coincideCat && coincideSub;
    });

    const val = Number(valorIngresado) || 0;

    const listaSimulada = filtrados.map(p => {
      let nuevoPrecio = p.precio;

      if (tipoOperacion === 'aumento_porcentaje') {
        nuevoPrecio = p.precio * (1 + val / 100);
      } else if (tipoOperacion === 'descuento_porcentaje') {
        nuevoPrecio = p.precio * (1 - val / 100);
      } else if (tipoOperacion === 'aumento_monto') {
        nuevoPrecio = p.precio + val;
      } else if (tipoOperacion === 'descuento_monto') {
        nuevoPrecio = Math.max(0, p.precio - val);
      } else if (tipoOperacion === 'fijar_precio') {
        nuevoPrecio = val;
      }

      // Redondeo
      if (estrategiaRedondeo === '100') {
        nuevoPrecio = Math.round(nuevoPrecio / 100) * 100;
      } else if (estrategiaRedondeo === '500') {
        nuevoPrecio = Math.round(nuevoPrecio / 500) * 500;
      } else if (estrategiaRedondeo === '1000') {
        nuevoPrecio = Math.round(nuevoPrecio / 1000) * 1000;
      } else {
        nuevoPrecio = Math.round(nuevoPrecio);
      }

      const diferenciaAbsoluta = nuevoPrecio - p.precio;
      const diferenciaPorcentual = p.precio > 0 ? ((nuevoPrecio - p.precio) / p.precio) * 100 : 0;

      return {
        producto: p,
        precioActual: p.precio,
        precioNuevo: Math.max(100, nuevoPrecio),
        diferenciaAbsoluta,
        diferenciaPorcentual
      };
    });

    const promedioActual = filtrados.length > 0 
      ? filtrados.reduce((acc, p) => acc + p.precio, 0) / filtrados.length 
      : 0;

    const promedioNuevo = listaSimulada.length > 0
      ? listaSimulada.reduce((acc, item) => acc + item.precioNuevo, 0) / listaSimulada.length
      : 0;

    return {
      afectados: listaSimulada,
      totalAfectados: filtrados.length,
      promedioActual,
      promedioNuevo,
      variacionPromedio: promedioNuevo - promedioActual
    };
  }, [
    productos, 
    categoriaSeleccionada, 
    subcategoriaSeleccionada, 
    tipoOperacion, 
    valorIngresado, 
    estrategiaRedondeo
  ]);

  // Manejar confirmación de cambios masivos
  const handleConfirmar = async () => {
    if (calculoPrevisualizacion.totalAfectados === 0) return;

    setProcesando(true);
    setMensajeExito(null);

    const exito = await alConfirmarActualizacionMasiva({
      categoria: categoriaSeleccionada,
      subcategoria: subcategoriaSeleccionada,
      tipoOperacion,
      valor: Number(valorIngresado),
      redondeo: estrategiaRedondeo
    });

    setProcesando(false);

    if (exito) {
      setMensajeExito(`¡Se actualizaron con éxito los precios de ${calculoPrevisualizacion.totalAfectados} productos!`);
      setTimeout(() => {
        setMensajeExito(null);
        alCerrar();
      }, 1800);
    }
  };

  // Los hooks van siempre antes de cualquier return (reglas de hooks de React)
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#e5d8cc]">
        
        {/* Encabezado del Modal */}
        <div className="bg-[#735a3e] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D9B99B]">
              <DollarSign size={22} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl leading-tight">
                Actualización Masiva de Precios
              </h3>
              <p className="text-xs text-[#e5d8cc] mt-0.5">
                Aplica aumentos o descuentos por categoría o subcategoría con redondeo automático.
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerta de Éxito si aplica */}
        {mensajeExito && (
          <div className="bg-[#e2f0d9] border-b border-[#c3e6cb] text-[#2e6830] px-6 py-3 text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <Check size={18} className="shrink-0 text-[#28a745]" />
            <span>{mensajeExito}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* PASO 1: Selección de Categoría y Subcategoría */}
          <div className="bg-[#fff8f4] p-5 rounded-2xl border border-[#eee7e2] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#735a3e]">
              <Filter size={15} />
              <span>1. Filtrar Productos a Modificar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categoría Principal */}
              <div>
                <label className="block text-xs font-bold text-[#4e453d] mb-1.5">
                  Categoría Principal
                </label>
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => {
                    setCategoriaSeleccionada(e.target.value as any);
                    setSubcategoriaSeleccionada('Todas');
                  }}
                  className="w-full bg-white border border-[#d9ceb9] rounded-xl px-3 py-2 text-sm text-[#1e1b19] font-medium focus:ring-2 focus:ring-[#735a3e] outline-none"
                >
                  {categoriasLista.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'Todas' ? '✦ Todas las Categorías' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategoría */}
              <div>
                <label className="block text-xs font-bold text-[#4e453d] mb-1.5">
                  Subcategoría / Tipo de Prenda
                </label>
                <select
                  value={subcategoriaSeleccionada}
                  onChange={(e) => setSubcategoriaSeleccionada(e.target.value as any)}
                  className="w-full bg-white border border-[#d9ceb9] rounded-xl px-3 py-2 text-sm text-[#1e1b19] font-medium focus:ring-2 focus:ring-[#735a3e] outline-none"
                >
                  {subcategoriasLista.map(sub => (
                    <option key={sub} value={sub}>
                      {sub === 'Todas' ? '✦ Todas las Subcategorías' : sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PASO 2: Reglas de Ajuste de Precio */}
          <div className="bg-[#fff8f4] p-5 rounded-2xl border border-[#eee7e2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#735a3e]">
                <Layers size={15} />
                <span>2. Configurar Ajuste y Redondeo</span>
              </div>
              <span className="text-xs text-[#80756b] font-medium">
                Suma, descuenta o establece valores fijos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Operación */}
              <div>
                <label className="block text-xs font-bold text-[#4e453d] mb-1.5">
                  Tipo de Modificación
                </label>
                <select
                  value={tipoOperacion}
                  onChange={(e) => setTipoOperacion(e.target.value as any)}
                  className="w-full bg-white border border-[#d9ceb9] rounded-xl px-3 py-2 text-sm text-[#1e1b19] font-medium focus:ring-2 focus:ring-[#735a3e] outline-none"
                >
                  <option value="aumento_porcentaje">+ Porcentaje (%) Aumento</option>
                  <option value="descuento_porcentaje">- Porcentaje (%) Descuento</option>
                  <option value="aumento_monto">+ Monto Fijo ($) Aumento</option>
                  <option value="descuento_monto">- Monto Fijo ($) Descuento</option>
                  <option value="fijar_precio">= Precio Fijo Unificado ($)</option>
                </select>
              </div>

              {/* Valor / Porcentaje */}
              <div>
                <label className="block text-xs font-bold text-[#4e453d] mb-1.5">
                  {tipoOperacion.includes('porcentaje') ? 'Porcentaje (%)' : 'Monto en Pesos ($)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={tipoOperacion.includes('porcentaje') ? '1' : '500'}
                    value={valorIngresado}
                    onChange={(e) => setValorIngresado(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white border border-[#d9ceb9] rounded-xl px-3 py-2 pr-10 text-sm font-bold text-[#1e1b19] focus:ring-2 focus:ring-[#735a3e] outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#735a3e]">
                    {tipoOperacion.includes('porcentaje') ? '%' : '$'}
                  </div>
                </div>

                {/* Accesos rápidos de Porcentaje */}
                {tipoOperacion.includes('porcentaje') && (
                  <div className="flex gap-1.5 mt-2">
                    {[10, 15, 20, 25, 30, 50].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValorIngresado(p)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          valorIngresado === p 
                            ? 'bg-[#735a3e] text-white border-[#735a3e]' 
                            : 'bg-white text-[#4e453d] border-[#d9ceb9] hover:bg-[#eee7e2]'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Estrategia de Redondeo */}
              <div>
                <label className="block text-xs font-bold text-[#4e453d] mb-1.5">
                  Redondeo Automático
                </label>
                <select
                  value={estrategiaRedondeo}
                  onChange={(e) => setEstrategiaRedondeo(e.target.value as any)}
                  className="w-full bg-white border border-[#d9ceb9] rounded-xl px-3 py-2 text-sm text-[#1e1b19] font-medium focus:ring-2 focus:ring-[#735a3e] outline-none"
                >
                  <option value="100">Redondear a $100 más cercano (ej: $42.300)</option>
                  <option value="500">Redondear a $500 más cercano (ej: $42.500)</option>
                  <option value="1000">Redondear a $1.000 más cercano (ej: $43.000)</option>
                  <option value="ninguno">Sin redondeo (Valor exacto)</option>
                </select>
              </div>
            </div>
          </div>

          {/* PASO 3: Resumen y Previsualización de Impacto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#735a3e]">
                <Eye size={15} />
                <span>3. Previsualización de Cambios ({calculoPrevisualizacion.totalAfectados} prendas)</span>
              </div>
              <span className="text-xs text-[#80756b] font-medium">
                {calculoPrevisualizacion.totalAfectados === 0 
                  ? 'Ningún producto coincide con los filtros' 
                  : 'Valores calculados automáticamente'
                }
              </span>
            </div>

            {/* Métrica Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#fff8f4] p-3 rounded-xl border border-[#eee7e2]">
                <span className="text-[10px] font-bold text-[#80756b] uppercase block">
                  Productos Seleccionados
                </span>
                <span className="text-xl font-bold text-[#735a3e] font-display">
                  {calculoPrevisualizacion.totalAfectados} un.
                </span>
              </div>

              <div className="bg-[#fff8f4] p-3 rounded-xl border border-[#eee7e2]">
                <span className="text-[10px] font-bold text-[#80756b] uppercase block">
                  Precio Promedio Actual
                </span>
                <span className="text-lg font-bold text-[#4e453d] font-display">
                  ${Math.round(calculoPrevisualizacion.promedioActual).toLocaleString('es-AR')}
                </span>
              </div>

              <div className="bg-[#fff8f4] p-3 rounded-xl border border-[#eee7e2]">
                <span className="text-[10px] font-bold text-[#80756b] uppercase block">
                  Nuevo Promedio Calculado
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-[#2e6830] font-display">
                    ${Math.round(calculoPrevisualizacion.promedioNuevo).toLocaleString('es-AR')}
                  </span>
                  {calculoPrevisualizacion.variacionPromedio !== 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      calculoPrevisualizacion.variacionPromedio > 0 
                        ? 'bg-[#e2f0d9] text-[#2e6830]' 
                        : 'bg-[#fce8e6] text-[#c5221f]'
                    }`}>
                      {calculoPrevisualizacion.variacionPromedio > 0 ? '+' : ''}
                      ${Math.round(calculoPrevisualizacion.variacionPromedio).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de Previsualización de Productos */}
            {calculoPrevisualizacion.totalAfectados > 0 ? (
              <div className="border border-[#e5d8cc] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f5eeea] text-[#735a3e] font-bold border-b border-[#e5d8cc] sticky top-0">
                    <tr>
                      <th className="p-3">Prenda / SKU</th>
                      <th className="p-3">Categoría / Subcategoría</th>
                      <th className="p-3 text-right">Precio Actual</th>
                      <th className="p-3 text-right">Nuevo Precio</th>
                      <th className="p-3 text-right">Variación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee7e2]">
                    {calculoPrevisualizacion.afectados.map((item) => {
                      const esAumento = item.diferenciaAbsoluta > 0;
                      const esDescuento = item.diferenciaAbsoluta < 0;

                      return (
                        <tr key={item.producto.id} className="hover:bg-[#fff8f4] transition-colors">
                          <td className="p-3 flex items-center gap-2.5">
                            <img
                              src={item.producto.imagenPrincipal}
                              alt={item.producto.nombre}
                              className="w-8 h-8 rounded-lg object-cover bg-neutral-100 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-[#1e1b19] block leading-tight">
                                {item.producto.nombre}
                              </span>
                              <span className="text-[10px] text-[#80756b] font-mono">
                                {item.producto.sku}
                              </span>
                            </div>
                          </td>

                          <td className="p-3 text-[#4e453d]">
                            <span className="font-semibold block">{item.producto.categoria}</span>
                            <span className="text-[10px] text-[#80756b]">
                              {item.producto.subcategoria || 'General'}
                            </span>
                          </td>

                          <td className="p-3 text-right text-[#80756b] line-through font-mono">
                            ${item.precioActual.toLocaleString('es-AR')}
                          </td>

                          <td className="p-3 text-right font-bold text-[#1e1b19] font-mono text-sm">
                            ${item.precioNuevo.toLocaleString('es-AR')}
                          </td>

                          <td className="p-3 text-right font-semibold">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                              esAumento 
                                ? 'bg-[#e2f0d9] text-[#2e6830]' 
                                : esDescuento 
                                ? 'bg-[#fce8e6] text-[#c5221f]' 
                                : 'bg-neutral-100 text-[#80756b]'
                            }`}>
                              {esAumento && <ArrowUpRight size={12} />}
                              {esDescuento && <ArrowDownRight size={12} />}
                              {esAumento ? '+' : ''}${Math.abs(item.diferenciaAbsoluta).toLocaleString('es-AR')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#fff8f4] rounded-2xl border border-dashed border-[#d9ceb9] text-[#80756b]">
                <AlertCircle size={28} className="mx-auto text-[#c4a484] mb-2" />
                <p className="text-sm font-semibold text-[#4e453d]">
                  No se encontraron prendas con la combinación de filtros seleccionada.
                </p>
                <p className="text-xs mt-1 text-[#80756b]">
                  Prueba cambiando la Categoría Principal a "Todas" o ajustando la Subcategoría.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones de Confirmación y Cierre */}
        <div className="bg-[#f8f5f2] border-t border-[#e5d8cc] p-4 px-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={alCerrar}
            className="px-5 py-2.5 rounded-xl border border-[#d9ceb9] text-xs font-bold text-[#4e453d] hover:bg-[#eee7e2] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={calculoPrevisualizacion.totalAfectados === 0 || procesando}
            onClick={handleConfirmar}
            className="px-6 py-2.5 rounded-xl bg-[#735a3e] hover:bg-[#5c4731] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
          >
            {procesando ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Aplicando Cambios...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>
                  Confirmar y Aplicar a {calculoPrevisualizacion.totalAfectados} Prendas
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
