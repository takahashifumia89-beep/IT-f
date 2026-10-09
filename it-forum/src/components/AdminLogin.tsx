import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { api } from '../api';



interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.login(password);
      setPassword('');
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Қате');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Lock className="text-purple-600" size={32} />
          </div>
        </div>
        
        <h2 className="text-center mb-2">Вход в админ-панель</h2>
        <p className="text-center text-gray-600 mb-6">Введите пароль для доступа</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full disabled:opacity-60 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {busy ? "Тексерілуде..." : "Войти"}
          </button>

        
        </form>
      </div>
    </div>
  );
}
