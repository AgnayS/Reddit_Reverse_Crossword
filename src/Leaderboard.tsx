import { Devvit } from '@devvit/public-api';

type LeaderboardProps = {
  leaderboard: { username: string; time: number }[];
  onBack: () => void;
};

export const Leaderboard = ({ leaderboard, onBack }: LeaderboardProps) => {

  return (
    <blocks height="tall">
      <zstack grow alignment="middle center">
        <image url="crossword.jpg" imageWidth={700} imageHeight={500} resizeMode="cover" />
        <vstack
          alignment="middle center"
          padding="medium"
          backgroundColor="rgba(255, 255, 255, 0.9)" // Increased opacity for better contrast
          cornerRadius="large"
          borderColor="#000000"
          width="60%"
        >
          <text size="large" weight="bold" color="#333333" alignment="middle center"> {/* Darker color for header */}
            🏆 Leaderboard
          </text>
          <spacer size="small" />
          {leaderboard.map((entry, index) => (
            <hstack key={String(index)} gap="small" alignment="middle center">
              <text color="#000000">{index + 1}.</text> {/* Black color for index */}
              <text color="#000000">{entry.username}</text> {/* Black color for username */}
              <spacer grow />
              <text color="#000000">{entry.time} seconds</text> {/* Black color for time */}
            </hstack>
          ))}
          <spacer size="medium" />
          <button appearance="secondary" onPress={onBack}>
            Back
          </button>
        </vstack>
      </zstack>
    </blocks>
  );
};
