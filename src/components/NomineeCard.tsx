import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Nominee } from '../types';

interface Props {
  nominee: Nominee;
  rank: number;
}

export const NomineeCard: React.FC<Props> = ({ nominee, rank }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nominee.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nominee-card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className="nominee-rank">{rank}</span>
      <div className="nominee-title">{nominee.title}</div>
    </div>
  );
};