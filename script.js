const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const tempSlider = document.getElementById('temp-slider');
const tempValue = document.getElementById('temp-value');
const atomCountDisplay = document.getElementById('atom-count');
const bondCountDisplay = document.getElementById('bond-count');
const uiContainer = document.getElementById('ui-container');
const elementsGrid = document.getElementById('elements-grid');
const searchInput = document.getElementById('element-search');
const selectedLabel = document.getElementById('current-selected-label');

let atoms = [];
let bonds = [];
let effects = []; // Sparkles and flashes
let width, height;
let selectedElementSymbol = 'H';

const camera = { x: 0, y: 0, zoom: 1, isDragging: false, lastMouseX: 0, lastMouseY: 0 };
let draggedAtom = null;
let currentMouseX = 0;
let currentMouseY = 0;
let selectionStart = null;
let selectionEnd = null;
let isSelecting = false;
let clipboardAtoms = null;
let pendingPaste = null; // Atoms waiting to be placed
let pendingPasteOffset = { x: 0, y: 0 };

// Physical constants
const BOND_DISTANCE_FACTOR = 1.1;
const BONDING_RADIUS_MUL = 1.3;
const SPRING_CONSTANT = 0.1;
const DAMPING = 0.98;
const COLLISION_DAMPING = 0.5;
const INTERMOLECULAR_STRENGTH = 0.005;

function calculateRadius(mass) { return Math.pow(mass, 1 / 3) * 8.5; }

function resize() {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width; canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

function screenToWorld(x, y) {
    return { x: (x - width / 2) / camera.zoom - camera.x, y: (y - height / 2) / camera.zoom - camera.y };
}

function worldToScreen(x, y) {
    return { x: (x + camera.x) * camera.zoom + width / 2, y: (y + camera.y) * camera.zoom + height / 2 };
}

class Atom {
    constructor(elementData, x, y) {
        this.type = elementData.symbol;
        this.mass = elementData.mass;
        this.radius = calculateRadius(this.mass);
        this.valence = elementData.valence;
        this.en = elementData.en || 0;
        this.color = elementData.cpk;
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        this.textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';
    }

    getOccupiedValence() {
        return bonds.reduce((total, b) => (b.a === this || b.b === this) ? total + b.count : total, 0);
    }

    update() {
        const kelvin = parseFloat(tempSlider.value);
        const tempFactor = kelvin / 300;

        // Brownian
        const brownian = tempFactor * 0.4;
        this.vx += (Math.random() - 0.5) * brownian;
        this.vy += (Math.random() - 0.5) * brownian;

        // Speed limit
        const limit = 2 + tempFactor * 20;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > limit) { this.vx *= 0.9; this.vy *= 0.9; }

        this.x += this.vx; this.y += this.vy;
    }

    draw() {
        const dx = (this.x + camera.x) * camera.zoom + width / 2;
        const dy = (this.y + camera.y) * camera.zoom + height / 2;
        const dr = this.radius * camera.zoom;
        if (dx + dr < 0 || dx - dr > width || dy + dr < 0 || dy - dr > height) return;

        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10 * camera.zoom;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = Math.max(0.5, 1 * camera.zoom);
        ctx.stroke();

        if (camera.zoom > 0.4) {
            ctx.fillStyle = this.textColor;
            ctx.font = `bold ${Math.max(6, dr * 0.8)}px Orbitron`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.type, dx, dy);
        }
    }
}

