export class Timer {
    private element: HTMLElement | null;
    private startTime: number | null;
    private timerInterval: number | null;

    constructor() {
        this.element = document.getElementById('timer');
        this.startTime = null;
        this.timerInterval = null;
    }

    public start(): void {
        this.startTime = Date.now();
        this.timerInterval = window.setInterval(() => {
            this.updateDisplay();
        }, 1000);
        this.updateDisplay();
    }

    private updateDisplay(): void {
        if (!this.element || !this.startTime) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        this.element.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    public stop(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    public reset(): void {
        this.stop();
        if (this.element) {
            this.element.textContent = '00:00';
        }
        this.start();
    }
}
