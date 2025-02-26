document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        currentLevel: 0,
        heartsCollected: 0,
        achievements: [],
        quizAnswers: 0,
        memoryMatches: 0
    };

    // Audio elements
    const bgMusic = document.getElementById('bgMusic');
    const successSound = document.getElementById('successSound');
    const matchSound = document.getElementById('matchSound');

    // Game elements
    const loadingScreen = document.getElementById('loading-screen');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const celebrationScreen = document.getElementById('celebration-screen');
    const startButton = document.getElementById('start-button');
    const progressBar = document.querySelector('.progress');
    const heartsCount = document.getElementById('hearts-count');

    // Birthday messages for each completed level
    const birthdayMessages = [
        "Every memory with you is a treasure. You make my life beautiful! 🌟",
        "Your love lights up my world. Happy Birthday, my angel! 🎂",
        "You deserve all the happiness in the world. I love you! 💝",
        "Today and always, you're my everything! 👑"
    ];

    // Quiz questions about your relationship and her birthday
    const quizQuestions = [
        {
            question: "What makes your birthday so special to me?",
            options: [
                "It's the day my world became complete",
                "It's when angels blessed the earth",
                "It's when love found its meaning",
                "All of the above"
            ],
            correct: 3,
            message: "You are my everything, my love! 💖"
        },
        {
            question: "What gift did I promise you on our first celebration together?",
            options: [
                "A lifetime of happiness",
                "My eternal love",
                "Adventures together",
                "All my tomorrows"
            ],
            correct: 1,
            message: "And I'll keep that promise forever! 🎁"
        },
        {
            question: "What's your magical superpower?",
            options: [
                "Making everyone smile",
                "Turning bad days good",
                "Healing hearts with love",
                "Being absolutely perfect"
            ],
            correct: 0,
            message: "You're my superhero! 🦸‍♀️"
        }
    ];

    // Memory game pairs with birthday theme
    const memoryPairs = [
        '🎂', '🎈', '🎁', '👑', '🌟', '💝',
        '🎂', '🎈', '🎁', '👑', '🌟', '💝'
    ];

    // Birthday wishes to collect in catch game
    const birthdayWishes = [
        "Endless Joy",
        "Infinite Love",
        "Perfect Health",
        "Sweet Dreams",
        "Amazing Adventures",
        "Precious Moments",
        "Beautiful Smiles",
        "Magical Days"
    ];

    // Initialize game
    async function init() {
        // Initialize all game components first
        initializeMemoryGame();
        initializeQuiz();
        initializeCatchGame();
        await initializePuzzle();

        // Add event listeners
        startButton.addEventListener('click', startGame);

        // Show start screen
        loadingScreen.classList.remove('active');
        startScreen.classList.add('active');
    }

    // Start game
    function startGame() {
        startScreen.classList.remove('active');
        gameScreen.classList.add('active');
        bgMusic.play().catch(e => console.log('Audio autoplay blocked'));
        showLevel(0);
    }

    // Level management
    function showLevel(level) {
        state.currentLevel = level;
        const sections = document.querySelectorAll('.game-section');
        sections.forEach(section => section.classList.add('hidden'));

        updateProgress();

        switch(level) {
            case 0:
                document.getElementById('memory-game').classList.remove('hidden');
                break;
            case 1:
                document.getElementById('love-quiz').classList.remove('hidden');
                break;
            case 2:
                const catchHeartsSection = document.getElementById('catch-hearts');
                catchHeartsSection.classList.remove('hidden');
                startCatchGame();
                break;
            case 3:
                document.getElementById('photo-puzzle').classList.remove('hidden');
                break;
            case 4:
                showCelebration();
                break;
        }
    }

    // Memory Game
    function initializeMemoryGame() {
        const grid = document.querySelector('.memory-grid');
        const shuffledPairs = memoryPairs.sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = new Set();

        shuffledPairs.forEach((pair, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.value = pair;
            card.dataset.index = index;
            
            card.addEventListener('click', () => {
                if (flipped.length === 2 || flipped.includes(card) || matched.has(card.dataset.index)) return;
                
                card.textContent = pair;
                flipped.push(card);

                if (flipped.length === 2) {
                    if (flipped[0].dataset.value === flipped[1].dataset.value) {
                        matched.add(flipped[0].dataset.index);
                        matched.add(flipped[1].dataset.index);
                        flipped = [];
                        matchSound.play();
                        state.memoryMatches++;
                        addHearts(2);

                        if (matched.size === memoryPairs.length) {
                            setTimeout(() => showLevel(1), 1000);
                        }
                    } else {
                        setTimeout(() => {
                            flipped.forEach(card => card.textContent = '');
                            flipped = [];
                        }, 1000);
                    }
                }
            });

            grid.appendChild(card);
        });
    }

    // Quiz Game
    function initializeQuiz() {
        const container = document.querySelector('.quiz-container');
        let currentQuestion = 0;

        function showQuestion() {
            if (currentQuestion >= quizQuestions.length) {
                showLevel(2);
                return;
            }

            const question = quizQuestions[currentQuestion];
            container.innerHTML = `
                <h3>${question.question}</h3>
                ${question.options.map((option, index) => `
                    <div class="quiz-option" data-index="${index}">${option}</div>
                `).join('')}
            `;

            container.querySelectorAll('.quiz-option').forEach(option => {
                option.addEventListener('click', () => {
                    if (parseInt(option.dataset.index) === question.correct) {
                        successSound.play();
                        state.quizAnswers++;
                        addHearts(3);
                    }
                    currentQuestion++;
                    setTimeout(showQuestion, 500);
                });
            });
        }

        showQuestion();
    }

    // Catch Hearts Game
    let catchGameActive = false;
    let catchInterval = null;

    function initializeCatchGame() {
        const gameArea = document.querySelector('.game-area');
        const catcher = document.getElementById('catcher');

        function moveCatcher(e) {
            const bounds = gameArea.getBoundingClientRect();
            let x;
            
            if (e.type === 'touchmove') {
                x = e.touches[0].clientX - bounds.left - catcher.offsetWidth / 2;
            } else {
                x = e.clientX - bounds.left - catcher.offsetWidth / 2;
            }

            x = Math.max(0, Math.min(x, bounds.width - catcher.offsetWidth));
            catcher.style.left = `${x}px`;
        }

        gameArea.addEventListener('mousemove', moveCatcher);
        gameArea.addEventListener('touchmove', moveCatcher);
    }

    function createFallingWish() {
        if (!catchGameActive) return;

        const gameArea = document.querySelector('.game-area');
        const catcher = document.getElementById('catcher');
        const wish = document.createElement('div');
        const randomWish = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
        
        wish.className = 'falling-wish';
        wish.innerHTML = `
            <div class="wish-content">
                <span class="wish-icon">✨</span>
                <span class="wish-text">${randomWish}</span>
            </div>
        `;
        wish.style.left = `${Math.random() * (gameArea.offsetWidth - 150)}px`;
        wish.style.top = '-50px';
        gameArea.appendChild(wish);

        let pos = -50;
        const speed = 3;
        const wobble = Math.random() * 30;
        let wobblePos = 0;

        const fall = setInterval(() => {
            if (!catchGameActive) {
                clearInterval(fall);
                wish.remove();
                return;
            }

            pos += speed;
            wobblePos += 0.05;
            const xPos = Math.sin(wobblePos) * wobble;
            wish.style.transform = `translateX(${xPos}px)`;
            wish.style.top = `${pos}px`;

            const wishBounds = wish.getBoundingClientRect();
            const catcherBounds = catcher.getBoundingClientRect();

            if (wishBounds.bottom >= catcherBounds.top &&
                wishBounds.top <= catcherBounds.bottom &&
                wishBounds.right >= catcherBounds.left &&
                wishBounds.left <= catcherBounds.right) {
                
                const wishesCollected = document.querySelector('.wishes-collected');
                const collectedWish = document.createElement('div');
                collectedWish.className = 'wish-item animate__animated animate__bounceIn';
                collectedWish.innerHTML = `${randomWish} ✨`;
                wishesCollected.appendChild(collectedWish);
                
                wish.remove();
                matchSound.play();
                addHearts(2);

                const celebration = document.createElement('div');
                celebration.className = 'wish-celebration';
                celebration.style.left = `${wishBounds.left}px`;
                celebration.style.top = `${wishBounds.top}px`;
                gameArea.appendChild(celebration);
                setTimeout(() => celebration.remove(), 1000);

                if (wishesCollected.children.length >= 8) {
                    catchGameActive = false;
                    clearInterval(catchInterval);
                    showBirthdayMessage("You've collected all the magical birthday wishes! 🌟");
                    setTimeout(() => showLevel(3), 2000);
                }
            }

            if (pos > gameArea.offsetHeight) {
                wish.remove();
                clearInterval(fall);
            }
        }, 16);
    }

    function startCatchGame() {
        catchGameActive = true;
        document.querySelector('.wishes-collected').innerHTML = '';
        
        // Create initial wishes
        for (let i = 0; i < 3; i++) {
            setTimeout(createFallingWish, i * 500);
        }

        // Continue creating wishes
        if (catchInterval) clearInterval(catchInterval);
        catchInterval = setInterval(createFallingWish, 1500);
    }

    // Photo Puzzle
    async function initializePuzzle() {
        const grid = document.querySelector('.puzzle-grid');
        const pieces = Array.from({length: 4}, (_, i) => i);
        let solved = false;
        let selectedPiece = null;

        function handlePieceClick(piece) {
            if (solved) return;

            if (!selectedPiece) {
                // First piece selected
                selectedPiece = piece;
                piece.classList.add('selected');
                matchSound.play();
            } else if (selectedPiece === piece) {
                // Deselect if clicking same piece
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            } else {
                // Swap pieces
                const tempBg = selectedPiece.style.backgroundPosition;
                const tempIndex = selectedPiece.dataset.index;
                
                selectedPiece.style.backgroundPosition = piece.style.backgroundPosition;
                selectedPiece.dataset.index = piece.dataset.index;
                
                piece.style.backgroundPosition = tempBg;
                piece.dataset.index = tempIndex;
                
                // Reset selection
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
                
                successSound.play();
                checkSolution();
            }
        }

        // Create puzzle pieces using the generated image
        pieces.sort(() => Math.random() - 0.5).forEach((index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = index;
            piece.style.backgroundImage = 'url(images/puzzle.png)';
            piece.style.backgroundSize = '300px 300px';
            piece.style.backgroundPosition = `${(index % 2) * -150}px ${Math.floor(index / 2) * -150}px`;
            
            // Add number label to help identify pieces
            const label = document.createElement('div');
            label.className = 'piece-label';
            label.textContent = (index + 1).toString();
            piece.appendChild(label);

            piece.addEventListener('click', () => handlePieceClick(piece));

            // Hover effect
            piece.addEventListener('mouseenter', () => {
                if (!solved) piece.classList.add('hover');
            });
            
            piece.addEventListener('mouseleave', () => {
                if (!solved) piece.classList.remove('hover');
            });
            
            grid.appendChild(piece);
        });

        function checkSolution() {
            const currentOrder = Array.from(grid.children)
                .filter(piece => !piece.classList.contains('empty'))
                .map(piece => parseInt(piece.dataset.index));
            
            solved = currentOrder.every((num, i) => num === i);
            if (solved) {
                successSound.play();
                addHearts(5);
                
                // Show complete image
                grid.innerHTML = '';
                const finalImage = document.createElement('div');
                finalImage.className = 'puzzle-complete animate__animated animate__fadeIn';
                finalImage.style.backgroundImage = 'url(images/puzzle.png)';
                grid.appendChild(finalImage);
                
                setTimeout(() => showLevel(4), 2000);
            }
        }
    }

    function showBirthdayMessage(message) {
        const messageDiv = document.querySelector('.birthday-message');
        messageDiv.textContent = message;
        messageDiv.classList.remove('hidden');
        messageDiv.classList.add('animate__animated', 'animate__fadeIn');
    }

    // Helper functions
    function isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 2);
        const col1 = index1 % 2;
        const row2 = Math.floor(index2 / 2);
        const col2 = index2 % 2;
        
        // For 2x2 grid, pieces are adjacent if they share an edge
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }

    function addHearts(amount) {
        state.heartsCollected += amount;
        heartsCount.textContent = state.heartsCollected;
        
        for (let i = 0; i < amount; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = '❤️';
                heart.className = 'floating-heart';
                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 2000);
            }, i * 200);
        }
    }

    function updateProgress() {
        const progress = (state.currentLevel / 4) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function showCelebration() {
        gameScreen.classList.remove('active');
        celebrationScreen.classList.add('active');

        const achievements = [
            { name: "Memory Master", condition: state.memoryMatches >= 6 },
            { name: "Quiz Whiz", condition: state.quizAnswers >= 2 },
            { name: "Heart Collector", condition: state.heartsCollected >= 20 },
            { name: "Love Expert", condition: state.heartsCollected >= 30 }
        ];

        const earnedAchievements = achievements.filter(a => a.condition);
        const achievementsList = document.getElementById('achievements-list');
        
        earnedAchievements.forEach(achievement => {
            const div = document.createElement('div');
            div.className = 'achievement animate__animated animate__fadeIn';
            div.innerHTML = `🏆 ${achievement.name}`;
            achievementsList.appendChild(div);
        });

        createFireworks();
        typeMessage(
            "You've completed our love journey! Every moment with you is precious, and I'm looking forward to creating many more beautiful memories together. Happy Birthday, my love! ❤️",
            document.querySelector('.typing-text')
        );
    }

    function createFireworks() {
        const fireworks = document.querySelector('.fireworks');
        setInterval(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            fireworks.appendChild(firework);
            setTimeout(() => firework.remove(), 1000);
        }, 300);
    }

    function typeMessage(text, element) {
        let index = 0;
        element.textContent = '';
        
        function type() {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
                setTimeout(type, 50);
            }
        }
        
        type();
    }

    // Initialize the game
    init();
});