class Bond {
    constructor(a, b, count = 1) {
        this.a = a; this.b = b; this.count = count;
        this.targetDist = (a.radius + b.radius) * BOND_DISTANCE_FACTOR;
    }
    update() {
        const dx = this.b.x - this.a.x;
        const dy = this.b.y - this.a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const force = (d - this.targetDist) * SPRING_CONSTANT * (1 + (this.count - 1) * 0.5);
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        this.a.vx += fx / this.a.mass; this.a.vy += fy / this.a.mass;
        this.b.vx -= fx / this.b.mass; this.b.vy -= fy / this.b.mass;
    }
    draw() {
        const x1 = (this.a.x + camera.x) * camera.zoom + width / 2;
        const y1 = (this.a.y + camera.y) * camera.zoom + height / 2;
        const x2 = (this.b.x + camera.x) * camera.zoom + width / 2;
        const y2 = (this.b.y + camera.y) * camera.zoom + height / 2;
        const dx = x2 - x1; const dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) return;
        const nx = -dy / d; const ny = dx / d;
        const sp = 4 * camera.zoom;
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.lineWidth = Math.max(1, 4 * camera.zoom);
        const dl = (o) => { ctx.beginPath(); ctx.moveTo(x1 + nx * o, y1 + ny * o); ctx.lineTo(x2 + nx * o, y2 + ny * o); ctx.stroke(); };
        if (this.count === 1) dl(0);
        else if (this.count === 2) { dl(-sp); dl(sp); }
        else if (this.count === 3) { dl(-sp * 1.5); dl(0); dl(sp * 1.5); }
    }
}

// Spatial grid for O(n) neighbor lookups
const GRID_CELL_SIZE = 100;
let spatialGrid = {};

function buildSpatialGrid() {
    spatialGrid = {};
    for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        const key = `${Math.floor(a.x / GRID_CELL_SIZE)},${Math.floor(a.y / GRID_CELL_SIZE)}`;
        if (!spatialGrid[key]) spatialGrid[key] = [];
        spatialGrid[key].push(i);
    }
}

function getNeighborIndices(atom) {
    const cx = Math.floor(atom.x / GRID_CELL_SIZE);
    const cy = Math.floor(atom.y / GRID_CELL_SIZE);
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const key = `${cx + dx},${cy + dy}`;
            if (spatialGrid[key]) neighbors.push(...spatialGrid[key]);
        }
    }
    return neighbors;
}

function solvePhysics() {
    buildSpatialGrid();
    const checked = new Set();
    
    for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        const neighbors = getNeighborIndices(a);
        
        for (const j of neighbors) {
            if (j <= i) continue;
            const pairKey = `${i},${j}`;
            if (checked.has(pairKey)) continue;
            checked.add(pairKey);
            
            const b = atoms[j];
            const dx = b.x - a.x; const dy = b.y - a.y;
            const ds = dx * dx + dy * dy;
            const md = a.radius + b.radius;

            if (ds < (md * BONDING_RADIUS_MUL) ** 2) tryCreateBond(a, b);

            if (ds < md * md) {
                const d = Math.sqrt(ds) || 0.1;
                const ov = md - d;
                const nx = dx / d; const ny = dy / d;
                a.x -= nx * ov * 0.5; a.y -= ny * ov * 0.5;
                b.x += nx * ov * 0.5; b.y += ny * ov * 0.5;
                const rvx = b.vx - a.vx; const rvy = b.vy - a.vy;
                const vn = rvx * nx + rvy * ny;
                if (vn < 0) {
                    const im = -(1 + COLLISION_DAMPING) * vn / (1 / a.mass + 1 / b.mass);
                    a.vx -= (im * nx) / a.mass; a.vy -= (im * ny) / a.mass;
                    b.vx += (im * nx) / b.mass; b.vy += (im * ny) / b.mass;
                }
            }
        }
    }
}

function tryCreateBond(a, b) {
    if (a.valence === 0 || b.valence === 0) return;
    const existing = bonds.find(bo => (bo.a === a && bo.b === b) || (bo.a === b && bo.b === a));

    if (existing) {
        if (existing.count < 3 && a.getOccupiedValence() < a.valence && b.getOccupiedValence() < b.valence) {
            existing.count++;
            createEffect(a.x, a.y, '#00f2ff', 2);
        }
    } else {
        const aFree = a.valence - a.getOccupiedValence();
        const bFree = b.valence - b.getOccupiedValence();

        if (aFree > 0 && bFree > 0) {
            bonds.push(new Bond(a, b));
            createEffect((a.x + b.x) / 2, (a.y + b.y) / 2, '#fff', 3);
        } else {
            // ADVANCED OXIDATION / SUBSTITUTION
            const kelvin = parseFloat(tempSlider.value);
            if (kelvin > 450) { // Activation energy
                if (aFree > 0) attemptReaction(a, b);
                else if (bFree > 0) attemptReaction(b, a);
            }
        }
    }
}

