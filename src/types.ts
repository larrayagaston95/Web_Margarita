/**
 * Definiciones de tipos para Margarita Indumentaria
 * Estructura limpia y tipada para mantener el proyecto.
 */

// La estructura completa del menú (categorías, Nena/Varón y tipos de prenda)
// está en src/data/menu.ts
export type CategoriaProducto =
  | 'Bebé Otoño-Invierno'
  | 'Bebé Primavera-Verano'
  | 'Kids Otoño-Invierno'
  | 'Kids Primavera-Verano';

export type GeneroProducto = 'Nena' | 'Varón' | 'Unisex';

/** Tipo de prenda (ej. "Joggers", "Enteritos"). Las opciones están en src/data/menu.ts */
export type SubcategoriaProducto = string;

/** Talle (ej. "0-3m" para bebé, "4" para kids). */
export type TalleBebe = string;

export interface ColorProducto {
  nombre: string;
  hex: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: CategoriaProducto;
  genero?: GeneroProducto;
  subcategoria?: SubcategoriaProducto;
  precio: number;
  /** Precio rebajado. Si es menor que "precio", es el que se cobra. */
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
