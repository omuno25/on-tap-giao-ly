import leaderboardData from "@/data/leaderboard.json";

export type LeaderboardLearner = {
  id: string;
  name: string;
  points: number;
  cardsLearned: number;
  streak: number;
};

export const LEADERBOARD_META = leaderboardData.meta;
export const LEADERBOARD =
  leaderboardData.learners satisfies LeaderboardLearner[];
