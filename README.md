# Kvant

**Kvant** — браузерный 2D-симулятор молекулярной динамики с химическими реакциями. Позволяет собирать молекулы из 118 элементов периодической таблицы, задавать температуру, наблюдать реакции окисления, разрывы связей при нагреве, копировать и сохранять сцены.

---

## Содержание

1. [Структура проекта](#структура-проекта)
2. [Запуск](#запуск)
3. [Использование](#использование)
4. [Горячие клавиши](#горячие-клавиши)
5. [Формат файла .kv](#формат-файла-kv)
6. [Подробное описание кода](#подробное-описание-кода)
7. [Физика и химия](#физика-и-химия)
8. [Технические детали](#технические-детали)

---

## Структура проекта

```
chim_sim/
├── index.html      # Главная страница, структура интерфейса
├── style.css       # Все стили, анимации, оформление
├── script.js       # Логика симуляции, физика, рендеринг, управление
├── elements.js     # Данные периодической таблицы (118 элементов)
├── icon.jpg        # Иконка вкладки (фавиконка)
└── README.md       # Этот файл
```

---

## Запуск

1. Откройте `index.html` в любом современном браузере (Chrome, Firefox, Edge, Safari)
2. Никаких зависимостей или серверов не требуется — всё работает локально
3. При первом открытии на экране появится молекула воды (H₂O)

---

## Использование

### Основной цикл

1. **Выберите элемент** — кликните по элементу в панели слева или используйте быстрые кнопки H/O/C/N
2. **Добавьте атом** — кликните ЛКМ по пустому месту или нажмите пробел
3. **Соедините атомы** — поднесите атомы друг к другу, они автоматически образуют связь (если есть свободные валентности)
4. **Управляйте температурой** — двигайте ползунок Temperature (K)
5. **Наблюдайте реакции** — при температуре выше 450 K начинаются реакции окисления

### Панель управления

| Элемент | Описание |
|---------|----------|
| **Temperature (K)** | Ползунок температуры от 0 до 1000 Кельвинов |
| **Atoms / Bonds** | Счётчики атомов и связей на экране |
| **Select Element** | Список всех 118 элементов с поиском |
| **H O C N** | Быстрые кнопки для самых распространённых элементов |
| **Instructions** | Сворачиваемый блок с подсказками |
| **Reset simulation** | Полный сброс сцены |
| **Save / Load** | Сохранение/загрузка сцены в файл `.kv` |
| **Copy / Paste** | Копирование/вставка всей сцены в буфер обмена |
| **☰ / ✕** | Сворачивание всей панели управления |

---

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| **ЛКМ** | Добавить атом / Перетащить существующий атом |
| **Пробел** | Добавить атом в позиции курсора |
| **ПКМ** | Удалить атом |
| **Shift + ЛКМ** | Перетаскивание камеры (панорамирование) |
| **Средняя кнопка мыши** | Перетаскивание камеры (панорамирование) |
| **Колёсико мыши** | Масштабирование (zoom) |
| **Ctrl + ЛКМ** | Выделение прямоугольной области |
| **Ctrl + C** | Копировать выделенные атомы |
| **Ctrl + V** | Вставить скопированную молекулу |
| **Delete / Backspace** | Удалить выделенные атомы |

---

## Формат файла `.kv`

Файл `.kv` — это JSON-файл, содержащий полное описание сцены:

```json
{
  "atoms": [
    {
      "type": "H",        // Символ элемента
      "x": 100.5,        // Координата X в мировых координатах
      "y": -50.2,        // Координата Y
      "vx": 0.5,         // Скорость по X
      "vy": -0.3         // Скорость по Y
    }
  ],
  "bonds": [
    {
      "a": 0,            // Индекс первого атома в массиве atoms
      "b": 1,            // Индекс второго атома
      "count": 1         // Кратность связи (1, 2 или 3)
    }
  ],
  "camera": {
    "x": 0,             // Смещение камеры по X
    "y": 0,             // Смещение камеры по Y
    "zoom": 1           // Масштаб камеры
  }
}
```

---

## Подробное описание кода

### `index.html` — Структура страницы

```html
<!DOCTYPE html>
<html lang="ru">
```
Объявление типа документа и языка страницы (русский).

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Кодировка UTF-8 и адаптивность для мобильных устройств.

```html
<title>Kvant</title>
```
Заголовок вкладки браузера.

```html
<link rel="icon" type="image/jpeg" href="icon.jpg">
```
Подключение фавиконки из файла `icon.jpg`.

```html
<link rel="stylesheet" href="style.css">
```
Подключение внешней таблицы стилей.

```html
<button id="toggle-menu" onclick="toggleMenu()">☰</button>
```
Кнопка-гамбургер для сворачивания панели. Вызывает функцию `toggleMenu()` при клике.

```html
<div id="ui-container">
```
Контейнер всей панели управления. Имеет абсолютное позиционирование и полную высоту экрана.

```html
<div class="header">
    <h1>Kvant</h1>
    <button class="minimize-btn" onclick="toggleMenu()" title="Minimize panel">✕</button>
</div>
```
Заголовок панели с кнопкой закрытия.

```html
<input type="range" id="temp-slider" min="0" max="1000" value="293">
```
Ползунок температуры: от 0 до 1000 Кельвинов, начальное значение 293 K (комнатная температура).

```html
<span id="temp-value">293 K</span>
```
Отображение текущего значения температуры.

```html
<button onclick="setSelectedElement('H')">H</button>
```
Быстрые кнопки выбора элементов. Вызывают `setSelectedElement()` с символом элемента.

```html
<input type="text" id="element-search" placeholder="Search..." oninput="filterElements()">
```
Поле поиска элементов. При каждом вводе символа вызывает `filterElements()`.

```html
<div id="elements-grid" class="sidebar-grid"></div>
```
Контейнер для сетки кнопок элементов (заполняется динамически через JavaScript).

```html
<div class="instructions-header" onclick="toggleInstructions()">
```
Кликабельный заголовок блока инструкций. Сворачивает/разворачивает содержимое.

```html
<canvas id="simCanvas"></canvas>
```
Canvas-элемент, на котором происходит весь рендеринг симуляции.

```html
<script src="elements.js"></script>
<script src="script.js"></script>
```
Подключение JavaScript-файлов. `elements.js` загружается первым, так как `script.js` использует `PERIODIC_TABLE`.

---

### `style.css` — Оформление

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@300;500&display=swap');
```
Подключение шрифтов Google Fonts:
- **Orbitron** — футуристичный шрифт для заголовка и символов атомов
- **Roboto Mono** — моноширинный шрифт для интерфейса

```css
:root {
    --bg-color: #05050a;          /* Тёмный фон (почти чёрный с синим оттенком) */
    --panel-bg: rgba(10, 10, 20, 0.8);  /* Фон панели с прозрачностью */
    --accent-color: #00f2ff;      /* Неоновый циановый акцент */
    --text-color: #e0e0ff;        /* Светлый текст с фиолетовым оттенком */
    --border-color: rgba(0, 242, 255, 0.3); /* Полупрозрачные границы */
}
```
CSS-переменные для цветовой схемы. Используются во всех стилях.

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```
Сброс стандартных отступов. `box-sizing: border-box` делает так, что padding и border включаются в ширину/высоту элемента.

```css
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Roboto Mono', monospace;
    overflow: hidden;          /* Запрет прокрутки страницы */
    height: 100vh;             /* Высота = 100% высоты окна */
    width: 100vw;              /* Ширина = 100% ширины окна */
}
```
Стили body: тёмный фон, моноширинный шрифт, запрокрутки.

```css
#simCanvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;                /* Canvas под панелью управления */
}
```
Canvas позиционируется абсолютно в левом верхнем углу.

```css
#ui-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;               /* Панель поверх canvas */
    background: var(--panel-bg);
    padding: 20px;
    border-right: 1px solid var(--border-color);
    width: 300px;              /* Фиксированная ширина панели */
    height: 100vh;
    backdrop-filter: blur(10px);    /* Эффект размытия фона */
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.5);  /* Тень справа */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);  /* Плавная анимация */
    display: flex;
    flex-direction: column;    /* Вертикальная компоновка */
}
```
Панель управления: фиксированная ширина 300px, эффект размытия, тень, плавная анимация сворачивания.

```css
#ui-container.minimized {
    transform: translateX(-100%);  /* Сдвиг панели влево за экран */
}
```
Класс `.minimized` скрывает панель (сдвиг на 100% влево).

```css
#toggle-menu {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 5;                /* Под панелью, но над canvas */
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
Кнопка-гамбургер: компактная, полупрозрачная, со скруглёнными углами.

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
Кнопки элементов: высота 60px, вертикальная компоновка (символ сверху, название снизу).

```css
.element-btn:hover {
    background: rgba(0, 242, 255, 0.1);
    border-color: var(--border-color);
}
```
При наведении кнопка подсвечивается циановым.

```css
.element-btn.selected {
    background: var(--accent-color);
    color: #000;
}
```
Выбранный элемент заливается циановым, текст становится чёрным.

```css
.reset-btn {
    border-color: #ff3e3e;
    color: #ff3e3e;
    background: rgba(255, 62, 62, 0.1);
}
```
Кнопка сброса красная (опасное действие).

```css
.scene-controls {
    display: flex;
    gap: 5px;
    margin-top: 10px;
    flex-shrink: 0;
}
```
Контейнер кнопок управления сценами: flex-сетка с отступами.

---

### `script.js` — Логика симуляции

#### Глобальные переменные и константы

```javascript
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
```
Получение ссылки на canvas и его 2D-контекст для рисования.

```javascript
let atoms = [];
let bonds = [];
let effects = [];
```
- `atoms` — массив всех атомов на экране
- `bonds` — массив всех связей между атомами
- `effects` — массив визуальных эффектов (искры, вспышки)

```javascript
const camera = { x: 0, y: 0, zoom: 1, isDragging: false, lastMouseX: 0, lastMouseY: 0 };
```
Объект камеры: смещение (x, y), масштаб (zoom), флаг перетаскивания и последние координаты мыши.

```javascript
let selectionStart = null;
let selectionEnd = null;
let isSelecting = false;
```
Переменные для выделения области: начальная и конечная точки, флаг выделения.

```javascript
let clipboardAtoms = null;
let pendingPaste = null;
let pendingPasteOffset = { x: 0, y: 0 };
```
- `clipboardAtoms` — скопированная молекула (буфер обмена)
- `pendingPaste` — молекула, ожидающая размещения (полупрозрачная)
- `pendingPasteOffset` — смещение при перемещении

```javascript
const BOND_DISTANCE_FACTOR = 1.1;      // Расстояние связи = (r1 + r2) * 1.1
const BONDING_RADIUS_MUL = 1.3;         // Радиус образования связи = (r1 + r2) * 1.3
const SPRING_CONSTANT = 0.1;            // Жёсткость "пружины" связи
const DAMPING = 0.98;                   // Затухание скорости (трение)
const COLLISION_DAMPING = 0.5;          // Упругость столкновений (0 = неупругое, 1 = абсолютно упругое)
const INTERMOLECULAR_STRENGTH = 0.005;  // Сила межмолекулярного взаимодействия
```
Физические константы, определяющие поведение атомов.

#### Класс Atom

```javascript
class Atom {
    constructor(elementData, x, y) {
        this.type = elementData.symbol;     // Символ элемента (H, O, C, ...)
        this.mass = elementData.mass;       // Атомная масса
        this.radius = calculateRadius(this.mass);  // Радиус атома
        this.valence = elementData.valence;       // Валентность (1, 2, 3, 4, ...)
        this.en = elementData.en || 0;             // Электроотрицательность по Полингу
        this.color = elementData.cpk;              // CPK-цвет элемента
        this.x = x; this.y = y;                    // Координаты в мировых координатах
        this.vx = (Math.random() - 0.5) * 2;      // Начальная скорость по X (случайная)
        this.vy = (Math.random() - 0.5) * 2;      // Начальная скорость по Y
```
Конструктор атома: сохраняет свойства элемента, задаёт случайную начальную скорость (тепловое движение).

```javascript
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        this.textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#fff';
```
Выбор цвета текста: если цвет атома светлый (яркость > 186), текст чёрный, иначе белый. Формула яркости — стандартная для RGB.

```javascript
    getOccupiedValence() {
        return bonds.reduce((total, b) => (b.a === this || b.b === this) ? total + b.count : total, 0);
    }
}
```
Подсчёт занятых валентностей: суммирует кратности всех связей атома.

```javascript
    update() {
        const kelvin = parseFloat(tempSlider.value);
        const tempFactor = kelvin / 300;
```
Температурный фактор: отношение текущей температуры к 300 K (комнатная).

```javascript
        // Brownian
        const brownian = tempFactor * 0.4;
        this.vx += (Math.random() - 0.5) * brownian;
        this.vy += (Math.random() - 0.5) * brownian;
```
Броуновское движение: случайные импульсы, пропорциональные температуре.

```javascript
        // Speed limit
        const limit = 2 + tempFactor * 20;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > limit) { this.vx *= 0.9; this.vy *= 0.9; }
```
Ограничение максимальной скорости: если атом слишком быстрый, скорость уменьшается на 10%.

```javascript
        this.x += this.vx; this.y += this.vy;
    }
}
```
Интегрирование: обновление координат по скорости (метод Эйлера).

```javascript
    draw() {
        const dx = (this.x + camera.x) * camera.zoom + width / 2;
        const dy = (this.y + camera.y) * camera.zoom + height / 2;
        const dr = this.radius * camera.zoom;
```
Преобразование мировых координат в экранные:
- Добавляем смещение камеры
- Умножаем на масштаб
- Добавляем половину ширины/высоты (центр экрана)

```javascript
        if (dx + dr < 0 || dx - dr > width || dy + dr < 0 || dy - dr > height) return;
```
Отсечка невидимых атомов: если атом полностью за пределами экрана, не рисуем.

```javascript
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10 * camera.zoom;      // Свечение пропорционально масштабу
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
```
Рисование атома: окружность с цветом элемента и свечением.

```javascript
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = Math.max(0.5, 1 * camera.zoom);
        ctx.stroke();
```
Белая полупрозрачная обводка вокруг атома.

```javascript
        if (camera.zoom > 0.4) {
            ctx.fillStyle = this.textColor;
            ctx.font = `bold ${Math.max(6, dr * 0.8)}px Orbitron`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(this.type, dx, dy);
        }
```
Символ элемента рисуется только при достаточном масштабе (> 0.4), чтобы не засорять экран.

#### Класс Bond

```javascript
class Bond {
    constructor(a, b, count = 1) {
        this.a = a; this.b = b;
        this.count = count;                    // Кратность: 1, 2 или 3
        this.targetDist = (a.radius + b.radius) * BOND_DISTANCE_FACTOR;
    }
```
Конструктор связи: два атома, кратность, целевое расстояние.

```javascript
    update() {
        const dx = this.b.x - this.a.x;
        const dy = this.b.y - this.a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.1;
```
Вектор между атомами и расстояние (с защитой от деления на ноль).

```javascript
        const force = (d - this.targetDist) * SPRING_CONSTANT * (1 + (this.count - 1) * 0.5);
```
Сила "пружины": пропорциональна отклонению от целевого расстояния. Кратные связи жёстче (множитель 0.5 за  each дополнительную связь).

```javascript
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        this.a.vx += fx / this.a.mass; this.a.vy += fy / this.a.mass;
        this.b.vx -= fx / this.b.mass; this.b.vy -= fy / this.b.mass;
```
Применение силы к обоим атомам (третий закон Ньютона). Ускорение = сила / масса.

```javascript
    draw() {
        const x1 = (this.a.x + camera.x) * camera.zoom + width / 2;
        const y1 = (this.a.y + camera.y) * camera.zoom + height / 2;
        const x2 = (this.b.x + camera.x) * camera.zoom + width / 2;
        const y2 = (this.b.y + camera.y) * camera.zoom + height / 2;
```
Преобразование координат обоих атомов в экранные.

```javascript
        const dx = x2 - x1; const dy = y2 - y1;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) return;                     // Не рисовать слишком короткие связи
        const nx = -dy / d; const ny = dx / d; // Нормаль к связи
        const sp = 4 * camera.zoom;           // Расстояние между линиями кратных связей
```
Вычисление нормали для рисования кратных связей (смещение параллельных линий).

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
Рисование связи:
- Одинарная — одна линия по центру
- Двойная — две параллельные линии (±sp)
- Тройная — три линии (±sp*1.5 и 0)

#### Пространственная сетка (оптимизация)

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
Пространственное хеширование: атомы распределяются по ячейкам сетки 100×100. Это позволяет проверять только соседние атомы, а не все пары (O(n) вместо O(n²)).

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
Получение индексов атомов из 9 соседних ячеек (3×3 вокруг текущей).

#### Физика

```javascript
function solvePhysics() {
    buildSpatialGrid();
    const checked = new Set();
```
Пересборка сетки и создание множества для отслеживания уже проверенных пар.

```javascript
    for (let i = 0; i < atoms.length; i++) {
        const a = atoms[i];
        const neighbors = getNeighborIndices(a);
        
        for (const j of neighbors) {
            if (j <= i) continue;                    // Каждая пара проверяется один раз
            const pairKey = `${i},${j}`;
            if (checked.has(pairKey)) continue;
            checked.add(pairKey);
```
Цикл по всем атомам и их соседям. Проверка `j <= i` предотвращает двойную обработку пар.

```javascript
            const b = atoms[j];
            const dx = b.x - a.x; const dy = b.y - a.y;
            const ds = dx * dx + dy * dy;           // Квадрат расстояния (без sqrt для производительности)
            const md = a.radius + b.radius;         // Минимальное расстояние (касание)
```
Вычисление вектора и квадрата расстояния между атомами.

```javascript
            if (ds < (md * BONDING_RADIUS_MUL) ** 2) tryCreateBond(a, b);
```
Если атомы достаточно близки (в пределах радиуса образования связи), пытаемся создать связь.

```javascript
            if (ds < md * md) {                     // Столкновение (атомы перекрываются)
                const d = Math.sqrt(ds) || 0.1;
                const ov = md - d;                  // Величина перекрытия
                const nx = dx / d; const ny = dy / d; // Нормаль столкновения
                a.x -= nx * ov * 0.5; a.y -= ny * ov * 0.5;  // Раздвигаем атомы
                b.x += nx * ov * 0.5; b.y += ny * ov * 0.5;
```
Разрешение столкновений: атомы раздвигаются наполовину величины перекрытия вдоль нормали.

```javascript
                const rvx = b.vx - a.vx; const rvy = b.vy - a.vy;  // Относительная скорость
                const vn = rvx * nx + rvy * ny;                        // Проекция скорости на нормаль
                if (vn < 0) {                                          // Атомы движутся друг к другу
                    const im = -(1 + COLLISION_DAMPING) * vn / (1 / a.mass + 1 / b.mass);
                    a.vx -= (im * nx) / a.mass; a.vy -= (im * ny) / a.mass;
                    b.vx += (im * nx) / b.mass; b.vy += (im * ny) / b.mass;
                }
            }
```
Импульс столкновения: упругий удар с учётом масс и коэффициента восстановления `COLLISION_DAMPING`.

#### Химия

```javascript
function tryCreateBond(a, b) {
    if (a.valence === 0 || b.valence === 0) return;  // Инертные газы не образуют связи
```
Проверка валентности: если у атома валентность 0 (He, Ne, Ar, ...), связь не образуется.

```javascript
    const existing = bonds.find(bo => (bo.a === a && bo.b === b) || (bo.a === b && bo.b === a));
```
Поиск существующей связи между этими атомами.

```javascript
    if (existing) {
        if (existing.count < 3 && a.getOccupiedValence() < a.valence && b.getOccupiedValence() < b.valence) {
            existing.count++;                    // Увеличение кратности связи
            createEffect(a.x, a.y, '#00f2ff', 2);
        }
```
Если связь уже существует и кратность < 3, увеличиваем кратность (одинарная → двойная → тройная).

```javascript
    } else {
        const aFree = a.valence - a.getOccupiedValence();
        const bFree = b.valence - b.getOccupiedValence();

        if (aFree > 0 && bFree > 0) {
            bonds.push(new Bond(a, b));          // Создание новой связи
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
Если оба атома имеют свободные валентности — создаём связь. Иначе, при температуре > 450 K, пытаемся провести реакцию окисления.

```javascript
function attemptReaction(attacker, target) {
    const targetBonds = bonds.filter(b => b.a === target || b.b === target);
    for (let bondToBreak of targetBonds) {
        const victim = bondToBreak.a === target ? bondToBreak.b : bondToBreak.a;
        if (victim === attacker) continue;
```
Поиск связи, которую можно разорвать. "Жертва" — атом, связанный с целью, но не атакующий.

```javascript
        // Oxidation Logic: More electronegative atom kicks out the less EN one
        const enDifference = attacker.en - victim.en;
        if (enDifference > 0.7) {
```
Проверка электроотрицательности: атакующий должен быть значительно более электроотрицательным (разница > 0.7).

```javascript
            bonds = bonds.filter(b => b !== bondToBreak);       // Разрыв старой связи
            let newCount = (attacker.type === 'O' && target.type === 'C' && 
                           attacker.valence >= 2 && 
                           target.valence - (target.getOccupiedValence()) >= 2) ? 2 : 1;
            bonds.push(new Bond(attacker, target, newCount));   // Создание новой связи
```
Разрыв старой связи и создание новой. Особый случай: кислод-углерод образует двойную связь (C=O).

```javascript
            createEffect(target.x, target.y, '#ff4d00', 15);  // Эффект выделения тепла
            const kick = 5 + enDifference * 5;
            victim.vx += (Math.random() - 0.5) * kick;        // Отталкивание жертвы
            victim.vy += (Math.random() - 0.5) * kick;
            attacker.vx += (Math.random() - 0.5) * 2;          // Небольшой импульс атакующему
            target.vx += (Math.random() - 0.5) * 2;            // И цели
            return;
        }
    }
}
```
Визуальный эффект (оранжевые искры) и импульсы отталкивания для участников реакции.

#### Обновление симуляции

```javascript
function updateSimulation() {
    const kelvin = parseFloat(tempSlider.value);

    // Effects update
    effects = effects.filter(e => {
        e.x += e.vx; e.y += e.vy; e.life -= 0.05;
        return e.life > 0;
    });
```
Обновление эффектов: движение, затухание жизни, удаление мёртвых.

```javascript
    for (let s = 0; s < 6; s++) {              // 6 подшагов физики для стабильности
        // Bond thermal stress
        for (let i = bonds.length - 1; i >= 0; i--) {
            bonds[i].update();
            const stress = (kelvin / 2000) * (0.005 / (bonds[i].count ** 2));
            if (kelvin > 400 && Math.random() < stress) {
                createEffect((bonds[i].a.x + bonds[i].b.x) / 2, 
                            (bonds[i].a.y + bonds[i].b.y) / 2, '#ff0', 5);
                bonds.splice(i, 1);             // Термический разрыв связи
            }
        }
```
Термический разрыв связей: при температуре > 400 K связи могут случайно разорваться. Вероятность пропорциональна температуре и обратно пропорциональна квадрату кратности (тройные связи прочнее).

```javascript
        solvePhysics();
        atoms.forEach(a => { a.update(); a.vx *= DAMPING; a.vy *= DAMPING; });
    }
}
```
Основной цикл: физика столкновений, обновление атомов, применение затухания.

#### Рендеринг

```javascript
function draw() {
    ctx.clearRect(0, 0, width, height);
```
Очистка canvas.

```javascript
    // Grid
    const gz = 100 * camera.zoom;
    const ox = (camera.x * camera.zoom + width / 2) % gz;
    const oy = (camera.y * camera.zoom + height / 2) % gz;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    for (let x = ox; x < width; x += gz) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = oy; y < height; y += gz) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
```
Отрисовка фоновой сетки: линии через каждые 100 мировых единиц (с учётом камеры и масштаба).

```javascript
    bonds.forEach(b => b.draw());
```
Отрисовка всех связей.

```javascript
    const hasSelection = selectionStart && selectionEnd && 
                        (selectionStart.x !== selectionEnd.x || selectionStart.y !== selectionEnd.y);
    const selected = hasSelection ? getSelectedAtoms() : [];
    const pendingIndices = pendingPaste ? pendingPaste.atoms.map(a => atoms.indexOf(a)) : [];
```
Определение выделенных атомов и атомов, ожидающих вставки.

```javascript
    atoms.forEach(a => {
        const isPending = pendingIndices.includes(atoms.indexOf(a));
        if (isPending) {
            ctx.globalAlpha = 0.5;           // Полупрозрачные атомы при вставке
            a.draw();
            ctx.globalAlpha = 1.0;
        } else {
            a.draw();
        }
        if (selected.includes(a)) {
            // Зелёный пунктирный контур вокруг выделенных атомов
        }
    });
```
Отрисовка атомов с подсветкой выделения.

```javascript
    // Pending paste ghost
    if (pendingPaste) {
        ctx.globalAlpha = 0.4;               // Полупрозрачный "призрак" вставки
        // ...
    }
```
Отрисовка полупрозрачной копии вставляемой молекулы.

```javascript
    // Selection rectangle (always visible when selection exists)
    if (selectionStart && selectionEnd && ...) {
        // Полупрозрачный прямоугольник выделения
    }
```
Отрисовка прямоугольника выделения.

```javascript
    // Effects
    effects.forEach(e => {
        // Рисование искр с затуханием прозрачности
    });
    ctx.globalAlpha = 1.0;
}
```
Отрисовка визуальных эффектов.

#### Управление камерой

```javascript
function screenToWorld(x, y) {
    return { x: (x - width / 2) / camera.zoom - camera.x, y: (y - height / 2) / camera.zoom - camera.y };
}
```
Преобразование экранных координат в мировые (обратное к рендерингу).

#### Управление мышью

```javascript
canvas.addEventListener('mousedown', (e) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
```
Преобразование координат мыши в мировые координаты.

```javascript
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        camera.isDragging = true;
        camera.lastMouseX = e.clientX; camera.lastMouseY = e.clientY;
    }
```
Средняя кнопка мыши или Shift+ЛКМ начинают панорамирование.

```javascript
    } else if (e.button === 0 && e.ctrlKey) {
        isSelecting = true;
        selectionStart = { x: e.clientX, y: e.clientY };
        selectionEnd = { x: e.clientX, y: e.clientY };
    }
```
Ctrl+ЛКМ начинает выделение области.

```javascript
    } else if (e.button === 0) {
        clearSelection();                    // Сброс выделения
        if (pendingPaste) confirmPaste();   // Подтверждение вставки
        
        // Поиск атома под курсором
        let found = false;
        for (let i = atoms.length - 1; i >= 0; i--) {
            const a = atoms[i];
            const dist = Math.sqrt((a.x - worldPos.x) ** 2 + (a.y - worldPos.y) ** 2);
            if (dist < a.radius + 5) {        // Радиус + 5 пикселей запаса
                draggedAtom = a;
                found = true;
                break;
            }
        }
        if (!found) injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    }
```
Обычный ЛКМ: сброс выделения, подтверждение вставки, поиск атома под курсором или создание нового.

```javascript
    } else if (e.button === 2) {
        removeAtomAt(worldPos.x, worldPos.y);
    }
});
```
ПКМ: удаление атома под курсором.

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
Обновление при движении мыши: панорамирование камеры, обновление выделения, перетаскивание атома.

```javascript
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = Math.pow(1.15, -e.deltaY / 120);           // Множитель масштаба
    const b = screenToWorld(e.clientX, e.clientY);       // Точка под курсором (до зума)
    camera.zoom = Math.min(Math.max(camera.zoom * f, 0.05), 15);  // Ограничение масштаба
    const a = screenToWorld(e.clientX, e.clientY);       // Точка под курсором (после зума)
    camera.x += (a.x - b.x);                              // Коррекция камеры
    camera.y += (a.y - b.y);
}, { passive: false });
```
Масштабирование с привязкой к курсору: точка под курсором остаётся на месте.

#### Клавиатура

```javascript
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        const worldPos = screenToWorld(currentMouseX, currentMouseY);
        injectAtom(selectedElementSymbol, worldPos.x, worldPos.y);
    }
```
Пробел: добавить атом в позиции курсора.

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
Ctrl+C: копировать выделение. Ctrl+V: вставить.

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
Delete/Backspace: удаление всех выделенных атомов и их связей.

#### Выделение

```javascript
function clearSelection() {
    selectionStart = null;
    selectionEnd = null;
    isSelecting = false;
}
```
Сброс всех переменных выделения.

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
Получение всех атомов внутри прямоугольника выделения: преобразуем координаты атомов в экранные и проверяем попадание в прямоугольник.

#### Копирование и вставка

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
Копирование: сохраняем атомы и связи (с переиндексацией) в `clipboardAtoms`.

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
Вставка: создаём "ожидающую" копию с небольшим случайным смещением. Атомы пока не в основном массиве.

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
Подтверждение вставки: атомы добавляются в основной массив, связи создаются с новыми индексами.

#### Сериализация сцены

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
Преобразование сцены в JSON: атомы с координатами и скоростями, связи с индексами, состояние камеры.

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
Восстановление сцены из JSON: создаём атомы, связи, восстанавливаем камеру.

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
Сохранение сцены: создаём Blob (бинарные данные), временную ссылку, кнопку скачивания и кликаем по ней.

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
Загрузка сцены: создаём невидимый input типа file, при выборе файла читаем его и восстанавливаем сцену.

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
Копирование/вставка всей сцены через буфер обмена (Clipboard API).

#### UI функции

```javascript
function toggleMenu() { uiContainer.classList.toggle('minimized'); }
```
Переключение видимости панели.

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
Сворачивание/разворачивание блока инструкций через CSS-класс.

```javascript
function setSelectedElement(s) {
    selectedElementSymbol = s;
    if (selectedLabel) selectedLabel.textContent = s;
    populateGrid();
}
```
Выбор элемента: сохранение символа, обновление текста, перерисовка сетки с подсветкой.

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
Заполнение сетки элементов: фильтрация по поисковому запросу, создание кнопок с символом, названием и цветовой полоской.

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
Добавление атома: находим данные элемента, если координаты не указаны — создаём рядом с центром экрана.

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
Удаление атома: ищем атом в радиусе (radius + 10) и удаляем его вместе со всеми связями.

```javascript
function resetSim() {
    atoms = []; bonds = []; effects = [];
    camera.x = 0; camera.y = 0; camera.zoom = 1;
}
```
Полный сброс: очистка всех массивов и сброс камеры.

#### Главный цикл

```javascript
function tick() {
    atomCountDisplay.textContent = atoms.length;
    bondCountDisplay.textContent = bonds.length;
    tempValue.textContent = tempSlider.value + ' K';
    updateSimulation(); draw(); requestAnimationFrame(tick);
}
```
Главный цикл анимации: обновление счётчиков, физики, рендеринга, и запрос следующего кадра.

```javascript
populateGrid(); tick();
injectAtom('H'); injectAtom('H'); injectAtom('O');
```
Инициализация: заполнение сетки элементов, запуск цикла, создание начальной молекулы воды (H₂O).

---

### `elements.js` — Периодическая таблица

```javascript
const PERIODIC_TABLE = [
    { "name": "Hydrogen", "symbol": "H", "mass": 1.008, "cpk": "#ffffff", "valence": 1, "en": 2.20 },
    // ... 118 элементов
];
```
Массив объектов с данными элементов:
- `name` — английское название
- `symbol` — химический символ
- `mass` — атомная масса (а.е.м.)
- `cpk` — CPK-цвет (стандартная цветовая схема молекулярных моделей)
- `valence` — типичная валентность
- `en` — электроотрицательность по шкале Полинга

---

## Физика и химия

### Броуновское движение

Атомы получают случайные импульсы, пропорциональные температуре:
```
brownian = (T / 300) * 0.4
v += (random() - 0.5) * brownian
```

### Ограничение скорости

Максимальная скорость атома зависит от температуры:
```
limit = 2 + (T / 300) * 20
```
При превышении скорость уменьшается на 10%.

### Затухание

Каждый кадр скорость умножается на 0.98 (коэффициент трения):
```
v *= 0.98
```

### Связи как пружины

Связи моделируются как пружины с жёсткостью 0.1:
```
force = (distance - targetDistance) * 0.1 * (1 + (count - 1) * 0.5)
```
Кратные связи жёстче: двойные в 1.5 раза, тройные в 2 раза.

### Столкновения

Атомы отталкиваются при перекрытии с коэффициентом упругости 0.5 (частично упругие).

### Образование связей

Связь образуется если:
1. Расстояние между атомами < (r₁ + r₂) × 1.3
2. У обоих атомов есть свободные валентности
3. Валентность обоих атомов > 0

### Реакции окисления

При температуре > 450 K, если атом не может образовать новую связь (нет свободных валентностей), он может "атаковать" существующую связь:
- Электроотрицательность атакующего должна быть на 0.7 выше, чем у "жертвы"
- Особый случай: кислород-углерод образуют двойную связь (C=O)

### Термический разрыв связей

При температуре > 400 K связи могут случайно разрываться:
```
stress = (T / 2000) * (0.005 / count²)
```
Тройные связи разрываются в 9 раз реже, чем одинарные.

---

## Технические детали

### Производительность

- **Пространственная сетка**: атомы распределены по ячейкам 100×100, проверяются только соседние атомы (O(n) вместо O(n²))
- **6 подшагов физики** на кадр для стабильности
- **Отсечение невидимых объектов**: атомы за пределами экрана не рисуются

### Совместимость

- Работает во всех современных браузерах (Chrome, Firefox, Edge, Safari)
- Не требует сервера или сборки
- Использует Canvas 2D API (без WebGL)

### Ограничения

- 2D-симуляция (нет третьего измерения)
- Упрощённая модель химии (не учитывает орбитали, стереохимию, кинетику)
- Максимальная производительность при ~500+ атомах зависит от устройства

---

## Лицензия

Свободное использование в образовательных целях.
