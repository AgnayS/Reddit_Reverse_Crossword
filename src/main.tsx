import './createPost';
import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
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

    const onLaunchClick = () => {
      setWebviewVisible(true);
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
              url="page.html"
              grow
            />
          </vstack>
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;