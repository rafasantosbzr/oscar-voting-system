import { Vote, Nominee, VotingResult } from '../types';

export class PreferentialVotingCalculator {
  private readonly WINNING_THRESHOLD_PERCENTAGE = 0.5;
  private readonly MAX_NOMINEES = 10;

  calculateWinner(votes: Vote[], nominees: Nominee[]): VotingResult {
    // Input validation
    this.validateInput(votes, nominees);

    if (nominees.length > this.MAX_NOMINEES) {
      throw new Error('Maximum of 10 nominees allowed');
    }

    let currentRound = 1;
    let currentVotes = [...votes];
    let activeNominees = [...nominees];
    const rounds = [];
    
    while (true) {
      // Count current top choices for each ballot
      const voteCounts = new Map<number, number>();
      activeNominees.forEach(nominee => voteCounts.set(nominee.id, 0));
      
      // Count each ballot's highest remaining choice
      currentVotes.forEach(vote => {
        if (vote.rankings.length > 0) {
          const topChoice = vote.rankings[0]; // First remaining choice
          voteCounts.set(topChoice, (voteCounts.get(topChoice) || 0) + 1);
        }
      });

      // Check for winner
      const totalVotes = currentVotes.length;
      const winningThreshold = totalVotes * this.WINNING_THRESHOLD_PERCENTAGE;

      for (const [nomineeId, count] of voteCounts.entries()) {
        if (count > winningThreshold) {
          return {
            winner: nominees.find(n => n.id === nomineeId)!,
            rounds: [...rounds, { roundNumber: currentRound, voteCounts }]
          };
        }
      }

      // Find nominee(s) with fewest votes
      let minVotes = Infinity;
      let eliminatedIds: number[] = [];
      
      voteCounts.forEach((count, nomineeId) => {
        if (count === 0) return;
        if (count < minVotes) {
          minVotes = count;
          eliminatedIds = [nomineeId];
        } else if (count === minVotes) {
          eliminatedIds.push(nomineeId);
        }
      });

      // Record this round
      const eliminatedNominee = nominees.find(n => n.id === eliminatedIds[0]);
      rounds.push({
        roundNumber: currentRound,
        eliminatedNominee,
        voteCounts
      });

      // Remove eliminated nominees from active list
      activeNominees = activeNominees.filter(n => !eliminatedIds.includes(n.id));

      // Remove eliminated nominees from each ballot's rankings
      currentVotes = currentVotes.map(vote => ({
        ...vote,
        rankings: vote.rankings.filter(r => !eliminatedIds.includes(r))
      }));

      currentRound++;

      // Safety checks
      if (activeNominees.length === 0) {
        throw new Error('No winner could be determined');
      }

      if (currentRound > nominees.length) {
        throw new Error('Voting exceeded maximum possible rounds');
      }
    }
  }

  private validateInput(votes: Vote[], nominees: Nominee[]): void {
    if (!votes.length || !nominees.length) {
      throw new Error('Votes and nominees arrays cannot be empty');
    }

    if (!Array.isArray(votes) || !Array.isArray(nominees)) {
      throw new Error('Invalid input format');
    }
    
    votes.forEach(vote => {
      if (!Array.isArray(vote.rankings) || 
          !vote.rankings.every(r => typeof r === 'number')) {
        throw new Error('Invalid vote format');
      }
    });
  }
}