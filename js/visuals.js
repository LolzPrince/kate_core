/* ===========================
   VISUAL EFFECTS MANAGER
=========================== */

const Visuals = {
    // RGB Shift при вводе текста
    rgbShiftTimeout: null,

    triggerRGBShift() {
        if (Editor.nanoMode) return;

        const inputLine = document.getElementById('input-line');

        // Удаляем предыдущий класс если есть
        inputLine.classList.remove('rgb-shift');

        // Принудительно перезапускаем анимацию
        void inputLine.offsetWidth;

        // Добавляем класс снова
        inputLine.classList.add('rgb-shift');

        // Убираем класс после анимации
        clearTimeout(this.rgbShiftTimeout);
        this.rgbShiftTimeout = setTimeout(() => {
            inputLine.classList.remove('rgb-shift');
        }, 300);
    },

    // Случайные помехи экрана
    randomGlitch() {
        const glitch = document.createElement('div');

        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const width = 10 + Math.random() * 50;
        const height = 1 + Math.random() * 3;
        const rotation = Math.random() * 360;

        glitch.style.cssText = `
            position: fixed;
            top: ${top}%;
            left: ${left}%;
            width: ${width}%;
            height: ${height}px;
            background: rgba(255, 0, 128, 0.3);
            transform: rotate(${rotation}deg);
            pointer-events: none;
            z-index: 100;
            animation: glitchFlash 0.1s linear;
        `;

        document.body.appendChild(glitch);

        setTimeout(() => {
            if (glitch.parentNode) {
                glitch.remove();
            }
        }, 100);
    },

    // Периодические глитчи
    startRandomGlitches() {
        // Случайные помехи каждые 3-8 секунд
        setInterval(() => {
            if (Math.random() > 0.5) {
                this.randomGlitch();
            }
        }, 3000 + Math.random() * 5000);
    },

    // Инициализация визуальных эффектов
    init() {
        this.startRandomGlitches();

        // Добавляем CSS для анимации глитчей если её нет
        if (!document.getElementById('glitch-styles')) {
            const style = document.createElement('style');
            style.id = 'glitch-styles';
            style.textContent = `
                @keyframes glitchFlash {
                    0% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};