export interface Vote {
  rankings: number[];
  timestamp?: string;
}

export interface Nominee {
  id: number;
  name: string;
  title: string;
}

export interface Round {
  roundNumber: number;
  voteCounts: Map<number, number>;
  eliminatedNominee?: Nominee;
}

export interface VotingResult {
  winner: Nominee;
  rounds: Round[];
}