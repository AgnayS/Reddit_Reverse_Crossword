import { RedisClient } from '@devvit/public-api';

export type LeaderboardEntry = {
  username: string;
  time: number;
};

export async function saveUserTime(redis: RedisClient, username: string, time: number): Promise<void> {
  console.log(`Attempting to save time for ${username}: ${time} seconds.`);
  await redis.zAdd('leaderboard', { score: time, member: username });
  console.log(`Successfully saved time for ${username}.`);
}

export async function getLeaderboard(redis: RedisClient, count: number = 10): Promise<LeaderboardEntry[]> {
  console.log("Fetching leaderboard data...");

  // Be sure to fetch the data with scores.
  // If by default it returns objects with { member, score }, this should be fine:
  const result = await redis.zRange('leaderboard', 0, count - 1, { by: 'rank' });
  console.log("Raw leaderboard data from Redis:", result);

  const leaderboard: LeaderboardEntry[] = [];

  // Now, each element of `result` is { member: string, score: number }
  for (const entry of result) {
    leaderboard.push({
      username: entry.member,
      time: entry.score,
    });
  }

  console.log("Formatted leaderboard data:", leaderboard);
  return leaderboard;
}


