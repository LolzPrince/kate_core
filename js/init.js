/* ===========================
   INITIALIZATION
=========================== */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем визуальные эффекты
    Visuals.init();

    // Инициализируем терминал
    Terminal.init();

    // Добавляем эффект приветствия
    setTimeout(() => {
        Terminal.print("[Система готова к работе]");
    }, 1000);

    // Глобальные объекты для отладки
    window.Terminal = Terminal;
    window.Filesystem = Filesystem;
    window.Editor = Editor;
    window.Visuals = Visuals;
    window.Commands = Commands;

    console.log('DarkCore Terminal v2.1 initialized');
    console.log('Доступные объекты: Terminal, Filesystem, Editor, Visuals, Commands');
});