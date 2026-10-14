import { Producto } from '../types';

export const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: 'prod-001',
    sku: 'BEB-OI-001',
    nombre: 'Conjunto Punto Arroz',
    categoria: 'Bebé Otoño-Invierno',
    subcategoria: 'Conjuntos & Sets',
    precio: 42500,
    stock: 14,
    stockMinimo: 5,
    talles: ['0-3m', '3-6m', '6-9m', '9-12m'],
    colores: [
      { nombre: 'Rosa Salmón', hex: '#E5989B' },
      { nombre: 'Crudo', hex: '#FAF9F6' }
    ],
    descripcion: 'Conjunto de dos piezas tejido en punto arroz de máxima suavidad con gorrito a juego. Ideal para recién nacidos.',
    composicion: '100% Algodón Hipoalergénico Orgánico Certificado',
    cuidados: 'Lavar a mano con agua fría y jabón neutro. No retorcer. Secar horizontalmente a la sombra.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida/AP1WRLuR_7rmNEBEUHNcbd8OkxRqu1eeDC3nKe_bvKARKn6CBTKHnER3i8YIvMZL7fKgg91BzEkJPfScswvCWYKRhio0Jja-vlXdB5TAks8h3_dBwFuFfeULc5d0IHN4RTIge-FQQAQmPWC89Ub_JFiDfpxzcHz4sAmGfoK-bNU0zNh6Ulrz1DCgIz_YFog43rHBFOylU0QmXJmg5-1uqXEIpcGF6c2-TPo5_LiJp56Fp6n-u0o4kQIigyUaF9Q',
    imagenesSecundarias: [
      'https://lh3.googleusercontent.com/aida/AP1WRLuR_7rmNEBEUHNcbd8OkxRqu1eeDC3nKe_bvKARKn6CBTKHnER3i8YIvMZL7fKgg91BzEkJPfScswvCWYKRhio0Jja-vlXdB5TAks8h3_dBwFuFfeULc5d0IHN4RTIge-FQQAQmPWC89Ub_JFiDfpxzcHz4sAmGfoK-bNU0zNh6Ulrz1DCgIz_YFog43rHBFOylU0QmXJmg5-1uqXEIpcGF6c2-TPo5_LiJp56Fp6n-u0o4kQIigyUaF9Q'
    ],
    esNuevo: true,
    esDestacado: true,
    calificacion: 4.9,
    resenasCount: 18
  },
  {
    id: 'prod-002',
    sku: 'BEB-PV-002',
    nombre: 'Vestido Floreado Lino',
    categoria: 'Bebé Primavera-Verano',
    subcategoria: 'Vestidos & Enteritos',
    precio: 38900,
    stock: 8,
    stockMinimo: 4,
    talles: ['3-6m', '6-9m', '9-12m', '12-18m'],
    colores: [
      { nombre: 'Verde Oliva', hex: '#6B7D68' },
      { nombre: 'Soft Clay', hex: '#D9B99B' }
    ],
    descripcion: 'Vestido y conjunto ligero confeccionado en mezcla de lino natural y algodón con estampa botánica artesanal.',
    composicion: '60% Lino Natural, 40% Algodón',
    cuidados: 'Lavar en lavarropas ciclo delicado con agua fría.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida/AP1WRLsVwg_B-EDyQBmD_PAOpx_CAYstlSXwz4zJHsHa5JyyA6DTuNh8LSr3dCEn0rSxc3o065p4qjeesVaHDwEzMr5mLKNtFQV9uF1bSJEQsDltGgoHPejRie9tbSn9pDzsanL_QYcKBlILtIS3amglf4dwNFfYac8iqOaJURS884OgM8KXhVPUStQmDwrMO0zPSWLDjCbFMqke4CdPLSQrK_UiDHxysjCYawxiWXEoIjZMyTFQ89QIx_vw66U',
    imagenesSecundarias: [],
    esNuevo: true,
    esDestacado: true,
    calificacion: 4.8,
    resenasCount: 12
  },
  {
    id: 'prod-003',
    sku: 'KID-OI-003',
    nombre: 'Sweater Kids Lana',
    categoria: 'Kids',
    subcategoria: 'Sweaters & Abrigos',
    precio: 45000,
    stock: 3, // Stock bajo para probar alertas de inventario
    stockMinimo: 5,
    talles: ['2T', '4T', '6T'],
    colores: [
      { nombre: 'Miel Canela', hex: '#B08D57' },
      { nombre: 'Beige Crudo', hex: '#FAF9F6' }
    ],
    descripcion: 'Sweater artesanal tejido con capucha y botón de madera natural, ultrasuave y súper abrigado para días de juego.',
    composicion: '80% Lana Merino Suave, 20% Dralón Hipoalergénico',
    cuidados: 'Lavar a mano únicamente. Secar extendido.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida/AP1WRLtpNhX_44DpcieFV-vPEl6_qPgg39JGFGgMqjDvUd8LQMCt4NCuLO8WG2fwqdxqtUzvPAMhR8ARrsge42O_6uQ0XGWk9vCZceH0D7ULr7VG8kpUUbm-D9K5R1Bu8qHwpz-zTAhbG7pLYLFfMojKwaHnVMw_Nts2hu5O6yTA9R1KdyDu3yRRrBwSpuxmfyeZ2lQEbZvXyHK8cuZHUY8TVB3kRzhT3epeVp727COdWNHDPpUfsv44YXSFymc',
    imagenesSecundarias: [],
    esNuevo: true,
    esDestacado: true,
    calificacion: 5.0,
    resenasCount: 24
  },
  {
    id: 'prod-004',
    sku: 'BEB-OI-004',
    nombre: 'Conjunto Algodón Estampado',
    categoria: 'Bebé Otoño-Invierno',
    subcategoria: 'Conjuntos & Sets',
    precio: 12500,
    stock: 22,
    stockMinimo: 6,
    talles: ['0-3m', '3-6m', '6-9m'],
    colores: [
      { nombre: 'Crudo Rosa', hex: '#D9B99B' },
      { nombre: 'Blanco Puro', hex: '#FFFFFF' }
    ],
    descripcion: 'Conjunto interlock de algodón peinado con broches metálicos libres de níquel para rápida muda.',
    composicion: '100% Algodón Peinado Interlock',
    cuidados: 'Apto lavarropas agua tibia.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida/AP1WRLuR_7rmNEBEUHNcbd8OkxRqu1eeDC3nKe_bvKARKn6CBTKHnER3i8YIvMZL7fKgg91BzEkJPfScswvCWYKRhio0Jja-vlXdB5TAks8h3_dBwFuFfeULc5d0IHN4RTIge-FQQAQmPWC89Ub_JFiDfpxzcHz4sAmGfoK-bNU0zNh6Ulrz1DCgIz_YFog43rHBFOylU0QmXJmg5-1uqXEIpcGF6c2-TPo5_LiJp56Fp6n-u0o4kQIigyUaF9Q',
    imagenesSecundarias: [],
    esNuevo: false,
    esDestacado: true,
    calificacion: 4.7,
    resenasCount: 9
  },
  {
    id: 'prod-005',
    sku: 'ACC-005',
    nombre: 'Zapatitos Tejidos Sage',
    categoria: 'Accesorios',
    subcategoria: 'Accesorios & Calzado',
    precio: 2500,
    stock: 18,
    stockMinimo: 5,
    talles: ['0-3m', '3-6m'],
    colores: [
      { nombre: 'Sage Green', hex: '#6B7D68' },
      { nombre: 'Arcilla', hex: '#D9B99B' }
    ],
    descripcion: 'Escarpines o zapatitos tejidos a mano con cordón de ajuste para que no se salgan del piecito.',
    composicion: '100% Hilado de Algodón Hipoalergénico',
    cuidados: 'Lavar a mano.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD64VanyhK3wvMXFhSwW0s7ovBbiPNaRW1biwv6P1rwxnNwD6XZrBDTip-1ctF2QL0Juf1LXX9WAIl5TpYWppPSZvp1L2CKka3q8MLO9z-TVxmYf4KKP0I9IbaaQ5vivERlFK4WU7stueKiAAuqA5qkoljApOjnp3RTePDZjuoIMgZYgul2jSS4egltjzZgB86YPRhOsK4N7k871RiexzUglaJmrBnf5G3W54rhqqJPMi6kKwuA6ZJk',
    imagenesSecundarias: [],
    esNuevo: false,
    esDestacado: true,
    calificacion: 4.9,
    resenasCount: 31
  },
  {
    id: 'prod-006',
    sku: 'ACC-006',
    nombre: 'Manta Wavy Clay',
    categoria: 'Accesorios',
    subcategoria: 'Accesorios & Calzado',
    precio: 4200,
    stock: 10,
    stockMinimo: 3,
    talles: ['0-3m', '3-6m', '6-9m', '9-12m'],
    colores: [
      { nombre: 'Clay & Cream', hex: '#C4A484' }
    ],
    descripcion: 'Manta acolchada con delicadas ondas en relief. Tamaño 90x110 cm ideal para cuna o cochecito.',
    composicion: '50% Lana Merino, 50% Algodón',
    cuidados: 'Lavar en ciclo delicado.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJE2-hYMnHNxuNbKMp_nUWfr0nbIg8vtBQUiT5EALZ0t1SDsUIN2cz-uBPSIg6cOe_YpuSx3KlAQ62rVUH_n-3FnO7yc8ACw2OueJUC4x9IMhBb7oNkRwiYg1-vgdJX7Q6nw9gRl8empgLI6nj8CP9LHKwe5SgDVnPJeVjcNQLiaasMUOrHbPEDJlm5l7x2cn8-s4QuO_jMbTLDQwu2HMTTxi1GsVCI_F2hCao3gpbKUJkDl2VbNfc',
    imagenesSecundarias: [],
    esNuevo: false,
    esDestacado: true,
    calificacion: 5.0,
    resenasCount: 15
  },
  {
    id: 'prod-007',
    sku: 'BEB-OI-007',
    nombre: 'Pack Bodys Tierra',
    categoria: 'Bebé Otoño-Invierno',
    subcategoria: 'Bodys & Básicos',
    precio: 6800,
    stock: 2, // Alerta stock bajo
    stockMinimo: 5,
    talles: ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m'],
    colores: [
      { nombre: 'Tonalidades Tierra', hex: '#B08D57' }
    ],
    descripcion: 'Pack de 3 bodys mangas largas con cuello americano y broches inferiores. Colores terracota, sage y arena.',
    composicion: '100% Algodón Orgánico',
    cuidados: 'Lavar con agua fría.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwKcwv9lUiu-XsmT5OnixXW8S_8eeHRx5Asknf4jYBe5BPm4A_3NgNPAFxT7CiSumplzMtA3NOJn3iXqhEGVkISklM9N6r3iGCimCQ13GtjPMtumzx7XpfPaP6r134ZDcp52ChadiTL4WmxaRK1ZWCJygD9tHLw0nvspM7xcy1YEgm5_Ncp2GGngVcPFOlgEabmZVFLBUKyW6nt5KKGTlkFhJAcCtIt8FmgxFGMYFqV5aJ91uO7a5S',
    imagenesSecundarias: [],
    esNuevo: false,
    esDestacado: false,
    calificacion: 4.8,
    resenasCount: 22
  },
  {
    id: 'prod-008',
    sku: 'ACC-008',
    nombre: 'Gorrito Nudo Algodón',
    categoria: 'Accesorios',
    subcategoria: 'Accesorios & Calzado',
    precio: 1800,
    stock: 25,
    stockMinimo: 5,
    talles: ['0-3m', '3-6m'],
    colores: [
      { nombre: 'Crudo', hex: '#FAF9F6' },
      { nombre: 'Tostado', hex: '#C4A484' }
    ],
    descripcion: 'Gorrito con nudo regulable para ajustar a medida que el bebé crece. Súper suave y cómodo.',
    composicion: '100% Algodón Rib Hipoalergénico',
    cuidados: 'Lavar con colores similares.',
    imagenPrincipal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp-PpQnjA8AG8UYuMYmhimfMgaw3M_Fn8D60t_9McIJi6nJ8pvx4AqCezbr0kuYnDkZfn2PMzn5PS51WwAHqBcmS2rQOuJO5FgH-ceCHqEVQ8tF8z3f_VMH-RJ2FxuDiaLO5gMZ_ZMZFPunXPtU6SMwdJkAUnw2g1JplB4R_b7YYYi9uQ-W1b5oJlK0MngKDKviD1IVYq3s70Zzm9-1_AnNvKgtSH0Rp6qPPxxCImBCl3K1nF_vsEj',
    imagenesSecundarias: [],
    esNuevo: false,
    esDestacado: false,
    calificacion: 4.9,
    resenasCount: 11
  }
];
