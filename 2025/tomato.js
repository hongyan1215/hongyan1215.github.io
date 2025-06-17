class PomodoroTimer {
    constructor() {
        this.focusTime = 25 * 60; // 25 minutes in seconds
        this.breakTime = 5 * 60;  // 5 minutes in seconds
        this.timeLeft = this.focusTime;
        this.isRunning = false;
        this.isFocusTime = true;
        this.timerId = null;
        this.tomatoCount = 0;

        // DOM elements
        this.timerDisplay = document.getElementById('timer');
        this.timerLabel = document.getElementById('timerLabel');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.tomatoCountDisplay = document.getElementById('tomatoCount');
        this.tomatoesContainer = document.getElementById('tomatoes');
        this.focusSound = document.getElementById('focusSound');
        this.breakSound = document.getElementById('breakSound');

        // Bind event listeners
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Initialize display
        this.updateDisplay();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timerId = setInterval(() => this.tick(), 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.timerId);
        }
    }

    reset() {
        this.pause();
        this.timeLeft = this.focusTime;
        this.isFocusTime = true;
        this.updateDisplay();
        this.timerLabel.textContent = '專注時間';
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateDisplay();
        } else {
            this.handleTimerComplete();
        }
    }

    handleTimerComplete() {
        if (this.isFocusTime) {
            // Focus time completed
            this.focusSound.play();
            this.addTomato();
            this.timeLeft = this.breakTime;
            this.isFocusTime = false;
            this.timerLabel.textContent = '休息時間';
        } else {
            // Break time completed
            this.breakSound.play();
            this.timeLeft = this.focusTime;
            this.isFocusTime = true;
            this.timerLabel.textContent = '專注時間';
        }
        this.updateDisplay();
    }

    addTomato() {
        this.tomatoCount++;
        this.tomatoCountDisplay.textContent = this.tomatoCount;
        
        const tomato = document.createElement('div');
        tomato.className = 'tomato';
        this.tomatoesContainer.appendChild(tomato);
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 