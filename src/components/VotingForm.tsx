import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRankings((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
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
    <div className="voting-form">
      <h2>Classifique seus indicados</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="nominees-info">
        <p>Arraste e solte (ou toque e arraste no mobile) para reordenar os indicados.</p>
        <p>1 sendo sua principal escolha e {nominees.length} sendo sua última escolha.</p>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={rankings.map(n => n.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="nominees-list">
            {rankings.map((nominee, index) => (
              <NomineeCard
                key={nominee.id}
                nominee={nominee}
                rank={index + 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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