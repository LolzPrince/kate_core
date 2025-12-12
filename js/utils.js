/* ===========================
   UTILITY FUNCTIONS
=========================== */

const Utils = {
    // Форматирование размера файла
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Генерация случайного цвета для эффектов
    randomGlitchColor() {
        const colors = [
            '#ff0080', // ярко-розовый
            '#00ff80', // ярко-зеленый
            '#0080ff', // ярко-синий
            '#ffff00', // желтый
            '#ff8000'  // оранжевый
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Анимация набора текста
    typewriter(text, speed = 50, callback) {
        let i = 0;
        const output = Terminal.output;
        const originalContent = output.innerHTML;

        function type() {
            if (i < text.length) {
                output.innerHTML = originalContent + text.substring(0, i + 1);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }

        type();
    },

    // Создание прогресс-бара
    createProgressBar(value, max, width = 20) {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;

        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(1)}%`;
    }
};

// Добавляем в глобальную область видимости
window.Utils = Utils;