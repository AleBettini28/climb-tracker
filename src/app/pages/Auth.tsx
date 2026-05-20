import { useState } from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await auth.login(email, password);
      } else {
        await auth.signup(email, password, name);
      }
      await refreshUser();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Autenticazione fallita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              {isLogin ? 'Accedi' : 'Registrati'}
            </h1>
            <p className="text-stone-600">
              {isLogin ? 'Bentornato!' : 'Inizia a tracciare le tue scalate'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Il tuo nome"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="tua@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Minimo 6 caratteri"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-amber-700 hover:text-amber-800 text-sm font-medium"
            >
              {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
