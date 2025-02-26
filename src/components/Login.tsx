import React, { useState } from 'react';
import { api } from '../services/api';

const LoadingSpinner = () => (
  <div className="loading-spinner" />
);

const VerificationModal = ({ onClose }: { onClose: () => void }) => (
  <div className="verification-overlay">
    <div className="verification-modal">
      <div className="verification-icon">
        {/* Envelope Icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      </div>
      <h3>Verifique seu Email</h3>
      <p>
        Enviamos um link de confirmação para o seu email.
        Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
      </p>
      <p>
        <strong>Importante:</strong> Não se esqueça de verificar também sua pasta de spam!
      </p>
      <button onClick={onClose} className="close-button">
        Entendi
      </button>
    </div>
  </div>
);

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const validateForm = (): boolean => {
    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    return true;
  };

  const isPasswordStrong = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (isSignUp && !isPasswordStrong(password)) {
      setError('A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await api.signUp(email, password);
        setShowVerificationModal(true);
        // Clear form after successful signup
        setEmail('');
        setPassword('');
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
      <form onSubmit={handleSubmit} className="auth-form" aria-label="Authentication form">
        <h2>{isSignUp ? 'Crie sua conta' : 'Entrar'}</h2>
        
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Insira seu e-mail"
            required
            className="auth-input"
            aria-label="Email input"
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
            aria-label="Password input"
          />
        </div>

        <button 
          type="submit" 
          className="button" 
          disabled={loading}
        >
          {loading && <LoadingSpinner />}
          {loading ? 'Processando...' : (isSignUp ? 'Crie sua conta' : 'Entrar')}
        </button>

        <button 
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setShowVerificationModal(false);
          }}
          className="switch-auth-button"
        >
          {isSignUp ? 'Já possui uma conta? Entrar' : 'Precisa de uma conta? Crie sua conta'}
        </button>

        {error && <div className="error-message" role="alert">{error}</div>}
      </form>

      {showVerificationModal && (
        <VerificationModal onClose={() => {
          setShowVerificationModal(false);
          setIsSignUp(false); // Switch back to login form
        }} />
      )}
    </div>
  );
}