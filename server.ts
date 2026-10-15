import express from 'express';
import path from 'path';
import crypto from 'crypto';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { PRODUCTOS_INICIALES } from './src/data/productosIniciales';
import { Producto, Pedido, NotificacionCliente, VentaDiaria, ItemCarrito } from './src/types';
import { calcularCostoEnvio } from './src/config';

/**
 * Servidor Backend Principal de Margarita Indumentaria
 * Maneja la gestión de inventario en tiempo real, procesamiento de pedidos,
 * notificaciones a clientes y estadísticas de ventas para el panel de administración.
 */
async function iniciarServidor() {
  const app = express();
  const PUERTO = 3000;

  app.use(express.json());

  // Base de Datos en Memoria (Sincronizada en tiempo real)
  let productosDB: Producto[] = [...PRODUCTOS_INICIALES];
  
  // Pedidos y notificaciones reales (arrancan vacíos: sin datos de demostración).
  // ⚠️ Siguen guardándose en memoria: se pierden si el servidor se reinicia.
  // Próximo paso: conectar una base de datos.
  let pedidosDB: Pedido[] = [];
  let notificacionesDB: NotificacionCliente[] = [];

  // ==========================================
  // AUTENTICACIÓN DEL PANEL DE ADMINISTRACIÓN
  // ==========================================
  // La contraseña se define en la variable de entorno ADMIN_PASSWORD (archivo .env).
  // Si no está definida, el panel queda deshabilitado.
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
  const DURACION_SESION_MS = 1000 * 60 * 60 * 12; // 12 horas
  const sesionesAdmin = new Map<string, number>(); // token -> vencimiento

  if (!ADMIN_PASSWORD) {
    console.warn('[Margarita Servidor] ADMIN_PASSWORD no está definida: el panel de administración está deshabilitado.');
  }

  const compararSeguro = (a: string, b: string) => {
    const ha = crypto.createHash('sha256').update(a).digest();
    const hb = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
  };

  const requiereAdmin: express.RequestHandler = (req, res, next) => {
    const encabezado = req.headers.authorization || '';
    const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : '';
    const vence = token ? sesionesAdmin.get(token) : undefined;
    if (!vence || vence < Date.now()) {
      if (token) sesionesAdmin.delete(token);
      return res.status(401).json({ exito: false, mensaje: 'Sesión de administrador inválida o vencida.' });
    }
    next();
  };

  // Freno simple contra intentos repetidos de contraseña
  const intentosFallidos = new Map<string, { cantidad: number; hasta: number }>();

  app.post('/api/admin/login', (req, res) => {
    if (!ADMIN_PASSWORD) {
      return res.status(503).json({ exito: false, mensaje: 'El panel de administración no está configurado (falta ADMIN_PASSWORD).' });
    }
    const ip = req.ip || 'desconocida';
    const registro = intentosFallidos.get(ip);
    if (registro && registro.cantidad >= 5 && registro.hasta > Date.now()) {
      return res.status(429).json({ exito: false, mensaje: 'Demasiados intentos. Probá de nuevo en unos minutos.' });
    }

    const { password } = req.body || {};
    if (typeof password !== 'string' || !compararSeguro(password, ADMIN_PASSWORD)) {
      const cantidad = (registro && registro.hasta > Date.now() ? registro.cantidad : 0) + 1;
      intentosFallidos.set(ip, { cantidad, hasta: Date.now() + 1000 * 60 * 10 });
      return res.status(401).json({ exito: false, mensaje: 'Contraseña incorrecta.' });
    }

    intentosFallidos.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    sesionesAdmin.set(token, Date.now() + DURACION_SESION_MS);
    res.json({ exito: true, token });
  });

  app.post('/api/admin/logout', requiereAdmin, (req, res) => {
    const token = (req.headers.authorization || '').slice(7);
    sesionesAdmin.delete(token);
    res.json({ exito: true });
  });

  // ==========================================
  // RUTAS DE LA API (API ENDPOINTS EN ESPAÑOL)
  // ==========================================

  // 1. Obtener lista completa de productos (Inventario)
  app.get('/api/productos', (req, res) => {
    res.json({ exito: true, productos: productosDB });
  });

  // 2. Cargar nuevo producto (Gestión de Inventario Admin)
  app.post('/api/productos', requiereAdmin, (req, res) => {
    try {
      const nuevoProdData: Omit<Producto, 'id'> = req.body;
      const idUnico = 'prod-' + Date.now();
      const nuevoProducto: Producto = {
        ...nuevoProdData,
        id: idUnico,
        sku: nuevoProdData.sku || `MAR-${Math.floor(1000 + Math.random() * 9000)}`,
        esNuevo: true
      };
      
      productosDB.unshift(nuevoProducto);
      res.status(201).json({
        exito: true,
        mensaje: 'Producto creado correctamente y añadido al inventario.',
        producto: nuevoProducto
      });
    } catch (error) {
      res.status(400).json({ exito: false, mensaje: 'Error al crear el producto.' });
    }
  });

  // 3. Actualizar producto o modificar stock en tiempo real
  app.put('/api/productos/:id', requiereAdmin, (req, res) => {
    const { id } = req.params;
    const indice = productosDB.findIndex(p => p.id === id);

    if (indice === -1) {
      return res.status(404).json({ exito: false, mensaje: 'Producto no encontrado.' });
    }

    productosDB[indice] = { ...productosDB[indice], ...req.body };
    res.json({
      exito: true,
      mensaje: 'Inventario actualizado en tiempo real.',
      producto: productosDB[indice]
    });
  });

  // 3b. Actualización masiva de precios por categoría principal y subcategoría
  app.post('/api/productos/actualizacion-masiva', requiereAdmin, (req, res) => {
    try {
      const {
        categoria,
        subcategoria,
        tipoOperacion,
        valor,
        redondeo
      } = req.body;

      let cantidadActualizados = 0;

      productosDB = productosDB.map(p => {
        const coincideCategoria = !categoria || categoria === 'Todas' || p.categoria === categoria;
        const coincideSubcategoria = !subcategoria || subcategoria === 'Todas' || p.subcategoria === subcategoria;

        if (coincideCategoria && coincideSubcategoria) {
          cantidadActualizados++;
          let nuevoPrecio = p.precio;

          if (tipoOperacion === 'aumento_porcentaje') {
            nuevoPrecio = p.precio * (1 + Number(valor) / 100);
          } else if (tipoOperacion === 'descuento_porcentaje') {
            nuevoPrecio = p.precio * (1 - Number(valor) / 100);
          } else if (tipoOperacion === 'aumento_monto') {
            nuevoPrecio = p.precio + Number(valor);
          } else if (tipoOperacion === 'descuento_monto') {
            nuevoPrecio = Math.max(0, p.precio - Number(valor));
          } else if (tipoOperacion === 'fijar_precio') {
            nuevoPrecio = Number(valor);
          }

          if (redondeo === '100') {
            nuevoPrecio = Math.round(nuevoPrecio / 100) * 100;
          } else if (redondeo === '500') {
            nuevoPrecio = Math.round(nuevoPrecio / 500) * 500;
          } else if (redondeo === '1000') {
            nuevoPrecio = Math.round(nuevoPrecio / 1000) * 1000;
          } else {
            nuevoPrecio = Math.round(nuevoPrecio);
          }

          return {
            ...p,
            precio: Math.max(100, nuevoPrecio)
          };
        }
        return p;
      });

      res.json({
        exito: true,
        mensaje: `Precios actualizados masivamente para ${cantidadActualizados} productos.`,
        cantidadActualizados,
        productos: productosDB
      });
    } catch (error) {
      res.status(400).json({ exito: false, mensaje: 'Error al procesar actualización masiva.' });
    }
  });

  // 4. Eliminar producto del catálogo
  app.delete('/api/productos/:id', requiereAdmin, (req, res) => {
    const { id } = req.params;
    productosDB = productosDB.filter(p => p.id !== id);
    res.json({ exito: true, mensaje: 'Producto eliminado del catálogo.' });
  });

  // 5. Obtener historial de pedidos
  app.get('/api/pedidos', requiereAdmin, (req, res) => {
    res.json({ exito: true, pedidos: pedidosDB });
  });

  // 6. Procesar nuevo pedido (público). Los precios y totales se recalculan
  //    acá con los datos del servidor: nunca se confía en lo que manda el navegador.
  app.post('/api/pedidos', (req, res) => {
    try {
      const {
        clienteNombre,
        clienteEmail,
        clienteTelefono,
        clienteDireccion,
        clienteCiudad,
        items,
        notas
      } = req.body || {};

      const texto = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ exito: false, mensaje: 'El carrito de compras está vacío.' });
      }
      if (!texto(clienteNombre) || !texto(clienteTelefono) || !texto(clienteDireccion)) {
        return res.status(400).json({ exito: false, mensaje: 'Faltan datos del cliente.' });
      }

      // Armar los ítems con el producto y precio reales del catálogo
      const itemsValidados: ItemCarrito[] = [];
      for (const item of items) {
        const prod = productosDB.find(p => p.id === item?.producto?.id);
        const cantidad = Math.floor(Number(item?.cantidad));
        if (!prod || !Number.isFinite(cantidad) || cantidad < 1 || cantidad > 50) {
          return res.status(400).json({ exito: false, mensaje: 'Hay un producto inválido en el carrito.' });
        }
        if (prod.stock < cantidad) {
          return res.status(409).json({ exito: false, mensaje: `No hay stock suficiente de "${prod.nombre}".` });
        }
        const talle = prod.talles.includes(item.talleSeleccionado) ? item.talleSeleccionado : (prod.talles[0] || 'Único');
        const color = prod.colores.find(c => c.nombre === item?.colorSeleccionado?.nombre) || prod.colores[0] || { nombre: 'Único', hex: '#FAF9F6' };
        itemsValidados.push({
          idItem: `${prod.id}-${talle}-${color.nombre}`,
          producto: prod,
          talleSeleccionado: talle,
          colorSeleccionado: color,
          cantidad
        });
      }

      const subtotal = itemsValidados.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
      const costoEnvio = calcularCostoEnvio(subtotal);
      const total = subtotal + costoEnvio;

      // Descontar inventario
      itemsValidados.forEach(item => {
        item.producto.stock = Math.max(0, item.producto.stock - item.cantidad);
      });

      const proximoNumero = 100 + pedidosDB.length + 1;
      const numeroPedido = `MAG-${proximoNumero}`;

      const nuevoPedido: Pedido = {
        id: 'ped-' + Date.now(),
        numeroPedido,
        fecha: new Date().toISOString(),
        clienteNombre: texto(clienteNombre),
        clienteEmail: texto(clienteEmail),
        clienteTelefono: texto(clienteTelefono, 40),
        clienteDireccion: texto(clienteDireccion),
        clienteCiudad: texto(clienteCiudad, 80),
        items: itemsValidados,
        subtotal,
        costoEnvio,
        total,
        // El pago online todavía no está integrado: todos los pedidos se coordinan por WhatsApp.
        metodoPago: 'whatsapp',
        estadoPago: 'Pendiente',
        estadoPedido: 'Procesando',
        notas: texto(notas, 500)
      };

      pedidosDB.unshift(nuevoPedido);

      // Aviso interno para el panel de administración
      notificacionesDB.unshift({
        id: 'notif-' + Date.now(),
        clienteEmail: nuevoPedido.clienteEmail,
        pedidoNumero: numeroPedido,
        fecha: nuevoPedido.fecha,
        titulo: `Nuevo pedido ${numeroPedido}`,
        mensaje: `${nuevoPedido.clienteNombre} inició un pedido por $${total.toLocaleString('es-AR')} para coordinar por WhatsApp (${nuevoPedido.clienteTelefono}).`,
        tipo: 'compra',
        leida: false
      });

      // Al cliente solo se le devuelve lo necesario para armar el mensaje de WhatsApp
      res.status(201).json({
        exito: true,
        mensaje: 'Pedido registrado.',
        pedido: { numeroPedido, subtotal, costoEnvio, total }
      });
    } catch (error) {
      res.status(500).json({ exito: false, mensaje: 'Error interno al procesar el pedido.' });
    }
  });

  // 7. Actualizar estado de pedido
  app.put('/api/pedidos/:id/estado', requiereAdmin, (req, res) => {
    const { id } = req.params;
    const { estadoPedido, estadoPago } = req.body;

    const pedido = pedidosDB.find(p => p.id === id);
    if (!pedido) {
      return res.status(404).json({ exito: false, mensaje: 'Pedido no encontrado.' });
    }

    if (estadoPedido) pedido.estadoPedido = estadoPedido;
    if (estadoPago) pedido.estadoPago = estadoPago;

    // Notificar al cliente el cambio de estado
    if (estadoPedido === 'Enviado') {
      notificacionesDB.unshift({
        id: 'notif-' + Date.now(),
        clienteEmail: pedido.clienteEmail,
        pedidoNumero: pedido.numeroPedido,
        fecha: new Date().toISOString(),
        titulo: `¡Tu pedido ${pedido.numeroPedido} está en camino!`,
        mensaje: `Hola ${pedido.clienteNombre}, tu paquete ha sido despachado por Correo Argentino.`,
        tipo: 'envio',
        leida: false
      });
    }

    res.json({ exito: true, mensaje: 'Estado actualizado correctamente.', pedido });
  });

  // 8. Obtener notificaciones para clientes
  app.get('/api/notificaciones', requiereAdmin, (req, res) => {
    const { email } = req.query;
    if (email) {
      const filtradas = notificacionesDB.filter(n => n.clienteEmail.toLowerCase() === String(email).toLowerCase());
      return res.json({ exito: true, notificaciones: filtradas });
    }
    res.json({ exito: true, notificaciones: notificacionesDB });
  });

  // 9. Marcar notificación como leída
  app.post('/api/notificaciones/marcar-leida', requiereAdmin, (req, res) => {
    const { id } = req.body;
    const notif = notificacionesDB.find(n => n.id === id);
    if (notif) {
      notif.leida = true;
    }
    res.json({ exito: true });
  });

  // 10. Estadísticas detalladas de ventas diarias y resumen mensual
  app.get('/api/estadisticas', requiereAdmin, (req, res) => {
    const hoy = new Date();
    
    // Generar últimos 7 días con totales para los gráficos
    const ultimos7Dias: VentaDiaria[] = [];
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoy.getDate() - i);
      const fechaClave = d.toISOString().split('T')[0];
      const diaSemana = nombresDias[d.getDay()];

      // Los pedidos cancelados no cuentan como venta
      const pedidosDelDia = pedidosDB.filter(p => p.fecha.startsWith(fechaClave) && p.estadoPedido !== 'Cancelado');
      const montoTotal = pedidosDelDia.reduce((sum, p) => sum + p.total, 0);
      const cantidadProductos = pedidosDelDia.reduce((sum, p) => 
        sum + p.items.reduce((iSum, item) => iSum + item.cantidad, 0), 0
      );

      ultimos7Dias.push({
        fecha: fechaClave,
        diaNombre: diaSemana,
        totalVentas: pedidosDelDia.length,
        montoTotal,
        cantidadProductos
      });
    }

    const ingresosTotales = ultimos7Dias.reduce((sum, d) => sum + d.montoTotal, 0);
    const totalPedidos = ultimos7Dias.reduce((sum, d) => sum + d.totalVentas, 0);
    const ticketPromedio = totalPedidos > 0 ? Math.round(ingresosTotales / totalPedidos) : 0;

    // Alertas de stock bajo (menor o igual a stockMinimo)
    const productosStockBajo = productosDB.filter(p => p.stock <= p.stockMinimo);

    res.json({
      exito: true,
      estadisticas: {
        ingresosTotales,
        totalPedidos,
        ticketPromedio,
        ultimos7Dias,
        productosStockBajoCount: productosStockBajo.length,
        productosTotalCount: productosDB.length,
        productosStockBajo
      }
    });
  });

  // Integración de Middleware Vite para Desarrollo y archivos estáticos en Producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PUERTO, '0.0.0.0', () => {
    console.log(`[Margarita Servidor] Ejecutándose en http://localhost:${PUERTO}`);
  });
}

iniciarServidor();
