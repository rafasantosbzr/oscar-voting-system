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

  const handleDragStart = (e: React.DragEvent | TouchEvent, nominee: Nominee) => {
    setDraggedNominee(nominee);
  };

  const handleDrop = (e: React.DragEvent | TouchEvent, target: Nominee) => {
    if (e instanceof DragEvent) {
      e.preventDefault();
    }
    
    if (!draggedNominee || draggedNominee.id === target.id) {
      return;
    }

    const newRankings = [...rankings];
    const draggedIndex = rankings.findIndex(n => n.id === draggedNominee.id);
    const targetIndex = rankings.findIndex(n => n.id === target.id);

    // Remove dragged item
    newRankings.splice(draggedIndex, 1);
    // Insert at new position
    newRankings.splice(targetIndex, 0, draggedNominee);

    setRankings(newRankings);
    setDraggedNominee(null);
  };

  const findNomineeFromPoint = (x: number, y: number): Nominee | null => {
    const elements = document.elementsFromPoint(x, y);
    for (const element of elements) {
      const nomineeId = element.getAttribute('data-nominee-id');
      if (nomineeId) {
        return rankings.find(n => n.id === parseInt(nomineeId)) || null;
      }
    }
    return null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!draggedNominee) return;

    const touch = e.touches[0];
    const nominee = findNomineeFromPoint(touch.clientX, touch.clientY);
    
    if (nominee && nominee.id !== draggedNominee.id) {
      handleDrop(e, nominee);
    }
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
    <div 
      className="voting-form"
      onTouchMove={handleTouchMove as any}
    >
      <h2>Classifique seus indicados</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="nominees-info">
        <p>Arraste e solte (ou toque e segure no mobile) para reordenar os indicados.</p>
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