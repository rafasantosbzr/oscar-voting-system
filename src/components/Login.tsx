import React, { useState } from 'react';
import { api } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await api.signUp(email, password);
      } else {
        await api.signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha de autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isSignUp ? 'Crie sua conta' : 'Entrar'}</h2>
        
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Insira seu e-mail"
            required
            className="auth-input"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Insira sua senha"
            required
            minLength={6}
            className="auth-input"
          />
        </div>

        <button 
          type="submit" 
          className="button" 
          disabled={loading}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Crie sua conta' : 'Entrar')}
        </button>

        <button 
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="switch-auth-button"
        >
          {isSignUp ? 'Já possui uma conta? Entrar' : 'Precisa de uma conta? Crie sua conta'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}