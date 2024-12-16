import './createPost';
import { Devvit, useState } from '@devvit/public-api';
import { fetchWordsAndClues } from '../server/wordFetcher.server.ts';

Devvit.configure({
  redditAPI: true,
  http: true,
});

Devvit.addCustomPostType({
  name: 'DarkWord Game',
  height: 'tall',
  render: (context) => {
    const [webviewVisible, setWebviewVisible] = useState(false);
    const [username] = useState(async () => {
      const user = await context.reddit.getCurrentUser();
      return user?.username ?? 'guest';
    });

    const onLaunchClick = async () => {
      try {
        // Fetch the words data when launching the game
        const wordsData = await fetchWordsAndClues();
        console.log("Fetched game data:", wordsData); // Debug log
        
        // Send the data to the webview with proper typing
        context.ui.webView.postMessage('darkword', {
            message: 'INITIALIZE_GAME',
            payload: {
                theme: wordsData.theme,
                words: wordsData.words,
                clues: wordsData.clues
            }
        });
        setWebviewVisible(true);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };

    return (
      <blocks height="tall">
        <vstack grow padding="small">
          {/* Initial welcome screen */}
          <vstack 
            grow={!webviewVisible} 
            height={!webviewVisible ? '100%' : '0%'} 
            alignment="middle center"
          >
            <text size="xxlarge" weight="bold">DarkWord</text>
            <text size="medium">A Reverse Crossword Puzzle</text>
            <spacer size="medium" />
            <text alignment="center">
              Find the hidden crossword by blacking out extra letters.
              Solve the clues to help you find the real words!
            </text>
            <spacer size="medium" />
            <button appearance="primary" onPress={onLaunchClick}>
              Start Game
            </button>
          </vstack>

          {/* Game container */}
          <vstack 
            grow={webviewVisible}
            height={webviewVisible ? '100%' : '0%'}
          >
            <webview
              id="darkword"
              url="index.html"
              grow
              onMessage={(message) => {
                const msg = message as { type: string };
                if (msg.type === 'GAME_LOADED') {
                  onLaunchClick();
                }
              }}
            />
          </vstack>
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;