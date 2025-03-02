import React from 'react';
import { useVoting } from '../hooks/useVoting';

export function AdminPanel() {
  const { calculateResults, result, loading, nominees } = useVoting();

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <button 
        onClick={calculateResults}
        className="button calculate-button"
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Calculate Final Results'}
      </button>

      {result && (
        <div className="results-container">
          <div className="winner-section">
            <h3>Winner</h3>
            <div className="winner-card">
              {result.winner.title}
            </div>
          </div>

          <div className="rounds-section">
            {result.rounds.map((round) => (
              <div key={round.roundNumber} className="round-card">
                <h4>Round {round.roundNumber}</h4>
                <div className="vote-counts">
                  {Array.from(round.voteCounts.entries()).map(([nomineeId, count]) => (
                    <div key={nomineeId} className="vote-count-item">
                      <span className="nominee-name">
                        {nominees.find(n => n.id === nomineeId)?.title}
                      </span>
                      <span className="vote-count"> {count} votes</span>
                    </div>
                  ))}
                </div>
                {round.eliminatedNominee && (
                  <div className="eliminated-nominee">
                    Eliminado: {round.eliminatedNominee.title}
                    
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}