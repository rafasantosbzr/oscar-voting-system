export interface Nominee {
  id: number;
  title: string;
}

export interface Vote {
  id: string;
  rankings: number[];
  timestamp: string;
}

export interface VotingResult {
  winner: Nominee;
  rounds: RoundResult[];
}

export interface RoundResult {
  roundNumber: number;
  eliminatedNominee?: Nominee;
  voteCounts: Map<number, number>;
}