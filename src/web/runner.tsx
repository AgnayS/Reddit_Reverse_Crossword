// FILE: web/runner.tsx
import { Game } from './core/Game.tsx';

class GameManager {
    private game: Game | null = null;

    constructor() {
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    private init(): void {
        this.setupUIHandlers();
        this.setupMessageHandlers();
        
        // Notify Devvit that the game is ready to receive data
        window.parent.postMessage({
            type: 'GAME_LOADED'
        }, '*');
    }

    private setupMessageHandlers(): void {
        // Listen for messages from Devvit
        window.addEventListener('message', (event) => {
            if (event.data.type === 'devvit-message') {
                const devvitData = event.data.data;
                if (devvitData && devvitData.message && devvitData.message.message === 'INITIALIZE_GAME') {
                    if (!this.game) {
                        this.game = new Game();
                    }
                    this.game.initializeWithData(devvitData.message.payload);
                }
            }
        });
    }

    private setupUIHandlers(): void {
        const welcomeOverlay = document.getElementById('welcome-overlay')!;
        const tutorialOverlay = document.getElementById('tutorial-overlay')!;
        const gameContent = document.getElementById('game-content')!;
        const startGameBtn = document.getElementById('start-game')!;
        const howToPlayBtn = document.getElementById('how-to-play')!;
        const backToWelcomeBtn = document.getElementById('back-to-welcome')!;
        const startFromTutorialBtn = document.getElementById('start-from-tutorial')!;

        startGameBtn.addEventListener('click', () => {
            this.showGame(welcomeOverlay, tutorialOverlay, gameContent);
        });

        howToPlayBtn.addEventListener('click', () => {
            welcomeOverlay.classList.add('hidden');
            tutorialOverlay.classList.remove('hidden');
        });

        backToWelcomeBtn.addEventListener('click', () => {
            tutorialOverlay.classList.add('hidden');
            welcomeOverlay.classList.remove('hidden');
        });

        startFromTutorialBtn.addEventListener('click', () => {
            this.showGame(welcomeOverlay, tutorialOverlay, gameContent);
        });
    }

    private showGame(welcomeOverlay: HTMLElement, tutorialOverlay: HTMLElement, gameContent: HTMLElement) {
        welcomeOverlay.classList.add('hidden');
        tutorialOverlay.classList.add('hidden');
        gameContent.classList.remove('hidden');
        // No timer starts here. The timer is only started inside Game class once data is ready.
    }
}

new GameManager();