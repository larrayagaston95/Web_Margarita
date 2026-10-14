import React, { useState } from 'react';
import { Producto, Pedido, CategoriaProducto, SubcategoriaProducto, TalleBebe } from '../types';
import { 
  Package, TrendingUp, FileText, ShoppingCart, Plus, Edit, Trash2, 
  AlertTriangle, RefreshCw, Download, Check, Search, DollarSign, Layers, Percent
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { jsPDF } from 'jspdf';
import { ModalCambioMasivoPrecios } from './ModalCambioMasivoPrecios';
import { LogoMargarita } from './LogoMargarita';

interface PanelAdministradorProps {
  productos: Producto[];
  pedidos: Pedido[];
  estadisticas: any;
  alCrearProducto: (nuevoProducto: Omit<Producto, 'id'>) => Promise<boolean>;
  alActualizarStockProducto: (id: string, nuevoStock: number) => Promise<boolean>;
  alEditarProducto: (id: string, datosActualizados: Partial<Producto>) => Promise<boolean>;
  alEliminarProducto: (id: string) => Promise<boolean>;
  alCambiarEstadoPedido: (idPedido: string, estadoPedido: string) => Promise<boolean>;
  alActualizarMasivoPrecios: (
    datos: {
      categoria: CategoriaProducto | 'Todas';
      subcategoria: SubcategoriaProducto | 'Todas';
      tipoOperacion: 'aumento_porcentaje' | 'descuento_porcentaje' | 'aumento_monto' | 'descuento_monto' | 'fijar_precio';
      valor: number;
      redondeo: 'ninguno' | '100' | '500' | '1000';
    }
  ) => Promise<boolean>;
  alRecargarDatos: () => void;
}

/**
 * Panel de Administración Integral
 * Incluye:
 * 1. Gestión de Inventario y Carga de Productos en Tiempo Real
 * 2. Cambios Masivos de Precios por Categoría y Subcategoría
 * 3. Control de Pedidos y Estado de Envíos
 * 4. Panel de Estadísticas Detalladas de Ventas Diarias
 * 5. Generador de Reportes Mensuales Descargables en PDF
 */
export const PanelAdministrador: React.FC<PanelAdministradorProps> = ({
  productos,
  pedidos,
  estadisticas,
  alCrearProducto,
  alActualizarStockProducto,
  alEditarProducto,
  alEliminarProducto,
  alCambiarEstadoPedido,
  alActualizarMasivoPrecios,
  alRecargarDatos
}) => {
  const [pestanaActiva, setPestanaActiva] = useState<'inventario' | 'ventas' | 'pedidos' | 'reportes'>('inventario');
  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [modalFormularioProducto, setModalFormularioProducto] = useState(false);
  const [modalMasivoPreciosAbierto, setModalMasivoPreciosAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

  // Formulario estado local
  const [formNombre, setFormNombre] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoria, setFormCategoria] = useState<CategoriaProducto>('Bebé Otoño-Invierno');
  const [formPrecio, setFormPrecio] = useState<number>(15000);
  const [formStock, setFormStock] = useState<number>(10);
  const [formStockMin, setFormStockMin] = useState<number>(5);
  const [formTalles, setFormTalles] = useState<TalleBebe[]>(['0-3m', '3-6m', '6-9m']);
  const [formImagen, setFormImagen] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formComposicion, setFormComposicion] = useState('100% Algodón Hipoalergénico Orgánico');

  // Abrir modal para crear producto nuevo
  const handleAbrirNuevo = () => {
    setProductoEditando(null);
    setFormNombre('');
    setFormSku(`MAR-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormCategoria('Bebé Otoño-Invierno');
    setFormPrecio(15000);
    setFormStock(10);
    setFormStockMin(5);
    setFormTalles(['0-3m', '3-6m', '6-9m']);
    setFormImagen('https://lh3.googleusercontent.com/aida/AP1WRLuR_7rmNEBEUHNcbd8OkxRqu1eeDC3nKe_bvKARKn6CBTKHnER3i8YIvMZL7fKgg91BzEkJPfScswvCWYKRhio0Jja-vlXdB5TAks8h3_dBwFuFfeULc5d0IHN4RTIge-FQQAQmPWC89Ub_JFiDfpxzcHz4sAmGfoK-bNU0zNh6Ulrz1DCgIz_YFog43rHBFOylU0QmXJmg5-1uqXEIpcGF6c2-TPo5_LiJp56Fp6n-u0o4kQIigyUaF9Q');
    setFormDescripcion('Prenda artesanal de máxima suavidad.');
    setModalFormularioProducto(true);
  };

  // Abrir modal para editar
  const handleAbrirEditar = (p: Producto) => {
    setProductoEditando(p);
    setFormNombre(p.nombre);
    setFormSku(p.sku);
    setFormCategoria(p.categoria);
    setFormPrecio(p.precio);
    setFormStock(p.stock);
    setFormStockMin(p.stockMinimo);
    setFormTalles(p.talles);
    setFormImagen(p.imagenPrincipal);
    setFormDescripcion(p.descripcion);
    setFormComposicion(p.composicion);
    setModalFormularioProducto(true);
  };

  // Guardar creación / edición
  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productoEditando) {
      await alEditarProducto(productoEditando.id, {
        nombre: formNombre,
        sku: formSku,
        categoria: formCategoria,
        precio: formPrecio,
        stock: formStock,
        stockMinimo: formStockMin,
        talles: formTalles,
        imagenPrincipal: formImagen,
        descripcion: formDescripcion,
        composicion: formComposicion
      });
    } else {
      await alCrearProducto({
        sku: formSku,
        nombre: formNombre,
        categoria: formCategoria,
        precio: formPrecio,
        stock: formStock,
        stockMinimo: formStockMin,
        talles: formTalles,
        colores: [{ nombre: 'Crudo Natural', hex: '#FAF9F6' }, { nombre: 'Soft Clay', hex: '#D9B99B' }],
        descripcion: formDescripcion,
        composicion: formComposicion,
        cuidados: 'Lavar con agua fría ciclo delicado.',
        imagenPrincipal: formImagen || 'https://lh3.googleusercontent.com/aida/AP1WRLuR_7rmNEBEUHNcbd8OkxRqu1eeDC3nKe_bvKARKn6CBTKHnER3i8YIvMZL7fKgg91BzEkJPfScswvCWYKRhio0Jja-vlXdB5TAks8h3_dBwFuFfeULc5d0IHN4RTIge-FQQAQmPWC89Ub_JFiDfpxzcHz4sAmGfoK-bNU0zNh6Ulrz1DCgIz_YFog43rHBFOylU0QmXJmg5-1uqXEIpcGF6c2-TPo5_LiJp56Fp6n-u0o4kQIigyUaF9Q',
        imagenesSecundarias: []
      });
    }
    setModalFormularioProducto(false);
  };

  // Generación y descarga del Reporte Mensual en PDF con jsPDF
  const handleDescargarReportePDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Encabezado del documento
    doc.setFillColor(115, 90, 62); // Color #735a3e
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('MARGARITA INDUMENTARIA', 15, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte Oficial de Ventas & Estado de Inventario', 15, 25);
    doc.text(`Fecha de Emisión: ${fechaHoy}`, 130, 25);

    // Métricas Resumen
    doc.setTextColor(30, 27, 25);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Resumen Ejecutivo del Mes', 15, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Ingresos Totales de Ventas: $${(estadisticas?.ingresosTotales || 180000).toLocaleString('es-AR')}`, 20, 55);
    doc.text(`• Cantidad de Pedidos Procesados: ${estadisticas?.totalPedidos || 12} pedidos`, 20, 62);
    doc.text(`• Ticket Promedio por Compra: $${(estadisticas?.ticketPromedio || 15000).toLocaleString('es-AR')}`, 20, 69);
    doc.text(`• Total de Productos en Catálogo: ${productos.length} unidades`, 20, 76);
    doc.text(`• Alertas de Stock Bajo: ${estadisticas?.productosStockBajoCount || 2} productos en nivel crítico`, 20, 83);

    // Tabla de Ventas Recientes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Detalle de Pedidos Recientes', 15, 100);

    let y = 110;
    doc.setFillColor(244, 236, 232);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('N° Pedido', 20, y + 6);
    doc.text('Cliente', 55, y + 6);
    doc.text('Método Pago', 105, y + 6);
    doc.text('Estado', 145, y + 6);
    doc.text('Monto', 175, y + 6);

    y += 12;
    doc.setFont('helvetica', 'normal');

    pedidos.slice(0, 10).forEach((ped) => {
      doc.text(ped.numeroPedido, 20, y);
      doc.text(ped.clienteNombre.slice(0, 22), 55, y);
      doc.text(ped.metodoPago === 'pasarela' ? 'Pasarela' : 'WhatsApp', 105, y);
      doc.text(ped.estadoPedido, 145, y);
      doc.text(`$${ped.total.toLocaleString('es-AR')}`, 175, y);
      y += 8;
    });

    // Productos con stock bajo
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Alerta de Reposición de Inventario', 15, y);

    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    productos.filter(p => p.stock <= p.stockMinimo).forEach(p => {
      doc.text(`• SKU: ${p.sku} | ${p.nombre} — Stock Actual: ${p.stock} un. (Min: ${p.stockMinimo})`, 20, y);
      y += 6;
    });

    // Pie de página del PDF
    doc.setFontSize(8);
    doc.setTextColor(128, 117, 107);
    doc.text('Margarita Indumentaria — Av. Principal 1234, CABA, Argentina. Documento confidencial de gestión interna.', 15, 285);

    doc.save(`Margarita_Reporte_Mensual_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`);
  };

  const productosFiltradosInv = productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaInventario.toLowerCase()) ||
    p.sku.toLowerCase().includes(busquedaInventario.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-8 px-4 md:px-12 animate-fade-in">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Encabezado Panel Admin */}
        <div className="bg-white rounded-3xl p-6 cloud-shadow border border-[#eee7e2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <LogoMargarita tamanoIcono={52} />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#735a3e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Panel de Control
                </span>
                <span className="text-xs text-[#80756b]">Gestión en Tiempo Real</span>
              </div>
              <h1 className="font-display font-bold text-xl md:text-2xl text-[#1e1b19] mt-0.5">
                Margarita Administrador
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setModalMasivoPreciosAbierto(true)}
              className="bg-[#B08D57] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#977644] transition-all shadow-md animate-pulse"
              title="Cambio masivo de precios por categoría o subcategoría"
            >
              <Percent size={16} />
              <span>Cambio Masivo de Precios</span>
            </button>

            <button
              onClick={alRecargarDatos}
              className="p-2.5 bg-[#f4ece8] text-[#735a3e] rounded-xl hover:bg-[#e8e1dd] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Sincronizar datos"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={handleDescargarReportePDF}
              className="bg-[#6B7D68] text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#536a51] transition-all shadow-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Reporte PDF</span>
            </button>

            <button
              onClick={handleAbrirNuevo}
              className="bg-[#735a3e] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-[#5a4229] transition-all shadow-md"
            >
              <Plus size={16} />
              Cargar Producto
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación Admin */}
        <div className="flex border-b border-[#d2c4b9] gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setPestanaActiva('inventario')}
            className={`px-5 py-3 rounded-t-2xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
              pestanaActiva === 'inventario'
                ? 'bg-white text-[#735a3e] border-t-2 border-[#735a3e] shadow-sm font-bold'
                : 'text-[#4e453d] hover:bg-[#f4ece8]'
            }`}
          >
            <Package size={18} />
            Inventario & Productos ({productos.length})
          </button>

          <button
            onClick={() => setPestanaActiva('ventas')}
            className={`px-5 py-3 rounded-t-2xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
              pestanaActiva === 'ventas'
                ? 'bg-white text-[#735a3e] border-t-2 border-[#735a3e] shadow-sm font-bold'
                : 'text-[#4e453d] hover:bg-[#f4ece8]'
            }`}
          >
            <TrendingUp size={18} />
            Estadísticas de Ventas Diarias
          </button>

          <button
            onClick={() => setPestanaActiva('pedidos')}
            className={`px-5 py-3 rounded-t-2xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
              pestanaActiva === 'pedidos'
                ? 'bg-white text-[#735a3e] border-t-2 border-[#735a3e] shadow-sm font-bold'
                : 'text-[#4e453d] hover:bg-[#f4ece8]'
            }`}
          >
            <ShoppingCart size={18} />
            Pedidos Recibidos ({pedidos.length})
          </button>

          <button
            onClick={() => setPestanaActiva('reportes')}
            className={`px-5 py-3 rounded-t-2xl font-semibold text-xs md:text-sm flex items-center gap-2 transition-all ${
              pestanaActiva === 'reportes'
                ? 'bg-white text-[#735a3e] border-t-2 border-[#735a3e] shadow-sm font-bold'
                : 'text-[#4e453d] hover:bg-[#f4ece8]'
            }`}
          >
            <FileText size={18} />
            Reportes Mensuales PDF
          </button>
        </div>

        {/* PESTAÑA 1: GESTIÓN DE INVENTARIO EN TIEMPO REAL */}
        {pestanaActiva === 'inventario' && (
          <div className="bg-white rounded-3xl p-6 cloud-shadow border border-[#eee7e2] space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-3 text-[#80756b]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, SKU o categoría..."
                  value={busquedaInventario}
                  onChange={(e) => setBusquedaInventario(e.target.value)}
                  className="w-full bg-[#f4ece8] border border-[#d2c4b9] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#735a3e]"
                />
              </div>

              <div className="text-xs text-[#6B7D68] font-semibold flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#B08D57]" />
                <span>
                  {estadisticas?.productosStockBajoCount || 0} productos requieren reposición
                </span>
              </div>
            </div>

            {/* Tabla de Productos e Inventario */}
            <div className="overflow-x-auto rounded-2xl border border-[#eee7e2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f4ece8] text-[#1e1b19] font-bold border-b border-[#eee7e2]">
                    <th className="p-3">Prenda</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Stock en Vivo</th>
                    <th className="p-3 text-center">Ajuste Rápido</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee7e2]">
                  {productosFiltradosInv.map((p) => {
                    const esStockBajo = p.stock <= p.stockMinimo;
                    return (
                      <tr key={p.id} className="hover:bg-[#faf2ee]/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imagenPrincipal}
                              alt={p.nombre}
                              className="w-10 h-10 object-cover rounded-lg bg-[#e0d9d4] shrink-0"
                            />
                            <div>
                              <p className="font-bold text-[#1e1b19]">{p.nombre}</p>
                              <p className="text-[10px] text-[#80756b]">Talles: {p.talles.join(', ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#80756b]">{p.sku}</td>
                        <td className="p-3 font-semibold text-[#536a51]">{p.categoria}</td>
                        <td className="p-3 font-bold text-[#B08D57]">
                          ${p.precio.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[11px] ${
                              esStockBajo
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#cfeaca] text-[#536a51]'
                            }`}
                          >
                            {esStockBajo && <AlertTriangle size={12} />}
                            {p.stock} unidades
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-[#f4ece8] rounded-lg p-1">
                            <button
                              onClick={() => alActualizarStockProducto(p.id, Math.max(0, p.stock - 1))}
                              className="w-6 h-6 font-bold bg-white text-[#735a3e] rounded hover:bg-[#e8e1dd] flex items-center justify-center"
                              title="Restar 1 al stock"
                            >
                              -
                            </button>
                            <span className="w-8 font-mono text-center font-bold">{p.stock}</span>
                            <button
                              onClick={() => alActualizarStockProducto(p.id, p.stock + 1)}
                              className="w-6 h-6 font-bold bg-white text-[#735a3e] rounded hover:bg-[#e8e1dd] flex items-center justify-center"
                              title="Sumar 1 al stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAbrirEditar(p)}
                              className="p-1.5 text-[#735a3e] hover:bg-[#f4ece8] rounded-lg"
                              title="Editar producto"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => alEliminarProducto(p.id)}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg"
                              title="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: ESTADÍSTICAS DETALLADAS DE VENTAS DIARIAS */}
        {pestanaActiva === 'ventas' && (
          <div className="space-y-6 animate-fade-in">
            {/* Cards de Métricas Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 cloud-shadow border border-[#eee7e2] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#c4a484]/30 text-[#735a3e] flex items-center justify-center shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <span className="text-xs text-[#80756b] block font-semibold">Ingresos Totales</span>
                  <p className="font-display font-bold text-2xl text-[#1e1b19]">
                    ${(estadisticas?.ingresosTotales || 0).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 cloud-shadow border border-[#eee7e2] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#cfeaca] text-[#536a51] flex items-center justify-center shrink-0">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <span className="text-xs text-[#80756b] block font-semibold">Total de Pedidos</span>
                  <p className="font-display font-bold text-2xl text-[#1e1b19]">
                    {estadisticas?.totalPedidos || 0} ventas
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 cloud-shadow border border-[#eee7e2] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ffddbb] text-[#5a4229] flex items-center justify-center shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-xs text-[#80756b] block font-semibold">Ticket Promedio</span>
                  <p className="font-display font-bold text-2xl text-[#1e1b19]">
                    ${(estadisticas?.ticketPromedio || 0).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 cloud-shadow border border-[#eee7e2] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span className="text-xs text-[#80756b] block font-semibold">Stock Crítico</span>
                  <p className="font-display font-bold text-2xl text-[#1e1b19]">
                    {estadisticas?.productosStockBajoCount || 0} prendas
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico de Ventas Diarias con Recharts */}
            <div className="bg-white rounded-3xl p-6 cloud-shadow border border-[#eee7e2] space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1e1b19]">
                    Evolución de Ventas Diarias ($)
                  </h3>
                  <p className="text-xs text-[#80756b]">Ingresos acumulados de los últimos 7 días</p>
                </div>
                <span className="text-xs bg-[#cfeaca] text-[#536a51] font-bold px-3 py-1 rounded-full">
                  Sincronizado en tiempo real
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={estadisticas?.ultimos7Dias || []}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#735a3e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#735a3e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee7e2" />
                    <XAxis dataKey="diaNombre" stroke="#80756b" fontSize={12} />
                    <YAxis stroke="#80756b" fontSize={12} />
                    <Tooltip
                      formatter={(val: any) => [`$${val.toLocaleString('es-AR')}`, 'Monto Total']}
                      labelFormatter={(label: any) => `Día: ${label}`}
                      contentStyle={{ backgroundColor: '#fff8f4', borderRadius: '12px', borderColor: '#d2c4b9' }}
                    />
                    <Area type="monotone" dataKey="montoTotal" stroke="#735a3e" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: GESTIÓN DE PEDIDOS RECIBIDOS */}
        {pestanaActiva === 'pedidos' && (
          <div className="bg-white rounded-3xl p-6 cloud-shadow border border-[#eee7e2] space-y-4 animate-fade-in">
            <h3 className="font-display font-bold text-lg text-[#1e1b19]">
              Historial y Estado de Pedidos
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-[#eee7e2]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f4ece8] text-[#1e1b19] font-bold">
                    <th className="p-3">N° Pedido</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Método Pago</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Estado del Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee7e2]">
                  {pedidos.map((ped) => (
                    <tr key={ped.id} className="hover:bg-[#faf2ee]">
                      <td className="p-3 font-bold font-mono text-[#735a3e]">{ped.numeroPedido}</td>
                      <td className="p-3 text-[#80756b]">
                        {new Date(ped.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-[#1e1b19]">{ped.clienteNombre}</p>
                        <p className="text-[10px] text-[#80756b]">{ped.clienteEmail} | {ped.clienteTelefono}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ped.metodoPago === 'pasarela'
                            ? 'bg-[#cfeaca] text-[#536a51]'
                            : 'bg-[#ffddbb] text-[#5a4229]'
                        }`}>
                          {ped.metodoPago === 'pasarela' ? 'Pasarela' : 'WhatsApp'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#B08D57]">
                        ${ped.total.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3">
                        <select
                          value={ped.estadoPedido}
                          onChange={(e) => alCambiarEstadoPedido(ped.id, e.target.value)}
                          className="bg-[#f4ece8] border border-[#d2c4b9] rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#735a3e]"
                        >
                          <option value="Procesando">Procesando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: REPORTES MENSUALES DESCARGABLES EN PDF */}
        {pestanaActiva === 'reportes' && (
          <div className="bg-white rounded-3xl p-8 cloud-shadow border border-[#eee7e2] text-center max-w-2xl mx-auto space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#f4ece8] text-[#735a3e] flex items-center justify-center mx-auto">
              <FileText size={36} />
            </div>

            <h3 className="font-display font-bold text-2xl text-[#1e1b19]">
              Reportes Mensuales en PDF
            </h3>

            <p className="text-xs text-[#4e453d] max-w-md mx-auto leading-relaxed">
              Genera un reporte contable y de inventario completo con el membrete oficial de Margarita Indumentaria para auditoría interna o contador.
            </p>

            <button
              onClick={handleDescargarReportePDF}
              className="bg-[#735a3e] text-white px-8 py-3.5 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-[#5a4229] transition-all shadow-md flex items-center gap-2 mx-auto"
            >
              <Download size={18} />
              Generar y Descargar Reporte PDF
            </button>
          </div>
        )}
      </div>

      {/* MODAL CREACIÓN / EDICIÓN DE PRODUCTO */}
      {modalFormularioProducto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fff8f4] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalFormularioProducto(false)}
              className="absolute top-4 right-4 text-[#80756b] hover:text-[#1e1b19]"
            >
              <Trash2 size={20} />
            </button>

            <h3 className="font-display font-bold text-xl text-[#1e1b19] mb-4">
              {productoEditando ? 'Editar Producto' : 'Cargar Nuevo Producto'}
            </h3>

            <form onSubmit={handleGuardarProducto} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nombre de la Prenda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Conjunto Punto Arroz"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#735a3e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Categoría *</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value as CategoriaProducto)}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="Bebé Otoño-Invierno">Bebé Otoño-Invierno</option>
                    <option value="Bebé Primavera-Verano">Bebé Primavera-Verano</option>
                    <option value="Kids">Kids</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrecio}
                    onChange={(e) => setFormPrecio(Number(e.target.value))}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formStockMin}
                    onChange={(e) => setFormStockMin(Number(e.target.value))}
                    className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">URL de la Imagen Principal</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formImagen}
                  onChange={(e) => setFormImagen(e.target.value)}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  className="w-full bg-white border border-[#d2c4b9] rounded-xl p-2 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalFormularioProducto(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4ece8] text-[#735a3e] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#735a3e] text-white font-semibold shadow-md"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cambio Masivo de Precios */}
      <ModalCambioMasivoPrecios
        abierto={modalMasivoPreciosAbierto}
        alCerrar={() => setModalMasivoPreciosAbierto(false)}
        productos={productos}
        alConfirmarActualizacionMasiva={alActualizarMasivoPrecios}
      />
    </div>
  );
};
