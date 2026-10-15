import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { LogoMargarita } from './LogoMargarita';

interface LoginAdminProps {
  alIngresar: (token: string) => void;
  alVolverATienda: () => void;
}

/**
 * Pantalla de acceso al panel de administración.
 * La contraseña se valida en el servidor (variable ADMIN_PASSWORD).
 */
export const LoginAdmin: React.FC<LoginAdminProps> = ({ alIngresar, alVolverATienda }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setEnviando(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const datos = await res.json().catch(() => ({}));
      if (res.ok && datos.exito && datos.token) {
        setPassword('');
        alIngresar(datos.token);
      } else {
        setError(datos.mensaje || 'No se pudo ingresar.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-3xl p-8 cloud-shadow border border-[#eee7e2] space-y-5"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMargarita tamanoIcono={48} />
          <h1 className="font-display font-bold text-xl text-[#1e1b19] flex items-center gap-2">
            <Lock size={18} className="text-[#735a3e]" />
            Panel de administración
          </h1>
        </div>

        <div>
          <label htmlFor="admin-password" className="text-sm font-semibold text-[#4e453d] block mb-1.5">
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-[#d2c4b9] rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#735a3e]"
          />
        </div>

        {error && (
          <p role="alert" className="p-3 bg-[#ffdad6] text-[#93000a] text-sm rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando || !password}
          className="w-full bg-[#735a3e] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#5a4229] transition-colors disabled:opacity-50"
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <button
          type="button"
          onClick={alVolverATienda}
          className="w-full text-sm text-[#735a3e] flex items-center justify-center gap-1.5 hover:underline"
        >
          <ArrowLeft size={14} />
          Volver a la tienda
        </button>
      </form>
    </div>
  );
};
