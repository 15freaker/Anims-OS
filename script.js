let draggedWindow = null;
let resizingWindow = null;
let offset = { x: 0, y: 0 };
let notes = ['Welcome to Anims-OS!'];
const backgrounds = [
    { name: 'Dark Blue', gradient: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 50%, #0f1e2e 100%)' },
    { name: 'Ocean', gradient: 'linear-gradient(135deg, #0f2e3d 0%, #1a3a4e 50%, #0f2845 100%)' },
    { name: 'Purple', gradient: 'linear-gradient(135deg, #2d1b3d 0%, #3d2b5c 50%, #1a1a2e 100%)' },
    { name: 'Forest', gradient: 'linear-gradient(135deg, #1a3d2e 0%, #2d5c47 50%, #0f2e1f 100%)' },
    { name: 'Midnight', gradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f1520 100%)' }
];
let tetris = {
    board: [],
    score: 0,
    playing: false,
    current: null,
    interval: null
};
function init() {
    updateTime();
    setInterval(updateTime, 1000);
    displayNotes();
    createBackgroundOptions();
    setupDragging();
    setupResizing();
    initTetris();
    setupTetrisControls();
}
function setupTetrisControls() {
    document.addEventListener('keydown', e => {
        if (!tetris.playing || !tetris.current) return;
        if (e.key === 'ArrowLeft') {
            if (canMovePiece(tetris.current, -1, 0)) tetris.current.x--;
        } else if (e.key === 'ArrowRight') {
            if (canMovePiece(tetris.current, 1, 0)) tetris.current.x++;
        } else if (e.key === 'ArrowDown') {
            if (canMovePiece(tetris.current, 0, 1)) tetris.current.y++;
        } else if (e.key === 'ArrowUp') {
            rotatePiece(tetris.current);
        }
        drawTetris();});
}
function rotatePiece(piece) {
    let rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    let originalShape = piece.shape;
    piece.shape = rotated;
    if (!canMovePiece(piece, 0, 0)) {
        piece.shape = originalShape; }
}
function updateTime() {
    let now = new Date();
    let h = String(now.getHours()).padStart(2, '0');
    let m = String(now.getMinutes()).padStart(2, '0');
    let date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
    document.getElementById('time').textContent = h + ':' + m;
    document.getElementById('date').textContent = date;
}
function displayNotes() {
    let list = document.getElementById('notes-list');
    if (!list) return;
    list.innerHTML = '';
    notes.forEach(n => {
        let div = document.createElement('div');
        div.className = 'note-item';
        div.textContent = n;
        list.appendChild(div); });
}
function addNote(e) {
    if (e.key === 'Enter') {
        let input = document.getElementById('note-input');
        if (input.value.trim()) {
            notes.push(input.value);
            input.value = '';
            displayNotes();}}
        }
function createBackgroundOptions() {
    let container = document.getElementById('bg-container');
    backgrounds.forEach(bg => {
        let div = document.createElement('div');
        div.className = 'bg-option';
        div.style.background = bg.gradient;
        div.title = bg.name;
        div.onclick = () => document.body.style.background = bg.gradient;
        container.appendChild(div);
    });
}
function openWindow(id) {
    document.getElementById(id).classList.add('active');
}
function closeWindow(id) {
    document.getElementById(id).classList.remove('active');
}
function openApp(app) {
    if (app === 'notes') openWindow('notes-app');
    if (app === 'tetris') openWindow('tetris-app');
}
function showMenu() {
    document.getElementById('feature-menu').classList.add('show');
}
function hideMenu() {
    document.getElementById('feature-menu').classList.remove('show');
}
function openFeature(f) {
    if (f === 'backgrounds') {
        openWindow('backgrounds-menu');
    }
}
function closeFeature(f) {
    if (f === 'backgrounds') {
        closeWindow('backgrounds-menu');
    }
}
function setupDragging() {
    document.addEventListener('mousedown', e => {
        let header = e.target.closest('.window-header');
        if (header && !e.target.classList.contains('close-btn')) {
            draggedWindow = header.closest('.window');
            let rect = draggedWindow.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
        }
    });
    document.addEventListener('mousemove', e => {
        if (draggedWindow) {
            draggedWindow.style.left = Math.max(0, e.clientX - offset.x) + 'px';
            draggedWindow.style.top = Math.max(70, e.clientY - offset.y) + 'px';
        }
    });
    document.addEventListener('mouseup', () => draggedWindow = null);
}
function setupResizing() {
    document.addEventListener('mousedown', e => {
        if (e.target.closest('.resize-handle')) {
            resizingWindow = e.target.closest('.window');
            offset.x = e.clientX;
            offset.y = e.clientY;
            offset.w = resizingWindow.offsetWidth;
            offset.h = resizingWindow.offsetHeight;
        }
    });
    document.addEventListener('mousemove', e => {
        if (resizingWindow) {
            let newW = offset.w + (e.clientX - offset.x);
            let newH = offset.h + (e.clientY - offset.y);
            resizingWindow.style.width = Math.max(300, newW) + 'px';
            resizingWindow.style.height = Math.max(200, newH) + 'px';
        }
    });
    document.addEventListener('mouseup', () => resizingWindow = null);
}
function initTetris() {
    tetris.board = Array(20).fill(0).map(() => Array(10).fill(0));
}
function startTetris() {
    stopTetris();
    tetris.playing = true;
    tetris.score = 0;
    tetris.board = Array(20).fill(0).map(() => Array(10).fill(0));
    tetris.current = createPiece();
    document.getElementById('tetris-score').textContent = tetris.score;
    drawTetris();
    tetris.interval = setInterval(() => {
        if (!tetris.current) {
            tetris.current = createPiece();
            if (!canMovePiece(tetris.current, 0, 0)) {
                stopTetris();
                alert('Game Over! Score: ' + tetris.score);
                return;}
        }
        if (!canMovePiece(tetris.current, 0, 1)) {
            lockPiece(tetris.current);
            tetris.current = null;
        } else {
            tetris.current.y++;}
        drawTetris();
    }, 600);
}
function stopTetris() {
    if (tetris.interval) {
        clearInterval(tetris.interval);
        tetris.playing = false;
        tetris.interval = null;
    }
}
function createPiece() {
    let types = [
        { shape: [[1, 1, 1, 1]], color: 0 },
        { shape: [[1, 1], [1, 1]], color: 1 },
        { shape: [[0, 1, 0], [1, 1, 1]], color: 2 },
        { shape: [[1, 0, 0], [1, 1, 1]], color: 3 },
        { shape: [[0, 0, 1], [1, 1, 1]], color: 4 }
    ];
    let type = types[Math.floor(Math.random() * types.length)];
    return { shape: type.shape, x: 3, y: 0, color: type.color };
}
function canMovePiece(piece, dx, dy) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                let x = piece.x + col + dx;
                let y = piece.y + row + dy;
                if (x < 0 || x >= 10 || y >= 20) return false;
                if (y >= 0 && tetris.board[y][x]) return false;}
}}
    return true;
}
function lockPiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                let x = piece.x + col;
                let y = piece.y + row;
                if (y >= 0) {
                    tetris.board[y][x] = piece.color + 1; }
 }}}
    tetris.score += 10;
    document.getElementById('tetris-score').textContent = tetris.score;
}
function drawTetris() {
    let board = document.getElementById('tetris-board');
    board.innerHTML = '';
    let display = tetris.board.map(row => [...row]);
    if (tetris.current) {
        for (let row = 0; row < tetris.current.shape.length; row++) {
            for (let col = 0; col < tetris.current.shape[row].length; col++) {
                if (tetris.current.shape[row][col]) {
                    let x = tetris.current.x + col;
                    let y = tetris.current.y + row;
                    if (y >= 0 && y < 20 && x >= 0 && x < 10) {
                        display[y][x] = tetris.current.color + 1;}}}}}
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            let cell = document.createElement('div');
            cell.className = 'tetris-cell';
            if (display[row][col]) {
                cell.classList.add('active');
            }
            board.appendChild(cell);
        }
    }
}
window.onload = init;