function attemptReaction(attacker, target) {
    const targetBonds = bonds.filter(b => b.a === target || b.b === target);
    for (let bondToBreak of targetBonds) {
        const victim = bondToBreak.a === target ? bondToBreak.b : bondToBreak.a;
        if (victim === attacker) continue;

        // Oxidation Logic: More electronegative atom kicks out the less EN one
        const enDifference = attacker.en - victim.en;
        if (enDifference > 0.7) {
            bonds = bonds.filter(b => b !== bondToBreak);
            // Form new bond, often double if it's Oxygen-Carbon
            let newCount = (attacker.type === 'O' && target.type === 'C' && attacker.valence >= 2 && target.valence - (target.getOccupiedValence()) >= 2) ? 2 : 1;
            bonds.push(new Bond(attacker, target, newCount));

            // Energy release (Heat/Flash)
            createEffect(target.x, target.y, '#ff4d00', 15);
            const kick = 5 + enDifference * 5;
            victim.vx += (Math.random() - 0.5) * kick;
            victim.vy += (Math.random() - 0.5) * kick;
            attacker.vx += (Math.random() - 0.5) * 2; target.vx += (Math.random() - 0.5) * 2;
            return;
        }
    }
}

function createEffect(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        effects.push({
            x, y,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
            life: 1.0, color: color, size: Math.random() * 3 + 1
        });
    }
}

// Эффект под курсором — видно всегда, даже при большом зуме/панорамировании
function createFeedbackEffect(color, count) {
    const w = screenToWorld(currentMouseX, currentMouseY);
    createEffect(w.x, w.y, color, count);
}

function updateSimulation() {
    const kelvin = parseFloat(tempSlider.value);

    // Effects update
    effects = effects.filter(e => {
        e.x += e.vx; e.y += e.vy; e.life -= 0.05;
        return e.life > 0;
    });

    for (let s = 0; s < 6; s++) {
        // Bond thermal stress
        for (let i = bonds.length - 1; i >= 0; i--) {
            bonds[i].update();
            const stress = (kelvin / 2000) * (0.005 / (bonds[i].count ** 2));
            if (kelvin > 400 && Math.random() < stress) {
                createEffect((bonds[i].a.x + bonds[i].b.x) / 2, (bonds[i].a.y + bonds[i].b.y) / 2, '#ff0', 5);
                bonds.splice(i, 1);
            }
        }
        solvePhysics();
        atoms.forEach(a => { a.update(); a.vx *= DAMPING; a.vy *= DAMPING; });
    }
}

function clearSelection() {
    selectionStart = null;
    selectionEnd = null;
    isSelecting = false;
}

