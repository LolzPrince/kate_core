/* ============================================================================
   INITIALIZATION
   Инициализация DarkCore Terminal
   ============================================================================ */

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DarkCore Terminal v2.1 - Инициализация...');

    // 1. Инициализируем визуальные эффекты
    Visuals.init();

    // 2. Инициализируем терминал (уже включает файловую систему)
    Terminal.init();

    // 3. Показать приветственное сообщение
    setTimeout(() => {
        // Чтение и вывод файла MOTD
        const motdResult = FileSystem.readFile('/etc/motd');
        if (motdResult.success) {
            Terminal.print(motdResult.content);
        }

        Terminal.print(`\nСистема готова. Текущий каталог: ${FileSystem.currentPath}`);
        Terminal.print('Введите "help" для списка команд или "help filesystem" для работы с файлами.');
    }, 500);

    // 4. Глобальные объекты для отладки
    window.Terminal = Terminal;
    window.FileSystem = FileSystem;
    window.Editor = Editor;
    window.Visuals = Visuals;
    window.Commands = Commands;

    console.log('DarkCore Terminal v2.1 инициализирован');
    console.log('Доступные объекты: Terminal, FileSystem, Editor, Visuals, Commands');
    console.log('Текущий каталог:', FileSystem.currentPath);
    console.log('Корневая файловая система:', FileSystem.fs);
});