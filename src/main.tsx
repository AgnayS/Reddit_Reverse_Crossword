import './createPost';
import { Devvit, useState, useAsync } from '@devvit/public-api';
import { fetchWordsAndClues } from '../server/wordFetcher.server.ts';
import { saveUserTime, getLeaderboard } from '../server/leaderboard.server.ts';
import { Leaderboard } from './Leaderboard.tsx';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true,
});

type LeaderboardEntry = {
  username: string;
  time: number;
};

Devvit.addCustomPostType({
  name: 'DarkWord Game',
  height: 'tall',
  render: (context) => {
    const [webviewVisible, setWebviewVisible] = useState(false);
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [username, setUsername] = useState<string>('Guest');

    // Function to fetch and return the username
    const fetchUsername = async (): Promise<string> => {
      if (!context.userId) {
        console.warn("No user ID found, defaulting to Guest.");
        return "Guest";
      } else {
        const user = await context.reddit.getUserById(context.userId);
        if (user?.username) {
          return user.username;
        } else {
          return "Guest";
        }
      }
    };

    // Fetch leaderboard with logging
    const showLeaderboard = async () => {
      const scores = await getLeaderboard(context.redis);
      setLeaderboard(scores);
      setLeaderboardVisible(true);
    };

    // Launch game
    const onLaunchClick = async () => {
      const wordsData = await fetchWordsAndClues();

      const currentUsername = await fetchUsername();
      setUsername(currentUsername);

      context.ui.webView.postMessage('darkword', {
        message: 'INITIALIZE_GAME',
        payload: {
          theme: wordsData.theme,
          words: wordsData.words,
          clues: wordsData.clues,
          username: currentUsername, // Pass the username immediately
        },
      });
      setWebviewVisible(true);
    };


    // Handle game completion
    const onGameComplete = async (time: number) => {
      
      const currentUsername = await fetchUsername(); // Fetch username fresh


      // Save time
  
      await saveUserTime(context.redis, currentUsername, time);

      const updatedLeaderboard = await getLeaderboard(context.redis);
      setLeaderboard(updatedLeaderboard);
    };


    
    // Conditional render
    if (leaderboardVisible) {
      return <Leaderboard leaderboard={leaderboard} onBack={() => setLeaderboardVisible(false)} />;
    }

    return (
      <blocks height="tall">
        <vstack grow padding="small">
          {!webviewVisible ? (
            <zstack grow alignment="middle center">
              <image url="crossword.jpg" imageWidth={700} imageHeight={500} resizeMode="cover" />
              <vstack
                alignment="middle center"
                padding="medium"
                backgroundColor="rgba(255,255,255,0.8)"
                cornerRadius="large"
                borderColor="#000000"
                width="60%"
              >
                <text size="xxlarge" weight="bold" color="#000000">DarkWord</text>
                <text size="large" color="#000000">A Reverse Crossword Puzzle</text>
                <spacer size="medium" />
                <hstack gap="small" alignment="middle center">
                  <button appearance="primary" onPress={onLaunchClick}>🚀 Start Game</button>
                  <button appearance="secondary" onPress={showLeaderboard}>🏆 Leaderboard</button>
                </hstack>
              </vstack>
            </zstack>
          ) : (
            <vstack grow>
              <webview
                id="darkword"
                url="index.html"
                grow
                onMessage={(event) => {
                  const message = event as { type?: string; payload?: { time?: number } };
                  if (message?.type === 'GAME_COMPLETE' && message.payload?.time) {
                    onGameComplete(message.payload.time);
                  }
                }}
              />
            </vstack>
          )}
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;