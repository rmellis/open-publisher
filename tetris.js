(function() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    let tetrisActive = false;
    let canvas, ctx;
    let rAF;
    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000;
    
    let gameState = 'PLAYING'; // PLAYING, GAME_OVER, PAUSED, CLEARING

    const COLS = 10;
    const ROWS = 20;
    let BLOCK_SIZE = 30; 
    let boardX = 0, boardY = 0;

    let arena = [];
    let player = { pos: {x: 0, y: 0}, matrix: null };
    let nextPiece = null;
    let holdPiece = null;
    let hasHeld = false;
    let score = 0;
    let lines = 0;
    let level = 1;

    let clearTimer = 0;
    const CLEAR_DURATION = 150; // ms
    
    let lockTimer = 0;
    const LOCK_DELAY = 500; // ms

    let audioCtx;
    let themeAudio = new Audio('https://saw.floydcraft.co.uk/OpenPublisherTetrisTheme.mp3');
    themeAudio.loop = true;
    themeAudio.volume = 0.25;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
    }

    function playSound(type) {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'move') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, t);
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        } else if (type === 'rotate') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, t);
            gain.gain.setValueAtTime(0.01, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
        } else if (type === 'drop') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else if (type === 'lock') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, t);
            gain.gain.setValueAtTime(0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else if (type === 'clear') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.setValueAtTime(600, t + 0.05);
            osc.frequency.setValueAtTime(800, t + 0.1);
            gain.gain.setValueAtTime(0.03, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.2);
            osc.start(t);
            osc.stop(t + 0.2);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, t);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.5);
            osc.start(t);
            osc.stop(t + 0.5);
        }
    }

    const colors = [
        null,
        '#00E5FF', // I (Cyan)
        '#2962FF', // J (Blue)
        '#FF6D00', // L (Orange)
        '#FFD600', // O (Yellow)
        '#00E676', // S (Green)
        '#D500F9', // T (Purple)
        '#FF1744', // Z (Red)
        '#FFFFFF'  // 8 = Flash white for clear animation
    ];

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    }

    function createPiece(type) {
        if (type === 'T') return [[0, 0, 0], [6, 6, 6], [0, 6, 0]];
        if (type === 'O') return [[4, 4], [4, 4]];
        if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
        if (type === 'J') return [[0, 2, 0], [0, 2, 0], [2, 2, 0]];
        if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
        if (type === 'S') return [[0, 5, 5], [5, 5, 0], [0, 0, 0]];
        if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }

    function getRandomPiece() {
        const pieces = 'ILJOTSZ';
        return createPiece(pieces[pieces.length * Math.random() | 0]);
    }

    function drawBlock(ctx, x, y, size, colorIndex) {
        if (colorIndex === 0) return;
        const baseColor = colors[colorIndex];
        
        // Flash white for animations
        if (colorIndex === 8) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, y, size, size);
            return;
        }

        // Main block
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, size, size);

        const b = Math.max(2, size * 0.15); // bevel size
        // Light top-left bevel
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size - b, y + b);
        ctx.lineTo(x + b, y + b);
        ctx.lineTo(x + b, y + size - b);
        ctx.lineTo(x, y + size);
        ctx.fill();

        // Dark bottom-right bevel
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(x + size, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + b, y + size - b);
        ctx.lineTo(x + size - b, y + size - b);
        ctx.lineTo(x + size - b, y + b);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, boardX + (x + offset.x) * BLOCK_SIZE, boardY + (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, value);
                }
            });
        });
    }

    function drawGrid() {
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        for(let x=0; x<=COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(boardX + x * BLOCK_SIZE, boardY);
            ctx.lineTo(boardX + x * BLOCK_SIZE, boardY + ROWS * BLOCK_SIZE);
            ctx.stroke();
        }
        for(let y=0; y<=ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(boardX, boardY + y * BLOCK_SIZE);
            ctx.lineTo(boardX + COLS * BLOCK_SIZE, boardY + y * BLOCK_SIZE);
            ctx.stroke();
        }
    }

    function drawUI() {
        const leftPanelWidth = boardX;
        const leftPanelCenterX = leftPanelWidth / 2;
        const rightPanelCenterX = boardX + (COLS * BLOCK_SIZE) + (canvas.width - (boardX + COLS * BLOCK_SIZE)) / 2;

        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        
        // Left Panel (Hold & Stats)
        ctx.fillText('HOLD', leftPanelCenterX, boardY + 40);
        if (holdPiece) {
            const previewSize = BLOCK_SIZE * 0.8;
            const pieceW = holdPiece[0].length * previewSize;
            holdPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        drawBlock(ctx, leftPanelCenterX - pieceW/2 + x * previewSize, boardY + 60 + y * previewSize, previewSize, value);
                    }
                });
            });
        }
        
        const statsStartY = boardY + 200;
        ctx.fillText('SCORE', leftPanelCenterX, statsStartY);
        ctx.fillStyle = '#007670';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(score, leftPanelCenterX, statsStartY + 30);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('LEVEL', leftPanelCenterX, statsStartY + 100);
        ctx.fillStyle = '#007670';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(level, leftPanelCenterX, statsStartY + 130);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('LINES', leftPanelCenterX, statsStartY + 200);
        ctx.fillStyle = '#007670';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(lines, leftPanelCenterX, statsStartY + 230);

        // Right Panel (Next Piece)
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('NEXT', rightPanelCenterX, boardY + 40);

        if (nextPiece) {
            const previewSize = BLOCK_SIZE * 0.8;
            const pieceW = nextPiece[0].length * previewSize;
            nextPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        drawBlock(ctx, rightPanelCenterX - pieceW/2 + x * previewSize, boardY + 60 + y * previewSize, previewSize, value);
                    }
                });
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background Board
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(boardX, boardY, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        
        drawGrid();
        
        // Board border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 4;
        ctx.strokeRect(boardX - 2, boardY - 2, COLS * BLOCK_SIZE + 4, ROWS * BLOCK_SIZE + 4);

        // Draw Arena & Player
        drawMatrix(arena, {x: 0, y: 0});
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            drawMatrix(player.matrix, player.pos);
        }

        drawUI();

        // Overlays
        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(boardX, boardY, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText('GAME OVER', boardX + (COLS * BLOCK_SIZE)/2, boardY + (ROWS * BLOCK_SIZE)/2);
            ctx.font = '18px sans-serif';
            ctx.fillText('Press SPACE to Restart', boardX + (COLS * BLOCK_SIZE)/2, boardY + (ROWS * BLOCK_SIZE)/2 + 40);
        } else if (gameState === 'PAUSED') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(boardX, boardY, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText('PAUSED', boardX + (COLS * BLOCK_SIZE)/2, boardY + (ROWS * BLOCK_SIZE)/2);
        }
    }

    function merge(arena, player) {
        playSound('lock');
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function playerDrop() {
        if (gameState !== 'PLAYING') return;
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
        } else {
            dropCounter = 0;
        }
    }

    function playerMove(dir) {
        if (gameState !== 'PLAYING') return;
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        } else {
            playSound('move');
            lockTimer = 0;
        }
    }

    function playerReset() {
        if (!nextPiece) nextPiece = getRandomPiece();
        player.matrix = nextPiece;
        nextPiece = getRandomPiece();
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        hasHeld = false;
        lockTimer = 0;
        
        if (collide(arena, player)) {
            gameState = 'GAME_OVER';
            playSound('gameover');
        }
    }

    function playerHold() {
        if (gameState !== 'PLAYING' || hasHeld) return;
        
        const temp = player.matrix;
        if (holdPiece) {
            player.matrix = holdPiece;
            holdPiece = temp;
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        } else {
            holdPiece = temp;
            playerReset();
        }
        playSound('rotate');
        hasHeld = true;
        dropCounter = 0;
        lockTimer = 0;
    }

    function playerRotate(dir) {
        if (gameState !== 'PLAYING') return;
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
        playSound('rotate');
        lockTimer = 0;
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) matrix.forEach(row => row.reverse());
        else matrix.reverse();
    }

    function checkLines() {
        let linesFound = false;
        for (let y = arena.length - 1; y > 0; --y) {
            let isFull = true;
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                arena[y].fill(8); // 8 is the white flash color index
                linesFound = true;
            }
        }

        if (linesFound) {
            gameState = 'CLEARING';
            clearTimer = 0;
        } else {
            playerReset();
        }
    }

    function clearAnimatedLines() {
        let rowCount = 1;
        let cleared = 0;
        
        // Remove lines that are fully 8 (white)
        outer: for (let y = arena.length - 1; y >= 0; --y) {
            if (arena[y][0] === 8) {
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y; // Re-evaluate this row index since it shifted down
                cleared++;
                score += rowCount * 100;
                rowCount *= 2;
            }
        }

        if (cleared > 0) {
            playSound('clear');
            lines += cleared;
            level = Math.floor(lines / 10) + 1;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }

        gameState = 'PLAYING';
        playerReset();
    }

    function update(time = 0) {
        if (!tetrisActive) return;
        const deltaTime = time - lastTime;
        lastTime = time;

        if (gameState === 'PLAYING') {
            player.pos.y++;
            const isResting = collide(arena, player);
            player.pos.y--;

            if (isResting) {
                lockTimer += deltaTime;
                if (lockTimer > LOCK_DELAY) {
                    merge(arena, player);
                    checkLines();
                    lockTimer = 0;
                    dropCounter = 0;
                }
            } else {
                lockTimer = 0;
                dropCounter += deltaTime;
                if (dropCounter > dropInterval) {
                    player.pos.y++;
                    dropCounter = 0;
                }
            }
        } else if (gameState === 'CLEARING') {
            clearTimer += deltaTime;
            if (clearTimer > CLEAR_DURATION) {
                clearAnimatedLines();
            }
        }

        draw();
        rAF = requestAnimationFrame(update);
    }

    function initGame() {
        arena = createMatrix(COLS, ROWS);
        score = 0;
        lines = 0;
        level = 1;
        dropInterval = 1000;
        nextPiece = getRandomPiece();
        holdPiece = null;
        hasHeld = false;
        lockTimer = 0;
        dropCounter = 0;
        gameState = 'PLAYING';
        playerReset();
    }

    function toggleTetris() {
        const paper = document.getElementById('paper');
        if (!paper) return;

        tetrisActive = !tetrisActive;

        if (tetrisActive) {
            Array.from(paper.children).forEach(child => {
                if (child.id !== 'tetris-canvas') {
                    child.dataset.originalDisplay = child.style.display || '';
                    child.style.display = 'none';
                }
            });

            const paperW = paper.offsetWidth;
            const paperH = paper.offsetHeight;
            
            // Layout Calculation
            BLOCK_SIZE = Math.floor(paperH / 22); // 20 rows + 2 margin
            boardX = Math.floor((paperW - COLS * BLOCK_SIZE) / 2);
            boardY = Math.floor((paperH - ROWS * BLOCK_SIZE) / 2);

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'tetris-canvas';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.backgroundColor = 'transparent';
                canvas.style.zIndex = '999999';
            }
            
            canvas.width = paperW;
            canvas.height = paperH;
            paper.appendChild(canvas);
            
            ctx = canvas.getContext('2d');

            // Add Exit Button to Ribbon
            const homeRibbon = document.getElementById('ribbon-home');
            if (homeRibbon && !document.getElementById('tetris-exit-group')) {
                const group = document.createElement('div');
                group.className = 'group';
                group.id = 'tetris-exit-group';
                
                const btn = document.createElement('div');
                btn.className = 'tool-btn';
                btn.innerHTML = '<i class="fas fa-gamepad"></i>Exit Tetris';
                btn.style.color = '#FF1744';
                btn.onclick = toggleTetris;
                
                const label = document.createElement('div');
                label.className = 'group-label';
                label.innerText = 'Easter Egg';
                
                group.appendChild(btn);
                group.appendChild(label);
                
                homeRibbon.insertBefore(group, homeRibbon.firstChild);
            }

            // Add Gemini Credit Overlay
            if (!document.getElementById('gemini-credit')) {
                const credit = document.createElement('div');
                credit.id = 'gemini-credit';
                credit.innerHTML = `
                    <img src="https://saw.floydcraft.co.uk/ThemeMusicByGemini.png" alt="Theme music generated by Gemini" style="max-width: 300px; height: auto; display: block;" />
                `;
                credit.style.position = 'fixed';
                credit.style.top = '260px';
                credit.style.left = '280px';
                credit.style.textAlign = 'center';
                credit.style.opacity = '0';
                credit.style.transformOrigin = 'top center';
                credit.style.transform = 'perspective(800px) rotateX(-80deg)';
                credit.style.clipPath = 'inset(0% 0% 100% 0%)';
                credit.style.transition = 'all 2s cubic-bezier(0.25, 1, 0.5, 1)';
                credit.style.zIndex = '999999';
                credit.style.pointerEvents = 'none';
                document.body.appendChild(credit);
                
                // Fade in and roll out
                setTimeout(() => {
                    const el = document.getElementById('gemini-credit');
                    if (el) {
                        el.style.opacity = '1';
                        el.style.transform = 'perspective(800px) rotateX(0deg)';
                        el.style.clipPath = 'inset(0% 0% 0% 0%)';
                    }
                }, 100);
                
                // Fade out
                setTimeout(() => {
                    const el = document.getElementById('gemini-credit');
                    if (el) {
                        el.style.opacity = '0';
                    }
                }, 10000);
                
                // Remove
                setTimeout(() => {
                    const el = document.getElementById('gemini-credit');
                    if (el && el.parentNode) el.parentNode.removeChild(el);
                }, 12000);
            }

            initAudio();
            themeAudio.currentTime = 0;
            themeAudio.play().catch(e => console.log('Audio autoplay blocked', e));

            initGame();
            lastTime = performance.now();
            update(performance.now());
        } else {
            themeAudio.pause();
            themeAudio.currentTime = 0;

            if (rAF) cancelAnimationFrame(rAF);
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
            
            const exitGroup = document.getElementById('tetris-exit-group');
            if (exitGroup && exitGroup.parentNode) exitGroup.parentNode.removeChild(exitGroup);
            
            const creditEl = document.getElementById('gemini-credit');
            if (creditEl && creditEl.parentNode) creditEl.parentNode.removeChild(creditEl);
            
            Array.from(paper.children).forEach(child => {
                if (child.dataset.originalDisplay !== undefined) {
                    child.style.display = child.dataset.originalDisplay;
                    delete child.dataset.originalDisplay;
                }
            });
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                toggleTetris();
            }
        } else {
            konamiIndex = 0;
            if (e.key.toLowerCase() === konamiCode[0].toLowerCase()) konamiIndex = 1;
        }

        if (tetrisActive) {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'c', 'C', 'Shift', 'p', 'P', 'Escape'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (gameState === 'GAME_OVER') {
                if (e.key === ' ') initGame();
                return;
            }

            if (gameState === 'CLEARING') return; // Lock inputs during clear animation

            if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
                if (gameState === 'PLAYING') gameState = 'PAUSED';
                else if (gameState === 'PAUSED') gameState = 'PLAYING';
                return;
            }

            if (gameState === 'PAUSED') return;

            if (e.key.toLowerCase() === 'c' || e.key === 'Shift') playerHold();
            else if (e.key === 'ArrowLeft') playerMove(-1);
            else if (e.key === 'ArrowRight') playerMove(1);
            else if (e.key === 'ArrowDown') playerDrop();
            else if (e.key === 'ArrowUp') playerRotate(1);
            else if (e.key === ' ') {
                while (!collide(arena, player)) player.pos.y++;
                player.pos.y--;
                playSound('drop');
                merge(arena, player);
                checkLines();
                dropCounter = 0;
                lockTimer = 0;
            }
        }
    }, true);
})();
