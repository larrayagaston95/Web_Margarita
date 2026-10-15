import { CategoriaProducto, GeneroProducto, Producto } from '../types';

/**
 * Estructura del menú de la tienda (igual que margaritaindumentaria.com.ar):
 * Categoría (temporada) → Nena / Varón → Tipo de prenda.
 *
 * Para agregar o quitar un tipo de prenda, editá esta lista: el menú,
 * los filtros y el formulario del panel de administración se actualizan solos.
 */
export interface GrupoGenero {
  genero: 'Nena' | 'Varón';
  subcategorias: string[];
}

export interface CategoriaMenu {
  categoria: CategoriaProducto;
  /** Texto corto para el menú (ej. "Bebé" + "Otoño-Invierno") */
  linea: 'Bebé' | 'Kids';
  temporada: 'Otoño-Invierno' | 'Primavera-Verano';
  generos: GrupoGenero[];
}

export const ESTRUCTURA_MENU: CategoriaMenu[] = [
  {
    categoria: 'Bebé Otoño-Invierno',
    linea: 'Bebé',
    temporada: 'Otoño-Invierno',
    generos: [
      {
        genero: 'Nena',
        subcategorias: ['Body Manga Larga', 'Campera-Chaleco', 'Enteritos-Chinitos', 'Joggers', 'Leggins', 'Vestido']
      },
      {
        genero: 'Varón',
        subcategorias: ['Body Manga Larga', 'Campera-Chaleco', 'Enteritos-Chinitos', 'Joggers', 'Leggins']
      }
    ]
  },
  {
    categoria: 'Bebé Primavera-Verano',
    linea: 'Bebé',
    temporada: 'Primavera-Verano',
    generos: [
      { genero: 'Nena', subcategorias: ['Ajuar', 'Bikers-Shorts', 'Enteritos'] },
      { genero: 'Varón', subcategorias: ['Bikers-Shorts', 'Enteritos'] }
    ]
  },
  {
    categoria: 'Kids Otoño-Invierno',
    linea: 'Kids',
    temporada: 'Otoño-Invierno',
    generos: [
      { genero: 'Nena', subcategorias: ['Camperas', 'Conjuntos', 'Remera Manga Larga'] },
      { genero: 'Varón', subcategorias: ['Buzos'] }
    ]
  },
  {
    categoria: 'Kids Primavera-Verano',
    linea: 'Kids',
    temporada: 'Primavera-Verano',
    generos: [
      { genero: 'Nena', subcategorias: ['Camperas'] },
      { genero: 'Varón', subcategorias: [] }
    ]
  }
];

export const CATEGORIAS: CategoriaProducto[] = ESTRUCTURA_MENU.map(c => c.categoria);

export const GENEROS: GeneroProducto[] = ['Nena', 'Varón', 'Unisex'];

/** Todos los tipos de prenda, sin repetir y ordenados. */
export const TODAS_SUBCATEGORIAS: string[] = Array.from(
  new Set(ESTRUCTURA_MENU.flatMap(c => c.generos.flatMap(g => g.subcategorias)))
).sort((a, b) => a.localeCompare(b, 'es'));

/** Tipos de prenda disponibles para una categoría y un género (Unisex = los de ambos). */
export function subcategoriasPara(categoria: CategoriaProducto, genero?: GeneroProducto): string[] {
  const cat = ESTRUCTURA_MENU.find(c => c.categoria === categoria);
  if (!cat) return [];
  const grupos = !genero || genero === 'Unisex' ? cat.generos : cat.generos.filter(g => g.genero === genero);
  return Array.from(new Set(grupos.flatMap(g => g.subcategorias)));
}

export const TALLES_BEBE = ['0-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m'];
export const TALLES_KIDS = ['2', '4', '6', '8', '10', '12', '14'];

export function tallesPara(categoria: CategoriaProducto): string[] {
  return categoria.startsWith('Kids') ? TALLES_KIDS : TALLES_BEBE;
}

/** Un producto Unisex (o sin género cargado) aparece tanto en Nena como en Varón. */
export function coincideGenero(producto: Producto, genero?: GeneroProducto): boolean {
  if (!genero) return true;
  return !producto.genero || producto.genero === 'Unisex' || producto.genero === genero;
}
