import './createPost';
import { Devvit, useState } from '@devvit/public-api';
import { fetchWordsAndClues } from '../server/wordFetcher.server.ts';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true
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
        console.log("Fetched game data:", wordsData);

        // Send the data to the webview
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
          {!webviewVisible ? (
            <zstack grow height="100%" alignment="middle center">
              {/* Background Image */}
              <image 
                url="crossword.jpg" 
                imageWidth={700} 
                imageHeight={500} 
                resizeMode="cover"
              />

              {/* Semi-transparent panel */}
              <vstack 
                alignment="middle center" 
                padding="medium"
                backgroundColor="rgba(255,255,255,0.6)"
                cornerRadius="large"
                borderColor="#000000"
                borderWidth={2}
                width="60%"
              >
                {/* Title Section */}
                <text 
                  size="xxlarge" 
                  color="#000000" 
                  weight="bold" 
                  alignment="middle center"
                >
                  DarkWord
                </text>
                <text 
                  size="large" 
                  color="#000000" 
                  weight="bold" 
                  alignment="middle center"
                >
                  A Reverse Crossword Puzzle
                </text>

                <spacer size="small" />

                {/* Description */}
                <text 
                  size="medium" 
                  alignment="middle center" 
                  color="#000000"
                >
                  Find the hidden words by solving clues!
                </text>

                <spacer size="medium" />

                {/* Start Game Button */}
                <button 
                  appearance="primary" 
                  onPress={onLaunchClick}
                >
                  🚀 Start Game
                </button>
              </vstack>
            </zstack>
          ) : (
            <vstack grow height="100%">
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
          )}
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
