/* ============================================================================
   COMMAND DEFINITIONS
   Команды терминала DarkCore
   ============================================================================ */

const Commands = {
    // =========================================================================
    // BASIC COMMANDS - основные команды
    // =========================================================================

    help: (args) => {
        const category = args[0];

        const commands = {
            quest: `
Текстовый квест:
  quest start          - начать новый квест Dark Quest
  quest load           - загрузить сохранение
  quest save           - сохранить прогресс
  quest help           - помощь по квесту
  quest exit           - выйти из квеста

Dark Quest - атмосферный квест в стиле dark fantasy фильмов 80-х!
Исследуйте проклятый замок, делайте выборы и находите все концовки.
Пиксель-арт стиль, мрачная атмосфера, дерево решений.
`,
            basic: `
Основные команды:
  help [категория]    - показать справку
  clear               - очистить экран
  echo [текст]        - вывести текст
  time                - показать системное время
  banner              - показать баннер
  about               - информация о системе
  history             - история команд
  glitch              - тест визуальных эффектов
`,

            filesystem: `
Файловая система:
  pwd                 - показать текущий каталог
  ls [путь]           - список файлов
  cd [путь]           - сменить каталог
  cat [файл]          - просмотреть файл
  touch [файл]        - создать файл
  mkdir [каталог]     - создать каталог
  rm [путь]           - удалить файл
  rm -r [каталог]     - удалить каталог рекурсивно
  cp [от] [до]        - копировать
  mv [от] [до]        - переместить/переименовать
  find [паттерн]      - найти файлы
  stat [путь]         - информация о файле
  chmod [права] [файл]- изменить права доступа
  tree [путь]         - показать дерево каталогов
  du [путь]           - размер каталога
  df                  - свободное место
  grep [паттерн] [файл] - поиск текста в файле
  wc [файл]             - подсчет строк, слов, символов
  head [файл]           - показать начало файла
  tail [файл]           - показать конец файла
  diff [файл1] [файл2]  - сравнить файлы
  tar -czf архив файлы  - создать архив
  tar -xzf архив        - распаковать архив
  download [файл]       - скачать файл
  upload                - загрузить файл
`,

            editor: `
Редактор:
  nano [файл]         - открыть редактор
  edit [файл]         - создать/редактировать файл
  write [файл] [текст]- записать текст в файл
  
Редактор Nano:
  Ctrl+S              - сохранить
  Ctrl+X              - выйти
  Стрелки             - перемещение
  Enter               - новая строка
  Backspace/Delete    - удалить символ
  Home/End            - начало/конец строки
`,

            system: `
Системные команды:
  whoami              - текущий пользователь
  users               - список пользователей
  processes           - список процессов
  reboot              - перезагрузка системы
  shutdown            - выключение
  exportfs            - экспорт файловой системы
  importfs [json]     - импорт файловой системы
  resetfs             - сброс файловой системы
`,

            aliases: `
Псевдонимы:
  ll                  - ls -la
  ..                  - cd ..
  ...                 - cd ../..
  ~                   - cd ~ (домашний каталог)
`
        };

        if (category && commands[category]) {
            return commands[category];
        }

        return `
DarkCore Terminal v2.1 — Полная справка
======================================

Используйте: help [категория] для детальной справки

Доступные категории:
  basic       - основные команды
  filesystem  - файловая система
  editor      - редактор
  system      - системные команды
  aliases     - псевдонимы
  quest        - игры

Пример: help filesystem
`;
    },

    clear: () => Terminal.clear(),

    echo: (args) => args.join(" "),

    about: () => {
        const stats = FileSystem.exportFS();
        return `DarkCore Terminal v2.1 — CRT Edition
======================================

Файловая система:
  Корневой каталог: /
  Текущий каталог: ${FileSystem.currentPath}
  Всего файлов: ${Object.keys(FileSystem.fs).length}
  Последнее сохранение: ${stats.timestamp}

Возможности:
  - Полноценная виртуальная файловая система
  - Иерархия каталогов и файлов
  - Права доступа (chmod)
  - Редактор nano с подсветкой
  - CRT эффекты 80-х
  - Сохранение между сессиями

Введите "help" для списка команд.`;
    },

    time: () => {
        const now = new Date();
        return `${now.toLocaleString()}\nСистемное время: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    },

    banner: () => Terminal.getBanner(),

    // =========================================================================
    // FILESYSTEM COMMANDS - команды файловой системы
    // =========================================================================

    pwd: () => {
        const path = FileSystem.pwd();
        return `Текущий каталог: ${path}`;
    },

    ls: (args) => {
        const path = args[0] || '.';
        const listResult = FileSystem.listDirectory(path);

        if (!listResult.success) {
            return listResult.error;
        }

        if (listResult.items.length === 0) {
            return `Каталог ${listResult.path} пуст.`;
        }

        let output = `Содержимое каталога ${listResult.path}:\n`;
        output += '-'.repeat(60) + '\n';

        for (const item of listResult.items) {
            const type = item.type === 'directory' ? '📁' : '📄';
            const size = FileSystem.formatSize(item.size);
            const modified = new Date(item.modified).toLocaleDateString();

            output += `${item.permissions} ${type} ${item.owner.padEnd(8)} ${size.padStart(10)} ${modified.padStart(12)} ${item.name}\n`;
        }

        output += '-'.repeat(60);
        output += `\nВсего: ${listResult.items.length} объектов`;

        return output;
    },

    cd: (args) => {
        if (!args[0]) {
            // Без аргументов - перейти в домашний каталог
            return Commands.cd(['~']);
        }

        const result = FileSystem.cd(args[0]);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    cat: (args) => {
        if (!args[0]) {
            return "Использование: cat [файл]";
        }

        const result = FileSystem.readFile(args[0]);

        if (!result.success) {
            return `Ошибка: ${result.error}`;
        }

        const info = FileSystem.stat(args[0]);
        if (info.success) {
            return `Файл: ${args[0]} (${info.info.sizeHuman})\n` +
                `Разрешения: ${info.info.permissions}\n` +
                `Модифицирован: ${new Date(info.info.modified).toLocaleString()}\n` +
                '-'.repeat(60) + '\n' +
                result.content;
        }

        return result.content;
    },

    touch: (args) => {
        if (!args[0]) {
            return "Использование: touch [файл]";
        }

        const result = FileSystem.touch(args[0]);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    write: (args) => {
        if (args.length < 2) {
            return "Использование: write [файл] [текст]";
        }

        const filename = args[0];
        const content = args.slice(1).join(' ');

        const result = FileSystem.writeFile(filename, content);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    mkdir: (args) => {
        if (!args[0]) {
            return "Использование: mkdir [каталог]";
        }

        const result = FileSystem.mkdir(args[0]);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    rm: (args) => {
        if (!args[0]) {
            return "Использование: rm [файл] или rm -r [каталог]";
        }

        let result;
        if (args[0] === '-r' && args[1]) {
            result = FileSystem.rmRecursive(args[1]);
        } else {
            result = FileSystem.rm(args[0]);
        }

        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    cp: (args) => {
        if (args.length < 2) {
            return "Использование: cp [источник] [получатель]";
        }

        const result = FileSystem.cp(args[0], args[1]);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    mv: (args) => {
        if (args.length < 2) {
            return "Использование: mv [источник] [получатель]";
        }

        const result = FileSystem.mv(args[0], args[1]);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    find: (args) => {
        if (!args[0]) {
            return "Использование: find [паттерн] [путь]";
        }

        const pattern = args[0];
        const startPath = args[1] || '.';

        const result = FileSystem.find(pattern, startPath);

        if (!result.success) {
            return `Ошибка: ${result.error}`;
        }

        if (result.results.length === 0) {
            return `Не найдено файлов, соответствующих паттерну: ${pattern}`;
        }

        let output = `Найдено ${result.results.length} файлов:\n`;
        output += '-'.repeat(60) + '\n';

        for (const file of result.results) {
            const type = file.type === 'directory' ? '📁' : '📄';
            const size = FileSystem.formatSize(file.size);
            const modified = new Date(file.modified).toLocaleDateString();

            output += `${type} ${size.padStart(10)} ${modified.padStart(12)} ${file.path}\n`;
        }

        return output;
    },

    stat: (args) => {
        if (!args[0]) {
            return "Использование: stat [путь]";
        }

        const result = FileSystem.stat(args[0]);

        if (!result.success) {
            return `Ошибка: ${result.error}`;
        }

        const info = result.info;
        return `
Информация о файле: ${info.name}
========================================
Путь:          ${info.path}
Тип:           ${info.type === 'directory' ? 'Каталог' : 'Файл'}
Размер:        ${info.sizeHuman} (${info.size} байт)
Создан:        ${new Date(info.created).toLocaleString()}
Модифицирован: ${new Date(info.modified).toLocaleString()}
Права:         ${info.permissions}
Владелец:      ${info.owner}
Inode:         ${info.inode}
`;
    },

    chmod: (args) => {
        if (args.length < 2) {
            return "Использование: chmod [права] [файл]\nПример: chmod 755 файл.txt или chmod rwxr-xr-x файл.txt";
        }

        const mode = args[0];
        const path = args[1];

        const result = FileSystem.chmod(mode, path);
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    tree: (args) => {
        const path = args[0] || '.';

        let output = `Дерево каталогов: ${path}\n`;
        output += '└──\n';

        // Рекурсивная функция для построения дерева
        function buildTree(node, currentPath, prefix = '', isLast = true) {
            if (!node.children) return '';

            const children = Object.keys(node.children);
            let treeOutput = '';

            for (let i = 0; i < children.length; i++) {
                const childName = children[i];
                const child = node.children[childName];
                const childPath = currentPath === '/' ? `/${childName}` : `${currentPath}/${childName}`;

                const isChildLast = i === children.length - 1;
                const connector = isChildLast ? '└── ' : '├── ';
                const type = child.type === 'directory' ? '📁' : '📄';

                treeOutput += `${prefix}${connector}${type} ${childName}\n`;

                if (child.type === 'directory') {
                    const childPrefix = prefix + (isChildLast ? '    ' : '│   ');
                    treeOutput += buildTree(child, childPath, childPrefix, isChildLast);
                }
            }

            return treeOutput;
        }

        const startNode = FileSystem.getNode(FileSystem.resolvePath(path));
        if (!startNode || startNode.type !== 'directory') {
            return `Ошибка: ${path} не является каталогом`;
        }

        output += buildTree(startNode, FileSystem.resolvePath(path));
        return output;
    },

    du: (args) => {
        const path = args[0] || '.';
        const node = FileSystem.getNode(FileSystem.resolvePath(path));

        if (!node) {
            return `Ошибка: ${path} не существует`;
        }

        const size = FileSystem.getSize(node);
        const sizeHuman = FileSystem.formatSize(size);

        return `Размер ${path}: ${sizeHuman} (${size} байт)`;
    },

    df: () => {
        // Статистика по всей файловой системе
        const rootSize = FileSystem.getSize(FileSystem.fs['/']);
        const totalSpace = 1024 * 1024; // 1 MB виртуального пространства
        const usedPercent = ((rootSize / totalSpace) * 100).toFixed(1);
        const freeSpace = totalSpace - rootSize;

        return `
Дисковое пространство:
========================================
Всего:        ${FileSystem.formatSize(totalSpace)}
Использовано: ${FileSystem.formatSize(rootSize)} (${usedPercent}%)
Свободно:     ${FileSystem.formatSize(freeSpace)}
========================================
Файловая система: darkcore_vfs
Точка монтирования: /
`;
    },
    grep: (args) => {
        if (args.length < 2) return "Использование: grep [паттерн] [файл]";

        const pattern = args[0];
        const file = args[1];
        const result = FileSystem.readFile(file);

        if (!result.success) return `Ошибка: ${result.error}`;

        const lines = result.content.split('\n');
        let output = `grep "${pattern}" ${file}:\n`;
        output += '-'.repeat(60) + '\n';

        lines.forEach((line, index) => {
            if (line.includes(pattern)) {
                output += `${index + 1}: ${line}\n`;
            }
        });

        return output;
    },

    wc: (args) => {
        if (!args[0]) return "Использование: wc [файл]";

        const result = FileSystem.readFile(args[0]);
        if (!result.success) return `Ошибка: ${result.error}`;

        const content = result.content;
        const lines = content.split('\n').length;
        const words = content.split(/\s+/).filter(w => w).length;
        const chars = content.length;

        return `  ${lines}  ${words}  ${chars} ${args[0]}`;
    },

    head: (args) => {
        if (!args[0]) return "Использование: head [файл] или head -n [число] [файл]";

        let lines = 10;
        let file = args[0];

        if (args[0] === '-n' && args[1]) {
            lines = parseInt(args[1]) || 10;
            file = args[2];
        }

        if (!file) return "Использование: head [файл] или head -n [число] [файл]";

        const result = FileSystem.readFile(file);
        if (!result.success) return `Ошибка: ${result.error}`;

        const content = result.content.split('\n').slice(0, lines).join('\n');
        return `head -${lines} ${file}:\n${content}`;
    },

    tail: (args) => {
        if (!args[0]) return "Использование: tail [файл] или tail -n [число] [файл]";

        let lines = 10;
        let file = args[0];

        if (args[0] === '-n' && args[1]) {
            lines = parseInt(args[1]) || 10;
            file = args[2];
        }

        if (!file) return "Использование: tail [файл] или tail -n [число] [файл]";

        const result = FileSystem.readFile(file);
        if (!result.success) return `Ошибка: ${result.error}`;

        const allLines = result.content.split('\n');
        const content = allLines.slice(-lines).join('\n');
        return `tail -${lines} ${file}:\n${content}`;
    },
    diff: (args) => {
        if (args.length < 2) return "Использование: diff [файл1] [файл2]";

        const file1 = FileSystem.readFile(args[0]);
        const file2 = FileSystem.readFile(args[1]);

        if (!file1.success) return `Ошибка: ${file1.error}`;
        if (!file2.success) return `Ошибка: ${file2.error}`;

        const lines1 = file1.content.split('\n');
        const lines2 = file2.content.split('\n');

        let output = `Сравнение: ${args[0]} и ${args[1]}\n`;
        output += '-'.repeat(60) + '\n';

        const maxLines = Math.max(lines1.length, lines2.length);

        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1 !== line2) {
                output += `${i + 1}: - ${line1}\n`;
                output += `${i + 1}: + ${line2}\n`;
                output += '---\n';
            }
        }

        return output;
    },
    tar: (args) => {
        if (args.length < 2) return "Использование: tar -czf архив.tar.gz файлы...";

        const operation = args[0];
        const archiveName = args[1];
        const files = args.slice(2);

        if (operation === '-czf') {
            // Создание архива
            let archiveContent = `=== DARKCORE TAR ARCHIVE ===\n`;
            archiveContent += `Created: ${new Date().toISOString()}\n`;
            archiveContent += `Files: ${files.length}\n`;
            archiveContent += '='.repeat(50) + '\n\n';

            for (const file of files) {
                const result = FileSystem.readFile(file);
                if (result.success) {
                    archiveContent += `=== FILE: ${file} ===\n`;
                    archiveContent += `Size: ${result.content.length}\n`;
                    archiveContent += '-'.repeat(40) + '\n';
                    archiveContent += result.content + '\n\n';
                }
            }

            FileSystem.writeFile(archiveName, archiveContent);
            return `Архив создан: ${archiveName}`;
        }

        if (operation === '-xzf') {
            // Распаковка архива
            const result = FileSystem.readFile(archiveName);
            if (!result.success) return `Ошибка: ${result.error}`;

            // Простая парсинг архива
            const lines = result.content.split('\n');
            let currentFile = null;
            let fileContent = [];
            let inFile = false;

            for (const line of lines) {
                if (line.startsWith('=== FILE: ')) {
                    if (currentFile) {
                        FileSystem.writeFile(currentFile, fileContent.join('\n'));
                    }
                    currentFile = line.replace('=== FILE: ', '').replace(' ===', '');
                    fileContent = [];
                    inFile = false;
                } else if (line.startsWith('---')) {
                    inFile = true;
                } else if (inFile && line.trim() !== '') {
                    fileContent.push(line);
                }
            }

            if (currentFile) {
                FileSystem.writeFile(currentFile, fileContent.join('\n'));
            }

            return `Архив распакован: ${archiveName}`;
        }

        return "Поддерживаемые операции: -czf (создать), -xzf (распаковать)";
    },
    download: (args) => {
        if (!args[0]) return "Использование: download [файл]";

        const result = FileSystem.readFile(args[0]);
        if (!result.success) return `Ошибка: ${result.error}`;

        // Создаем ссылку для скачивания
        const blob = new Blob([result.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = args[0].split('/').pop() || 'file.txt';
        a.click();

        return `Файл ${args[0]} подготовлен для скачивания`;
    },

    upload: () => {
        // Создаем input для загрузки файла
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const filename = `uploaded_${file.name}`;
                FileSystem.writeFile(`/tmp/${filename}`, content);
                Terminal.print(`Загружен файл: /tmp/${filename}`);
            };
            reader.readAsText(file);
        };
        input.click();

        return "Выберите файл для загрузки...";
    },

    // =========================================================================
    // EDITOR COMMANDS - команды редактора
    // =========================================================================

    nano: (args) => {
        if (!args[0]) {
            return "Использование: nano [файл]";
        }

        Editor.enter(args[0]);
        return "";
    },

    edit: (args) => {
        if (!args[0]) {
            return "Использование: edit [файл]";
        }

        // Если файл не существует, создаем его
        if (!FileSystem.exists(args[0])) {
            FileSystem.touch(args[0]);
        }

        Editor.enter(args[0]);
        return "";
    },

    // =========================================================================
    // SYSTEM COMMANDS - системные команды
    // =========================================================================

    whoami: () => {
        return 'user';
    },

    users: () => {
        return `
Пользователи системы:
====================
root    - Суперпользователь
user    - Основной пользователь (вы)
guest   - Гостевой доступ (заблокирован)
`;
    },

    processes: () => {
        const processes = [
            { pid: 1, name: 'init', user: 'root', cpu: '0.1%', mem: '128K' },
            { pid: 42, name: 'terminal', user: 'user', cpu: '2.5%', mem: '256K' },
            { pid: 43, name: 'filesystem', user: 'root', cpu: '0.5%', mem: '192K' },
            { pid: 44, name: 'crt_effects', user: 'user', cpu: '1.2%', mem: '64K' }
        ];

        let output = 'Процессы DarkCore:\n';
        output += 'PID   Имя           Пользователь   CPU    Память\n';
        output += '-------------------------------------------------\n';

        for (const proc of processes) {
            output += `${proc.pid.toString().padEnd(6)} ${proc.name.padEnd(14)} ${proc.user.padEnd(14)} ${proc.cpu.padEnd(7)} ${proc.mem}\n`;
        }

        return output;
    },

    reboot: () => {
        Terminal.print('[SYSTEM] Перезагрузка системы...');
        setTimeout(() => {
            Terminal.output.innerHTML = '';
            Terminal.print(Terminal.getBanner());
            Terminal.print('[SYSTEM] Перезагрузка завершена.');
            FileSystem.cd('~');
        }, 1000);

        return '';
    },

    shutdown: () => {
        Terminal.print('[SYSTEM] Выключение системы...');
        Terminal.print('[SYSTEM] Файловая система сохранена.');
        Terminal.print('[SYSTEM] Все процессы остановлены.');

        // В реальном приложении здесь можно закрыть вкладку
        // window.close(); // Не работает без user gesture

        return 'Для полного выключения закройте вкладку браузера.';
    },

    exportfs: () => {
        const exportData = FileSystem.exportFS();
        const json = JSON.stringify(exportData, null, 2);

        // Создаем временный файл с экспортом
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `darkcore_export_${timestamp}.json`;

        FileSystem.writeFile(`/tmp/${filename}`, json);

        return `Файловая система экспортирована в /tmp/${filename}\nИспользуйте cat /tmp/${filename} для просмотра.`;
    },

    importfs: (args) => {
        if (!args[0]) {
            return "Использование: importfs [json]\nПример: importfs '{\"filesystem\": {...}}'";
        }

        try {
            const data = JSON.parse(args.join(' '));
            const result = FileSystem.importFS(data);

            if (result.success) {
                return 'Файловая система успешно импортирована.';
            } else {
                return `Ошибка импорта: ${result.error}`;
            }
        } catch (error) {
            return `Ошибка парсинга JSON: ${error.message}`;
        }
    },

    resetfs: () => {
        const result = FileSystem.reset();
        return result.success ? result.message : `Ошибка: ${result.error}`;
    },

    // =========================================================================
    // ALIASES - псевдонимы
    // =========================================================================

    ll: (args) => {
        // Псевдоним для ls -la
        return Commands.ls(['-la', ...args]);
    },

    '..': () => {
        return Commands.cd(['..']);
    },

    '...': () => {
        return Commands.cd(['../..']);
    },

    '~': () => {
        return Commands.cd(['~']);
    },

    // =========================================================================
    // OTHER COMMANDS - прочие команды
    // =========================================================================

    history: () => {
        if (Terminal.history.length === 0) {
            return "История команд пуста.";
        }

        let output = 'История команд:\n';
        output += '№   Команда\n';
        output += '-----------\n';

        Terminal.history.forEach((cmd, index) => {
            output += `${(index + 1).toString().padEnd(4)} ${cmd}\n`;
        });

        return output;
    },

    glitch: () => {
        for(let i = 0; i < 5; i++) {
            setTimeout(Visuals.randomGlitch, i * 100);
        }
        return "Тест визуальных эффектов...";
    },
    quest: (args) => {
        if (!args[0]) {
            return `Использование: quest [команда]
Доступные команды:
  start  - Начать новый квест (Dark Fantasy 80s)
  load   - Загрузить сохранение
  save   - Сохранить прогресс
  help   - Помощь по квесту
  exit   - Выйти из квеста

Dark Quest - текстовый квест в стиле dark fantasy фильмов 80-х!
Пиксель-арт, мрачная атмосфера, несколько концовок.`;
        }

        switch(args[0].toLowerCase()) {
            case 'start':
                return DarkQuest.init();
            case 'load':
                return DarkQuest.load();
            case 'save':
                return DarkQuest.save();
            case 'help':
                return DarkQuest.getHelp();
            case 'exit':
                return DarkQuest.exit();
            default:
                return `Неизвестная команда квеста: ${args[0]}`;
        }
    },
};

// Псевдонимы для совместимости со старыми командами
Commands.ls['-la'] = (args) => {
    // Здесь можно добавить специальную обработку для -la
    return Commands.ls(args);
};

window.Commands = Commands;