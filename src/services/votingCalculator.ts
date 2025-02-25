import { Vote, Nominee, VotingResult } from '../types';

export class PreferentialVotingCalculator {
  calculateWinner(votes: Vote[], nominees: Nominee[]): VotingResult {
    let currentRound = 1;
    let currentVotes = [...votes];
    let activeNominees = [...nominees];
    const rounds = [];
    
    while (true) {
      // Count first-choice votes
      const voteCounts = new Map<number, number>();
      activeNominees.forEach(nominee => voteCounts.set(nominee.id, 0));
      
      currentVotes.forEach(vote => {
        const firstChoice = vote.rankings[0];
        voteCounts.set(firstChoice, (voteCounts.get(firstChoice) || 0) + 1);
      });

      // Check for winner
      const totalVotes = currentVotes.length;
      const winningThreshold = totalVotes / 2;

      for (const [nomineeId, count] of voteCounts.entries()) {
        if (count > winningThreshold) {
          return {
            winner: nominees.find(n => n.id === nomineeId)!,
            rounds: [...rounds, { roundNumber: currentRound, voteCounts }]
          };
        }
      }

      // Find nominee with fewest votes
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

      const eliminatedNominee = nominees.find(n => n.id === eliminatedIds[0]);
      rounds.push({
        roundNumber: currentRound,
        eliminatedNominee,
        voteCounts
      });

      // Remove eliminated nominees and redistribute votes
      activeNominees = activeNominees.filter(n => !eliminatedIds.includes(n.id));
      currentVotes = currentVotes.map(vote => ({
        ...vote,
        rankings: vote.rankings.filter(r => !eliminatedIds.includes(r))
      }));

      currentRound++;
    }
  }
}