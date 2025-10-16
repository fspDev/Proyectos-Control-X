import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoIcon } from '../assets/icons';

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('jane.doe@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
      console.error(err);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-notion-sidebar text-notion-text">
      <div className="w-full max-w-sm p-8 space-y-8 bg-notion-bg rounded-lg border border-notion-border">
        <div className="flex flex-col items-center">
          <LogoIcon className="h-12 w-12 text-notion-accent" />
          <h2 className="mt-6 text-3xl font-bold text-center">Control X</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Inicia sesión en tu cuenta
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email"
              required 
              className="mt-1 w-full px-3 py-2 border border-notion-border rounded-md bg-transparent focus:ring-2 focus:ring-notion-accent focus:outline-none" 
              placeholder="email@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password"
              required 
              className="mt-1 w-full px-3 py-2 border border-notion-border rounded-md bg-transparent focus:ring-2 focus:ring-notion-accent focus:outline-none" 
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-notion-accent text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
