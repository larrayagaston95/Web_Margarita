import React, { useState, useEffect } from 'react';
import { 
  Producto, ItemCarrito, Pedido, NotificacionCliente, 
  CategoriaProducto, ColorProducto 
} from './types';
import { Navegacion } from './components/Navegacion';
import { SeccionHero } from './components/SeccionHero';
import { TiraValores } from './components/TiraValores';
import { GrillaProductos } from './components/GrillaProductos';
import { BentoCategorias } from './components/BentoCategorias';
import { DetalleProductoModal } from './components/DetalleProductoModal';
import { CarritoDrawer, DatosCliente } from './components/CarritoDrawer';
import { ModalPagoPasarela } from './components/ModalPagoPasarela';
import { ModalNotificacionesCliente } from './components/ModalNotificacionesCliente';
import { PanelAdministrador } from './components/PanelAdministrador';
import { SeccionNewsletter } from './components/SeccionNewsletter';
import { PiePagina } from './components/PiePagina';
import { BotonFlotanteWhatsapp } from './components/BotonFlotanteWhatsapp';

/**
 * Aplicación Principal Margarita Indumentaria
 * Controla el estado global de productos, carrito, pedidos, notificaciones y administración.
 * Todas las funciones y variables están nombradas en español de acuerdo a las pautas.
 */
