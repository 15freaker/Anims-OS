let activeWindow = null;
let activeResizeWindow = null;
let cursorOffset = { x: 0, y: 0 };
let userNotes = ['Welcome to Anims-OS!'];
let featureMenuTimeout = null;
let tetrisGame = {
    grid: [],
    score: 0,
    isPlaying: false,
    activePiece: null,
    timer: null
};
function initOS() {
    updateClock();
    setInterval(updateClock, 1000);
    renderNotes();
    renderThemeSelector();
    bindDragEvents();
    bindResizeEvents();
    initTetrisGrid();
    bindTetrisControls();
}
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    document.getElementById('date').textContent = formattedDate;
}
function renderNotes() {
    const notesContainer = document.getElementById('notes-list');
    if (!notesContainer) return;
    notesContainer.innerHTML = '';
    userNotes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.textContent = note;
        notesContainer.appendChild(item);
    });
}
function addNote(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('note-input');
        const text = input.value.trim();
        if (text) {
            userNotes.push(text);
            input.value = '';
            renderNotes();
        }}}
function renderThemeSelector() {
    const container = document.getElementById('bg-container');
    colorThemes.forEach(theme => {
        const swatch = document.createElement('div');
        swatch.className = 'bg-option';
        swatch.style.background = theme.gradient;
        swatch.title = theme.name;
        swatch.onclick = () => {
            document.body.style.background = theme.gradient;
        };
        container.appendChild(swatch);
});}
function openWindow(id) {
    document.getElementById(id).classList.add('active');
}
function closeWindow(id) {
    document.getElementById(id).classList.remove('active');}
function openApp(appName) {
    if (appName === 'notes') openWindow('notes-app');
    if (appName === 'tetris') openWindow('tetris-app');
}
function showMenu() {
    if (featureMenuTimeout) {
        clearTimeout(featureMenuTimeout);
        featureMenuTimeout = null;
    }
    document.getElementById('feature-menu').classList.add('show');
}
function hideMenu() {
    if (featureMenuTimeout) {
        clearTimeout(featureMenuTimeout);
    }
    featureMenuTimeout = setTimeout(() => {
        document.getElementById('feature-menu').classList.remove('show');
    }, 5000);
}
function openFeature(featureName) {
    if (featureName === 'backgrounds') openWindow('backgrounds-menu');
}
function closeFeature(featureName) {
    if (featureName === 'backgrounds') closeWindow('backgrounds-menu');
}
function bindDragEvents() {
    document.addEventListener('mousedown', event => {
        const header = event.target.closest('.window-header');
        if (header && !event.target.classList.contains('close-btn')) {
            activeWindow = header.closest('.window');
            const rect = activeWindow.getBoundingClientRect();
            cursorOffset.x = event.clientX - rect.left;
            cursorOffset.y = event.clientY - rect.top;
        }});
    document.addEventListener('mousemove', event => {
        if (activeWindow) {
            activeWindow.style.left = `${Math.max(0, event.clientX - cursorOffset.x)}px`;
            activeWindow.style.top = `${Math.max(70, event.clientY - cursorOffset.y)}px`;
        }
    });
    document.addEventListener('mouseup', () => {
        activeWindow = null;
    });
}
function bindResizeEvents() {
    document.addEventListener('mousedown', event => {
        if (event.target.closest('.resize-handle')) {
            activeResizeWindow = event.target.closest('.window');
            cursorOffset.x = event.clientX;
            cursorOffset.y = event.clientY;
            cursorOffset.w = activeResizeWindow.offsetWidth;
            cursorOffset.h = activeResizeWindow.offsetHeight;
        }
    });
    document.addEventListener('mousemove', event => {
        if (activeResizeWindow) {
            const nextWidth = cursorOffset.w + (event.clientX - cursorOffset.x);
            const nextHeight = cursorOffset.h + (event.clientY - cursorOffset.y);
            activeResizeWindow.style.width = `${Math.max(300, nextWidth)}px`;
            activeResizeWindow.style.height = `${Math.max(200, nextHeight)}px`;
        }
    });
    document.addEventListener('mouseup', () => {
        activeResizeWindow = null;
    });
}
function initTetrisGrid() {
    tetrisGame.grid = Array(20).fill(0).map(() => Array(10).fill(0));
}
function bindTetrisControls() {
    document.addEventListener('keydown', event => {
        if (!tetrisGame.isPlaying || !tetrisGame.activePiece) return;
        if (event.key === 'ArrowLeft') {
           if (canPieceMove(tetrisGame.activePiece, -1, 0)) tetrisGame.activePiece.x--;
        } else if (event.key === 'ArrowRight') {
            if (canPieceMove(tetrisGame.activePiece, 1, 0)) tetrisGame.activePiece.x++;
        } else if (event.key === 'ArrowDown') {
            if (canPieceMove(tetrisGame.activePiece, 0, 1)) tetrisGame.activePiece.y++;
        } else if (event.key === 'ArrowUp') {
            rotateTetrisPiece(tetrisGame.activePiece);
        }
        renderTetris();
    });}
