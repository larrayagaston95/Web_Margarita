import React from 'react';

export interface LogoMargaritaProps {
  className?: string;
  tamanoIcono?: number;
  mostrarTexto?: boolean;
  varianteTexto?: 'oscuro' | 'blanco' | 'auto';
  orientacion?: 'horizontal' | 'vertical';
  soloIcono?: boolean;
}

/**
 * Componente oficial del Logo de "Margarita Indumentaria Infantil"
 * Reproducción exacta del logotipo de marca:
 * - Flor margarita de 9 pétalos multicolores con contorno negro
 * - Centro blanco con su característico acento de brillo/comilla interior
 * - Tipografía principal "MARGARITA" en estilo serif con personalidad
 * - Subtítulo "Indumentaria Infantil" en tipografía artesanal/escolar
 */
export const LogoMargarita: React.FC<LogoMargaritaProps> = ({
  className = '',
  tamanoIcono = 44,
  mostrarTexto = true,
  varianteTexto = 'oscuro',
  orientacion = 'horizontal',
  soloIcono = false
}) => {
  // Los 9 colores exactos de los pétalos según el logo oficial (en sentido horario desde el amarillo superior)
  const petalos = [
    { color: '#FFDA00', rotacion: 0, nombre: 'Amarillo' },
    { color: '#00A651', rotacion: 40, nombre: 'Verde Esmeralda' },
    { color: '#82C330', rotacion: 80, nombre: 'Verde Lima' },
    { color: '#3FB2E6', rotacion: 120, nombre: 'Celeste Cielo' },
    { color: '#008FD5', rotacion: 160, nombre: 'Azul Intenso' },
    { color: '#A0A3D4', rotacion: 200, nombre: 'Lavanda' },
    { color: '#ECA2C7', rotacion: 240, nombre: 'Rosa Suave' },
    { color: '#E85A7A', rotacion: 280, nombre: 'Rosa Coral' },
    { color: '#F58220', rotacion: 320, nombre: 'Naranja' }
  ];

  const colorTextoTitulo = 
    varianteTexto === 'blanco' ? 'text-white' : 'text-[#1a1816]';

  const colorTextoSubtitulo = 
    varianteTexto === 'blanco' ? 'text-[#e5d8cc]' : 'text-[#2b2724]';

  return (
    <div
      className={`inline-flex select-none items-center ${
        orientacion === 'vertical' 
          ? 'flex-col text-center gap-2' 
          : 'flex-row gap-3 text-left'
      } ${className}`}
    >
      {/* Flor Margarita Vectorial */}
      <svg
        width={tamanoIcono}
        height={tamanoIcono}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-sm"
        aria-label="Flor Margarita Indumentaria"
      >
        <g transform="translate(80, 80)">
          {/* 9 Pétalos con contorno negro suavemente redondeados */}
          {petalos.map((p, idx) => (
            <path
              key={idx}
              d="M 0 0 m -11,-22 C -16,-46 -15,-64 0,-64 C 15,-64 16,-46 11,-22 Z"
              transform={`rotate(${p.rotacion})`}
              fill={p.color}
              stroke="#111111"
              strokeWidth="4.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Círculo Central Blanco con contorno negro */}
          <circle
            cx="0"
            cy="0"
            r="23"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="4.8"
          />

          {/* Acento gráfico característico en el centro (reflejo / comilla y punto) */}
          <path
            d="M 4 -12 C 8 -9 9 -4 6 0 C 4 -3 5 -8 1 -10 Z"
            fill="#111111"
          />
          <circle cx="6" cy="6" r="2.4" fill="#111111" />
        </g>
      </svg>

      {/* Tipografía de la marca */}
      {mostrarTexto && !soloIcono && (
        <div className={`flex flex-col ${orientacion === 'vertical' ? 'items-center -mt-0.5' : 'items-start'}`}>
          <span
            className={`font-black leading-none tracking-[0.06em] text-lg sm:text-xl md:text-2xl ${colorTextoTitulo}`}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            MARGARITA
          </span>
          <span
            className={`leading-tight tracking-wider text-xs sm:text-sm font-medium mt-0.5 ${colorTextoSubtitulo}`}
            style={{
              fontFamily: "'Patrick Hand', 'Caveat', cursive, sans-serif"
            }}
          >
            Indumentaria Infantil
          </span>
        </div>
      )}
    </div>
  );
};
