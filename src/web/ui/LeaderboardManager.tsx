// src/web/ui/LeaderboardManager.tsx

export class LeaderboardManager {
    private element: HTMLDivElement | null;

    constructor() {
        this.element = document.querySelector('#leaderboard');
    }

    public async updateLeaderboard(scores: Array<{username: string, time: number}>) {
        if (!this.element) return;

        this.element.innerHTML = '';
        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold mb-3';
        title.textContent = 'Today\'s Top Solvers';
        this.element.appendChild(title);

        const scoresList = document.createElement('div');
        scoresList.className = 'space-y-2';

        scores
            .sort((a, b) => a.time - b.time)
            .slice(0, 10)
            .forEach((score, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'flex items-center justify-between p-2 bg-white rounded-lg shadow-sm';

                const position = document.createElement('span');
                position.className = 'font-bold ' + (index < 3 ? 'text-blue-600' : 'text-gray-600');
                position.textContent = `#${index + 1}`;

                const username = document.createElement('span');
                username.textContent = score.username;

                const time = document.createElement('span');
                time.className = 'font-mono';
                time.textContent = this.formatTime(score.time);

                scoreItem.appendChild(position);
                scoreItem.appendChild(username);
                scoreItem.appendChild(time);
                scoresList.appendChild(scoreItem);
            });

        this.element.appendChild(scoresList);
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}