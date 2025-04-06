
let allImages = [
  'dino_green.png', 'dino_purple.png', 'dino_blue.png', 'dino_red.png',
  'egg_blue.png', 'egg_spotted.png', 'egg_green.png', 'dino_yellow.png'
];

let board = document.getElementById('game-board');
let statusText = document.getElementById('status');
let movesCounter = document.getElementById('moves');
let timerDisplay = document.getElementById('timer');
let difficultySelect = document.getElementById('difficulty');
let recordsList = document.getElementById('records');

let clickSound = new Audio('click.mp3');
let winSound = new Audio('win.mp3');
let errorSound = new Audio('error.mp3');

let revealedCards = [], matchedPairs = 0, totalPairs = 0, moves = 0;
let timer = null, seconds = 0, score = 0;

function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
}

function startTimer() {
    seconds = 0;
    timerDisplay.textContent = 'Время: 0 сек';
    timer = setInterval(() => {
        seconds++;
        timerDisplay.textContent = `Время: ${seconds} сек`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function showHint() {
    const cards = Array.from(document.querySelectorAll('.card:not(.revealed)'));
    if (cards.length < 2) return;
    let pair = {};
    for (let card of cards) {
        if (!pair[card.dataset.image]) {
            pair[card.dataset.image] = [card];
        } else {
            pair[card.dataset.image].push(card);
            break;
        }
    }
    if (Object.values(pair)[0]?.length === 2) {
        let [a, b] = Object.values(pair)[0];
        revealCard(a);
        revealCard(b);
        setTimeout(() => {
            hideCard(a);
            hideCard(b);
        }, 1000);
    }
}

function startGame() {
    board.innerHTML = '';
    statusText.textContent = '';
    revealedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    movesCounter.textContent = 'Ходы: 0';
    stopTimer();
    showRecords();

    let difficulty = difficultySelect.value;
    let rows = 4, cols = 4;
    if (difficulty === 'medium') { rows = 4; cols = 5; }
    if (difficulty === 'hard') { rows = 5; cols = 6; }

    board.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
    let numCards = rows * cols;
    totalPairs = numCards / 2;

    let selected = shuffle(allImages).slice(0, totalPairs);
    let cards = shuffle([...selected, ...selected]);

    cards.forEach((imgName) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = imgName;
        card.addEventListener('click', () => handleCardClick(card));
        board.appendChild(card);
    });

    startTimer();
}

function revealCard(card) {
    if (card.querySelector('img')) return;
    let img = document.createElement('img');
    img.src = 'images/' + card.dataset.image;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '10px';
    card.appendChild(img);
    card.classList.add('revealed');
}

function hideCard(card) {
    card.innerHTML = '';
    card.classList.remove('revealed');
}

function handleCardClick(card) {
    if (card.classList.contains('revealed') || revealedCards.length === 2) return;

    clickSound.play();
    revealCard(card);
    revealedCards.push(card);

    if (revealedCards.length === 2) {
        moves++;
        movesCounter.textContent = `Ходы: ${moves}`;
        const [first, second] = revealedCards;
        if (first.dataset.image === second.dataset.image) {
            matchedPairs++;
            revealedCards = [];
            if (matchedPairs === totalPairs) {
                winSound.play();
                stopTimer();
                score = Math.max(1000 - (moves * 5 + seconds * 3), 0);
                statusText.innerHTML = `Победа! Ходы: ${moves}, Время: ${seconds} сек, Очки: ${score}`;
                updateRecords(difficultySelect.value, moves, seconds);
            }
        } else {
            errorSound.play();
            setTimeout(() => {
                hideCard(first);
                hideCard(second);
                revealedCards = [];
            }, 800);
        }
    }
}

function updateRecords(difficulty, moves, time) {
    let key = `record_${difficulty}`;
    let existing = localStorage.getItem(key);
    let newRecord = { moves, time };
    let isNew = false;

    if (!existing) {
        isNew = true;
    } else {
        let oldRecord = JSON.parse(existing);
        if (time < oldRecord.time || (time === oldRecord.time && moves < oldRecord.moves)) {
            isNew = true;
        }
    }

    if (isNew) {
        localStorage.setItem(key, JSON.stringify(newRecord));
        statusText.innerHTML += '<br><strong>Новый рекорд!</strong>';
    }

    showRecords();
}

function showRecords() {
    let difficulties = { easy: 'Легко', medium: 'Средне', hard: 'Сложно' };
    recordsList.innerHTML = '';
    for (let diff in difficulties) {
        let rec = localStorage.getItem(`record_${diff}`);
        let text = `${difficulties[diff]}: `;
        if (rec) {
            let { moves, time } = JSON.parse(rec);
            text += `${moves} ходов, ${time} сек`;
        } else {
            text += 'нет';
        }
        let li = document.createElement('li');
        li.textContent = text;
        recordsList.appendChild(li);
    }
}

startGame();
