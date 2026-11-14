# Kvant

**Kvant** — браузерний 2D-симулятор молекулярної динаміки з хімічними реакціями. Дозволяє збирати молекули зі 118 елементів періодичної таблиці, задавати температуру, спостерігати за реакціями окиснення, розривами зв'язків при нагріванні, а також копіювати та зберігати сцени.

---

## Зміст

1. [Структура проєкту](#структура-проєкту)
2. [Запуск](#запуск)
3. [Використання](#використання)
4. [Гарячі клавіші](#гарячі-клавіші)
5. [Формат файлу .kv](#формат-файлу-kv)
6. [Детальний опис коду](#детальний-опис-коду)
7. [Фізика та хімія](#фізика-та-хімія)
8. [Технічні деталі](#технічні-деталі)

---

## Структура проєкту

```
chim_sim/
├── index.html      # Головна сторінка, структура інтерфейсу
├── style.css       # Усі стилі, анімації, оформлення
├── script.js       # Логіка симуляції, фізика, рендеринг, керування
├── elements.js     # Дані періодичної таблиці (118 елементів)
├── icon.jpg        # Іконка вкладки (фавіконка)
└── README.md       # Цей файл
```

---

## Запуск

1. Відкрийте `index.html` у будь-якому сучасному браузері (Chrome, Firefox, Edge, Safari).
2. Жодних залежностей чи серверів не потрібно — усе працює локально.
3. Під час першого відкриття на екрані з'явиться молекула води (H₂O).

---

## Використання

### Основний цикл

1. **Виберіть елемент** — клікніть по елементу в панелі ліворуч або використовуйте швидкі кнопки H/O/C/N.
2. **Додайте атом** — клікніть ЛКМ по пустому місцю або натисніть пробіл.
3. **З'єднайте атоми** — піднесіть атоми один до одного, вони автоматично утворять зв'язок (якщо є вільні валентності).
4. **Керуйте температурою** — рухайте повзунок Temperature (K).
5. **Спостерігайте за реакціями** — за температури вище 450 K починаються реакції окиснення.

### Панель керування

| Елемент | Опис |
|---------|----------|
| **Temperature (K)** | Повзунок температури від 0 до 1000 Кельвінів |
| **Atoms / Bonds** | Лічильники атомів і зв'язків на екрані |
| **Select Element** | Список усіх 118 елементів з пошуком |
| **H O C N** | Швидкі кнопки для найпоширеніших елементів |
| **Instructions** | Блок з підказками, що згортається |
| **Reset simulation** | Повне скидання сцени |
| **Save / Load** | Збереження/завантаження сцени у файл `.kv` |
| **Copy / Paste** | Копіювання/вставка всієї сцени в буфер обміну |
| **☰ / ✕** | Згортання всієї панелі керування |

---

## Гарячі клавіші

| Клавіша | Дія |
|---------|----------|
| **ЛКМ** | Додати атом / Перетягнути наявний атом |
| **Пробіл** | Додати атом у позиції курсора |
| **ПКМ** | Видалити атом |
| **Shift + ЛКМ** | Перетягування камери (панорамування) |
| **Середня кнопка миші** | Перетягування камери (панорамування) |
| **Коліщатко миші** | Масштабування (zoom) |
| **Ctrl + ЛКМ** | Виділення прямокутної області |
| **Ctrl + C** | Копіювати виділені атоми |
| **Ctrl + V** | Вставити скопійовану молекулу |
| **Delete / Backspace** | Видалити виділені атоми |

---

## Формат файлу `.kv`

Файл `.kv` — це JSON-файл, що містить повний опис сцени:

```json
{
  "atoms": [
    {
      "type": "H",        // Символ елемента
      "x": 100.5,        // Координата X у світових координатах
      "y": -50.2,        // Координата Y
      "vx": 0.5,         // Швидкість за X
      "vy": -0.3         // Швидкість за Y
    }
  ],
  "bonds": [
    {
      "a": 0,            // Індекс першого атома в масиві atoms
      "b": 1,            // Індекс другого атома
      "count": 1         // Кратність зв'язку (1, 2 або 3)
    }
  ],
  "camera": {
    "x": 0,             // Зсув камери за X
    "y": 0,             // Зсув камери за Y
    "zoom": 1           // Масштаб камери
  }
}
```

---

## Детальний опис коду

### `index.html` — Структура сторінки

```html
<!DOCTYPE html>
<html lang="uk">
```
Оголошення типу документа та мови сторінки (українська).

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Кодування UTF-8 та адаптивність для мобільних пристроїв.

```html
<title>Kvant</title>
```
Заголовок вкладки браузера.

```html
<link rel="icon" type="image/jpeg" href="icon.jpg">
```
Підключення фавіконки з файлу `icon.jpg`.

```html
<link rel="stylesheet" href="style.css">
```
Підключення зовнішньої таблиці стилів.

```html
<button id="toggle-menu" onclick="toggleMenu()">☰</button>
```
Кнопка-гамбургер для згортання панелі. Викликає функцію `toggleMenu()` під час кліку.

```html
<div id="ui-container">
```
Контейнер усієї панелі керування. Має абсолютне позиціонування та повну висоту екрана.

```html
<div class="header">
    <h1>Kvant</h1>
    <button class="minimize-btn" onclick="toggleMenu()" title="Minimize panel">✕</button>
</div>
```
Заголовок панелі з кнопкою закриття.

```html
<input type="range" id="temp-slider" min="0" max="1000" value="293">
```
Повзунок температури: від 0 до 1000 Кельвінів, початкове значення 293 K (кімнатна температура).

```html
<span id="temp-value">293 K</span>
```
Відображення поточного значення температури.

```html
<button onclick="setSelectedElement('H')">H</button>
```
Швидкі кнопки вибору елементів. Викликають `setSelectedElement()` із символом елемента.

```html
<input type="text" id="element-search" placeholder="Search..." oninput="filterElements()">
```
Поле пошуку елементів. При кожному вводі символу викликає `filterElements()`.

```html
<div id="elements-grid" class="sidebar-grid"></div>
```
Контейнер для сітки кнопок елементів (заповнюється динамічно через JavaScript).

```html
<div class="instructions-header" onclick="toggleInstructions()">
```
Кликабельний заголовок блоку інструкцій. Згортає/розгортає вміст.

```html
<canvas id="simCanvas"></canvas>
```
Canvas-елемент, на якому відбувається весь рендеринг симуляції.

```html
<script src="elements.js"></script>
<script src="script.js"></script>
```
Підключення JavaScript-файлів. `elements.js` завантажується першим, оскільки `script.js` використовує `PERIODIC_TABLE`.

---

### `style.css` — Оформлення

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@300;500&display=swap');
```
Підключення шрифтів Google Fonts:
- **Orbitron** — футуристичний шрифт для заголовка та символів атомів.
- **Roboto Mono** — моноширинний шрифт для інтерфейсу.

```css
:root {
    --bg-color: #05050a;          /* Темний фон (майже чорний з синім відтінком) */
    --panel-bg: rgba(10, 10, 20, 0.8);  /* Фон панелі з прозорістю */
    --accent-color: #00f2ff;      /* Неоновий ціановий акцент */
    --text-color: #e0e0ff;        /* Світлий текст з фіолетовим відтінком */
    --border-color: rgba(0, 242, 255, 0.3); /* Напівпрозрачні межі */
}
```
CSS-змінні для колірної схеми. Використовуються у всіх стилях.

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```
Скидання стандартних відступів. `box-sizing: border-box` гарантує, що padding та border включаються в ширину/висоту елемента.

```css
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Roboto Mono', monospace;
    overflow: hidden;          /* Заборона прокручування сторінки */
    height: 100vh;             /* Висота = 100% висоти вікна */
    width: 100vw;              /* Ширина = 100% ширини вікна */
}
```
Стилі body: темний фон, моноширинний шрифт, заборона прокрутки.

```css
#simCanvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;                /* Canvas під панеллю керування */
}
```
Canvas позиціюється абсолютно в лівому верхньому кутку.

```css
#ui-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;               /* Панель поверх canvas */
    background: var(--panel-bg);
    padding: 20px;
    border-right: 1px solid var(--border-color);
    width: 300px;              /* Фіксована ширина панелі */
    height: 100vh;
    backdrop-filter: blur(10px);    /* Ефект розмиття фону */
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.5);  /* Тінь праворуч */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* Плавна анімація */
    display: flex;
    flex-direction: column;    /* Вертикальне компонування */
}
```
Панель керування: фіксована ширина 300px, ефект розмиття, тінь, плавна анімація згортання.

```css
#ui-container.minimized {
    transform: translateX(-100%);  /* Зсув панелі ліворуч за екран */
}
```
Клас `.minimized` приховує панель (зсув на 100% ліворуч).

```css
#toggle-menu {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 5;                /* Під панеллю, але над canvas */
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1.2rem;
    background: rgba(10, 10, 20, 0.6);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    backdrop-filter: blur(5px);
    transition: all 0.2s;
}
```
Кнопка-гамбургер: компактна, напівпрозора, із заокругленими кутами.

```css
.element-btn {
    padding: 8px;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}
```
Кнопки елементів: висота 60px, вертикальне компонування (символ зверху, назва знизу).

```css
.element-btn:hover {
    background: rgba(0, 242, 255, 0.1);
    border-color: var(--border-color);
}
```
При наведенні кнопка підсвічується ціановим кольором.

```css
.element-btn.selected {
    background: var(--accent-color);
    color: #000;
}
```
Вибраний елемент заповнюється ціановим, текст стає чорним.

```css
.reset-btn {
    border-color: #ff3e3e;
    color: #ff3e3e;
    background: rgba(255, 62, 62, 0.1);
}
```
Кнопка скидання червона (небезпечна дія).

```css
.scene-controls {
    display: flex;
    gap: 5px;
    margin-top: 10px;
    flex-shrink: 0;
}
```
Контейнер кнопок керування сценами: flex-сітка з відступами.

---

### `script.js` — Логіка симуляції

#### Глобальні змінні та константи

```javascript
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
```
Отримання посилання на canvas та його 2D-контекст для малювання.

```javascript
let atoms = [];
let bonds = [];
let effects = [];
```
- `atoms` — масив усіх атомів на екрані.
- `bonds` — масив усіх зв'язків між атомами.
- `effects` — масив візуальних ефектів (іскри, спалахи).

```javascript
const camera = { x: 0, y: 0, zoom: 1, isDragging: false, lastMouseX: 0, lastMouseY: 0 };
```
Об'єкт камери: зсув (x, y), масштаб (zoom), прапорець перетягування та останні координати миші.

```javascript
let selectionStart = null;
let selectionEnd = null;
let isSelecting = false;
```
Змінні для виділення області: початкова й кінцева точки, прапорець виділення.

```javascript
let clipboardAtoms = null;
let pendingPaste = null;
let pendingPasteOffset = { x: 0, y: 0 };
```
- `clipboardAtoms` — скопійована молекула (буфер обміну).
- `pendingPaste` — молекула, що очікує розміщення (напівпрозора).
- `pendingPasteOffset` — зсув під час переміщення.

```javascript
const BOND_DISTANCE_FACTOR = 1.1;      // Відстань зв'язку = (r1 + r2) * 1.1
const BONDING_RADIUS_MUL = 1.3;         // Радіус утворення зв'язку = (r1 + r2) * 1.3
const SPRING_CONSTANT = 0.1;            // Жорсткість "пружини" зв'язку
const DAMPING = 0.98;                   // Згасання швидкості (тертя)
const COLLISION_DAMPING = 0.5;          // Пружність зіткнень (0 = непружне, 1 = абсолютно пружне)
const INTERMOLECULAR_STRENGTH = 0.005;  // Сила міжмолекулярної взаємодії
```
Фізичні константи, що визначають поведінку атомів.

#### Клас Atom

```javascript
class Atom {
    constructor(elementData, x, y) {
        this.type = elementData.symbol;     // Символ елемента (H, O, C, ...)
        this.mass = elementData.mass;       // Атомна маса
        this.radius = calculateRadius(this.mass);  // Радіус атома
        this.valence = elementData.valence;       // Валентність (1, 2, 3, 4, ...)
        this.en = elementData.en || 0;             // Електронегативність за Полінгом
        this.color = elementData.cpk;              // CPK-колір елемента
        this.x = x; this.y = y;                    // Координати у світових координатах
        this.vx = (Math.random() - 0.5) * 2;      // Початкова швидкість за X (випадкова)
        this.vy = (Math.random() - 0.5) * 2;      // Початкова швидкість за Y
```
Конструктор атома: зберігає властивості елемента, задає випадкову початкову швидкість (тепловий рух).

```javascript
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        this.textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';
```
Вибір кольору тексту: якщо колір атома світлий (яскравість > 186), текст чорний, інакше білий. Формула яскравості — стандартна для RGB.

```javascript
    getOccupiedValence() {
        return bonds.reduce((total, b) => (b.a === this || b.b === this) ? total + b.count : total, 0);
    }
}
```
Підрахунок зайнятих валентностей: підсумовує кратності всіх зв'язків атома.

```javascript
    update() {
        const kelvin = parseFloat(tempSlider.value);
        const tempFactor = kelvin / 300;
```
Температурний фактор: відношення поточної температури до 300 K (кімнатної).

```javascript
        // Brownian
        const brownian = tempFactor * 0.4;
        this.vx += (Math.random() - 0.5) * brownian;
        this.vy += (Math.random() - 0.5) * brownian;
```
Броунівський рух: випадкові імпульси, пропорційні температурі.

```javascript
        // Speed limit
        const limit = 2 + tempFactor * 20;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > limit) { this.vx *= 0.9; this.vy *= 0.9; }
```
Обмеження максимальної швидкості: якщо атом занадто швидкий, швидкість зменшується на 10%.

```javascript
        this.x += this.vx; this.y += this.vy;
    }
}
```
Інтегрування: оновлення координат за швидкістю (метод Ейлера).

```javascript
    draw() {
        const dx = (this.x + camera.x) * camera.zoom + width / 2;
        const dy = (this.y + camera.y) * camera.zoom + height / 2;
        const dr = this.radius * camera.zoom;
```
Перетворення світових координат на екранні:
- Додаємо зсув камери.
- Множимо на масштаб.
- Додаємо половину ширини/висоти (центр екрана).

```javascript
        if (dx + dr < 0 || dx - dr > width || dy + dr < 0 || dy - dr > height) return;
```
Відсікання невидимих атомів: якщо атом повністю за межами екрана, не малюємо його.

```javascript
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10 * camera.zoom;      // Світіння пропорційне масштабу
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
```
Малювання атома: коло з кольором елемента та свіченням.

```javascript
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = Math.max(0.5, 1 * camera.zoom);
        ctx.stroke();
```
Біла напівпрозрачна обведення навколо атома.

```javascript
        if (camera.zoom > 0.4) {
            ctx.fillStyle = this.textColor;
            ctx.font = `bold ${Math.max(6, dr * 0.8)}px Orbitron`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.type, dx, dy);
        }
```
Символ елемента малюється лише за достатнього масштабу (> 0.4), щоб не засмічувати екран.

#### Клас Bond

```javascript
class Bond {
    constructor(a, b, count = 1) {
        this.a = a; this.b = b;
        this.count = count;                    // Кратність: 1, 2 або 3
        this.targetDist = (a.radius + b.radius) * BOND_DISTANCE_FACTOR;
    }
```
Конструктор зв'язку: два атоми, кратність, цільова відстань.

```javascript
    update() {
        const dx = this.b.x - this.a.x;
        const dy = this.b.y - this.a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
```
Вектор між атомами та відстань (із захистом від ділення на нуль).

```javascript
        const force = (d - this.targetDist) * SPRING_CONSTANT * (1 + (this.count - 1) * 0.5);
```
Сила "пружини": пропорційна відхиленню від цільової відстані. Кратні зв'язки жорсткіші (множник 0.5 за кожен додатковий зв'язок).

```javascript
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        this.a.vx += fx / this.a.mass; this.a.vy += fy / this.a.mass;
        this.b.vx -= fx / this.b.mass; this.b.vy -= fy / this.b.mass;
```
Застосування сили до обох атомів (третій закон Ньютона). Прискорення = сила / маса.

```javascript
    draw() {
        const x1 = (this.a.x + camera.x) * camera.zoom + width / 2;
        const y1 = (this.a.y + camera.y) * camera.zoom + height / 2;
        const x2 = (this.b.x + camera.x) * camera.zoom + width / 2;
        const y2 = (this.b.y + camera.y) * camera.zoom + height / 2;
```
Перетворення координат обох атомів на екранні.

```javascript
        const dx = x2 - x1; const dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) return;                     // Не малювати занадто короткі зв'язки
        const nx = -dy / d; const ny = dx / d; // Нормаль до зв'язку
        const sp = 4 * camera.zoom;           // Відстань між лініями кратних зв'язків
```
Обчислення нормалі для малювання кратних зв'язків (зсув паралельних ліній).

```javascript
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
        ctx.lineWidth = Math.max(1, 4 * camera.zoom);
        const dl = (o) => { ctx.beginPath(); ctx.moveTo(x1 + nx * o, y1 + ny * o); ctx.lineTo(x2 + nx * o, y2 + ny * o); ctx.stroke(); };
        if (this.count === 1) dl(0);
        else if (this.count === 2) { dl(-sp); dl(sp); }
        else if (this.count === 3) { dl(-sp * 1.5); dl(0); dl(sp * 1.5); }
    }
}
```
Малювання зв'язку:
- Одинарний — одна лінія по центру.
- Подвійний — дві паралельні лінії (±sp).
- Потрійний — три лінії (±sp*1.5 та 0).

#### Просторова сітка (оптимізація)

```javascript
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
```
Просторове хешування: атоми розподіляються по комірках сітки 100×100. Це дозволяє перевіряти лише сусідні атоми, а не всі пари (O(n) замість O(n²)).

```javascript
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
```
Отримання індексів атомів із 9 сусідніх комірок (3×3 навколо поточної).

#### Фізика

```javascript
function solvePhysics() {
    buildSpatialGrid();
    const checked = new Set();
```
Перезбирання сітки та створення множини для відстеження вже перевірених пар.

```javascript
    for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        const neighbors = getNeighborIndices(a);
        
        for (const j of neighbors) {
            if (j <= i) continue;                    // Кожна пара перевіряється один раз
            const pairKey = `${i},${j}`;
            if (checked.has(pairKey)) continue;
            checked.add(pairKey);
```
Цикл по всіх атомах та їхніх сусідах. Перевірка `j <= i` запобігає подвійній обробці пар.

```javascript
            const b = atoms[j];
            const dx = b.x - a.x; const dy = b.y - a.y;
            const ds = dx * dx + dy * dy;           // Квадрат відстані (без sqrt для продуктивності)
            const md = a.radius + b.radius;         // Мінімальна відстань (дотик)
```
Обчислення вектора та квадрата відстані між атомами.

```javascript
            if (ds < (md * BONDING_RADIUS_MUL) ** 2) tryCreateBond(a, b);
```
Якщо атоми достатньо близько (у межах радіуса утворення зв'язку), намагаємося створити зв'язок.

```javascript
            if (ds < md * md) {                     // Зіткнення (атоми перекриваються)
                const d = Math.sqrt(ds) || 0.1;
                const ov = md - d;                  // Величину перекриття
                const nx = dx / d; const ny = dy / d; // Нормаль зіткнення
                a.x -= nx * ov * 0.5; a.y -= ny * ov * 0.5;  // Розсуваємо атоми
                b.x += nx * ov * 0.5; b.y += ny * ov * 0.5;
```
Вирішення зіткнень: атоми розсуваються на половину величини перекриття вздовж нормалі.

```javascript
                const rvx = b.vx - a.vx; const rvy = b.vy - a.vy;  // Відносна швидкість
                const vn = rvx * nx + rvy * ny;                        // Проекція швидкості на нормаль
                if (vn < 0) {                                          // Атоми рухаються назустріч один одному
                    const im = -(1 + COLLISION_DAMPING) * vn / (1 / a.mass + 1 / b.mass);
                    a.vx -= (im * nx) / a.mass; a.vy -= (im * ny) / a.mass;
                    b.vx += (im * nx) / b.mass; b.vy += (im * ny) / b.mass;
                }
            }
```
Імпульс зіткнення: пружний удар з урахуванням мас та коефіцієнта відновлення `COLLISION_DAMPING`.

#### Хімія

```javascript
function tryCreateBond(a, b) {
    if (a.valence === 0 || b.valence === 0) return;  // Інертні гази не утворюють зв'язки
```
Перевірка валентності: якщо в атома валентність 0 (He, Ne, Ar, ...), зв'язок не утворюється.

```javascript
    const existing = bonds.find(bo => (bo.a === a && bo.b === b) || (bo.a === b && bo.b === a));
```
Пошук наявного зв'язку між цими атомами.

```javascript
    if (existing) {
        if (existing.count < 3 && a.getOccupiedValence() < a.valence && b.getOccupiedValence() < b.valence) {
            existing.count++;                    // Збільшення кратності зв'язку
            createEffect(a.x, a.y, '#00f2ff', 2);
        }
```
Якщо зв'язок уже існує і кратність < 3, збільшуємо кратність (одинарний → подвійний → потрійний).

```javascript
    } else {
        const aFree = a.valence - a.getOccupiedValence();
        const bFree = b.valence - b.getOccupiedValence();

        if (aFree > 0 && bFree > 0) {
            bonds.push(new Bond(a, b));          // Створення нового зв'язку
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
```
Якщо обидва атоми мають вільні валентності — створюємо зв'язок. Інакше, за температури > 450 K, намагаємося провести реакцію окиснення.

```javascript
function attemptReaction(attacker, target) {
    const targetBonds = bonds.filter(b => b.a === target || b.b === target);
    for (let bondToBreak of targetBonds) {
        const victim = bondToBreak.a === target ? bondToBreak.b : bondToBreak.a;
        if (victim === attacker) continue;
```
Пошук зв'язку, який можна розірвати. "Жертва" — атом, пов'язаний із ціллю, але не атакуючий.

```javascript
        // Oxidation Logic: More electronegative atom kicks out the less EN one
        const enDifference = attacker.en - victim.en;
        if (enDifference > 0.7) {
```
Перевірка електронегативності: атакуючий має бути значно більш електронегативним (різниця > 0.7).

```javascript
            bonds = bonds.filter(b => b !== bondToBreak);       // Розрив старого зв'язку
            let newCount = (attacker.type === 'O' && target.type === 'C' && 
                           attacker.valence >= 2 && 
                           target.valence - (target.getOccupiedValence()) >= 2) ? 2 : 1;
            bonds.push(new Bond(attacker, target, newCount));   // Створення нового зв'язку
```
Розрив старого зв'язку та створення нового. Особливий випадок: кисень-вуглець утворюють подвійний зв'язок (C=O).

```javascript
            createEffect(target.x, target.y, '#ff4d00', 15);  // Ефект виділення тепла
            const kick = 5 + enDifference * 5;
            victim.vx += (Math.random() - 0.5) * kick;        // Відштовхування жертви
            victim.vy += (Math.random() - 0.5) * kick;
            attacker.vx += (Math.random() - 0.5) * 2;          // Невеликий імпульс атакуючому
            target.vx += (Math.random() - 0.5) * 2;            // І цілі
            return;
        }
    }
}
```
Візуальний ефект (помаранчеві іскри) та імпульси відштовхування для учасників реакції.

#### Оновлення симуляції

```javascript
function updateSimulation() {
    const kelvin = parseFloat(tempSlider.value);

    // Effects update
    effects = effects.filter(e => {
        e.x += e.vx; e.y += e.vy; e.life -= 0.05;
        return e.life > 0;
    });
```
Оновлення ефектів: рух, згасання життя, видалення мертвих.

```javascript
    for (let s = 0; s < 6; s++) {              // 6 підкроків фізики для стабільності
        // Bond thermal stress
        for (let i = bonds.length - 1; i >= 0; i--) {
            bonds[i].update();
            const stress = (kelvin / 2000) * (0.005 / (bonds[i].count ** 2));
            if (kelvin > 400 && Math.random() < stress) {
                createEffect((bonds[i].a.x + bonds[i].b.x) / 2, 
                            (bonds[i].a.y + bonds[i].b.y) / 2, '#ff0', 5);
                bonds.splice(i, 1);             // Термічний розрив зв'язку
            }
        }
```
Термічний розрив зв'язків: за температури > 400 K зв'язки можуть випадково розірватися. Ймовірність пропорційна температурі й обернено пропорційна квадрату кратності (потрійні зв'язки міцніші).

```javascript
        solvePhysics();
        atoms.forEach(a => { a.update(); a.vx *= DAMPING; a.vy *= DAMPING; });
    }
}
```
Головний цикл: фізика зіткнень, оновлення атомів, застосування згасання.

#### Рендеринг

```javascript
function draw() {
    ctx.clearRect(0, 0, width, height);
```
Очищення canvas.

```javascript
    // Grid
    const gz = 100 * camera.zoom;
    const ox = (camera.x * camera.zoom + width / 2) % gz;
    const oy = (camera.y * camera.zoom + height / 2) % gz;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    for (let x = ox; x < width; x += gz) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = oy; y < height; y += gz) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
```
Відображення фонової сітки: лінії через кожні 100 світових одиниць (з урахуванням камери та масштабу).

```javascript
    bonds.forEach(b => b.draw());
```
Відображення всіх зв'язків.

```javascript
    const hasSelection = selectionStart && selectionEnd && 
                        (selectionStart.x !== selectionEnd.x || selectionStart.y !== selectionEnd.y);
    const selected = hasSelection ? getSelectedAtoms() : [];
    const pendingIndices = pendingPaste ? pendingPaste.atoms.map(a => atoms.indexOf(a)) : [];
```
Визначення виділених атомів та атомів, що очікують вставки.

```javascript
    atoms.forEach(a => {
        const isPending = pendingIndices.includes(atoms.indexOf(a));
        if (isPending) {
            ctx.globalAlpha = 0.5;           // Напівпрозорі атоми під час вставки
            a.draw();
            ctx.globalAlpha = 1.0;
        } else {
            a.draw();
        }
        if (selected.includes(a)) {
            // Зелений пунктирний контур навколо виділених атомів
        }
    });
```
Відображення атомів з підсвічуванням виділення.

```javascript
    // Pending paste ghost
    if (pendingPaste) {
        ctx.globalAlpha = 0.4;               // Напівпрозорий "привид" вставки
        // ...
    }
```
Відображення напівпрозорої копії молекули, що вставляється.

```javascript
    // Selection rectangle (always visible when selection exists)
    if (selectionStart && selectionEnd && ...) {
        // Напівпрозорий прямокутник виділення
    }
```
Відображення прямокутника виділення.

```javascript
    // Effects
    effects.forEach(e => {
        // Малювання іскор із затуханням прозорості
    });
    ctx.globalAlpha = 1.0;
}
```
Відображення візуальних ефектів.

#### Керування камерою

```javascript
function screenToWorld(x, y) {
    return { x: (x - width / 2) / camera.zoom - camera.x, y: (y - height / 2) / camera.zoom - camera.y };
}
```
Перетворення екранних координат на світові (обернене до рендерингу).

#### Керування мишею

```javascript
canvas.addEventListener('mousedown', (e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
```
Перетворення координат миші на світові координати.

```javascript
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        camera.isDragging = true;
        camera.lastMouseX = e.clientX; camera.lastMouseY = e.clientY;
    }
```
Середня кнопка миші або Shift+ЛКМ починають панорамування.

```javascript
    } else if (e.button === 0 && e.ctrlKey) {
        isSelecting = true;
        selectionStart = { x: e.clientX, y: e.clientY };
        selectionEnd = { x: e.clientX, y: e.clientY };
    }
```
Ctrl+ЛКМ починає виділення області.

```javascript
    } else if (e.button === 0) {
        clearSelection();                    // Скидання виділення
        if (pendingPaste) confirmPaste();   // Підтвердження вставки
        
        // Пошук атома під курсором
        let found = false;
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i];
            const dist = Math.sqrt((a.x - worldPos.x) ** 2 + (a.y - worldPos.y) ** 2);
            if (dist < a.radius + 5) {        // Радіус + 5 пікселів запасу
                draggedAtom = a;
                found = true;
                break;
            }
        }
        if (!found) injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    }
```
Звичайний ЛКМ: скидання виділення, підтвердження вставки, пошук атома під курсором або створення нового.

```javascript
    } else if (e.button === 2) {
        removeAtomAt(worldPos.x, worldPos.y);
    }
});
```
ПКМ: видалення атома під курсором.

```javascript
window.addEventListener('mousemove', (e) => {
    if (camera.isDragging) {
        camera.x += (e.clientX - camera.lastMouseX) / camera.zoom;
        camera.y += (e.clientY - camera.lastMouseY) / camera.zoom;
        camera.lastMouseX = e.clientX; camera.lastMouseY = e.clientY;
    } else if (isSelecting) {
        selectionEnd = { x: e.clientX, y: e.clientY };
    } else if (draggedAtom) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        draggedAtom.x = worldPos.x;
        draggedAtom.y = worldPos.y;
        draggedAtom.vx = 0;
        draggedAtom.vy = 0;
    }
});
```
Оновлення під час руху миші: панорамування камери, оновлення виділення, перетягування атома.

```javascript
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = Math.pow(1.15, -e.deltaY / 120);           // Множник масштабу
    const b = screenToWorld(e.clientX, e.clientY);       // Точка під курсором (до зуму)
    camera.zoom = Math.min(Math.max(camera.zoom * f, 0.05), 15);  // Обмеження масштабу
    const a = screenToWorld(e.clientX, e.clientY);       // Точка під курсором (після зуму)
    camera.x += (a.x - b.x);                              // Корекція камери
    camera.y += (a.y - b.y);
}, { passive: false });
```
Масштабування з прив'язкою до курсора: точка під курсором залишається на місці.

#### Клавіатура

```javascript
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        const worldPos = screenToWorld(currentMouseX, currentMouseY);
        injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    }
```
Пробіл: додати атом у позиції курсора.

```javascript
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        copySelection();
    }
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteSelection();
    }
```
Ctrl+C: копіювати виділення. Ctrl+V: вставити.

```javascript
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const selected = getSelectedAtoms();
        if (selected.length > 0) {
            e.preventDefault();
            const selectedSet = new Set(selected);
            bonds = bonds.filter(b => !selectedSet.has(b.a) && !selectedSet.has(b.b));
            atoms = atoms.filter(a => !selectedSet.has(a));
            clearSelection();
            createEffect(0, 0, '#ff0000', 3);
        }
    }
});
```
Delete/Backspace: видалення всіх виділених атомів та їхніх зв'язків.

#### Виділення

```javascript
function clearSelection() {
    selectionStart = null;
    selectionEnd = null;
    isSelecting = false;
}
```
Скидання всіх змінних виділення.

```javascript
function getSelectedAtoms() {
    if (!selectionStart || !selectionEnd) return [];
    const x1 = Math.min(selectionStart.x, selectionEnd.x);
    const y1 = Math.min(selectionStart.y, selectionEnd.y);
    const x2 = Math.max(selectionStart.x, selectionEnd.x);
    const y2 = Math.max(selectionStart.y, selectionEnd.y);
    
    return atoms.filter(a => {
        const dx = (a.x + camera.x) * camera.zoom + width / 2;
        const dy = (a.y + camera.y) * camera.zoom + height / 2;
        return dx >= x1 && dx <= x2 && dy >= y1 && dy <= y2;
    });
}
```
Отримання всіх атомів усередині прямокутника виділення: перетворюємо координати атомів на екранні та перевіряємо потрапляння до прямокутника.

#### Копіювання та вставка

```javascript
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
    createEffect(0, 0, '#00ff00', 3);
}
```
Копіювання: зберігаємо атоми та зв'язки (з переіндексацією) у `clipboardAtoms`.

```javascript
function pasteSelection() {
    if (!clipboardAtoms) return;
    
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    
    pendingPaste = {
        atoms: clipboardAtoms.atoms.map(aData => {
            const el = PERIODIC_TABLE.find(e => e.symbol === aData.type);
            if (el) {
                const atom = new Atom(el, aData.x + offsetX, aData.y + offsetY);
                atom.vx = 0; atom.vy = 0;
                return atom;
            }
            return null;
        }).filter(a => a !== null),
        bonds: clipboardAtoms.bonds
    };
    pendingPasteOffset = { x: 0, y: 0 };
    
    createEffect(0, 0, '#ff00ff', 3);
}
```
Вставка: створюємо "очікувану" копію з невеликим випадковим зсувом. Атоми поки не в основному масиві.

```javascript
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
    createEffect(0, 0, '#00ff00', 3);
}
```
Підтвердження вставки: атоми додаються до основного масиву, зв'язки створюються з новими індексами.

#### Серіалізація сцени

```javascript
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
```
Перетворення сцени на JSON: атоми з координатами та швидкостями, зв'язки з індексами, стан камери.

```javascript
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
```
Відновлення сцени з JSON: створюємо атоми, зв'язки, відновлюємо камеру.

```javascript
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
    createEffect(0, 0, '#00f2ff', 5);
}
```
Збереження сцени: створюємо Blob (бінарні дані), тимчасове посилання, кнопку завантаження та клікаємо по ній.

```javascript
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
                createEffect(0, 0, '#00ff00', 5);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}
```
Завантаження сцени: створюємо невидимий input типу file, під час вибору файлу читаємо його та відновлюємо сцену.

```javascript
function copyScene() {
    const data = serializeScene();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data).then(() => {
            createEffect(0, 0, '#ffff00', 5);
        });
    }
}

function pasteScene() {
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then((text) => {
            deserializeScene(text);
            createEffect(0, 0, '#ff00ff', 5);
        });
    }
}
```
Копіювання/вставка всієї сцени через буфер обміну (Clipboard API).

#### UI функції

```javascript
function toggleMenu() { uiContainer.classList.toggle('minimized'); }
```
Перемикання видимості панелі.

```javascript
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
```
Згортання/розгортання блоку інструкцій через CSS-клас.

```javascript
function setSelectedElement(s) {
    selectedElementSymbol = s;
    if (selectedLabel) selectedLabel.textContent = s;
    populateGrid();
}
```
Вибір елемента: збереження символу, оновлення тексту, перемальовування сітки з підсвічуванням.

```javascript
function populateGrid() {
    const f = searchInput.value.toLowerCase();
    elementsGrid.innerHTML = '';
    PERIODIC_TABLE.forEach(el => {
        if (el.symbol.toLowerCase().includes(f) || el.name.toLowerCase().includes(f)) {
            const btn = document.createElement('div');
            btn.className = `element-btn ${el.symbol === selectedElementSymbol ? 'selected' : ''}`;
            btn.innerHTML = `<span class="symbol">${el.symbol}</span><span class="name">${el.name}</span>`;
            btn.style.borderLeft = `3px solid ${el.cpk}`;
            btn.onclick = () => setSelectedElement(el.symbol);
            elementsGrid.appendChild(btn);
        }
    });
}
```
Заповнення сітки елементів: фільтрация за пошуковим запитом, створення кнопок із символом, назвою та кольоровою смужкою.

```javascript
function injectAtom(symbol, x, y) {
    const data = PERIODIC_TABLE.find(e => e.symbol === symbol);
    if (!data) return;
    if (x === undefined) {
        const w = screenToWorld(width / 2, height / 2);
        x = w.x + (Math.random() - 0.5) * 20;
        y = w.y + (Math.random() - 0.5) * 20;
    }
    atoms.push(new Atom(data, x, y));
}
```
Додавання атома: знаходимо дані елемента, якщо координати не вказані — створюємо поблизу центру екрана.

```javascript
function removeAtomAt(x, y) {
    for (let i = atoms.length - 1; i >= 0; i--) {
        const d2 = (atoms[i].x - x) ** 2 + (atoms[i].y - y) ** 2;
        if (d2 < (atoms[i].radius + 10) ** 2) {
            bonds = bonds.filter(b => b.a !== atoms[i] && b.b !== atoms[i]);
            atoms.splice(i, 1);
            return;
        }
    }
}
```
Видалення атома: шукаємо атом у радіусі (radius + 10) і видаляємо його разом з усіма зв'язками.

```javascript
function resetSim() {
    atoms = []; bonds = []; effects = [];
    camera.x = 0; camera.y = 0; camera.zoom = 1;
}
```
Повне скидання: очищення всіх масивів і скидання камери.

#### Головний цикл

```javascript
function tick() {
    atomCountDisplay.textContent = atoms.length;
    bondCountDisplay.textContent = bonds.length;
    tempValue.textContent = tempSlider.value + ' K';
    updateSimulation(); draw(); requestAnimationFrame(tick);
}
```
Головний цикл анімації: оновлення лічильників, фізики, рендерингу та запит наступного кадру.

```javascript
populateGrid(); tick();
injectAtom('H'); injectAtom('H'); injectAtom('O');
```
Ініціалізація: заповнення сітки елементів, запуск циклу, створення початкової молекули води (H₂O).

---

### `elements.js` — Періодична таблиця

```javascript
const PERIODIC_TABLE = [
    { "name": "Hydrogen", "symbol": "H", "mass": 1.008, "cpk": "#ffffff", "valence": 1, "en": 2.20 },
    // ... 118 елементів
];
```
Масив об'єктів із даними елементів:
- `name` — англійська назва.
- `symbol` — хімічний символ.
- `mass` — атомна маса (а.о.м.).
- `cpk` — CPK-колір (стандартна колірна схема молекулярних моделей).
- `valence` — типова валентність.
- `en` — електронегативність за шкалою Полінга.

---

## Фізика та хімія

### Броуновський рух

Атоми отримують випадкові імпульси, пропорційні температурі:
```
brownian = (T / 300) * 0.4
v += (random() - 0.5) * brownian
```

### Обмеження швидкості

Максимальна швидкість атома залежить від температури:
```
limit = 2 + (T / 300) * 20
```
У разі перевищення швидкість зменшується на 10%.

### Згасання

Кожного кадру швидкість множиться на 0.98 (коефіцієнт тертя):
```
v *= 0.98
```

### Зв'язки як пружини

Зв'язки моделюються як пружини з жорсткістю 0.1:
```
force = (distance - targetDistance) * 0.1 * (1 + (count - 1) * 0.5)
```
Кратні зв'язки жорсткіші: подвійні в 1.5 раза, потрійні в 2 рази.

### Зіткнення

Атоми відштовхуються при перекритті з коефіцієнтом пружності 0.5 (частково пружні).

### Утворення зв'язків

Зв'язок утворюється, якщо:
1. Відстань між атомами < (r₁ + r₂) × 1.3
2. Обидва атоми мають вільні валентності
3. Валентність обох атомів > 0

### Реакції окиснення

За температури > 450 K, якщо атом не може утворити новий зв'язок (немає вільних валентностей), він може "атакувати" наявний зв'язок:
- Електронегативність атакуючого має бути на 0.7 вищою, ніж у "жертви".
- Особливий випадок: кисень-вуглець утворюють подвійний зв'язок (C=O).

### Термічний розрив зв'язків

За температури > 400 K зв'язки можуть випадково розриватися:
```
stress = (T / 2000) * (0.005 / count²)
```
Потрійні зв'язки розриваються у 9 разів рідше, ніж одинарні.

---

## Технічні деталі

### Продуктивність

- **Просторова сітка**: атоми розподілені по комірках 100×100, перевіряються лише сусідні атоми (O(n) замість O(n²)).
- **6 підкроків физики** на кадр для стабільності.
- **Відсікання невидимих об'єктів**: атоми поза межами екрана не малюються.

### Сумісність

- Працює у всіх сучасних браузерах (Chrome, Firefox, Edge, Safari).
- Не потребує сервера чи збирання.
- Використовує Canvas 2D API (без WebGL).

### Обмеження

- 2D-симуляція (немає третього виміру).
- Спрощена модель хімії (не враховує орбіталі, стереохімію, кінетику).
- Максимальна продуктивність при ~500+ атомах залежить від пристрою.

---

## Ліцензія

Вільне використання в освітніх целях.