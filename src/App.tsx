import React, { useState, useEffect } from 'react';
import { Producto, ItemCarrito, Pedido, CategoriaProducto, ColorProducto } from './types';
import { Navegacion } from './components/Navegacion';
import { SeccionHero } from './components/SeccionHero';
import { TiraValores } from './components/TiraValores';
import { GrillaProductos } from './components/GrillaProductos';
import { BentoCategorias } from './components/BentoCategorias';
import { DetalleProductoModal } from './components/DetalleProductoModal';
import { CarritoDrawer, DatosCliente } from './components/CarritoDrawer';
import { PanelAdministrador } from './components/PanelAdministrador';
import { LoginAdmin } from './components/LoginAdmin';
import { SeccionNewsletter } from './components/SeccionNewsletter';
import { PiePagina } from './components/PiePagina';
import { BotonFlotanteWhatsapp } from './components/BotonFlotanteWhatsapp';
import { calcularCostoEnvio, urlWhatsApp, precioFinal } from './config';
import { prepararImagen } from './utils/imagenes';
import { coincideGenero } from './data/menu';

const CLAVE_TOKEN_ADMIN = 'margarita_admin_token';

const leerTokenGuardado = (): string | null => {
  try {
    return window.sessionStorage.getItem(CLAVE_TOKEN_ADMIN);
  } catch {
    return null;
  }
};

const guardarToken = (token: string | null) => {
  try {
    if (token) window.sessionStorage.setItem(CLAVE_TOKEN_ADMIN, token);
    else window.sessionStorage.removeItem(CLAVE_TOKEN_ADMIN);
  } catch {
    /* sin almacenamiento disponible: la sesión dura hasta recargar */
  }
};

/**
 * Aplicación Principal Margarita Indumentaria
 * Controla el estado global de productos, carrito, pedidos y administración (ruta /admin).
 * Todas las funciones y variables están nombradas en español de acuerdo a las pautas.
 */
