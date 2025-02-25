// src/hooks/useVoting.ts
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

  useEffect(() => {
    loadNominees();
  }, []);

  const loadNominees = async () => {
    try {
      setLoading(true);
      const data = await api.getNominees();
      setNominees(data);
    } catch (err) {
      setError('Failed to load nominees');
      console.error('Error loading nominees:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (rankings: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate rankings
      if (rankings.length !== nominees.length) {
        throw new Error('Please rank all nominees');
      }

      const vote = {
        rankings,
        timestamp: new Date().toISOString()
      };

      await api.submitVote(vote);
      await loadVotes(); // Refresh votes after submission
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
      
      // Load fresh votes
      const allVotes = await api.getAllVotes();
      
      if (allVotes.length === 0) {
        throw new Error('No votes have been submitted yet');
      }

      const calculator = new PreferentialVotingCalculator();
      const calculatedResult = calculator.calculateWinner(allVotes, nominees);
      setResult(calculatedResult);
      
      return calculatedResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate results');
      console.error('Error calculating results:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => votes.length;

  const getVotesByNominee = () => {
    const voteCount = new Map<number, number>();
    nominees.forEach(nominee => voteCount.set(nominee.id, 0));

    votes.forEach(vote => {
      const firstChoice = vote.rankings[0];
      voteCount.set(firstChoice, (voteCount.get(firstChoice) || 0) + 1);
    });

    return voteCount;
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
    getVotesByNominee
  };
};