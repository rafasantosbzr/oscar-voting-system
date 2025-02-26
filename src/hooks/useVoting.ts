import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Vote, Nominee, VotingResult } from '../types';
import { PreferentialVotingCalculator } from '../services/votingCalculator';

export const useVoting = () => {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [result, setResult] = useState<VotingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_NOMINEES = 10;

  useEffect(() => {
    loadNominees();
  }, []);

  const loadNominees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNominees();
      
      if (data.length > MAX_NOMINEES) {
        throw new Error(`Cannot have more than ${MAX_NOMINEES} nominees`);
      }
      
      setNominees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nominees');
      console.error('Error loading nominees:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (rankings: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      if (rankings.length === 0) {
        throw new Error('Rankings cannot be empty');
      }

      if (rankings.length !== nominees.length) {
        throw new Error('Please rank all nominees');
      }

      const uniqueRankings = new Set(rankings);
      if (uniqueRankings.size !== rankings.length) {
        throw new Error('Each nominee must have a unique ranking');
      }

      const validNomineeIds = new Set(nominees.map(n => n.id));
      if (!rankings.every(id => validNomineeIds.has(id))) {
        throw new Error('Invalid nominee ID in rankings');
      }

      const vote: Vote = {
        rankings,
        timestamp: new Date().toISOString()
      };

      await api.submitVote(vote);
      await loadVotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
      console.error('Error submitting vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadVotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllVotes();
      setVotes(data);
    } catch (err) {
      setError('Failed to load votes');
      console.error('Error loading votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await loadVotes();
      
      if (votes.length === 0) {
        throw new Error('No votes have been submitted yet');
      }

      if (nominees.length === 0) {
        throw new Error('No nominees available');
      }

      const calculator = new PreferentialVotingCalculator();
      
      try {
        const calculatedResult = calculator.calculateWinner(votes, nominees);
        setResult(calculatedResult);
        return calculatedResult;
      } catch (calcError: unknown) {
        if (calcError instanceof Error) {
          throw new Error(`Calculation error: ${calcError.message}`);
        } else {
          throw new Error('An unknown calculation error occurred');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate results';
      setError(errorMessage);
      console.error('Error calculating results:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => votes.length;

  const getVotesByNominee = () => {
    const voteCount = new Map<number, number>();
    nominees.forEach(nominee => voteCount.set(nominee.id, 0));

    votes.forEach(vote => {
      if (vote.rankings.length > 0) {
        const firstChoice = vote.rankings[0];
        voteCount.set(firstChoice, (voteCount.get(firstChoice) || 0) + 1);
      }
    });

    return voteCount;
  };

  const getCurrentRoundStatus = () => {
    if (!result) return null;
    
    const lastRound = result.rounds[result.rounds.length - 1];
    return {
      roundNumber: lastRound.roundNumber,
      voteCounts: lastRound.voteCounts,
      eliminatedNominee: lastRound.eliminatedNominee
    };
  };

  return {
    nominees,
    votes,
    result,
    loading,
    error,
    submitVote,
    calculateResults,
    getTotalVotes,
    getVotesByNominee,
    getCurrentRoundStatus
  };
};