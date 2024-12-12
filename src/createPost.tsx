import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Create New DarkWord Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    const post = await reddit.submitPost({
      title: 'DarkWord - Reverse Crossword Puzzle',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading DarkWord Game...</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'Created new DarkWord game!' });
    ui.navigateTo(post.url);
  },
});