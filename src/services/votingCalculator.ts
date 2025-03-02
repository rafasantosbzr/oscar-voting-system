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
        const firstChoice = vote.rankings.find(id => firstChoiceVotes.has(id));
        if (firstChoice !== undefined) {
          firstChoiceVotes.set(firstChoice, (firstChoiceVotes.get(firstChoice) || 0) + 1);
        }
      });

      const totalVotes = Array.from(firstChoiceVotes.values()).reduce((sum, count) => sum + count, 0);
      const winningThreshold = totalVotes * this.WINNING_THRESHOLD_PERCENTAGE;

      for (const [nomineeId, count] of firstChoiceVotes.entries()) {
        if (count > winningThreshold) {
          return {
            winner: nominees.find(n => n.id === nomineeId)!,
            rounds: [...rounds, { roundNumber: currentRound, voteCounts: firstChoiceVotes }]
          };
        }
      }

      const eliminatedId = this.findLowestScoringNominee(firstChoiceVotes);

      const eliminatedNominee = nominees.find(n => n.id === eliminatedId);
      rounds.push({
        roundNumber: currentRound,
        eliminatedNominee,
        voteCounts: new Map(firstChoiceVotes)
      });

      // Remove eliminated nominee from active nominees
      activeNominees = activeNominees.filter(n => n.id !== eliminatedId);

      // Redistribute votes from eliminated nominee
      currentVotes = this.redistributeVotes(currentVotes, eliminatedId, activeNominees);

      currentRound++;

      if (activeNominees.length === 0) {
        throw new Error('No winner could be determined');
      }

      if (currentRound > this.INITIAL_NOMINEES) {
        throw new Error('Voting exceeded maximum possible rounds');
      }
    }
  }

  private findLowestScoringNominee(firstChoiceVotes: Map<number, number>): number {
    let lowestVotes = Math.min(...Array.from(firstChoiceVotes.values()));
    let lowestNominees = Array.from(firstChoiceVotes.entries())
      .filter(([_, votes]) => votes === lowestVotes)
      .map(([nomineeId]) => nomineeId);
    return lowestNominees[0];
  }

  private redistributeVotes(votes: Vote[], eliminatedId: number, activeNominees: Nominee[]): Vote[] {
    return votes.map(vote => {
      const newRankings = vote.rankings.filter(id => id !== eliminatedId);
      return {
        ...vote,
        rankings: newRankings.filter(id => activeNominees.some(n => n.id === id))
      };
    });
  }

  private validateInput(votes: Vote[], nominees: Nominee[]): void {
    if (!votes.length) {
      throw new Error('Votes array cannot be empty');
    }

    votes.forEach(vote => {
      if (
        !Array.isArray(vote.rankings) ||
        vote.rankings.length !== this.INITIAL_NOMINEES ||
        !vote.rankings.every(r => typeof r === 'number')
      ) {
        throw new Error('Each initial vote must rank exactly 10 nominees');
      }

      const uniqueRankings = new Set(vote.rankings);
      if (uniqueRankings.size !== this.INITIAL_NOMINEES) {
        throw new Error('Each nominee must be given a unique ranking');
      }
    });
  }
}