export function App() {
  // Estados de datos obtenidos del servidor API
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Ruta actual: la tienda vive en "/" y el panel en "/admin"
  const [rutaActual, setRutaActual] = useState(window.location.pathname);
  const [tokenAdmin, setTokenAdmin] = useState<string | null>(leerTokenGuardado);
  const esRutaAdmin = rutaActual.startsWith('/admin');
  const modoAdmin = esRutaAdmin && !!tokenAdmin;

  // Estados de navegación y filtros
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaProducto | 'Todas' | 'Home'>('Home');
  const [generoActivo, setGeneroActivo] = useState<'Nena' | 'Varón' | undefined>(undefined);
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');

  // Estados del Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Estados de Modales
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [errorPedido, setErrorPedido] = useState('');

  const navegar = (ruta: string) => {
    if (window.location.pathname !== ruta) {
      window.history.pushState({}, '', ruta);
    }
    setRutaActual(ruta);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const alCambiarHistorial = () => setRutaActual(window.location.pathname);
    window.addEventListener('popstate', alCambiarHistorial);
    return () => window.removeEventListener('popstate', alCambiarHistorial);
  }, []);

  const cerrarSesionAdmin = () => {
    if (tokenAdmin) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenAdmin}` }
      }).catch(() => {});
    }
    guardarToken(null);
    setTokenAdmin(null);
    setPedidos([]);
    setEstadisticas(null);
  };

  /** fetch para rutas protegidas: agrega el token y cierra la sesión si venció. */
  const fetchAdmin = async (url: string, opciones: RequestInit = {}) => {
    const res = await fetch(url, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(opciones.headers || {}),
        Authorization: `Bearer ${tokenAdmin}`
      }
    });
    if (res.status === 401) {
      cerrarSesionAdmin();
    }
    return res.json().catch(() => ({ exito: false, mensaje: `Error del servidor (${res.status}).` }));
  };

  // 1. Cargar datos del servidor
  const cargarProductos = async () => {
    try {
      const resProd = await fetch('/api/productos').then(r => r.json());
      if (resProd.exito) setProductos(resProd.productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosAdmin = async () => {
    if (!tokenAdmin) return;
    try {
      const [resPed, resEstad] = await Promise.all([
        fetchAdmin('/api/pedidos'),
        fetchAdmin('/api/estadisticas')
      ]);
      if (resPed.exito) setPedidos(resPed.pedidos);
      if (resEstad.exito) setEstadisticas(resEstad.estadisticas);
    } catch (error) {
      console.error('Error al cargar datos de administración:', error);
    }
  };

  const cargarDatosServidor = async () => {
    await cargarProductos();
    if (modoAdmin) await cargarDatosAdmin();
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (modoAdmin) cargarDatosAdmin();
  }, [modoAdmin, tokenAdmin]);

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
        // Copia nueva del ítem (sin mutar el estado anterior; en modo estricto
        // mutarlo duplicaba la cantidad sumada)
        return prev.map((item, i) =>
          i === existeIndice ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
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

  // 5. Enviar pedido por WhatsApp (único medio de compra mientras no haya pasarela real)
  const handleEnviarWhatsApp = async (datosCliente: DatosCliente) => {
    if (carrito.length === 0) return;
    setErrorPedido('');

    // Se abre la pestaña ANTES de esperar al servidor: si se abre después,
    // los navegadores la bloquean como ventana emergente.
    const ventana = window.open('', '_blank');

    let numeroPedido = '';
    let subtotal = carrito.reduce((s, i) => s + precioFinal(i.producto) * i.cantidad, 0);
    let costoEnvio = calcularCostoEnvio(subtotal);
    let total = subtotal + costoEnvio;

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteNombre: datosCliente.nombre,
          clienteEmail: datosCliente.email,
          clienteTelefono: datosCliente.telefono,
          clienteDireccion: datosCliente.direccion,
          clienteCiudad: datosCliente.ciudad,
          notas: datosCliente.notas,
          items: carrito
        })
      }).then(r => r.json());

      if (res.exito) {
        // Usar los montos que calculó el servidor
        numeroPedido = res.pedido.numeroPedido;
        subtotal = res.pedido.subtotal;
        costoEnvio = res.pedido.costoEnvio;
        total = res.pedido.total;
      } else {
        // Problema real con el pedido (ej. sin stock): avisar y no mandar el mensaje
        ventana?.close();
        setErrorPedido(res.mensaje || 'No pudimos registrar el pedido.');
        cargarProductos();
        return;
      }
    } catch (err) {
      // Si el servidor no responde, igual dejamos que el cliente nos escriba
      console.error('No se pudo registrar el pedido en el servidor:', err);
    }

    let mensaje = numeroPedido
      ? `¡Hola Margarita Indumentaria! Quisiera confirmar el pedido *${numeroPedido}*:\n\n`
      : `¡Hola Margarita Indumentaria! Quisiera hacer este pedido:\n\n`;
    carrito.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.producto.nombre}* (Talle: ${item.talleSeleccionado}, Color: ${item.colorSeleccionado.nombre}) x${item.cantidad} - $${(precioFinal(item.producto) * item.cantidad).toLocaleString('es-AR')}\n`;
    });
    mensaje += `\n*Subtotal:* $${subtotal.toLocaleString('es-AR')}`;
    mensaje += `\n*Envío:* ${costoEnvio === 0 ? 'Gratis' : '$' + costoEnvio.toLocaleString('es-AR')}`;
    mensaje += `\n*TOTAL:* $${total.toLocaleString('es-AR')}\n`;
    mensaje += `\n*Cliente:* ${datosCliente.nombre}`;
    mensaje += `\n*Teléfono:* ${datosCliente.telefono}`;
    mensaje += `\n*Dirección:* ${[datosCliente.direccion, datosCliente.ciudad].filter(Boolean).join(', ')}`;
    if (datosCliente.notas?.trim()) {
      mensaje += `\n*Notas:* ${datosCliente.notas.trim()}`;
    }

    const url = urlWhatsApp(mensaje);
    if (ventana) {
      ventana.location.href = url;
    } else {
      window.location.href = url;
    }

    setCarrito([]);
    setCarritoAbierto(false);
    cargarProductos();
  };

  // 8. Funciones de Administración en Tiempo Real
  const handleCrearProducto = async (nuevoProd: Omit<Producto, 'id'>): Promise<boolean> => {
    try {
      const res = await fetchAdmin('/api/productos', {
        method: 'POST',
        body: JSON.stringify(nuevoProd)
      });

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const handleSubirImagen = async (archivo: File): Promise<string> => {
    const datos = await prepararImagen(archivo);
    const res = await fetchAdmin('/api/admin/imagenes', {
      method: 'POST',
      body: JSON.stringify({ datos })
    });
    if (!res.exito || !res.url) throw new Error(res.mensaje || 'No se pudo subir la foto.');
    return res.url;
  };

  const handleActualizarStockProducto = async (id: string, nuevoStock: number): Promise<boolean> => {
    try {
      const res = await fetchAdmin(`/api/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: nuevoStock })
      });

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
      const res = await fetchAdmin(`/api/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos)
      });

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
      const res = await fetchAdmin(`/api/productos/${id}`, { method: 'DELETE' });
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
      const res = await fetchAdmin(`/api/pedidos/${idPedido}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estadoPedido })
      });

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
      const res = await fetchAdmin('/api/productos/actualizacion-masiva', {
        method: 'POST',
        body: JSON.stringify(datos)
      });

      if (res.exito) {
        cargarDatosServidor();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  /** Selección desde el menú: categoría, y opcionalmente Nena/Varón y tipo de prenda. */
  const seleccionarCategoria = (
    categoria: CategoriaProducto | 'Todas' | 'Home',
    genero?: 'Nena' | 'Varón',
    subcategoria?: string
  ) => {
    setCategoriaActiva(categoria);
    setGeneroActivo(genero);
    setSubcategoriaActiva(subcategoria);
    setBusqueda('');
    if (esRutaAdmin) navegar('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrado por búsqueda, Nena/Varón y tipo de prenda (la categoría la filtra la grilla)
  const textoBusqueda = busqueda.trim().toLowerCase();
  const productosFiltradosBusqueda = productos.filter(p => {
    if (!coincideGenero(p, generoActivo)) return false;
    if (subcategoriaActiva && p.subcategoria !== subcategoriaActiva) return false;
    if (!textoBusqueda) return true;
    return [p.nombre, p.categoria, p.subcategoria, p.genero, p.descripcion]
      .some(campo => (campo || '').toLowerCase().includes(textoBusqueda));
  });

  const tituloCatalogo =
    categoriaActiva === 'Home' || categoriaActiva === 'Todas'
      ? undefined
      : [subcategoriaActiva || categoriaActiva, generoActivo].filter(Boolean).join(' · ');

  const cantidadTotalCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#fff8f4] font-body text-[#1e1b19] flex flex-col justify-between selection:bg-[#D9B99B]/30">
      {/* 1. Encabezado de Navegación */}
      <Navegacion
        categoriaActiva={categoriaActiva}
        generoActivo={generoActivo}
        subcategoriaActiva={subcategoriaActiva}
        alSeleccionarCategoria={seleccionarCategoria}
        cantidadCarrito={cantidadTotalCarrito}
        alAbrirCarrito={() => setCarritoAbierto(true)}
        modoAdmin={modoAdmin}
        alSalirAdmin={() => {
          cerrarSesionAdmin();
          navegar('/');
        }}
        busqueda={busqueda}
        alCambiarBusqueda={(texto) => {
          setBusqueda(texto);
          if (esRutaAdmin) navegar('/');
        }}
      />

      {/* Vista condicional: Tienda vs Panel Administrador (/admin) */}
      {esRutaAdmin && !tokenAdmin ? (
        <main className="flex-1 flex">
          <LoginAdmin
            alIngresar={(token) => {
              guardarToken(token);
              setTokenAdmin(token);
            }}
            alVolverATienda={() => navegar('/')}
          />
        </main>
      ) : modoAdmin ? (
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
            alSubirImagen={handleSubirImagen}
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
                alVerHistoria={() => seleccionarCategoria('Bebé Otoño-Invierno')}
              />
              <TiraValores />
              <BentoCategorias
                alSeleccionarCategoria={(cat) => seleccionarCategoria(cat)}
              />
            </>
          )}

          {/* 3. Grilla Principal de Productos y Filtros */}
          <div id="catalogo">
            {cargando ? (
              <p className="text-center text-sm text-[#80756b] py-16">Cargando productos…</p>
            ) : (
              <GrillaProductos
                productos={productosFiltradosBusqueda}
                categoriaSeleccionada={categoriaActiva}
                titulo={tituloCatalogo}
                alSeleccionarProducto={(prod) => setProductoSeleccionado(prod)}
                alAgregarAlCarrito={(prod, talle, e) => {
                  e.stopPropagation();
                  handleAgregarAlCarrito(prod, talle, prod.colores[0], 1);
                }}
              />
            )}
          </div>

          {/* 4. Sección de Newsletter */}
          <SeccionNewsletter />
        </main>
      )}

      {/* 5. Pie de Página */}
      <PiePagina
        alSeleccionarCategoria={(cat) => seleccionarCategoria(cat)}
      />

      {/* 6. Botón Flotante de WhatsApp (solo en la tienda) */}
      {!esRutaAdmin && <BotonFlotanteWhatsapp />}

      {/* 7. Modal Vista de Detalle de Producto.
          La "key" hace que talle, color y foto se reinicien al cambiar de producto. */}
      {productoSeleccionado && (
        <DetalleProductoModal
          key={productoSeleccionado.id}
          producto={productoSeleccionado}
          alCerrar={() => setProductoSeleccionado(null)}
          alAgregarAlCarrito={handleAgregarAlCarrito}
          productosRelacionados={[
            // Primero los de la misma categoría, después el resto
            ...productos.filter(p => p.id !== productoSeleccionado.id && p.categoria === productoSeleccionado.categoria),
            ...productos.filter(p => p.id !== productoSeleccionado.id && p.categoria !== productoSeleccionado.categoria)
          ]}
          alSeleccionarProductoRelacionado={(p) => setProductoSeleccionado(p)}
        />
      )}

      {/* 8. Carrito Drawer */}
      {carritoAbierto && (
        <CarritoDrawer
          abierto={carritoAbierto}
          alCerrar={() => {
            setCarritoAbierto(false);
            setErrorPedido('');
          }}
          items={carrito}
          alActualizarCantidad={handleActualizarCantidadCarrito}
          alEliminarItem={handleEliminarItemCarrito}
          alEnviarWhatsApp={handleEnviarWhatsApp}
          errorPedido={errorPedido}
        />
      )}
    </div>
  );
}

export default App;
