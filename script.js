// 游戏核心变量
const cardSymbols = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓']; // 卡片图案，共8对16张
let cardList = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timer = null;
let seconds = 0;
let gameStarted = false;

// DOM元素
const cardGrid = document.getElementById('cardGrid');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const winModal = document.getElementById('winModal');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const modalRestart = document.getElementById('modalRestart');

// 初始化游戏
function initGame() {
    // 重置所有状态
    cardList = [];
    flippedCards = [];
    matchedCount = 0;
    moves = 0;
    seconds = 0;
    gameStarted = false;
    movesDisplay.textContent = moves;
    timerDisplay.textContent = '00:00';
    cardGrid.innerHTML = '';
    winModal.classList.remove('show');
    
    // 清除计时器
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // 生成成对的卡片
    cardSymbols.forEach(symbol => {
        cardList.push({ id: Date.now() + Math.random(), symbol, flipped: false, matched: false });
        cardList.push({ id: Date.now() + Math.random() + 1, symbol, flipped: false, matched: false });
    });

    // 洗牌算法（Fisher-Yates）
    for (let i = cardList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }

    // 渲染卡片
    renderCards();
}

// 渲染卡片到页面
function renderCards() {
    cardList.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">${card.symbol}</div>
        `;
        cardElement.addEventListener('click', flipCard);
        cardGrid.appendChild(cardElement);
    });
}

// 翻牌逻辑
function flipCard(e) {
    const cardElement = e.currentTarget;
    const index = cardElement.dataset.index;
    const card = cardList[index];

    // 禁止重复点击已翻开/已匹配的卡片，禁止同时翻超过2张
    if (card.flipped || card.matched || flippedCards.length >= 2) return;

    // 第一次点击卡片，启动计时器
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    // 翻转卡片
    card.flipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push({ index, card, element: cardElement });

    // 翻够2张，判断匹配
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// 卡片匹配判断
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.card.symbol === card2.card.symbol;

    if (isMatch) {
        // 匹配成功
        card1.card.matched = true;
        card2.card.matched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];

        // 判断是否全部匹配完成（胜利）
        if (matchedCount === cardList.length) {
            gameWin();
        }
    } else {
        // 匹配失败，翻回卡片
        setTimeout(() => {
            card1.card.flipped = false;
            card2.card.flipped = false;
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            flippedCards = [];
        }, 600);
    }
}

// 计时器功能
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${secs}`;
    }, 1000);
}

// 游戏胜利逻辑
function gameWin() {
    clearInterval(timer);
    finalMoves.textContent = moves;
    finalTime.textContent = timerDisplay.textContent;
    // 延迟弹出弹窗，避免动画冲突
    setTimeout(() => {
        winModal.classList.add('show');
    }, 300);
}

// 重新开始按钮事件
restartBtn.addEventListener('click', initGame);
modalRestart.addEventListener('click', initGame);

// 页面加载完成，初始化游戏
window.addEventListener('DOMContentLoaded', initGame);