import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Lock, User, ShoppingCart } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@market.com');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas. Tente admin@market.com / 123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 z-10 relative">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
             <ShoppingCart size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Mercado<span className="text-green-600">Fácil</span></h1>
          <p className="text-slate-500 text-sm">Gerenciamento inteligente para seu negócio</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">E-mail</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-slate-50"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-slate-50"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-green-500/30 mt-2"
          >
            ENTRAR
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-4">
           <p className="text-xs text-slate-400 mb-2">Credenciais de Acesso (Demo)</p>
           <div className="inline-block bg-slate-100 px-4 py-2 rounded text-slate-600 text-xs font-mono">
             admin@market.com &nbsp;|&nbsp; 123
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;