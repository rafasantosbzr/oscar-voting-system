import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, api } from './services/api';
import { Login } from './components/Login';
import { VotingForm } from './components/VotingForm';
import { AdminPanel } from './components/AdminPanel';
import { useVoting } from './hooks/useVoting';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { nominees, submitVote, error: votingError, loading: votingLoading } = useVoting();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('Nominees in App:', nominees);
  console.log('User:', user);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container">
        <header className="header">
          <h1>Sistema de Votação Preferencial do Oscar</h1>
        </header>
        <Login />
      </div>
    );
  }

  const isAdmin = user.email === 'rafasantosbzr@gmail.com';

  return (
    <div className="container">
      <header className="header">
        <h1>Sistema de Votação Preferencial do Oscar</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="button button-small"
          >
            Sign Out
          </button>
        </div>
      </header>

      {votingError && <div className="error">{votingError}</div>}

      {nominees.length === 0 ? (
        <div className="loading">Loading nominees...</div>
      ) : isAdmin ? (
        <AdminPanel />
      ) : (
        <VotingForm
          nominees={nominees}
          onSubmit={submitVote}
          loading={votingLoading}
        />
      )}
    </div>
  );
}