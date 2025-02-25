import React, { useState } from 'react';
import { Nominee } from '../types';

interface Props {
  nominee: Nominee;
  rank: number;
  onDragStart: (e: React.DragEvent, nominee: Nominee) => void;
  onDrop: (e: React.DragEvent, nominee: Nominee) => void;
}

export const NomineeCard: React.FC<Props> = ({
  nominee,
  rank,
  onDragStart,
  onDrop
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, nominee);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`nominee-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, nominee)}
    >
      <span className="nominee-rank">{rank}</span>
      <div className="nominee-title">{nominee.title}</div>
    </div>
  );
};