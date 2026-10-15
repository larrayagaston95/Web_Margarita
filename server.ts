import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import { PRODUCTOS_INICIALES } from './src/data/productosIniciales';
import { Producto, Pedido, NotificacionCliente, VentaDiaria, ItemCarrito } from './src/types';
import { calcularCostoEnvio, precioFinal } from './src/config';

/**
 * Servidor Backend Principal de Margarita Indumentaria
 * Maneja la gestión de inventario en tiempo real, procesamiento de pedidos,
 * notificaciones a clientes y estadísticas de ventas para el panel de administración.
 */
async function iniciarServidor() {
  const app = express();
  const PUERTO = 3000;

  // JSON chico para todas las rutas, salvo la de subida de fotos (que tiene su propio límite)
  const parserJson = express.json({ limit: '300kb' });
  app.use((req, res, next) => (req.path === '/api/admin/imagenes' ? next() : parserJson(req, res, next)));

  // ==========================================
  // ALMACENAMIENTO EN ARCHIVOS (carpeta data/)
  // ==========================================
  // Productos, pedidos y fotos se guardan en disco para que no se pierdan al
  // reiniciar el servidor. Hacé copias de seguridad de la carpeta data/.
  const DIR_DATOS = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const DIR_IMAGENES = path.join(DIR_DATOS, 'imagenes');
  fs.mkdirSync(DIR_IMAGENES, { recursive: true });

  function leerJSON<T>(archivo: string, porDefecto: T): T {
    const ruta = path.join(DIR_DATOS, archivo);
    if (!fs.existsSync(ruta)) return porDefecto;
    // Si el archivo existe pero está dañado, mejor frenar que pisarlo con datos vacíos
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  }

  function guardarJSON(archivo: string, datos: unknown) {
    const ruta = path.join(DIR_DATOS, archivo);
    const temporal = ruta + '.tmp';
    fs.writeFileSync(temporal, JSON.stringify(datos, null, 2), 'utf8');
    fs.renameSync(temporal, ruta); // reemplazo atómico: nunca queda un archivo a medio escribir
  }

  let productosDB: Producto[] = leerJSON('productos.json', PRODUCTOS_INICIALES.map(p => ({ ...p })));
  let pedidosDB: Pedido[] = leerJSON('pedidos.json', []);
  let notificacionesDB: NotificacionCliente[] = leerJSON('notificaciones.json', []);

  const guardarProductos = () => guardarJSON('productos.json', productosDB);
  const guardarPedidos = () => guardarJSON('pedidos.json', pedidosDB);
  const guardarNotificaciones = () => guardarJSON('notificaciones.json', notificacionesDB);

  if (!fs.existsSync(path.join(DIR_DATOS, 'productos.json'))) guardarProductos();

  // Fotos subidas desde el panel
  app.use('/imagenes', express.static(DIR_IMAGENES, { maxAge: '30d', fallthrough: false }));

  const NOMBRE_IMAGEN_VALIDO = /^[a-f0-9]{24}\.(jpg|png|webp)$/;

  /** Borra del disco las fotos que ya no usa ningún producto. */
  function borrarImagenesSinUso(urls: string[]) {
    const enUso = new Set(productosDB.flatMap(p => [p.imagenPrincipal, ...(p.imagenesSecundarias || [])]));
    for (const url of urls) {
      if (!url || !url.startsWith('/imagenes/') || enUso.has(url)) continue;
      const nombre = url.slice('/imagenes/'.length);
      if (!NOMBRE_IMAGEN_VALIDO.test(nombre)) continue;
      fs.promises.unlink(path.join(DIR_IMAGENES, nombre)).catch(() => {});
    }
  }

  const imagenesDe = (p?: Producto) => (p ? [p.imagenPrincipal, ...(p.imagenesSecundarias || [])] : []);

  /** Deja pasar solo los campos válidos de un producto y normaliza números. */
  function limpiarDatosProducto(cuerpo: any): Partial<Producto> {
    const campos = [
      'sku', 'nombre', 'categoria', 'genero', 'subcategoria', 'precio', 'precioOferta', 'stock',
      'stockMinimo', 'talles', 'colores', 'descripcion', 'composicion', 'cuidados',
      'imagenPrincipal', 'imagenesSecundarias', 'esNuevo', 'esDestacado'
    ];
    const datos: any = {};
    for (const campo of campos) {
      if (cuerpo && cuerpo[campo] !== undefined) datos[campo] = cuerpo[campo];
    }
    for (const campo of ['precio', 'stock', 'stockMinimo']) {
      if (campo in datos) datos[campo] = Math.max(0, Math.round(Number(datos[campo]) || 0));
    }
    if ('precioOferta' in datos) {
      const oferta = Math.round(Number(datos.precioOferta) || 0);
      datos.precioOferta = oferta > 0 ? oferta : undefined;
    }
    if ('subcategoria' in datos && !datos.subcategoria) datos.subcategoria = undefined;
    for (const campo of ['talles', 'colores', 'imagenesSecundarias']) {
      if (campo in datos && !Array.isArray(datos[campo])) datos[campo] = [];
    }
    return datos;
  }

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

  // Subida de fotos de productos (solo admin). El navegador manda la foto ya
  // achicada, como texto base64 ("data URL").
  app.post('/api/admin/imagenes', requiereAdmin, express.json({ limit: '12mb' }), (req, res) => {
    try {
      const datos = typeof req.body?.datos === 'string' ? req.body.datos : '';
      const coincidencia = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(datos);
      if (!coincidencia) {
        return res.status(400).json({ exito: false, mensaje: 'Formato de imagen no válido (usá JPG, PNG o WEBP).' });
      }
      const contenido = Buffer.from(coincidencia[2], 'base64');
      if (contenido.length === 0 || contenido.length > 8 * 1024 * 1024) {
        return res.status(413).json({ exito: false, mensaje: 'La imagen es demasiado pesada (máximo 8 MB).' });
      }
      // Verificar que el contenido sea realmente una imagen del tipo declarado
      const esJpg = contenido[0] === 0xff && contenido[1] === 0xd8;
      const esPng = contenido.subarray(0, 4).toString('hex') === '89504e47';
      const esWebp = contenido.subarray(0, 4).toString('ascii') === 'RIFF' && contenido.subarray(8, 12).toString('ascii') === 'WEBP';
      const tipo = coincidencia[1];
      if ((tipo === 'jpeg' && !esJpg) || (tipo === 'png' && !esPng) || (tipo === 'webp' && !esWebp)) {
        return res.status(400).json({ exito: false, mensaje: 'El archivo no es una imagen válida.' });
      }

      const extension = tipo === 'jpeg' ? 'jpg' : tipo;
      const nombre = `${crypto.randomBytes(12).toString('hex')}.${extension}`;
      fs.writeFileSync(path.join(DIR_IMAGENES, nombre), contenido);
      res.status(201).json({ exito: true, url: `/imagenes/${nombre}` });
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      res.status(500).json({ exito: false, mensaje: 'No se pudo guardar la imagen.' });
    }
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
      const datos = limpiarDatosProducto(req.body);
      if (!datos.nombre || !datos.categoria || !datos.imagenPrincipal) {
        return res.status(400).json({ exito: false, mensaje: 'Faltan datos obligatorios (nombre, categoría o foto).' });
      }
      const nuevoProducto: Producto = {
        stock: 0,
        stockMinimo: 0,
        precio: 0,
        talles: [],
        colores: [],
        descripcion: '',
        composicion: '',
        cuidados: '',
        imagenesSecundarias: [],
        esNuevo: true,
        ...datos,
        id: 'prod-' + Date.now(),
        sku: datos.sku || `MAR-${Math.floor(1000 + Math.random() * 9000)}`
      } as Producto;

      productosDB.unshift(nuevoProducto);
      guardarProductos();
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

    const anterior = productosDB[indice];
    productosDB[indice] = { ...anterior, ...limpiarDatosProducto(req.body), id: anterior.id };
    guardarProductos();
    borrarImagenesSinUso(imagenesDe(anterior));
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

      guardarProductos();
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
    const eliminado = productosDB.find(p => p.id === id);
    productosDB = productosDB.filter(p => p.id !== id);
    guardarProductos();
    borrarImagenesSinUso(imagenesDe(eliminado));
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

      const subtotal = itemsValidados.reduce((s, i) => s + precioFinal(i.producto) * i.cantidad, 0);
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

      guardarProductos();
      guardarPedidos();
      guardarNotificaciones();

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

    guardarPedidos();
    guardarNotificaciones();
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
      guardarNotificaciones();
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
