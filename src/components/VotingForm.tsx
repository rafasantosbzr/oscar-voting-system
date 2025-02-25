import React, { useState, useEffect } from 'react';
import { Nominee } from '../types';
import { NomineeCard } from './NomineeCard';
import { api } from '../services/api';

interface Props {
  nominees: Nominee[];
  onSubmit: (rankings: number[]) => void;
  loading: boolean;
}

export const VotingForm: React.FC<Props> = ({ nominees, onSubmit, loading }) => {
  const [rankings, setRankings] = useState<Nominee[]>([]);
  const [draggedNominee, setDraggedNominee] = useState<Nominee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    checkIfUserHasVoted();
    if (nominees && nominees.length > 0) {
      setRankings([...nominees]);
    }
  }, [nominees]);

  const checkIfUserHasVoted = async () => {
    try {
      const voted = await api.hasUserVoted();
      setHasVoted(voted);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleDragStart = (e: React.DragEvent, nominee: Nominee) => {
    setDraggedNominee(nominee);
  };

  const handleDrop = (e: React.DragEvent, target: Nominee) => {
    e.preventDefault();
    
    if (!draggedNominee) {
      return;
    }

    const newRankings = [...rankings];
    const draggedIndex = rankings.findIndex(n => n.id === draggedNominee.id);
    const targetIndex = rankings.findIndex(n => n.id === target.id);

    newRankings.splice(draggedIndex, 1);
    newRankings.splice(targetIndex, 0, draggedNominee);

    setRankings(newRankings);
    setDraggedNominee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rankings.length !== nominees.length) {
      setError('Please rank all nominees before submitting');
      return;
    }

    try {
      await onSubmit(rankings.map(n => n.id));
      setHasVoted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      console.error('Error submitting vote:', err);
    }
  };

  if (hasVoted) {
    return (
      <div className="voting-form">
        <div className="message-box">
          <h2>Obrigado!</h2>
          <p>Você já enviou seu voto.</p>
          <p>Os resultados finais estarão disponíveis após o término do período de votação.</p>
        </div>
      </div>
    );
  }

  if (!nominees || nominees.length === 0) {
    return (
      <div className="voting-form">
        <div className="loading">No nominees available</div>
      </div>
    );
  }

  return (
    <div className="voting-form">
      <h2>Classifique seus indicados</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="nominees-info">
        <p>Arraste e solte para reordenar os indicados de acordo com sua preferência.</p>
        <p>1 sendo sua principal escolha e {nominees.length} sendo sua última escolha.</p>
      </div>

      <div className="nominees-list">
        {rankings.map((nominee, index) => (
          <NomineeCard
            key={nominee.id}
            nominee={nominee}
            rank={index + 1}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className="submit-section">
        <button
          type="submit"
          className="button"
          onClick={handleSubmit}
          disabled={loading || rankings.length !== nominees.length}
        >
          {loading ? 'Submitting...' : 'Submit Vote'}
        </button>
      </div>
    </div>
  );
};