export function App() {
  // Estados de datos obtenidos del servidor API
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionCliente[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Estados de navegación y filtros
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaProducto | 'Todas' | 'Home'>('Home');
  const [busqueda, setBusqueda] = useState('');
  const [modoAdmin, setModoAdmin] = useState(false);

  // Estados del Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Estados de Modales
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [modalNotificacionesAbierto, setModalNotificacionesAbierto] = useState(false);
  const [datosClienteCheckout, setDatosClienteCheckout] = useState<DatosCliente | null>(null);

  // 1. Cargar datos iniciales del servidor Backend
  const cargarDatosServidor = async () => {
    try {
      const [resProd, resPed, resNotif, resEstad] = await Promise.all([
        fetch('/api/productos').then(r => r.json()),
        fetch('/api/pedidos').then(r => r.json()),
        fetch('/api/notificaciones').then(r => r.json()),
        fetch('/api/estadisticas').then(r => r.json())
      ]);

      if (resProd.exito) setProductos(resProd.productos);
      if (resPed.exito) setPedidos(resPed.pedidos);
      if (resNotif.exito) setNotificaciones(resNotif.notificaciones);
      if (resEstad.exito) setEstadisticas(resEstad.estadisticas);
    } catch (error) {
      console.error('Error al conectar con la base de datos backend:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosServidor();
  }, []);

  // 2. Agregar ítem al carrito
  const handleAgregarAlCarrito = (
    producto: Producto,
    talle: string,
    color?: ColorProducto,
    cantidad: number = 1
  ) => {
    const colorFinal = color || producto.colores[0] || { nombre: 'Crudo Natural', hex: '#FAF9F6' };
    const idItem = `${producto.id}-${talle}-${colorFinal.nombre}`;

    setCarrito(prev => {
      const existeIndice = prev.findIndex(item => item.idItem === idItem);
      if (existeIndice > -1) {
        const nuevoCarrito = [...prev];
        nuevoCarrito[existeIndice].cantidad += cantidad;
        return nuevoCarrito;
      }
      return [
        ...prev,
        {
          idItem,
          producto,
          talleSeleccionado: talle,
          colorSeleccionado: colorFinal,
          cantidad
        }
      ];
    });

    setCarritoAbierto(true);
  };

  // 3. Modificar cantidad en carrito
  const handleActualizarCantidadCarrito = (idItem: string, delta: number) => {
    setCarrito(prev =>
      prev
        .map(item => {
          if (item.idItem === idItem) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrito[]
    );
  };

  // 4. Eliminar ítem del carrito
  const handleEliminarItemCarrito = (idItem: string) => {
    setCarrito(prev => prev.filter(item => item.idItem !== idItem));
  };

  // 5. Iniciar proceso de pago por Pasarela Simulada
  const handleIniciarPagoPasarela = (datosCliente: DatosCliente) => {
    setDatosClienteCheckout(datosCliente);
    setModalPagoAbierto(true);
  };

  // 6. Confirmar compra por Pasarela (Actualiza inventario en servidor)
  const handleConfirmarPagoPasarela = async (detallesTarjeta: any): Promise<Pedido | null> => {
    if (!datosClienteCheckout || carrito.length === 0) return null;

    const subtotal = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
    const costoEnvio = subtotal >= 50000 ? 0 : 2800;
    const total = subtotal + costoEnvio;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datosClienteCheckout,
          items: carrito,
          subtotal,
          costoEnvio,
          total,
          metodoPago: 'pasarela'
        })
      }).then(r => r.json());

      if (res.exito) {
        setCarrito([]); // Vaciar carrito
        cargarDatosServidor(); // Recargar inventario y notificaciones
        return res.pedido;
      }
    } catch (err) {
      console.error('Error al procesar pago por pasarela:', err);
    }
    return null;
  };

  // 7. Enviar pedido por WhatsApp directamente con mensaje acordado
  const handleEnviarWhatsApp = async (datosCliente: DatosCliente) => {
    const subtotal = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
    const costoEnvio = subtotal >= 50000 ? 0 : 2800;
    const total = subtotal + costoEnvio;

    try {
      // Registrar pedido en servidor
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datosCliente,
          items: carrito,
          subtotal,
          costoEnvio,
          total,
          metodoPago: 'whatsapp'
        })
      }).then(r => r.json());

      if (res.exito) {
        const numeroPedido = res.pedido.numeroPedido;

        // Construir mensaje detallado de WhatsApp
        let mensaje = `¡Hola Margarita Indumentaria! Quisiera confirmar el pedido *${numeroPedido}*:\n\n`;
        carrito.forEach((item, index) => {
          mensaje += `${index + 1}. *${item.producto.nombre}* (Talle: ${item.talleSeleccionado}, Color: ${item.colorSeleccionado.nombre}) x${item.cantidad} - $${(item.producto.precio * item.cantidad).toLocaleString('es-AR')}\n`;
        });
        mensaje += `\n*Subtotal:* $${subtotal.toLocaleString('es-AR')}`;
        mensaje += `\n*Envío:* $${costoEnvio.toLocaleString('es-AR')}`;
        mensaje += `\n*TOTAL A ACORDAR:* $${total.toLocaleString('es-AR')}\n`;
        mensaje += `\n*Cliente:* ${datosCliente.nombre}`;
        mensaje += `\n*Teléfono:* ${datosCliente.telefono}`;
        mensaje += `\n*Dirección:* ${datosCliente.direccion}, ${datosCliente.ciudad}`;

        const urlWhatsApp = `https://wa.me/541145891234?text=${encodeURIComponent(mensaje)}`;

        setCarrito([]);
        setCarritoAbierto(false);
        cargarDatosServidor();

        // Abrir WhatsApp en nueva pestaña
        window.open(urlWhatsApp, '_blank');
      }
    } catch (err) {
      console.error('Error al enviar pedido por WhatsApp:', err);
    }
  };

  // 8. Funciones de Administración en Tiempo Real
  const handleCrearProducto = async (nuevoProd: Omit<Producto, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProd)
      }).then(r => r.json());

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleActualizarStockProducto = async (id: string, nuevoStock: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
      }).then(r => r.json());

      if (res.exito) {
        setProductos(prev => prev.map(p => p.id === id ? { ...p, stock: nuevoStock } : p));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleEditarProducto = async (id: string, datos: Partial<Producto>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      }).then(r => r.json());

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleEliminarProducto = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' }).then(r => r.json());
      if (res.exito) {
        setProductos(prev => prev.filter(p => p.id !== id));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleCambiarEstadoPedido = async (idPedido: string, estadoPedido: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/pedidos/${idPedido}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estadoPedido })
      }).then(r => r.json());

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleActualizarMasivoPrecios = async (datos: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/productos/actualizacion-masiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      }).then(r => r.json());

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleMarcarNotificacionLeida = async (idNotif: string) => {
    await fetch('/api/notificaciones/marcar-leida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: idNotif })
    });
    setNotificaciones(prev => prev.map(n => n.id === idNotif ? { ...n, leida: true } : n));
  };

  // Filtrado de búsqueda de productos
  const productosFiltradosBusqueda = productos.filter(p => {
    if (!busqueda.trim()) return true;
    return (
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  const cantidadTotalCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen bg-[#fff8f4] font-body text-[#1e1b19] flex flex-col justify-between selection:bg-[#D9B99B]/30">
      {/* 1. Encabezado de Navegación */}
      <Navegacion
        categoriaActiva={categoriaActiva}
        alSeleccionarCategoria={(cat) => {
          setCategoriaActiva(cat);
          setModoAdmin(false);
        }}
        cantidadCarrito={cantidadTotalCarrito}
        alAbrirCarrito={() => setCarritoAbierto(true)}
        modoAdmin={modoAdmin}
        alCambiarModoAdmin={setModoAdmin}
        alAbrirNotificaciones={() => setModalNotificacionesAbierto(true)}
        notificacionesNoLeidas={notificacionesNoLeidas}
        busqueda={busqueda}
        alCambiarBusqueda={setBusqueda}
      />

      {/* Vista condicional: Modo Tienda Cliente vs Panel Administrador */}
      {modoAdmin ? (
        <main className="flex-1">
          <PanelAdministrador
            productos={productos}
            pedidos={pedidos}
            estadisticas={estadisticas}
            alCrearProducto={handleCrearProducto}
            alActualizarStockProducto={handleActualizarStockProducto}
            alEditarProducto={handleEditarProducto}
            alEliminarProducto={handleEliminarProducto}
            alCambiarEstadoPedido={handleCambiarEstadoPedido}
            alActualizarMasivoPrecios={handleActualizarMasivoPrecios}
            alRecargarDatos={cargarDatosServidor}
          />
        </main>
      ) : (
        <main className="flex-1 space-y-4">
          {/* 2. Banner Principal Hero (Solo en Home sin búsqueda activa) */}
          {categoriaActiva === 'Home' && !busqueda && (
            <>
              <SeccionHero
                alVerCatalogo={() => {
                  const elem = document.getElementById('catalogo');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                alVerHistoria={() => {
                  setCategoriaActiva('Bebé Otoño-Invierno');
                }}
              />
              <TiraValores />
              <BentoCategorias
                alSeleccionarCategoria={(cat) => setCategoriaActiva(cat)}
              />
            </>
          )}

          {/* 3. Grilla Principal de Productos y Filtros */}
          <div id="catalogo">
            <GrillaProductos
              productos={productosFiltradosBusqueda}
              categoriaSeleccionada={categoriaActiva}
              alSeleccionarProducto={(prod) => setProductoSeleccionado(prod)}
              alAgregarAlCarrito={(prod, talle, e) => {
                e.stopPropagation();
                handleAgregarAlCarrito(prod, talle, prod.colores[0], 1);
              }}
            />
          </div>

          {/* 4. Sección de Newsletter */}
          <SeccionNewsletter />
        </main>
      )}

      {/* 5. Pie de Página */}
      <PiePagina
        alSeleccionarCategoria={(cat) => {
          setCategoriaActiva(cat);
          setModoAdmin(false);
        }}
        alAbrirNotificaciones={() => setModalNotificacionesAbierto(true)}
      />

      {/* 6. Botón Flotante de WhatsApp */}
      <BotonFlotanteWhatsapp />

      {/* 7. Modal Vista de Detalle de Producto */}
      <DetalleProductoModal
        producto={productoSeleccionado}
        alCerrar={() => setProductoSeleccionado(null)}
        alAgregarAlCarrito={handleAgregarAlCarrito}
        productosRelacionados={productos.filter(p => p.id !== productoSeleccionado?.id)}
        alSeleccionarProductoRelacionado={(p) => setProductoSeleccionado(p)}
      />

      {/* 8. Carrito Drawer */}
      <CarritoDrawer
        abierto={carritoAbierto}
        alCerrar={() => setCarritoAbierto(false)}
        items={carrito}
        alActualizarCantidad={handleActualizarCantidadCarrito}
        alEliminarItem={handleEliminarItemCarrito}
        alIniciarPagoPasarela={handleIniciarPagoPasarela}
        alEnviarWhatsApp={handleEnviarWhatsApp}
      />

      {/* 9. Modal Pasarela de Pago Simulada */}
      <ModalPagoPasarela
        abierto={modalPagoAbierto}
        alCerrar={() => {
          setModalPagoAbierto(false);
          setCarritoAbierto(false);
        }}
        items={carrito}
        datosCliente={datosClienteCheckout || {
          nombre: 'Cliente',
          email: 'cliente@ejemplo.com',
          telefono: '1122334455',
          direccion: 'Av. Cabildo 123',
          ciudad: 'CABA'
        }}
        alConfirmarPago={handleConfirmarPagoPasarela}
      />

      {/* 10. Modal Notificaciones del Cliente */}
      <ModalNotificacionesCliente
        abierto={modalNotificacionesAbierto}
        alCerrar={() => setModalNotificacionesAbierto(false)}
        notificaciones={notificaciones}
        alMarcarComoLeida={handleMarcarNotificacionLeida}
      />
    </div>
  );
}

export default App;
