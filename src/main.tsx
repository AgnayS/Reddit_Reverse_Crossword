import './createPost';
import { Devvit, useState } from '@devvit/public-api';
import { fetchWordsAndClues } from '../server/wordFetcher.server.ts';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
  realtime: true,
});

Devvit.addCustomPostType({
  name: 'DarkWord Game',
  height: 'tall',
  render: (context) => {
    const [webviewVisible, setWebviewVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Loading Overlay Component
    const LoadingOverlay = () => (
      <zstack
        width="100%"
        height="100%"
        alignment="middle center"
        backgroundColor="rgba(255,255,255,0.95)"
      >
        <vstack alignment="middle center" gap="medium">
          <hstack gap="small" alignment="middle center">
            <text size="xxlarge" color="#0079D3">🔄</text>
            <text size="large" color="#0079D3" weight="bold">
              Loading, please wait...
            </text>
          </hstack>
        </vstack>
      </zstack>
    );

    // Start Game Handler
    const onLaunchClick = async () => {
      setIsLoading(true); // Show loader
      setWebviewVisible(false); // Hide WebView if previously loaded
      setErrorMessage(null); // Clear any previous errors

      try {
        console.log("Starting data fetch...");
        const wordsData = await fetchWordsAndClues();

        // Validate Data
        if (!wordsData || !wordsData.words || !wordsData.clues) {
          throw new Error("Incomplete data received");
        }

        console.log("Fetched Game Data:", wordsData);

        // Send game data to the WebView
        context.ui.webView.postMessage('darkword', {
          message: 'INITIALIZE_GAME',
          payload: {
            theme: wordsData.theme,
            words: wordsData.words,
            clues: wordsData.clues,
          },
        });

        // Display the WebView
        setWebviewVisible(true);
      } catch (error) {
        console.error("Error loading game:", error);
        setErrorMessage("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false); // Stop loader
      }
    };

    // Main Render
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
            <zstack grow height="100%" alignment="middle center">
              {/* Background Image */}
              <image
                url="crossword.jpg"
                imageWidth={700}
                imageHeight={500}
                resizeMode="cover"
              />

              {/* Semi-Transparent Overlay */}
              <vstack
                alignment="middle center"
                padding="medium"
                backgroundColor="rgba(255,255,255,0.8)"
                cornerRadius="large"
                borderColor="#000000"
                borderWidth={2}
                width="60%"
              >
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

                <text size="medium" alignment="middle center" color="#000000">
                  Find the hidden words by solving clues!
                </text>

                <spacer size="medium" />

                <button
                  appearance="primary"
                  onPress={onLaunchClick}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Loading...' : '🚀 Start Game'}
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
                    console.log("Game loaded successfully");
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