function rotateTetrisPiece(piece) {
    const rotatedShape = piece.shape[0].map((_, idx) =>
        piece.shape.map(row => row[idx]).reverse()
    );
    const originalShape = piece.shape;
    piece.shape = rotatedShape;
    if (!canPieceMove(piece, 0, 0)) {
        piece.shape = originalShape;
    }}
const colorThemes = [
    { name: 'Dark Blue', gradient: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 50%, #0f1e2e 100%)' },
    { name: 'Ocean', gradient: 'linear-gradient(135deg, #0f2e3d 0%, #1a3a4e 50%, #0f2845 100%)' },
    { name: 'Purple', gradient: 'linear-gradient(135deg, #2d1b3d 0%, #3d2b5c 50%, #1a1a2e 100%)' },
    { name: 'Forest', gradient: 'linear-gradient(135deg, #1a3d2e 0%, #2d5c47 50%, #0f2e1f 100%)' },
    { name: 'Midnight', gradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f1520 100%)' }
];
function startTetris() {
    stopTetris();
    tetrisGame.isPlaying = true;
    tetrisGame.score = 0;
    tetrisGame.grid = Array(20).fill(0).map(() => Array(10).fill(0));
    tetrisGame.activePiece = generateTetrisPiece();
    document.getElementById('tetris-score').textContent = tetrisGame.score;
    renderTetris();
    tetrisGame.timer = setInterval(() => {
        if (!tetrisGame.activePiece) {
            tetrisGame.activePiece = generateTetrisPiece();
            if (!canPieceMove(tetrisGame.activePiece, 0, 0)) {
                stopTetris();
                alert(`Game Over! Score: ${tetrisGame.score}`);
                return;}}
        if (!canPieceMove(tetrisGame.activePiece, 0, 1)) {
            lockTetrisPiece(tetrisGame.activePiece);
            tetrisGame.activePiece = null;
        } else {
            tetrisGame.activePiece.y++;
        }
        renderTetris();
    }, 600);}
function stopTetris() {
    if (tetrisGame.timer) {
        clearInterval(tetrisGame.timer);
        tetrisGame.isPlaying = false;
        tetrisGame.timer = null;}}
function generateTetrisPiece() {
    const shapes = [
        { shape: [[1, 1, 1, 1]], color: 0 },
        { shape: [[1, 1], [1, 1]], color: 1 },
        { shape: [[0, 1, 0], [1, 1, 1]], color: 2 },
        { shape: [[1, 0, 0], [1, 1, 1]], color: 3 },
        { shape: [[0, 0, 1], [1, 1, 1]], color: 4 }
    ];
    const picked = shapes[Math.floor(Math.random() * shapes.length)];
    return { shape: picked.shape, x: 3, y: 0, color: picked.color };
}
function canPieceMove(piece, dx, dy) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const newX = piece.x + col + dx;
                const newY = piece.y + row + dy;
                if (newX < 0 || newX >= 10 || newY >= 20) return false;
                if (newY >= 0 && tetrisGame.grid[newY][newX]) return false;
            }}}return true;}
function lockTetrisPiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const targetX = piece.x + col;
                const targetY = piece.y + row;
                if (targetY >= 0) {
                    tetrisGame.grid[targetY][targetX] = piece.color + 1;
}}}}
    tetrisGame.score += 10;
    document.getElementById('tetris-score').textContent = tetrisGame.score;}
function renderTetris() {
    const board = document.getElementById('tetris-board');
    board.innerHTML = '';
    const renderGrid = tetrisGame.grid.map(row => [...row]);
    if (tetrisGame.activePiece) {
        for (let row = 0; row < tetrisGame.activePiece.shape.length; row++) {
            for (let col = 0; col < tetrisGame.activePiece.shape[row].length; col++) {
                if (tetrisGame.activePiece.shape[row][col]) {
                    const drawX = tetrisGame.activePiece.x + col;
                    const drawY = tetrisGame.activePiece.y + row;
                    if (drawY >= 0 && drawY < 20 && drawX >= 0 && drawX < 10) {
                        renderGrid[drawY][drawX] = tetrisGame.activePiece.color + 1;
                    }}}}}
    for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 10; c++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            if (renderGrid[r][c]) {
                cell.classList.add('active');}
            board.appendChild(cell);
        }}}
window.onload = initOS;