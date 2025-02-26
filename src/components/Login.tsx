import React, { useState } from 'react';
import { api } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.signInWithEmail(email);
      setMessage('Verifique seu e-mail para o link de login!');
    } catch (err) {
      setError('Falha ao enviar o link de login. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Entre Para Votar</h2>
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
        <button 
          type="submit" 
          className="button" 
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Envie o Link de Confirmação'}
        </button>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}