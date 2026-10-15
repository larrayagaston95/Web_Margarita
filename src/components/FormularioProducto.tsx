import React, { useRef, useState } from 'react';
import { X, Upload, Star, Trash2, Plus, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Producto, CategoriaProducto, GeneroProducto, ColorProducto } from '../types';
import { CATEGORIAS, GENEROS, subcategoriasPara, tallesPara } from '../data/menu';

interface FormularioProductoProps {
  /** Producto a editar, o null para cargar uno nuevo. */
  producto: Producto | null;
  alCerrar: () => void;
  alGuardar: (datos: Omit<Producto, 'id'>) => Promise<boolean>;
  /** Sube una foto y devuelve su URL. Si falla, lanza un error con el motivo. */
  alSubirImagen: (archivo: File) => Promise<string>;
}

const claseCampo =
  'w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#735a3e]';
const claseEtiqueta = 'text-sm font-semibold text-[#4e453d] block mb-1.5';

/**
 * Formulario de alta y edición de productos (estilo panel de La Puntual):
 * a la izquierda las fotos, a la derecha los datos de la prenda.
 */
export const FormularioProducto: React.FC<FormularioProductoProps> = ({
  producto,
  alCerrar,
  alGuardar,
  alSubirImagen
}) => {
  const p = producto;
  const [nombre, setNombre] = useState(p?.nombre || '');
  const [sku, setSku] = useState(p?.sku || `MAR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [categoria, setCategoria] = useState<CategoriaProducto>(p?.categoria || CATEGORIAS[0]);
  const [genero, setGenero] = useState<GeneroProducto>(p?.genero || 'Unisex');
  const [subcategoria, setSubcategoria] = useState(p?.subcategoria || '');
  const [precio, setPrecio] = useState(p ? String(p.precio) : '');
  const [precioOferta, setPrecioOferta] = useState(p?.precioOferta ? String(p.precioOferta) : '');
  const [stock, setStock] = useState(p ? String(p.stock) : '');
  const [stockMinimo, setStockMinimo] = useState(p ? String(p.stockMinimo) : '2');
  const [talles, setTalles] = useState<string[]>(p?.talles || []);
  const [colores, setColores] = useState<ColorProducto[]>(p?.colores || []);
  const [nuevoColorNombre, setNuevoColorNombre] = useState('');
  const [nuevoColorHex, setNuevoColorHex] = useState('#D9B99B');
  const [descripcion, setDescripcion] = useState(p?.descripcion || '');
  const [composicion, setComposicion] = useState(p?.composicion || '');
  const [cuidados, setCuidados] = useState(p?.cuidados || '');
  const [esNuevo, setEsNuevo] = useState(p ? !!p.esNuevo : true);
  const [esDestacado, setEsDestacado] = useState(!!p?.esDestacado);
  const [imagenes, setImagenes] = useState<string[]>(
    p ? [p.imagenPrincipal, ...(p.imagenesSecundarias || [])].filter(Boolean) : []
  );
  const [subiendo, setSubiendo] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const inputArchivos = useRef<HTMLInputElement>(null);

  const opcionesSubcategoria = subcategoriasPara(categoria, genero);
  const opcionesTalles = tallesPara(categoria);

  const cambiarCategoria = (nueva: CategoriaProducto) => {
    setCategoria(nueva);
    if (!subcategoriasPara(nueva, genero).includes(subcategoria)) setSubcategoria('');
    const tallesValidos = tallesPara(nueva);
    setTalles(prev => prev.filter(t => tallesValidos.includes(t)));
  };

  const cambiarGenero = (nuevo: GeneroProducto) => {
    setGenero(nuevo);
    if (!subcategoriasPara(categoria, nuevo).includes(subcategoria)) setSubcategoria('');
  };

  const alternarTalle = (talle: string) => {
    setTalles(prev =>
      prev.includes(talle)
        ? prev.filter(t => t !== talle)
        : opcionesTalles.filter(t => t === talle || prev.includes(t)) // mantiene el orden de la lista
    );
  };

  const subirArchivos = async (lista: FileList | null) => {
    if (!lista || lista.length === 0) return;
    setError('');
    const archivos = Array.from(lista);
    setSubiendo(n => n + archivos.length);
    for (const archivo of archivos) {
      try {
        const url = await alSubirImagen(archivo);
        setImagenes(prev => [...prev, url]);
      } catch (e: any) {
        setError(`${archivo.name}: ${e?.message || 'no se pudo subir.'}`);
      } finally {
        setSubiendo(n => n - 1);
      }
    }
    if (inputArchivos.current) inputArchivos.current.value = '';
  };

  const moverImagen = (indice: number, delta: number) => {
    setImagenes(prev => {
      const destino = indice + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  const hacerPrincipal = (indice: number) => {
    setImagenes(prev => [prev[indice], ...prev.filter((_, i) => i !== indice)]);
  };

  const agregarColor = () => {
    const nombreColor = nuevoColorNombre.trim();
    if (!nombreColor) return;
    if (colores.some(c => c.nombre.toLowerCase() === nombreColor.toLowerCase())) return;
    setColores(prev => [...prev, { nombre: nombreColor, hex: nuevoColorHex }]);
    setNuevoColorNombre('');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numPrecio = Math.round(Number(precio));
    const numOferta = precioOferta ? Math.round(Number(precioOferta)) : 0;
    if (!nombre.trim()) return setError('Falta el nombre de la prenda.');
    if (imagenes.length === 0) return setError('Subí al menos una foto.');
    if (!(numPrecio > 0)) return setError('Ingresá un precio válido.');
    if (numOferta && numOferta >= numPrecio) return setError('El precio de oferta tiene que ser menor al precio normal.');
    if (talles.length === 0) return setError('Elegí al menos un talle.');

    setGuardando(true);
    const ok = await alGuardar({
      sku: sku.trim(),
      nombre: nombre.trim(),
      categoria,
      genero,
      // '' y 0 (no undefined) para que al editar se pueda borrar el valor anterior
      subcategoria: subcategoria,
      precio: numPrecio,
      precioOferta: numOferta,
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      stockMinimo: Math.max(0, Math.round(Number(stockMinimo) || 0)),
      talles,
      colores,
      descripcion: descripcion.trim(),
      composicion: composicion.trim(),
      cuidados: cuidados.trim(),
      imagenPrincipal: imagenes[0],
      imagenesSecundarias: imagenes.slice(1),
      esNuevo,
      esDestacado
    });
    setGuardando(false);
    if (ok) alCerrar();
    else setError('No se pudo guardar. Revisá la conexión e intentá de nuevo.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <form
        onSubmit={handleGuardar}
        className="bg-[#fff8f4] w-full max-w-5xl rounded-3xl shadow-2xl relative my-4 flex flex-col max-h-[calc(100vh-2rem)]"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#eee7e2]">
          <h3 className="font-display font-bold text-xl text-[#1e1b19]">
            {producto ? 'Editar producto' : 'Cargar producto nuevo'}
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            className="p-2 text-[#80756b] hover:text-[#1e1b19] hover:bg-[#eee7e2] rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6">
          {/* ===== Columna izquierda: FOTOS ===== */}
          <section className="space-y-3">
            <h4 className="font-display font-bold text-base text-[#1e1b19]">Fotos</h4>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                subirArchivos(e.dataTransfer.files);
              }}
              onClick={() => inputArchivos.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputArchivos.current?.click();
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                arrastrando ? 'border-[#735a3e] bg-[#f4ece8]' : 'border-[#d2c4b9] bg-white hover:bg-[#faf2ee]'
              }`}
            >
              <Upload size={28} className="mx-auto text-[#735a3e]" />
              <p className="text-sm font-semibold text-[#1e1b19] mt-2">Tocá para elegir fotos o arrastralas acá</p>
              <p className="text-xs text-[#80756b] mt-1">JPG, PNG o WEBP. Podés subir varias a la vez.</p>
              <input
                ref={inputArchivos}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => subirArchivos(e.target.files)}
              />
            </div>

            {subiendo > 0 && (
              <p className="text-sm text-[#735a3e] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Subiendo {subiendo} {subiendo === 1 ? 'foto' : 'fotos'}…
              </p>
            )}

            {imagenes.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {imagenes.map((url, i) => (
                  <li key={url + i} className="relative group rounded-xl overflow-hidden border border-[#eee7e2] bg-[#e8e1dd] aspect-[4/5]">
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#735a3e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => moverImagen(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda" className="p-1 bg-white/90 rounded-md disabled:opacity-30">
                          <ArrowLeft size={13} />
                        </button>
                        <button type="button" onClick={() => moverImagen(i, 1)} disabled={i === imagenes.length - 1} aria-label="Mover a la derecha" className="p-1 bg-white/90 rounded-md disabled:opacity-30">
                          <ArrowRight size={13} />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {i !== 0 && (
                          <button type="button" onClick={() => hacerPrincipal(i)} aria-label="Usar como foto principal" title="Usar como principal" className="p-1 bg-white/90 rounded-md text-[#B08D57]">
                            <Star size={13} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImagenes(prev => prev.filter((_, j) => j !== i))}
                          aria-label="Quitar foto"
                          className="p-1 bg-white/90 rounded-md text-[#ba1a1a]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-[#80756b]">La primera foto es la que se ve en el catálogo.</p>
          </section>

          {/* ===== Columna derecha: DATOS ===== */}
          <section className="space-y-4">
            <div>
              <label htmlFor="fp-nombre" className={claseEtiqueta}>Nombre de la prenda *</label>
              <input id="fp-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Jogger frisa con puño" className={claseCampo} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3">
              <div>
                <label htmlFor="fp-categoria" className={claseEtiqueta}>Categoría *</label>
                <select id="fp-categoria" value={categoria} onChange={(e) => cambiarCategoria(e.target.value as CategoriaProducto)} className={claseCampo}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="fp-genero" className={claseEtiqueta}>Para *</label>
                <select id="fp-genero" value={genero} onChange={(e) => cambiarGenero(e.target.value as GeneroProducto)} className={claseCampo}>
                  {GENEROS.map(g => <option key={g} value={g}>{g === 'Unisex' ? 'Nena y Varón (unisex)' : g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="fp-sub" className={claseEtiqueta}>Tipo de prenda</label>
                <select id="fp-sub" value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)} className={claseCampo}>
                  <option value="">Sin especificar</option>
                  {opcionesSubcategoria.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="fp-precio" className={claseEtiqueta}>Precio *</label>
                <input id="fp-precio" type="number" inputMode="numeric" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="$" className={claseCampo} />
              </div>
              <div>
                <label htmlFor="fp-oferta" className={claseEtiqueta}>Precio oferta</label>
                <input id="fp-oferta" type="number" inputMode="numeric" min={0} value={precioOferta} onChange={(e) => setPrecioOferta(e.target.value)} placeholder="Opcional" className={claseCampo} />
              </div>
              <div>
                <label htmlFor="fp-stock" className={claseEtiqueta}>Stock</label>
                <input id="fp-stock" type="number" inputMode="numeric" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className={claseCampo} />
              </div>
              <div>
                <label htmlFor="fp-stockmin" className={claseEtiqueta}>Avisar con</label>
                <input id="fp-stockmin" type="number" inputMode="numeric" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} title="Te avisa en el panel cuando el stock baja a este número" className={claseCampo} />
              </div>
            </div>

            <div>
              <span className={claseEtiqueta}>Talles *</span>
              <div className="flex flex-wrap gap-2">
                {opcionesTalles.map(t => {
                  const activo = talles.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => alternarTalle(t)}
                      aria-pressed={activo}
                      className={`min-w-[3rem] px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        activo ? 'bg-[#735a3e] text-white border-[#735a3e]' : 'bg-white text-[#4e453d] border-[#d2c4b9] hover:border-[#735a3e]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className={claseEtiqueta}>Colores</span>
              {colores.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-2">
                  {colores.map(c => (
                    <li key={c.nombre} className="flex items-center gap-2 bg-white border border-[#d2c4b9] rounded-full pl-1.5 pr-2 py-1 text-sm">
                      <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      {c.nombre}
                      <button type="button" onClick={() => setColores(prev => prev.filter(x => x.nombre !== c.nombre))} aria-label={`Quitar color ${c.nombre}`} className="text-[#80756b] hover:text-[#ba1a1a]">
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  type="color"
                  value={nuevoColorHex}
                  onChange={(e) => setNuevoColorHex(e.target.value)}
                  aria-label="Elegir color"
                  className="w-11 h-11 rounded-xl border border-[#d2c4b9] bg-white p-1 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={nuevoColorNombre}
                  onChange={(e) => setNuevoColorNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarColor();
                    }
                  }}
                  placeholder="Nombre del color (ej. Rosa viejo)"
                  aria-label="Nombre del color"
                  className={claseCampo}
                />
                <button type="button" onClick={agregarColor} className="px-3 rounded-xl bg-[#f4ece8] text-[#735a3e] font-semibold text-sm flex items-center gap-1 shrink-0 hover:bg-[#e8e1dd]">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fp-desc" className={claseEtiqueta}>Descripción</label>
              <textarea id="fp-desc" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={claseCampo} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fp-comp" className={claseEtiqueta}>Composición</label>
                <input id="fp-comp" type="text" value={composicion} onChange={(e) => setComposicion(e.target.value)} placeholder="Ej. 100% algodón" className={claseCampo} />
              </div>
              <div>
                <label htmlFor="fp-cuid" className={claseEtiqueta}>Cuidados</label>
                <input id="fp-cuid" type="text" value={cuidados} onChange={(e) => setCuidados(e.target.value)} placeholder="Ej. Lavar con agua fría" className={claseCampo} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label htmlFor="fp-sku" className={claseEtiqueta}>Código (SKU)</label>
                <input id="fp-sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} className={`${claseCampo} font-mono`} />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#4e453d] py-2.5">
                <input type="checkbox" checked={esNuevo} onChange={(e) => setEsNuevo(e.target.checked)} className="w-4 h-4 accent-[#735a3e]" />
                Marcar como "Nuevo"
              </label>
              <label className="flex items-center gap-2 text-sm text-[#4e453d] py-2.5">
                <input type="checkbox" checked={esDestacado} onChange={(e) => setEsDestacado(e.target.checked)} className="w-4 h-4 accent-[#735a3e]" />
                Destacado (aparece primero)
              </label>
            </div>
          </section>
        </div>

        {/* Pie */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#eee7e2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p role="alert" className="text-sm text-[#ba1a1a] min-h-[1.25rem]">{error}</p>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={alCerrar} className="px-5 py-2.5 rounded-xl bg-[#f4ece8] text-[#735a3e] font-semibold text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || subiendo > 0}
              className="px-6 py-2.5 rounded-xl bg-[#735a3e] text-white font-semibold text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {guardando && <Loader2 size={16} className="animate-spin" />}
              {producto ? 'Guardar cambios' : 'Guardar producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
