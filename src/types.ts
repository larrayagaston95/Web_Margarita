/**
 * Definiciones de tipos para Margarita Indumentaria
 * Estructura limpia y tipada para mantener el proyecto.
 */

export type CategoriaProducto = 
  | 'Bebé Otoño-Invierno'
  | 'Bebé Primavera-Verano'
  | 'Kids'
  | 'Accesorios';

export type SubcategoriaProducto = 
  | 'Conjuntos & Sets'
  | 'Vestidos & Enteritos'
  | 'Sweaters & Abrigos'
  | 'Bodys & Básicos'
  | 'Pantalones'
  | 'Accesorios & Calzado';

export type TalleBebe = '0-3m' | '3-6m' | '6-9m' | '9-12m' | '12-18m' | '2T' | '4T' | '6T';

export interface ColorProducto {
  nombre: string;
  hex: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: CategoriaProducto;
  subcategoria?: SubcategoriaProducto;
  precio: number;
  precioOferta?: number;
  stock: number;
  stockMinimo: number;
  talles: TalleBebe[];
  colores: ColorProducto[];
  descripcion: string;
  composicion: string;
  cuidados: string;
  imagenPrincipal: string;
  imagenesSecundarias: string[];
  esNuevo?: boolean;
  esDestacado?: boolean;
  calificacion?: number;
  resenasCount?: number;
}

export interface ItemCarrito {
  idItem: string;
  producto: Producto;
  talleSeleccionado: string;
  colorSeleccionado: ColorProducto;
  cantidad: number;
}

export type MetodoPago = 'pasarela' | 'whatsapp';
export type EstadoPago = 'Aprobado' | 'Pendiente' | 'Acordado por WhatsApp';
export type EstadoPedido = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Pedido {
  id: string;
  numeroPedido: string;
  fecha: string; // ISO string
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  clienteDireccion: string;
  clienteCiudad: string;
  items: ItemCarrito[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  estadoPedido: EstadoPedido;
  notas?: string;
}

export interface NotificacionCliente {
  id: string;
  clienteEmail: string;
  pedidoNumero: string;
  fecha: string;
  titulo: string;
  mensaje: string;
  tipo: 'compra' | 'envio' | 'oferta' | 'sistema';
  leida: boolean;
}

export interface VentaDiaria {
  fecha: string; // YYYY-MM-DD
  diaNombre: string;
  totalVentas: number;
  montoTotal: number;
  cantidadProductos: number;
}

export interface ReporteMensual {
  mes: string;
  anio: number;
  totalIngresos: number;
  totalPedidos: number;
  ticketPromedio: number;
  productoMasVendido: string;
  ventasPorCategoria: {
    categoria: CategoriaProducto;
    monto: number;
    porcentaje: number;
  }[];
}
