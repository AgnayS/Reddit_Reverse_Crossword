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
      console.log("Attempting to fetch username...");
      if (!context.userId) {
        console.warn("No user ID found, defaulting to Guest.");
        return "Guest";
      } else {
        const user = await context.reddit.getUserById(context.userId);
        if (user?.username) {
          console.log("Fetched username successfully:", user.username);
          return user.username;
        } else {
          console.warn("No username found for userId:", context.userId);
          return "Guest";
        }
      }
    };

    // Fetch leaderboard with logging
    const showLeaderboard = async () => {
      console.log("Fetching leaderboard data...");
      const scores = await getLeaderboard(context.redis);
      console.log("Fetched leaderboard data:", scores);
      setLeaderboard(scores);
      setLeaderboardVisible(true);
    };

    // Launch game
    const onLaunchClick = async () => {
      console.log("Fetching words and clues...");
      const wordsData = await fetchWordsAndClues();
      console.log("Fetched words data:", wordsData);

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
      console.log("Sent game initialization data to webview.");
      setWebviewVisible(true);
    };


    // Handle game completion
    const onGameComplete = async (time: number) => {
      console.log(`Game completed! Received time: ${time} seconds.`);
      
      const currentUsername = await fetchUsername(); // Fetch username fresh
      console.log(`Using username: ${currentUsername} to save time.`);

      // Save time
      console.log(`Saving time for ${currentUsername}: ${time} seconds.`);
      await saveUserTime(context.redis, currentUsername, time);
      console.log("Time saved successfully.");

      // Fetch updated leaderboard
      console.log("Fetching updated leaderboard...");
      const updatedLeaderboard = await getLeaderboard(context.redis);
      console.log("Updated leaderboard data:", updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
    };



    // Conditional render
    if (leaderboardVisible) {
      console.log("Rendering leaderboard...");
      return <Leaderboard leaderboard={leaderboard} onBack={() => setLeaderboardVisible(false)} />;
    }

    return (
      <blocks height="tall">
        <vstack grow padding="small">
          {/* Show Loader */}
          {isLoading && <LoadingOverlay />}

          {/* Error Message */}
          {errorMessage && (
            <text
              size="medium"
              color="red"
              alignment="middle center"
              weight="bold"
            >
              {errorMessage}
            </text>
          )}

          {/* Conditional Render: Show Start Screen or WebView */}
          {!webviewVisible ? (
            <zstack grow alignment="middle center">
              <image url="crossword.jpg" imageWidth={700} imageHeight={500} resizeMode="cover" />
              <vstack
                alignment="middle center"
                padding="medium"
                backgroundColor="rgba(255,255,255,0.8)"
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
                  console.log("Message received from webview:", message);
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
