import { Vote, Nominee, VotingResult } from '../types';

export class PreferentialVotingCalculator {
  private readonly WINNING_THRESHOLD_PERCENTAGE = 0.5;
  private readonly INITIAL_NOMINEES = 10;

  calculateWinner(votes: Vote[], nominees: Nominee[]): VotingResult {
    this.validateInput(votes, nominees);

    if (nominees.length !== this.INITIAL_NOMINEES) {
      throw new Error('Must start with exactly 10 nominees');
    }

    let currentRound = 1;
    let currentVotes = [...votes];
    let activeNominees = [...nominees];
    const rounds = [];
    
    while (true) {
      // Count first-choice votes
      const firstChoiceVotes = new Map<number, number>();
      activeNominees.forEach(nominee => firstChoiceVotes.set(nominee.id, 0));
      
      currentVotes.forEach(vote => {
        if (vote.rankings.length > 0) {
          const firstChoice = vote.rankings[0];
          firstChoiceVotes.set(firstChoice, (firstChoiceVotes.get(firstChoice) || 0) + 1);
        }
      });

      // Check for winner
      const totalVotes = currentVotes.length;
      const winningThreshold = totalVotes * this.WINNING_THRESHOLD_PERCENTAGE;

      for (const [nomineeId, count] of firstChoiceVotes.entries()) {
        if (count > winningThreshold) {
          return {
            winner: nominees.find(n => n.id === nomineeId)!,
            rounds: [...rounds, { roundNumber: currentRound, voteCounts: firstChoiceVotes }]
          };
        }
      }

      // If no winner, calculate weighted scores for remaining nominees
      const weightedScores = this.calculateWeightedScores(currentVotes, activeNominees);
      const eliminatedId = this.findLowestScoringNominee(weightedScores, firstChoiceVotes);

      // Record this round
      const eliminatedNominee = nominees.find(n => n.id === eliminatedId);
      rounds.push({
        roundNumber: currentRound,
        eliminatedNominee,
        voteCounts: firstChoiceVotes
      });

      // Remove eliminated nominee and redistribute votes
      activeNominees = activeNominees.filter(n => n.id !== eliminatedId);
      currentVotes = this.redistributeVotes(currentVotes, eliminatedId);

      currentRound++;

      if (activeNominees.length === 0) {
        throw new Error('No winner could be determined');
      }

      if (currentRound > this.INITIAL_NOMINEES) {
        throw new Error('Voting exceeded maximum possible rounds');
      }
    }
  }

  private calculateWeightedScores(votes: Vote[], activeNominees: Nominee[]): Map<number, number> {
    const scores = new Map<number, number>();
    activeNominees.forEach(nominee => scores.set(nominee.id, 0));

    votes.forEach(vote => {
      // Generate weights based on current number of active nominees
      const weights = Array.from(
        { length: activeNominees.length }, 
        (_, i) => activeNominees.length - i
      );

      // Add weighted scores based on current position
      vote.rankings.forEach((nomineeId, index) => {
        if (scores.has(nomineeId)) { // Only count active nominees
          const weight = weights[index];
          scores.set(nomineeId, (scores.get(nomineeId) || 0) + weight);
        }
      });
    });

    return scores;
  }

  private findLowestScoringNominee(
    weightedScores: Map<number, number>, 
    firstChoiceVotes: Map<number, number>
  ): number {
    let lowestScore = Infinity;
    let lowestFirstChoiceVotes = Infinity;
    let lowestId = -1;

    weightedScores.forEach((score, nomineeId) => {
      const firstChoiceCount = firstChoiceVotes.get(nomineeId) || 0;
      
      if (score < lowestScore || 
         (score === lowestScore && firstChoiceCount < lowestFirstChoiceVotes)) {
        lowestScore = score;
        lowestFirstChoiceVotes = firstChoiceCount;
        lowestId = nomineeId;
      }
    });

    if (lowestId === -1) {
      throw new Error('Could not determine nominee to eliminate');
    }

    return lowestId;
  }

  private redistributeVotes(votes: Vote[], eliminatedId: number): Vote[] {
    return votes.map(vote => ({
      ...vote,
      rankings: vote.rankings.filter(r => r !== eliminatedId)
    }));
  }

  private validateInput(votes: Vote[], nominees: Nominee[]): void {
    if (!votes.length) {
      throw new Error('Votes array cannot be empty');
    }

    votes.forEach(vote => {
      if (!Array.isArray(vote.rankings) || 
          vote.rankings.length !== this.INITIAL_NOMINEES ||
          !vote.rankings.every(r => typeof r === 'number')) {
        throw new Error('Each initial vote must rank exactly 10 nominees');
      }

      // Check for duplicate rankings
      const uniqueRankings = new Set(vote.rankings);
      if (uniqueRankings.size !== this.INITIAL_NOMINEES) {
        throw new Error('Each nominee must be given a unique ranking');
      }
    });
  }
}