function getSelectedAtoms() {
    if (!selectionStart || !selectionEnd) return [];
    const x1 = Math.min(selectionStart.x, selectionEnd.x);
    const y1 = Math.min(selectionStart.y, selectionEnd.y);
    const x2 = Math.max(selectionStart.x, selectionEnd.x);
    const y2 = Math.max(selectionStart.y, selectionEnd.y);
    
    // Мировые координаты: выделение «держится» на месте при зуме и панорамировании
    return atoms.filter(a => a.x >= x1 && a.x <= x2 && a.y >= y1 && a.y <= y2);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Grid
    const gz = 100 * camera.zoom;
    const ox = (camera.x * camera.zoom + width / 2) % gz;
    const oy = (camera.y * camera.zoom + height / 2) % gz;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    for (let x = ox; x < width; x += gz) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = oy; y < height; y += gz) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    bonds.forEach(b => b.draw());
    
    // Draw atoms with selection highlight
    const hasSelection = selectionStart && selectionEnd && (selectionStart.x !== selectionEnd.x || selectionStart.y !== selectionEnd.y);
    const selected = hasSelection ? getSelectedAtoms() : [];
    const pendingIndices = pendingPaste ? pendingPaste.atoms.map(a => atoms.indexOf(a)) : [];
    
    atoms.forEach(a => {
        const isPending = pendingIndices.includes(atoms.indexOf(a));
        if (isPending) {
            ctx.globalAlpha = 0.5;
            a.draw();
            ctx.globalAlpha = 1.0;
        } else {
            a.draw();
        }
        if (selected.includes(a)) {
            const dx = (a.x + camera.x) * camera.zoom + width / 2;
            const dy = (a.y + camera.y) * camera.zoom + height / 2;
            const dr = a.radius * camera.zoom + 6;
            ctx.strokeStyle = 'rgba(0, 255, 150, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });

    // Pending paste ghost
    if (pendingPaste) {
        ctx.globalAlpha = 0.4;
        pendingPaste.atoms.forEach(a => {
            const dx = (a.x + pendingPasteOffset.x + camera.x) * camera.zoom + width / 2;
            const dy = (a.y + pendingPasteOffset.y + camera.y) * camera.zoom + height / 2;
            const dr = a.radius * camera.zoom;
            ctx.beginPath();
            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
            ctx.fillStyle = a.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.globalAlpha = 1.0;
    }

    // Selection rectangle (мировые координаты -> экран, поэтому масштабируется при зуме)
    if (selectionStart && selectionEnd && (selectionStart.x !== selectionEnd.x || selectionStart.y !== selectionEnd.y)) {
        const p1 = worldToScreen(selectionStart.x, selectionStart.y);
        const p2 = worldToScreen(selectionEnd.x, selectionEnd.y);
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        ctx.fillStyle = 'rgba(0, 255, 150, 0.1)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
        ctx.setLineDash([]);
    }

    // Effects
    effects.forEach(e => {
        const ex = (e.x + camera.x) * camera.zoom + width / 2;
        const ey = (e.y + camera.y) * camera.zoom + height / 2;
        ctx.fillStyle = e.color;
        ctx.globalAlpha = e.life;
        ctx.beginPath(); ctx.arc(ex, ey, e.size * camera.zoom, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;
}

// REST OF UI (unchanged logic)
function injectAtom(symbol, x, y) {
    const data = PERIODIC_TABLE.find(e => e.symbol === symbol);
    if (!data) return;
    if (x === undefined) { const w = screenToWorld(width / 2, height / 2); x = w.x + (Math.random() - 0.5) * 20; y = w.y + (Math.random() - 0.5) * 20; }
    atoms.push(new Atom(data, x, y));
}
function removeAtomAt(x, y) {
    for (let i = atoms.length - 1; i >= 0; i--) {
        const d2 = (atoms[i].x - x) ** 2 + (atoms[i].y - y) ** 2;
        if (d2 < (atoms[i].radius + 10) ** 2) { bonds = bonds.filter(b => b.a !== atoms[i] && b.b !== atoms[i]); atoms.splice(i, 1); return; }
    }
}
function resetSim() { atoms = []; bonds = []; effects = []; camera.x = 0; camera.y = 0; camera.zoom = 1; }
function toggleMenu() { uiContainer.classList.toggle('minimized'); }
function toggleInstructions() {
    const panel = document.getElementById('instructions-panel');
    const content = document.getElementById('instructions-content');
    panel.classList.toggle('collapsed');
    if (panel.classList.contains('collapsed')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
    }
}
function setSelectedElement(s) {
    selectedElementSymbol = s;
    if (selectedLabel) selectedLabel.textContent = s;
    populateGrid();
}
function populateGrid() {
    const f = searchInput.value.toLowerCase(); elementsGrid.innerHTML = '';
    PERIODIC_TABLE.forEach(el => {
        if (el.symbol.toLowerCase().includes(f) || el.name.toLowerCase().includes(f)) {
            const btn = document.createElement('div'); btn.className = `element-btn ${el.symbol === selectedElementSymbol ? 'selected' : ''}`;
            btn.innerHTML = `<span class="symbol">${el.symbol}</span><span class="name">${el.name}</span>`;
            btn.style.borderLeft = `3px solid ${el.cpk}`; btn.onclick = () => setSelectedElement(el.symbol); elementsGrid.appendChild(btn);
        }
    });
}

function filterElements() { populateGrid(); }

canvas.addEventListener('mousedown', (e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);

    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        camera.isDragging = true;
        camera.lastMouseX = e.clientX; camera.lastMouseY = e.clientY;
    } else if (e.button === 0 && e.ctrlKey) {
        // Start selection (в мировых координатах — выделение привязано к миру)
        isSelecting = true;
        selectionStart = screenToWorld(e.clientX, e.clientY);
        selectionEnd = { x: selectionStart.x, y: selectionStart.y };
    } else if (e.button === 0) {
        // Clear selection on regular click
        clearSelection();
        
        // Confirm pending paste if clicking elsewhere
        if (pendingPaste) {
            confirmPaste();
            return;
        }
        
        // Find if we clicked on an atom
        let found = false;
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i];
            const dist = Math.sqrt((a.x - worldPos.x) ** 2 + (a.y - worldPos.y) ** 2);
            if (dist < a.radius + 5) {
                draggedAtom = a;
                found = true;
                break;
            }
        }
        if (!found) injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    } else if (e.button === 2) {
        removeAtomAt(worldPos.x, worldPos.y);
    }
});

window.addEventListener('mousemove', (e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;

    if (camera.isDragging) {
        camera.x += (e.clientX - camera.lastMouseX) / camera.zoom;
        camera.y += (e.clientY - camera.lastMouseY) / camera.zoom;
        camera.lastMouseX = e.clientX; camera.lastMouseY = e.clientY;
    } else if (isSelecting) {
        selectionEnd = screenToWorld(e.clientX, e.clientY);
    } else if (draggedAtom) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        draggedAtom.x = worldPos.x;
        draggedAtom.y = worldPos.y;
        draggedAtom.vx = 0;
        draggedAtom.vy = 0;
    } else if (pendingPaste) {
        // «Призрак» вставки следует за курсором до клика
        const worldPos = screenToWorld(e.clientX, e.clientY);
        pendingPasteOffset.x = worldPos.x - pendingPaste.centerX;
        pendingPasteOffset.y = worldPos.y - pendingPaste.centerY;
    }
});

window.addEventListener('mouseup', (e) => {
    camera.isDragging = false;
    draggedAtom = null;
    if (isSelecting && e.button === 0) {
        isSelecting = false;
        // Selection complete - could add visual feedback here
    }
});

window.addEventListener('keydown', (e) => {
    // Не перехватываем клавиши, когда фокус в поле ввода (поиск элементов)
    const tag = e.target ? e.target.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.code === 'Space') {
        e.preventDefault();
        const worldPos = screenToWorld(currentMouseX, currentMouseY);
        injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    }

    // e.code не зависит от раскладки: работает и на русской ЙЦУКЕН, и на любой другой
    const isCopy = e.ctrlKey && (e.code === 'KeyC' || e.key === 'c' || e.key === 'с');
    const isPaste = e.ctrlKey && (e.code === 'KeyV' || e.key === 'v' || e.key === 'в');

    if (isCopy) {
        e.preventDefault();
        copySelection();
    }
    if (isPaste) {
        e.preventDefault();
        pasteSelection();
    }
    if (e.code === 'Delete' || e.code === 'Backspace') {
        const selected = getSelectedAtoms();
        if (selected.length > 0) {
            e.preventDefault();
            const selectedSet = new Set(selected);
            bonds = bonds.filter(b => !selectedSet.has(b.a) && !selectedSet.has(b.b));
            atoms = atoms.filter(a => !selectedSet.has(a));
            clearSelection();
            createFeedbackEffect('#ff0000', 5);
        }
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); const f = Math.pow(1.15, -e.deltaY / 120); const b = screenToWorld(e.clientX, e.clientY);
    camera.zoom = Math.min(Math.max(camera.zoom * f, 0.05), 15); const a = screenToWorld(e.clientX, e.clientY);
    camera.x += (a.x - b.x); camera.y += (a.y - b.y);
}, { passive: false });

canvas.addEventListener('contextmenu', e => e.preventDefault());

function tick() {
    atomCountDisplay.textContent = atoms.length; bondCountDisplay.textContent = bonds.length;
    tempValue.textContent = tempSlider.value + ' K';
    updateSimulation(); draw(); requestAnimationFrame(tick);
}
function copySelection() {
    const selected = getSelectedAtoms();
    if (selected.length === 0) return;
    
    const indices = selected.map(a => atoms.indexOf(a));
    clipboardAtoms = {
        atoms: selected.map(a => ({
            type: a.type,
            x: a.x, y: a.y,
            vx: a.vx, vy: a.vy
        })),
        bonds: bonds
            .filter(b => indices.includes(atoms.indexOf(b.a)) && indices.includes(atoms.indexOf(b.b)))
            .map(b => ({
                a: indices.indexOf(atoms.indexOf(b.a)),
                b: indices.indexOf(atoms.indexOf(b.b)),
                count: b.count
            }))
    };
    createFeedbackEffect('#00ff00', 3);
}

function pasteSelection() {
    if (!clipboardAtoms || clipboardAtoms.atoms.length === 0) return;

    // Центр скопированной молекулы — чтобы «призрак» появился под курсором
    let cx = 0, cy = 0;
    clipboardAtoms.atoms.forEach(a => { cx += a.x; cy += a.y; });
    cx /= clipboardAtoms.atoms.length;
    cy /= clipboardAtoms.atoms.length;

    pendingPaste = {
        centerX: cx,
        centerY: cy,
        atoms: clipboardAtoms.atoms.map(aData => {
            const el = PERIODIC_TABLE.find(e => e.symbol === aData.type);
            if (el) {
                const atom = new Atom(el, aData.x, aData.y);
                atom.vx = 0; atom.vy = 0;
                return atom;
            }
            return null;
        }).filter(a => a !== null),
        bonds: clipboardAtoms.bonds
    };

    const mouseWorld = screenToWorld(currentMouseX, currentMouseY);
    pendingPasteOffset = { x: mouseWorld.x - cx, y: mouseWorld.y - cy };

    createFeedbackEffect('#ff00ff', 5);
}

function confirmPaste() {
    if (!pendingPaste) return;
    
    const newIndices = {};
    pendingPaste.atoms.forEach((atom, i) => {
        atom.x += pendingPasteOffset.x;
        atom.y += pendingPasteOffset.y;
        atoms.push(atom);
        newIndices[i] = atoms.length - 1;
    });
    
    pendingPaste.bonds.forEach(bData => {
        if (newIndices[bData.a] !== undefined && newIndices[bData.b] !== undefined) {
            bonds.push(new Bond(atoms[newIndices[bData.a]], atoms[newIndices[bData.b]], bData.count));
        }
    });
    
    pendingPaste = null;
    pendingPasteOffset = { x: 0, y: 0 };
    createFeedbackEffect('#00ff00', 3);
}

// Scene serialization
function serializeScene() {
    return JSON.stringify({
        atoms: atoms.map(a => ({
            type: a.type,
            x: a.x, y: a.y,
            vx: a.vx, vy: a.vy
        })),
        bonds: bonds.map(b => ({
            a: atoms.indexOf(b.a),
            b: atoms.indexOf(b.b),
            count: b.count
        })),
        camera: { x: camera.x, y: camera.y, zoom: camera.zoom }
    });
}

function deserializeScene(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    atoms = []; bonds = []; effects = [];
    
    data.atoms.forEach(aData => {
        const el = PERIODIC_TABLE.find(e => e.symbol === aData.type);
        if (el) {
            const atom = new Atom(el, aData.x, aData.y);
            atom.vx = aData.vx || 0;
            atom.vy = aData.vy || 0;
            atoms.push(atom);
        }
    });
    
    data.bonds.forEach(bData => {
        if (bData.a >= 0 && bData.a < atoms.length && bData.b >= 0 && bData.b < atoms.length) {
            bonds.push(new Bond(atoms[bData.a], atoms[bData.b], bData.count));
        }
    });
    
    if (data.camera) {
        camera.x = data.camera.x || 0;
        camera.y = data.camera.y || 0;
        camera.zoom = data.camera.zoom || 1;
    }
}

function saveScene() {
    const data = serializeScene();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.kv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    createFeedbackEffect('#00f2ff', 5);
}

function loadScene() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.kv,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                deserializeScene(ev.target.result);
                createFeedbackEffect('#00ff00', 5);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function copyScene() {
    const data = serializeScene();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data).then(() => {
            createFeedbackEffect('#ffff00', 5);
        });
    }
}

function pasteScene() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
            deserializeScene(text);
            createFeedbackEffect('#ff00ff', 5);
        });
    }
}

populateGrid(); tick();
injectAtom('H'); injectAtom('H'); injectAtom('O');
