import './createPost.js';
import { Devvit, useState } from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | { type: 'initialData'; data: { username: string } }
  | { type: 'setBlackout'; data: { blackoutCells: string[][] } };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Darkword',
  height: 'tall',
  render: (context) => {
    // Reactive state for showing the web view
    const [webviewVisible, setWebviewVisible] = useState(false);

    // Function to handle messages from the web view
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'setBlackout':
          console.log('Received blackout data:', msg.data.blackoutCells);
          break;

        case 'initialData':
          break;

        default:
          throw new Error(`Unknown message type: ${msg satisfies never}`);
      }
    };

    // Show the web view when the button is clicked
    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      context.ui.webView.postMessage('darkwordWebView', {
        type: 'initialData',
        data: { username: 'anon' },
      });
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <text size="xlarge" weight="bold">
            Darkword
          </text>
          <spacer />
          <button onPress={onShowWebviewClick}>Launch Crossword</button>
        </vstack>
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="darkwordWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
