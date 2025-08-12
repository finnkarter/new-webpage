/**
 * Games.js - 미니게임 모음
 */

class GamesApp {
    constructor() {
        this.currentModal = null;
        this.gameStats = Utils.storage.get('milbase_game_stats', {
            baseball: { played: 0, won: 0, bestScore: 0 },
            rps: { played: 0, won: 0, streak: 0, maxStreak: 0 },
            quiz: { played: 0, correct: 0, totalQuestions: 0 },
            memory: { played: 0, won: 0, bestTime: 0 },
            wordchain: { played: 0, maxWords: 0 },
            calculator: { played: 0, bestScore: 0 }
        });
        
        // 게임별 데이터
        this.baseballAnswer = '';
        this.baseballAttempts = 0;
        this.baseballHistory = [];
        
        this.rpsStreak = 0;
        this.rpsHistory = [];
        
        this.quizQuestions = [];
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        
        this.memoryCards = [];
        this.memoryFlipped = [];
        this.memoryMatched = [];
        this.memoryStartTime = 0;
        
        this.wordChainWords = [];
        this.lastWord = '';
        
        this.calculatorScore = 0;
        this.calculatorTime = 30;
        this.calculatorTimer = null;

        // 반응속도
        this.reactionState = { waiting: false, startTime: 0, bestMs: null, history: [] };

        // 2048
        this.game2048 = {
            size: 4,
            board: [],
            score: 0,
            best: Utils.storage.get('milbase_2048_best', 0)
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initQuizData();
        this.updateStatsDisplay();
        this.initAchievements();
        console.log('🎮 게임 애플리케이션이 초기화되었습니다.');
    }

    setupEventListeners() {
        // 게임 카드 클릭
        document.querySelectorAll('.game-card').forEach(card => {
            Utils.on(card, 'click', () => {
                const game = card.dataset.game;
                this.openGame(game);
            });
        });
    }

    openGame(gameType) {
        switch (gameType) {
            case 'reaction':
                this.openReaction();
                break;
            case 'game2048':
                this.open2048();
                break;
            case 'baseball':
                this.openBaseball();
                break;
            case 'rps':
                this.openRockPaperScissors();
                break;
            case 'quiz':
                this.openQuiz();
                break;
            case 'memory':
                this.openMemoryGame();
                break;
            case 'wordchain':
                this.openWordChain();
                break;
            case 'calculator':
                this.openCalculator();
                break;
        }
    }

    // === 반응속도 테스트 ===
    openReaction() {
        this.reactionState = { waiting: false, startTime: 0, bestMs: this.reactionState.bestMs, history: this.reactionState.history };
        this.createGameModal('⚡ 반응속도 테스트', `
            <div class="game-area" id="reactionArea" style="padding: 2rem; cursor: pointer; user-select: none;">
                <h4>화면이 초록색으로 바뀌면 즉시 클릭하세요!</h4>
                <div id="reactionInfo" style="margin: 1rem 0; color: var(--color-text-muted);">
                    준비되면 아래 영역을 클릭하세요.
                </div>
                <div id="reactionBox" style="height: 200px; border-radius: var(--radius-lg); background: #b91c1c; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                    클릭하여 시작
                </div>
                <div style="margin-top: 1rem;">
                    <div>최고 기록: <span id="reactionBest">${this.reactionState.bestMs ?? '-'} ms</span></div>
                    <div id="reactionLast">마지막: -</div>
                </div>
            </div>
        `);

        const box = document.getElementById('reactionBox');
        const info = document.getElementById('reactionInfo');
        const best = document.getElementById('reactionBest');
        const last = document.getElementById('reactionLast');

        let timeoutId = null;
        const startWait = () => {
            box.style.background = '#b91c1c';
            box.textContent = '초록색이 되면 클릭!';
            info.textContent = '대기 중...';
            this.reactionState.waiting = true;
            timeoutId = setTimeout(() => {
                box.style.background = '#166534';
                box.textContent = '지금!';
                this.reactionState.startTime = performance.now();
                this.reactionState.waiting = false;
            }, Utils.randomInt(1200, 3000));
        };

        box.addEventListener('click', () => {
            if (this.reactionState.startTime && !this.reactionState.waiting) {
                const ms = Math.round(performance.now() - this.reactionState.startTime);
                last.textContent = `마지막: ${ms} ms`;
                if (this.reactionState.bestMs === null || ms < this.reactionState.bestMs) {
                    this.reactionState.bestMs = ms;
                    best.textContent = `${ms} ms`;
                }
                this.reactionState.history.unshift(ms);
                if (this.reactionState.history.length > 10) this.reactionState.history.pop();
                this.reactionState.startTime = 0;
                startWait();
            } else if (this.reactionState.waiting) {
                // 성급 클릭
                info.textContent = '너무 빨라요! 다시 시도하세요.';
                clearTimeout(timeoutId);
                startWait();
            } else {
                startWait();
            }
        });
    }

    // === 2048 ===
    open2048() {
        this.init2048();
        this.createGameModal('🔳 2048', `
            <div class="game-area" style="max-width: 360px; margin: 0 auto;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>점수: <strong id="g2048Score">0</strong></div>
                    <div>최고: <strong id="g2048Best">${this.game2048.best}</strong></div>
                </div>
                <div id="g2048Board" style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    background: var(--color-surface);
                    padding: 8px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--color-border);
                "></div>
                <div style="margin-top:1rem; color: var(--color-text-muted);">방향키(←↑→↓)로 이동합니다.</div>
            </div>
        `);

        this.render2048();
        this.bind2048Keys();
    }

    init2048() {
        this.game2048.board = Array.from({ length: 4 }, () => Array(4).fill(0));
        this.game2048.score = 0;
        this.addRandomTile2048();
        this.addRandomTile2048();
    }

    addRandomTile2048() {
        const empty = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.game2048.board[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return false;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        this.game2048.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    render2048() {
        const boardEl = document.getElementById('g2048Board');
        const scoreEl = document.getElementById('g2048Score');
        const bestEl = document.getElementById('g2048Best');
        if (!boardEl) return;
        scoreEl.textContent = this.game2048.score;
        bestEl.textContent = this.game2048.best;
        boardEl.innerHTML = '';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const val = this.game2048.board[r][c];
                const cell = document.createElement('div');
                cell.style.cssText = `
                    height: 72px; display:flex; align-items:center; justify-content:center;
                    border-radius: 8px; font-weight: 800; font-size: 1.25rem;
                    background: ${val ? 'var(--primary-700)' : 'var(--color-card)'};
                    color: ${val ? 'white' : 'var(--color-text-subtle)'};
                `;
                cell.textContent = val ? String(val) : '';
                boardEl.appendChild(cell);
            }
        }
    }

    bind2048Keys() {
        const handler = (e) => {
            const key = e.key;
            const before = JSON.stringify(this.game2048.board);
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)) {
                e.preventDefault();
                switch (key) {
                    case 'ArrowLeft': this.move2048('left'); break;
                    case 'ArrowRight': this.move2048('right'); break;
                    case 'ArrowUp': this.move2048('up'); break;
                    case 'ArrowDown': this.move2048('down'); break;
                }
                const after = JSON.stringify(this.game2048.board);
                if (before !== after) {
                    this.addRandomTile2048();
                    this.render2048();
                    if (this.is2048GameOver()) {
                        this.finish2048();
                    }
                }
            }
        };
        Utils.on(window, 'keydown', handler);
        // 모달 닫힐 때 해제 위해 currentModal에 리스너 참조 저장
        if (this.currentModal) this.currentModal._g2048KeyHandler = handler;
    }

    move2048(dir) {
        const size = 4;
        const b = this.game2048.board;
        const rotateRight = (m) => m[0].map((_, i) => m.map(row => row[i]).reverse());
        const rotateLeft = (m) => rotateRight(rotateRight(rotateRight(m)));
        const reverse = (m) => m.map(row => row.slice().reverse());

        const compress = (row) => row.filter(v => v !== 0).concat(Array(size - row.filter(v => v !== 0).length).fill(0));
        const merge = (row) => {
            for (let i = 0; i < size - 1; i++) {
                if (row[i] !== 0 && row[i] === row[i + 1]) {
                    row[i] *= 2;
                    this.game2048.score += row[i];
                    row[i + 1] = 0;
                }
            }
            return row;
        };

        let board = b.map(row => row.slice());
        if (dir === 'up') {
            board = rotateLeft(board);
        } else if (dir === 'down') {
            board = rotateRight(board);
        } else if (dir === 'right') {
            board = reverse(board);
        }

        for (let r = 0; r < size; r++) {
            let row = board[r];
            row = compress(row);
            row = merge(row);
            row = compress(row);
            board[r] = row;
        }

        if (dir === 'up') {
            board = rotateRight(board);
        } else if (dir === 'down') {
            board = rotateLeft(board);
        } else if (dir === 'right') {
            board = reverse(board);
        }

        this.game2048.board = board;
    }

    is2048GameOver() {
        const b = this.game2048.board;
        // 빈칸 있으면 아직 진행
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (b[r][c] === 0) return false;
        // 인접 합쳐질 타일 검사
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr>=0 && nr<4 && nc>=0 && nc<4 && b[r][c] === b[nr][nc]) return false;
            }
        }
        return true;
    }

    finish2048() {
        if (this.game2048.score > this.game2048.best) {
            this.game2048.best = this.game2048.score;
            Utils.storage.set('milbase_2048_best', this.game2048.best);
        }
        window.toast?.show(`게임 종료! 점수: ${this.game2048.score}`, 'info');
    }

    // === 숫자야구 게임 ===
    openBaseball() {
        this.generateBaseballAnswer();
        this.baseballAttempts = 0;
        this.baseballHistory = [];
        
        this.createGameModal('⚾ 숫자야구', `
            <div class="game-area">
                <h4>3자리 숫자를 맞춰보세요!</h4>
                <p style="color: var(--color-text-muted); margin: var(--space-2) 0;">
                    서로 다른 숫자 3개로 이루어진 숫자를 맞춰야 합니다.
                </p>
                <div style="margin: var(--space-4) 0;">
                    <input type="text" id="baseballInput" class="game-input" placeholder="예: 123" maxlength="3">
                    <br>
                    <button class="game-button" onclick="window.gamesApp.makeBaseballGuess()">도전!</button>
                    <button class="game-button secondary" onclick="window.gamesApp.newBaseballGame()">새 게임</button>
                </div>
                <div id="baseballResult" style="margin: var(--space-2) 0; min-height: 30px; font-weight: var(--weight-medium);"></div>
            </div>
            <div class="game-history" id="baseballHistory">
                <strong>시도 기록</strong>
                <div id="baseballHistoryList">게임을 시작해보세요!</div>
            </div>
        `);
        
        // 입력 필드에 포커스
        setTimeout(() => {
            const input = document.getElementById('baseballInput');
            if (input) {
                input.focus();
                Utils.on(input, 'keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.makeBaseballGuess();
                    }
                    // 숫자만 입력 허용
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                    }
                });
            }
        }, 100);
    }

    generateBaseballAnswer() {
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        Utils.shuffle(digits);
        this.baseballAnswer = digits.slice(0, 3).join('');
        console.log('Answer:', this.baseballAnswer); // 디버깅용
    }

    makeBaseballGuess() {
        const input = document.getElementById('baseballInput');
        const resultDiv = document.getElementById('baseballResult');
        const historyDiv = document.getElementById('baseballHistoryList');
        
        if (!input || !resultDiv || !historyDiv) return;
        
        const guess = input.value.trim();
        
        // 유효성 검사
        if (guess.length !== 3) {
            resultDiv.innerHTML = '<span style="color: var(--error);">3자리 숫자를 입력해주세요!</span>';
            return;
        }
        
        if (!/^\d{3}$/.test(guess)) {
            resultDiv.innerHTML = '<span style="color: var(--error);">숫자만 입력해주세요!</span>';
            return;
        }
        
        if (new Set(guess).size !== 3) {
            resultDiv.innerHTML = '<span style="color: var(--error);">서로 다른 숫자를 입력해주세요!</span>';
            return;
        }
        
        this.baseballAttempts++;
        const result = this.checkBaseballGuess(guess);
        
        // 기록 추가
        this.baseballHistory.push({
            guess: guess,
            result: result,
            attempt: this.baseballAttempts
        });
        
        // 결과 표시
        if (result.strike === 3) {
            resultDiv.innerHTML = `<span style="color: var(--success);">🎉 정답입니다! ${this.baseballAttempts}번 만에 맞추셨습니다!</span>`;
            this.gameStats.baseball.played++;
            this.gameStats.baseball.won++;
            if (this.gameStats.baseball.bestScore === 0 || this.baseballAttempts < this.gameStats.baseball.bestScore) {
                this.gameStats.baseball.bestScore = this.baseballAttempts;
            }
            this.saveGameStats();
            input.disabled = true;
        } else {
            resultDiv.innerHTML = `<span style="color: var(--color-text);">${result.strike}S ${result.ball}B</span>`;
        }
        
        // 히스토리 업데이트
        historyDiv.innerHTML = this.baseballHistory.map(h => 
            `<div style="margin: var(--space-1) 0;">${h.attempt}. ${h.guess} → ${h.result.strike}S ${h.result.ball}B</div>`
        ).join('');
        
        input.value = '';
        input.focus();
    }

    checkBaseballGuess(guess) {
        let strike = 0;
        let ball = 0;
        
        for (let i = 0; i < 3; i++) {
            if (guess[i] === this.baseballAnswer[i]) {
                strike++;
            } else if (this.baseballAnswer.includes(guess[i])) {
                ball++;
            }
        }
        
        return { strike, ball };
    }

    newBaseballGame() {
        this.generateBaseballAnswer();
        this.baseballAttempts = 0;
        this.baseballHistory = [];
        
        const input = document.getElementById('baseballInput');
        const resultDiv = document.getElementById('baseballResult');
        const historyDiv = document.getElementById('baseballHistoryList');
        
        if (input) {
            input.disabled = false;
            input.value = '';
            input.focus();
        }
        if (resultDiv) resultDiv.innerHTML = '';
        if (historyDiv) historyDiv.innerHTML = '게임을 시작해보세요!';
    }

    // === 가위바위보 게임 ===
    openRockPaperScissors() {
        this.rpsStreak = 0;
        this.rpsHistory = [];
        
        this.createGameModal('✂️ 가위바위보', `
            <div class="game-area">
                <h4>컴퓨터와 가위바위보 대결!</h4>
                <div style="margin: var(--space-4) 0;">
                    <div style="font-size: var(--text-lg); margin-bottom: var(--space-2);">
                        연승: <span id="rpsStreak" style="color: var(--color-primary); font-weight: var(--weight-bold);">0</span>
                    </div>
                    <div id="rpsResult" style="margin: var(--space-2) 0; min-height: 50px; font-size: var(--text-lg);"></div>
                </div>
                
                <div class="rps-buttons">
                    <button class="rps-button" onclick="window.gamesApp.playRPS('rock')" title="바위">🪨</button>
                    <button class="rps-button" onclick="window.gamesApp.playRPS('paper')" title="보">📄</button>
                    <button class="rps-button" onclick="window.gamesApp.playRPS('scissors')" title="가위">✂️</button>
                </div>
            </div>
            <div class="game-history" id="rpsHistory">
                <strong>최근 기록</strong>
                <div id="rpsHistoryList">버튼을 클릭해서 게임을 시작하세요!</div>
            </div>
        `);
    }

    playRPS(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        const choiceEmoji = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        
        const choiceName = {
            rock: '바위',
            paper: '보',
            scissors: '가위'
        };
        
        let result = '';
        let resultClass = '';
        
        if (playerChoice === computerChoice) {
            result = '무승부';
            resultClass = 'draw';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = '승리';
            resultClass = 'win';
            this.rpsStreak++;
            this.gameStats.rps.won++;
        } else {
            result = '패배';
            resultClass = 'lose';
            this.rpsStreak = 0;
        }
        
        this.gameStats.rps.played++;
        if (this.rpsStreak > this.gameStats.rps.maxStreak) {
            this.gameStats.rps.maxStreak = this.rpsStreak;
        }
        this.saveGameStats();
        
        // 결과 표시
        const resultDiv = document.getElementById('rpsResult');
        const streakDiv = document.getElementById('rpsStreak');
        
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="margin: var(--space-2) 0;">
                    나: ${choiceEmoji[playerChoice]} vs 컴퓨터: ${choiceEmoji[computerChoice]}
                </div>
                <div class="game-result ${resultClass}" style="font-size: var(--text-lg);">
                    ${result}!
                </div>
            `;
        }
        
        if (streakDiv) {
            streakDiv.textContent = this.rpsStreak;
        }
        
        // 히스토리 업데이트
        this.rpsHistory.unshift({
            player: playerChoice,
            computer: computerChoice,
            result: result
        });
        
        if (this.rpsHistory.length > 10) {
            this.rpsHistory = this.rpsHistory.slice(0, 10);
        }
        
        const historyDiv = document.getElementById('rpsHistoryList');
        if (historyDiv) {
            historyDiv.innerHTML = this.rpsHistory.map(h => 
                `<div class="game-result ${h.result === '승리' ? 'win' : h.result === '패배' ? 'lose' : 'draw'}">
                    ${choiceEmoji[h.player]} vs ${choiceEmoji[h.computer]} → ${h.result}
                </div>`
            ).join('');
        }
    }

    // === 퀴즈 게임 ===
    initQuizData() {
        this.quizQuestions = [
            {
                question: "대한민국 육군의 복무기간은?",
                options: ["18개월", "21개월", "24개월", "30개월"],
                correct: 0
            },
            {
                question: "군대에서 'PX'는 무엇을 의미하나요?",
                options: ["부대 식당", "매점/상점", "훈련장", "의무실"],
                correct: 1
            },
            {
                question: "대한민국의 수도는?",
                options: ["부산", "서울", "대구", "인천"],
                correct: 1
            },
            {
                question: "태양계에서 가장 큰 행성은?",
                options: ["토성", "목성", "해왕성", "천왕성"],
                correct: 1
            },
            {
                question: "한국의 전통 무예는?",
                options: ["가라테", "태권도", "유도", "복싱"],
                correct: 1
            },
            {
                question: "군대에서 '취침점호'는 보통 몇 시에 하나요?",
                options: ["21:00", "22:00", "23:00", "24:00"],
                correct: 1
            },
            {
                question: "컴퓨터의 CPU는 무엇의 약자인가요?",
                options: ["Central Processing Unit", "Computer Program Unit", "Central Program Unit", "Computer Processing Unit"],
                correct: 0
            },
            {
                question: "대한민국의 국화는?",
                options: ["장미", "무궁화", "벚꽃", "진달래"],
                correct: 1
            },
            {
                question: "세계에서 가장 높은 산은?",
                options: ["K2", "에베레스트", "킬리만자로", "후지산"],
                correct: 1
            },
            {
                question: "군대에서 '행정반'의 역할은?",
                options: ["경계근무", "취사업무", "부대관리업무", "정비업무"],
                correct: 2
            }
        ];
    }

    openQuiz() {
        this.currentQuizIndex = 0;
        this.quizScore = 0;
        Utils.shuffle(this.quizQuestions);
        
        this.showNextQuestion();
    }

    showNextQuestion() {
        if (this.currentQuizIndex >= this.quizQuestions.length) {
            this.showQuizResult();
            return;
        }
        
        const question = this.quizQuestions[this.currentQuizIndex];
        
        this.createGameModal('🧠 군사상식 퀴즈', `
            <div class="game-area">
                <div style="margin-bottom: var(--space-4);">
                    <div style="color: var(--color-text-muted); margin-bottom: var(--space-2);">
                        문제 ${this.currentQuizIndex + 1} / ${this.quizQuestions.length}
                    </div>
                    <div style="color: var(--color-text-muted); margin-bottom: var(--space-4);">
                        점수: ${this.quizScore} / ${this.currentQuizIndex}
                    </div>
                    <h4 style="margin-bottom: var(--space-4);">${question.question}</h4>
                </div>
                
                <div id="quizOptions">
                    ${question.options.map((option, index) => 
                        `<button class="quiz-option" onclick="window.gamesApp.selectQuizAnswer(${index})">${option}</button>`
                    ).join('')}
                </div>
                
                <div id="quizFeedback" style="margin-top: var(--space-4); min-height: 40px;"></div>
            </div>
        `);
    }

    selectQuizAnswer(selectedIndex) {
        const question = this.quizQuestions[this.currentQuizIndex];
        const isCorrect = selectedIndex === question.correct;
        
        // 모든 버튼 비활성화
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.disabled = true;
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('wrong');
            }
        });
        
        // 피드백 표시
        const feedbackDiv = document.getElementById('quizFeedback');
        if (feedbackDiv) {
            if (isCorrect) {
                this.quizScore++;
                feedbackDiv.innerHTML = '<div class="game-result win">정답입니다! 🎉</div>';
            } else {
                feedbackDiv.innerHTML = `<div class="game-result lose">틀렸습니다. 정답은 "${question.options[question.correct]}" 입니다.</div>`;
            }
        }
        
        // 2초 후 다음 문제
        setTimeout(() => {
            this.currentQuizIndex++;
            this.showNextQuestion();
        }, 2000);
    }

    showQuizResult() {
        const percentage = Math.round((this.quizScore / this.quizQuestions.length) * 100);
        let grade = '';
        
        if (percentage >= 90) grade = '🏆 최우수';
        else if (percentage >= 80) grade = '🥇 우수';
        else if (percentage >= 70) grade = '🥈 양호';
        else if (percentage >= 60) grade = '🥉 보통';
        else grade = '📚 더 공부하세요';
        
        this.gameStats.quiz.played++;
        this.gameStats.quiz.correct += this.quizScore;
        this.gameStats.quiz.totalQuestions += this.quizQuestions.length;
        this.saveGameStats();
        
        this.createGameModal('🧠 퀴즈 결과', `
            <div class="game-area" style="text-align: center;">
                <h4 style="margin-bottom: var(--space-4);">퀴즈 완료!</h4>
                <div style="font-size: var(--text-2xl); margin: var(--space-4) 0;">
                    ${grade}
                </div>
                <div style="font-size: var(--text-xl); margin: var(--space-2) 0;">
                    ${this.quizScore} / ${this.quizQuestions.length} (${percentage}%)
                </div>
                <div style="margin: var(--space-4) 0;">
                    <button class="game-button" onclick="window.gamesApp.openQuiz()">다시 도전</button>
                    <button class="game-button secondary" onclick="window.gamesApp.closeModal()">닫기</button>
                </div>
            </div>
        `);
    }

    // === 기억력 게임 ===
    openMemoryGame() {
        this.createGameModal('🃏 기억력 게임', `
            <div class="game-area">
                <div style="text-align: center; margin-bottom: var(--space-4);">
                    <h4>같은 카드를 찾아보세요!</h4>
                    <div style="margin: var(--space-2) 0;">
                        <span>시간: <span id="memoryTime">0</span>초</span> | 
                        <span>매치: <span id="memoryMatches">0</span>/8</span>
                    </div>
                    <button class="game-button" onclick="window.gamesApp.startMemoryGame()">게임 시작</button>
                </div>
                <div id="memoryBoard" style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-2);
                    max-width: 300px;
                    margin: 0 auto;
                "></div>
            </div>
        `);
    }

    startMemoryGame() {
        const emojis = ['🎖️', '⚔️', '🛡️', '🎯', '🚁', '🔫', '💣', '🏃'];
        this.memoryCards = [...emojis, ...emojis];
        Utils.shuffle(this.memoryCards);
        
        this.memoryFlipped = [];
        this.memoryMatched = [];
        this.memoryStartTime = Date.now();
        
        const board = document.getElementById('memoryBoard');
        if (board) {
            board.innerHTML = this.memoryCards.map((card, index) => 
                `<div class="memory-card" data-index="${index}" onclick="window.gamesApp.flipMemoryCard(${index})" style="
                    width: 60px;
                    height: 60px;
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: var(--text-2xl);
                    transition: all var(--transition-fast);
                ">?</div>`
            ).join('');
        }
        
        this.updateMemoryTimer();
    }

    flipMemoryCard(index) {
        if (this.memoryFlipped.length >= 2 || this.memoryFlipped.includes(index) || this.memoryMatched.includes(index)) {
            return;
        }
        
        const card = document.querySelector(`[data-index="${index}"]`);
        if (card) {
            card.textContent = this.memoryCards[index];
            card.style.background = 'var(--color-primary)';
            this.memoryFlipped.push(index);
        }
        
        if (this.memoryFlipped.length === 2) {
            setTimeout(() => this.checkMemoryMatch(), 500);
        }
    }

    checkMemoryMatch() {
        const [first, second] = this.memoryFlipped;
        const firstCard = document.querySelector(`[data-index="${first}"]`);
        const secondCard = document.querySelector(`[data-index="${second}"]`);
        
        if (this.memoryCards[first] === this.memoryCards[second]) {
            // 매치!
            this.memoryMatched.push(first, second);
            if (firstCard) firstCard.style.background = 'var(--success)';
            if (secondCard) secondCard.style.background = 'var(--success)';
            
            const matchesDiv = document.getElementById('memoryMatches');
            if (matchesDiv) matchesDiv.textContent = this.memoryMatched.length / 2;
            
            if (this.memoryMatched.length === this.memoryCards.length) {
                this.finishMemoryGame();
            }
        } else {
            // 틀림
            if (firstCard) {
                firstCard.textContent = '?';
                firstCard.style.background = 'var(--color-card)';
            }
            if (secondCard) {
                secondCard.textContent = '?';
                secondCard.style.background = 'var(--color-card)';
            }
        }
        
        this.memoryFlipped = [];
    }

    updateMemoryTimer() {
        if (this.memoryMatched.length === this.memoryCards.length) return;
        
        const elapsed = Math.floor((Date.now() - this.memoryStartTime) / 1000);
        const timeDiv = document.getElementById('memoryTime');
        if (timeDiv) timeDiv.textContent = elapsed;
        
        setTimeout(() => this.updateMemoryTimer(), 1000);
    }

    finishMemoryGame() {
        const totalTime = Math.floor((Date.now() - this.memoryStartTime) / 1000);
        
        this.gameStats.memory.played++;
        this.gameStats.memory.won++;
        if (this.gameStats.memory.bestTime === 0 || totalTime < this.gameStats.memory.bestTime) {
            this.gameStats.memory.bestTime = totalTime;
        }
        this.saveGameStats();
        
        setTimeout(() => {
            window.toast?.show(`축하합니다! ${totalTime}초 만에 완성했습니다! 🎉`, 'success');
        }, 500);
    }

    // === 계산 게임 ===
    openCalculator() {
        this.calculatorScore = 0;
        this.calculatorTime = 30;
        
        this.createGameModal('🔢 계산 게임', `
            <div class="game-area">
                <div style="text-align: center; margin-bottom: var(--space-4);">
                    <h4>30초 안에 최대한 많은 문제를 푸세요!</h4>
                    <div style="margin: var(--space-2) 0;">
                        <span>남은 시간: <span id="calcTime" style="color: var(--color-primary); font-weight: var(--weight-bold);">30</span>초</span> | 
                        <span>점수: <span id="calcScore" style="color: var(--success); font-weight: var(--weight-bold);">0</span></span>
                    </div>
                    <button class="game-button" onclick="window.gamesApp.startCalculatorGame()">게임 시작</button>
                </div>
                <div id="calcProblem" style="text-align: center; margin: var(--space-4) 0; font-size: var(--text-2xl);"></div>
                <div style="text-align: center;">
                    <input type="number" id="calcAnswer" class="game-input" placeholder="답을 입력하세요" disabled>
                    <br>
                    <button class="game-button" id="calcSubmit" onclick="window.gamesApp.submitCalculatorAnswer()" disabled>확인</button>
                </div>
            </div>
        `);
    }

    startCalculatorGame() {
        this.calculatorScore = 0;
        this.calculatorTime = 30;
        
        const answerInput = document.getElementById('calcAnswer');
        const submitBtn = document.getElementById('calcSubmit');
        
        if (answerInput) {
            answerInput.disabled = false;
            answerInput.focus();
            Utils.on(answerInput, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitCalculatorAnswer();
                }
            });
        }
        if (submitBtn) submitBtn.disabled = false;
        
        this.generateCalculatorProblem();
        this.startCalculatorTimer();
    }

    generateCalculatorProblem() {
        const operations = ['+', '-', '×'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let a, b, answer;
        
        switch (operation) {
            case '+':
                a = Utils.randomInt(10, 99);
                b = Utils.randomInt(10, 99);
                answer = a + b;
                break;
            case '-':
                a = Utils.randomInt(50, 99);
                b = Utils.randomInt(10, a - 1);
                answer = a - b;
                break;
            case '×':
                a = Utils.randomInt(2, 12);
                b = Utils.randomInt(2, 12);
                answer = a * b;
                break;
        }
        
        this.currentCalculatorAnswer = answer;
        
        const problemDiv = document.getElementById('calcProblem');
        if (problemDiv) {
            problemDiv.textContent = `${a} ${operation} ${b} = ?`;
        }
        
        const answerInput = document.getElementById('calcAnswer');
        if (answerInput) {
            answerInput.value = '';
            answerInput.focus();
        }
    }

    submitCalculatorAnswer() {
        const answerInput = document.getElementById('calcAnswer');
        if (!answerInput) return;
        
        const userAnswer = parseInt(answerInput.value);
        
        if (userAnswer === this.currentCalculatorAnswer) {
            this.calculatorScore++;
            const scoreDiv = document.getElementById('calcScore');
            if (scoreDiv) scoreDiv.textContent = this.calculatorScore;
            this.generateCalculatorProblem();
        } else {
            // 틀렸을 때 잠깐 빨간색으로 표시
            answerInput.style.borderColor = 'var(--error)';
            setTimeout(() => {
                answerInput.style.borderColor = 'var(--color-border)';
            }, 500);
        }
    }

    startCalculatorTimer() {
        this.calculatorTimer = setInterval(() => {
            this.calculatorTime--;
            const timeDiv = document.getElementById('calcTime');
            if (timeDiv) timeDiv.textContent = this.calculatorTime;
            
            if (this.calculatorTime <= 0) {
                this.finishCalculatorGame();
            }
        }, 1000);
    }

    finishCalculatorGame() {
        if (this.calculatorTimer) {
            clearInterval(this.calculatorTimer);
            this.calculatorTimer = null;
        }
        
        const answerInput = document.getElementById('calcAnswer');
        const submitBtn = document.getElementById('calcSubmit');
        
        if (answerInput) answerInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
        
        this.gameStats.calculator.played++;
        if (this.calculatorScore > this.gameStats.calculator.bestScore) {
            this.gameStats.calculator.bestScore = this.calculatorScore;
        }
        this.saveGameStats();
        
        window.toast?.show(`시간 종료! 총 ${this.calculatorScore}문제를 맞추셨습니다! 🎉`, 'success');
    }

    // === 공통 메서드 ===
    createGameModal(title, content) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        
        modal.innerHTML = `
            <div class="game-modal-content">
                <button class="game-close" onclick="window.gamesApp.closeModal()">✕</button>
                <h3 style="margin-bottom: var(--space-4); color: var(--color-text);">${title}</h3>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        Utils.fadeIn(modal);
        
        // ESC 키로 닫기
        Utils.on(modal, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // 배경 클릭으로 닫기
        Utils.on(modal, 'click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        if (this.currentModal) {
            // 타이머 정리
            if (this.calculatorTimer) {
                clearInterval(this.calculatorTimer);
                this.calculatorTimer = null;
            }
            
            Utils.fadeOut(this.currentModal).then(() => {
                if (this.currentModal?.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
            });
        }
    }

    saveGameStats() {
        Utils.storage.set('milbase_game_stats', this.gameStats);
    }

    getGameStats() {
        return this.gameStats;
    }

    // 통계 표시 업데이트
    updateStatsDisplay() {
        const stats = this.gameStats;
        
        // 총 게임 횟수 계산
        const totalGames = Object.values(stats).reduce((sum, game) => sum + game.played, 0);
        document.getElementById('totalGamesPlayed').textContent = totalGames;
        
        // 총 플레이 시간 (가상 데이터)
        const totalPlayTime = Math.floor(totalGames * 3.5); // 게임당 평균 3.5분
        document.getElementById('totalPlayTime').textContent = totalPlayTime + '분';
        
        // 최고 점수 (숫자야구 + 계산게임 중 최고)
        const highestScore = Math.max(stats.baseball.bestScore, stats.calculator.bestScore);
        document.getElementById('highestScore').textContent = highestScore;
        
        // 연속 플레이 (가위바위보 최대 연승)
        document.getElementById('currentStreak').textContent = stats.rps.maxStreak + '회';
        
        // 게임별 상세 통계
        this.updateGameSpecificStats();
    }

    updateGameSpecificStats() {
        const stats = this.gameStats;
        
        // 숫자야구 통계
        document.getElementById('baseballPlayCount').textContent = stats.baseball.played + '회';
        document.getElementById('baseballBestTries').textContent = 
            stats.baseball.bestScore > 0 ? stats.baseball.bestScore + '회' : '-';
        document.getElementById('baseballWinRate').textContent = 
            stats.baseball.played > 0 ? 
            Math.round((stats.baseball.won / stats.baseball.played) * 100) + '%' : '0%';
        
        // 가위바위보 통계
        document.getElementById('rpsPlayCount').textContent = stats.rps.played + '회';
        document.getElementById('rpsWinRate').textContent = 
            stats.rps.played > 0 ? 
            Math.round((stats.rps.won / stats.rps.played) * 100) + '%' : '0%';
        document.getElementById('rpsMaxStreak').textContent = stats.rps.maxStreak + '회';
        
        // 퀴즈 통계
        document.getElementById('quizPlayCount').textContent = stats.quiz.played + '회';
        document.getElementById('quizAccuracy').textContent = 
            stats.quiz.totalQuestions > 0 ? 
            Math.round((stats.quiz.correct / stats.quiz.totalQuestions) * 100) + '%' : '0%';
        document.getElementById('quizHighScore').textContent = 
            stats.quiz.correct > 0 ? stats.quiz.correct + '점' : '0점';
        
        // 기억력 게임 통계
        document.getElementById('memoryPlayCount').textContent = stats.memory.played + '회';
        document.getElementById('memoryHighLevel').textContent = 
            stats.memory.won > 0 ? stats.memory.won : '0';
        document.getElementById('memoryAccuracy').textContent = 
            stats.memory.played > 0 ? 
            Math.round((stats.memory.won / stats.memory.played) * 100) + '%' : '0%';
    }

    // 성취도 배지 초기화
    initAchievements() {
        const achievements = [
            { id: 'first_game', name: '첫 게임', desc: '첫 번째 게임 플레이', icon: '🎮', unlocked: this.getTotalGamesPlayed() > 0 },
            { id: 'game_master', name: '게임 마스터', desc: '총 100회 게임 플레이', icon: '🏆', unlocked: this.getTotalGamesPlayed() >= 100 },
            { id: 'baseball_pro', name: '야구 고수', desc: '숫자야구 10회 승리', icon: '⚾', unlocked: this.gameStats.baseball.won >= 10 },
            { id: 'rps_champion', name: '가위바위보 챔피언', desc: '5연승 달성', icon: '✂️', unlocked: this.gameStats.rps.maxStreak >= 5 },
            { id: 'quiz_genius', name: '퀴즈 천재', desc: '퀴즈 정답률 90% 이상', icon: '🧠', unlocked: this.getQuizAccuracy() >= 90 },
            { id: 'memory_master', name: '기억력 마스터', desc: '기억력 게임 20회 클리어', icon: '🃏', unlocked: this.gameStats.memory.won >= 20 },
            { id: 'daily_player', name: '일일 플레이어', desc: '하루에 10게임 플레이', icon: '📅', unlocked: this.getDailyGames() >= 10 },
            { id: 'speed_demon', name: '스피드 데몬', desc: '계산게임 고득점', icon: '⚡', unlocked: this.gameStats.calculator.bestScore >= 50 }
        ];
        
        this.renderAchievements(achievements);
    }

    renderAchievements(achievements) {
        const container = document.getElementById('achievementsGrid');
        container.innerHTML = '';
        
        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-badge';
            achievementElement.style.cssText = `
                background: ${achievement.unlocked ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)'};
                border: 1px solid ${achievement.unlocked ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
                border-radius: var(--border-radius);
                padding: 1rem;
                text-align: center;
                transition: all var(--transition-smooth);
                cursor: pointer;
                opacity: ${achievement.unlocked ? '1' : '0.5'};
            `;
            
            achievementElement.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${achievement.icon}</div>
                <div style="font-size: 0.75rem; font-weight: 600; color: ${achievement.unlocked ? 'white' : 'var(--color-text)'};
                    margin-bottom: 0.25rem;">${achievement.name}</div>
                <div style="font-size: 0.625rem; color: ${achievement.unlocked ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)'};
                    line-height: 1.2;">${achievement.desc}</div>
            `;
            
            if (achievement.unlocked) {
                achievementElement.addEventListener('mouseenter', () => {
                    achievementElement.style.transform = 'scale(1.05)';
                    achievementElement.style.boxShadow = 'var(--shadow-glow)';
                });
                
                achievementElement.addEventListener('mouseleave', () => {
                    achievementElement.style.transform = 'scale(1)';
                    achievementElement.style.boxShadow = 'none';
                });
            }
            
            container.appendChild(achievementElement);
        });
    }

    // 헬퍼 메서드들
    getTotalGamesPlayed() {
        return Object.values(this.gameStats).reduce((sum, game) => sum + game.played, 0);
    }

    getQuizAccuracy() {
        const stats = this.gameStats.quiz;
        return stats.totalQuestions > 0 ? (stats.correct / stats.totalQuestions) * 100 : 0;
    }

    getDailyGames() {
        // 실제로는 오늘 날짜의 게임 수를 계산해야 하지만, 
        // 여기서는 간단히 최근 플레이 수를 반환
        const today = new Date().toDateString();
        const dailyData = Utils.storage.get('milbase_daily_games', {});
        return dailyData[today] || 0;
    }

    updateDailyGames() {
        const today = new Date().toDateString();
        const dailyData = Utils.storage.get('milbase_daily_games', {});
        dailyData[today] = (dailyData[today] || 0) + 1;
        Utils.storage.set('milbase_daily_games', dailyData);
    }

    // 게임 완료 시 통계 업데이트
    updateGameStats(gameType, result) {
        this.updateDailyGames();
        
        switch(gameType) {
            case 'baseball':
                this.gameStats.baseball.played++;
                if (result.won) {
                    this.gameStats.baseball.won++;
                    if (result.attempts < this.gameStats.baseball.bestScore || this.gameStats.baseball.bestScore === 0) {
                        this.gameStats.baseball.bestScore = result.attempts;
                    }
                }
                break;
                
            case 'rps':
                this.gameStats.rps.played++;
                if (result.won) {
                    this.gameStats.rps.won++;
                    this.gameStats.rps.streak++;
                    if (this.gameStats.rps.streak > this.gameStats.rps.maxStreak) {
                        this.gameStats.rps.maxStreak = this.gameStats.rps.streak;
                    }
                } else {
                    this.gameStats.rps.streak = 0;
                }
                break;
                
            case 'quiz':
                this.gameStats.quiz.played++;
                this.gameStats.quiz.totalQuestions += result.totalQuestions;
                this.gameStats.quiz.correct += result.correctAnswers;
                break;
                
            case 'memory':
                this.gameStats.memory.played++;
                if (result.won) {
                    this.gameStats.memory.won++;
                    if (result.time < this.gameStats.memory.bestTime || this.gameStats.memory.bestTime === 0) {
                        this.gameStats.memory.bestTime = result.time;
                    }
                }
                break;
                
            case 'calculator':
                this.gameStats.calculator.played++;
                if (result.score > this.gameStats.calculator.bestScore) {
                    this.gameStats.calculator.bestScore = result.score;
                }
                break;
        }
        
        this.saveGameStats();
        this.updateStatsDisplay();
        this.initAchievements(); // 성취도 업데이트
    }
}

// 애플리케이션 초기화
let gamesApp;

const initGamesApp = () => {
    gamesApp = new GamesApp();
    window.gamesApp = gamesApp;
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initGamesApp);
} else {
    initGamesApp();
}
