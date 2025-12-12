/* ============================================================================
   DARKCORE FILESYSTEM v2.0
   Полноценная виртуальная файловая система с иерархией каталогов
   ============================================================================ */

const FileSystem = {
    // Инициализация файловой системы
    init() {
        this.loadFromStorage();
        this.ensureDefaultStructure();
    },

    // Структура файловой системы
    fs: {
        '/': {
            type: 'directory',
            name: '/',
            children: {},
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            permissions: 'rwxr-xr-x',
            owner: 'root',
            size: 0
        }
    },

    // Текущий рабочий каталог
    currentPath: '/',

    // Корневая директория
    get root() {
        return this.fs['/'];
    },

    // Загрузка из localStorage
    loadFromStorage() {
        try {
            const savedFS = localStorage.getItem('darkcore_fs_v2');
            const savedPath = localStorage.getItem('darkcore_current_path');

            if (savedFS) {
                this.fs = JSON.parse(savedFS);
                // Восстанавливаем даты
                this.restoreDates(this.fs['/']);
            }

            if (savedPath) {
                this.currentPath = savedPath;
            }
        } catch (error) {
            console.error('Error loading filesystem:', error);
            this.createDefaultFS();
        }
    },

    // Восстановление дат после загрузки
    restoreDates(node) {
        if (node.created) node.created = new Date(node.created);
        if (node.modified) node.modified = new Date(node.modified);

        if (node.children) {
            for (const childName in node.children) {
                this.restoreDates(node.children[childName]);
            }
        }
    },

    // Сохранение в localStorage
    saveToStorage() {
        try {
            localStorage.setItem('darkcore_fs_v2', JSON.stringify(this.fs));
            localStorage.setItem('darkcore_current_path', this.currentPath);
        } catch (error) {
            console.error('Error saving filesystem:', error);
        }
    },

    // Создание файловой системы по умолчанию
    createDefaultFS() {
        this.fs = {
            '/': {
                type: 'directory',
                name: '/',
                children: {},
                created: new Date(),
                modified: new Date(),
                permissions: 'rwxr-xr-x',
                owner: 'root',
                size: 0
            }
        };

        this.createDefaultFiles();
    },

    // Файлы по умолчанию
    createDefaultFiles() {
        // Создаем стандартные директории
        this.mkdir('/home');
        this.mkdir('/home/user');
        this.mkdir('/home/user/documents');
        this.mkdir('/home/user/downloads');
        this.mkdir('/etc');
        this.mkdir('/var');
        this.mkdir('/var/log');
        this.mkdir('/tmp');
        this.mkdir('/bin');

        // Создаем системные файлы
        this.writeFile('/readme.txt',
            `DarkCore Terminal v2.1 — CRT Edition
========================================

Добро пожаловать в DarkCore Terminal!
Это виртуальная файловая система, которая сохраняется между сессиями.

Основные команды:
  help           - показать справку
  ls [путь]      - список файлов и каталогов
  cd [путь]      - сменить каталог
  pwd           - показать текущий каталог
  cat [файл]     - просмотреть файл
  nano [файл]    - редактировать файл
  mkdir [имя]    - создать каталог
  touch [файл]   - создать файл
  rm [путь]      - удалить файл или каталог
  cp [от] [до]   - копировать
  mv [от] [до]   - переместить/переименовать
  find [имя]     - найти файлы
  stat [путь]    - информация о файле
  chmod [права] [файл] - изменить права доступа
`);

        this.writeFile('/etc/motd',
            `╔══════════════════════════════════════════╗
║       DARKCORE TERMINAL v2.1          ║
║       CRT Edition                     ║
║                                        ║
║  Добро пожаловать в кибер-пустоши     ║
║  Загрузка завершена. Система готова.  ║
╚══════════════════════════════════════════╝`
        );

        this.writeFile('/home/user/.bashrc',
            '# Конфигурация терминала DarkCore\n' +
            '# Автоматически загружается при старте\n\n' +
            'alias ll="ls -la"\n' +
            'alias ..="cd .."\n' +
            'alias ...="cd ../.."\n' +
            'alias nano="nano --linenumbers"\n\n' +
            'export PS1="\\[\\e[32m\\]❯\\[\\e[0m\\] "\n' +
            'export EDITOR="nano"\n'
        );

        this.writeFile('/home/user/documents/lore.txt',
            `В неоновых руинах кремниевой пустоши...
Кибер-маги дремлют в кэш-памяти древних серверов.
Терминал DarkCore — последний портал в забытые сети.

[СИСТЕМНЫЙ ЖУРНАЛ]
Дата: ${new Date().toLocaleDateString()}
Версия: 2.1 CRT Edition
Статус: ОПЕРАТИВНО

[ИНФОРМАЦИЯ О СИСТЕМЕ]
Пользователь: user
Домашний каталог: /home/user
Дисковое пространство: 640K доступно`
        );

        this.writeFile('/var/log/system.log',
            `[${new Date().toLocaleString()}] Система загружена
[${new Date().toLocaleString()}] Инициализация файловой системы... OK
[${new Date().toLocaleString()}] Загрузка CRT эффектов... OK
[${new Date().toLocaleString()}] Инициализация терминала... OK
[${new Date().toLocaleString()}] Готов к работе`
        );

        // Исполняемые скрипты
        this.writeFile('/bin/hello',
            '#!/bin/darkcore\n' +
            'echo "Привет из DarkCore Terminal!"\n' +
            'echo "Текущее время: $(date)"\n' +
            'echo "Пользователь: $USER"\n'
        );

        this.writeFile('/bin/sysinfo',
            '#!/bin/darkcore\n' +
            'echo "=== DarkCore System Information ===\n"\n' +
            'echo "Версия: 2.1 CRT Edition"\n' +
            'echo "Дата сборки: 2024"\n' +
            'echo "Архитектура: x86_64"\n' +
            'echo "Память: 640K"\n' +
            'echo "Доступное дисковое пространство: 1024K"\n' +
            'echo "Текущий пользователь: $USER"\n'
        );

        this.saveToStorage();
    },

    // Убедиться, что структура по умолчанию существует
    ensureDefaultStructure() {
        if (!this.exists('/home/user')) {
            this.createDefaultFiles();
        }
    },

    // =========================================================================
    // PATH RESOLUTION - разрешение путей
    // =========================================================================

    // Получить абсолютный путь
    resolvePath(path) {
        if (!path) return this.currentPath;

        // Если путь уже абсолютный
        if (path.startsWith('/')) {
            return this.normalizePath(path);
        }

        // Относительный путь
        return this.normalizePath(this.currentPath + '/' + path);
    },

    // Нормализация пути (убрать //, ./ и ../)
    normalizePath(path) {
        // Убираем двойные слеши
        path = path.replace(/\/+/g, '/');

        // Обрабатываем . и ..
        const parts = path.split('/');
        const result = [];

        for (const part of parts) {
            if (part === '' || part === '.') {
                continue;
            } else if (part === '..') {
                if (result.length > 0) {
                    result.pop();
                }
            } else {
                result.push(part);
            }
        }

        return '/' + result.join('/');
    },

    // Получить родительский каталог
    getParentPath(path) {
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(p => p);

        if (parts.length === 0) return '/';

        parts.pop();
        return '/' + parts.join('/');
    },

    // Получить имя файла из пути
    getFileName(path) {
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/').filter(p => p);

        if (parts.length === 0) return '';
        return parts[parts.length - 1];
    },

    // =========================================================================
    // NODE OPERATIONS - операции с узлами файловой системы
    // =========================================================================

    // Получить узел по пути
    getNode(path) {
        const normalized = this.resolvePath(path);

        if (normalized === '/') {
            return this.root;
        }

        const parts = normalized.split('/').filter(p => p);
        let currentNode = this.root;

        for (const part of parts) {
            if (!currentNode.children || !currentNode.children[part]) {
                return null;
            }
            currentNode = currentNode.children[part];
        }

        return currentNode;
    },

    // Проверить существование пути
    exists(path) {
        return this.getNode(path) !== null;
    },

    // Проверить, является ли путь директорией
    isDirectory(path) {
        const node = this.getNode(path);
        return node && node.type === 'directory';
    },

    // Проверить, является ли путь файлом
    isFile(path) {
        const node = this.getNode(path);
        return node && node.type === 'file';
    },

    // =========================================================================
    // FILE OPERATIONS - операции с файлами
    // =========================================================================

    // Создать файл (touch)
    touch(path, content = '') {
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const fileName = this.getFileName(resolvedPath);

        // Проверить существование родительского каталога
        if (!this.exists(parentPath) || !this.isDirectory(parentPath)) {
            return { success: false, error: `Каталог не существует: ${parentPath}` };
        }

        const parentNode = this.getNode(parentPath);

        // Проверить, не существует ли уже файл/каталог с таким именем
        if (parentNode.children && parentNode.children[fileName]) {
            // Если существует, просто обновляем время модификации
            parentNode.children[fileName].modified = new Date();
            this.saveToStorage();
            return { success: true, message: `Время модификации обновлено: ${fileName}` };
        }

        // Создать новый файл
        const newNode = {
            type: 'file',
            name: fileName,
            content: content,
            created: new Date(),
            modified: new Date(),
            permissions: 'rw-r--r--',
            owner: 'user',
            size: content.length
        };

        if (!parentNode.children) parentNode.children = {};
        parentNode.children[fileName] = newNode;

        // Обновить размер родительского каталога
        this.updateDirectorySize(parentPath);

        this.saveToStorage();
        return { success: true, message: `Создан файл: ${fileName}` };
    },

    // Записать в файл
    writeFile(path, content) {
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const fileName = this.getFileName(resolvedPath);

        // Проверить существование родительского каталога
        if (!this.exists(parentPath) || !this.isDirectory(parentPath)) {
            return { success: false, error: `Каталог не существует: ${parentPath}` };
        }

        const parentNode = this.getNode(parentPath);

        // Если файл существует, обновить его
        if (parentNode.children && parentNode.children[fileName]) {
            const fileNode = parentNode.children[fileName];

            if (fileNode.type !== 'file') {
                return { success: false, error: `${fileName} не является файлом` };
            }

            fileNode.content = content;
            fileNode.modified = new Date();
            fileNode.size = content.length;

            this.updateDirectorySize(parentPath);
            this.saveToStorage();
            return { success: true, message: `Файл обновлен: ${fileName}` };
        }

        // Создать новый файл
        return this.touch(resolvedPath, content);
    },

    // Прочитать файл
    readFile(path) {
        const node = this.getNode(path);

        if (!node) {
            return { success: false, error: `Файл не существует: ${path}` };
        }

        if (node.type !== 'file') {
            return { success: false, error: `${path} не является файлом` };
        }

        return { success: true, content: node.content, node: node };
    },

    // Удалить файл
    rm(path) {
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const fileName = this.getFileName(resolvedPath);

        const parentNode = this.getNode(parentPath);

        if (!parentNode || !parentNode.children || !parentNode.children[fileName]) {
            return { success: false, error: `Файл не существует: ${fileName}` };
        }

        const node = parentNode.children[fileName];

        // Проверить, не является ли это директорией (для директорий нужна рекурсивная проверка)
        if (node.type === 'directory' && node.children && Object.keys(node.children).length > 0) {
            return { success: false, error: `Каталог не пустой: ${fileName}. Используйте rm -r для удаления каталогов.` };
        }

        // Удалить узел
        delete parentNode.children[fileName];

        // Обновить размер родительского каталога
        this.updateDirectorySize(parentPath);

        this.saveToStorage();
        return { success: true, message: `Удален: ${fileName}` };
    },

    // Рекурсивное удаление
    rmRecursive(path) {
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const fileName = this.getFileName(resolvedPath);

        const parentNode = this.getNode(parentPath);

        if (!parentNode || !parentNode.children || !parentNode.children[fileName]) {
            return { success: false, error: `Не существует: ${fileName}` };
        }

        const node = parentNode.children[fileName];

        // Рекурсивно удалить дочерние элементы для директорий
        if (node.type === 'directory' && node.children) {
            for (const childName in node.children) {
                const childPath = resolvedPath + '/' + childName;
                this.rmRecursive(childPath);
            }
        }

        // Удалить узел
        delete parentNode.children[fileName];

        // Обновить размер родительского каталога
        this.updateDirectorySize(parentPath);

        this.saveToStorage();
        return { success: true, message: `Удалено рекурсивно: ${fileName}` };
    },

    // =========================================================================
    // DIRECTORY OPERATIONS - операции с каталогами
    // =========================================================================

    // Создать каталог
    mkdir(path) {
        const resolvedPath = this.resolvePath(path);
        const parentPath = this.getParentPath(resolvedPath);
        const dirName = this.getFileName(resolvedPath);

        // Проверить существование родительского каталога
        if (!this.exists(parentPath) || !this.isDirectory(parentPath)) {
            return { success: false, error: `Каталог не существует: ${parentPath}` };
        }

        const parentNode = this.getNode(parentPath);

        // Проверить, не существует ли уже файл/каталог с таким именем
        if (parentNode.children && parentNode.children[dirName]) {
            return { success: false, error: `Уже существует: ${dirName}` };
        }

        // Создать новый каталог
        const newDir = {
            type: 'directory',
            name: dirName,
            children: {},
            created: new Date(),
            modified: new Date(),
            permissions: 'rwxr-xr-x',
            owner: 'user',
            size: 0
        };

        if (!parentNode.children) parentNode.children = {};
        parentNode.children[dirName] = newDir;

        // Обновить размер родительского каталога
        this.updateDirectorySize(parentPath);

        this.saveToStorage();
        return { success: true, message: `Создан каталог: ${dirName}` };
    },

    // Список содержимого каталога
    listDirectory(path = '.') {
        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(resolvedPath);

        if (!node) {
            return { success: false, error: `Каталог не существует: ${resolvedPath}` };
        }

        if (node.type !== 'directory') {
            return { success: false, error: `Не является каталогом: ${resolvedPath}` };
        }

        const items = [];

        if (node.children) {
            for (const childName in node.children) {
                const child = node.children[childName];
                items.push({
                    name: childName,
                    type: child.type,
                    size: child.size || 0,
                    modified: child.modified,
                    permissions: child.permissions,
                    owner: child.owner
                });
            }
        }

        // Сортировка: сначала директории, потом файлы, по алфавиту
        items.sort((a, b) => {
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;
            return a.name.localeCompare(b.name);
        });

        return { success: true, items: items, path: resolvedPath };
    },

    // Сменить текущий каталог
    cd(path) {
        if (!path || path === '~') {
            this.currentPath = '/home/user';
            this.saveToStorage();
            return { success: true, message: `Текущий каталог: ${this.currentPath}` };
        }

        if (path === '-') {
            // В будущем можно реализовать историю каталогов
            return { success: false, error: 'История каталогов не реализована' };
        }

        const resolvedPath = this.resolvePath(path);
        const node = this.getNode(resolvedPath);

        if (!node) {
            return { success: false, error: `Каталог не существует: ${resolvedPath}` };
        }

        if (node.type !== 'directory') {
            return { success: false, error: `Не является каталогом: ${resolvedPath}` };
        }

        this.currentPath = resolvedPath;
        this.saveToStorage();
        return { success: true, message: `Текущий каталог: ${this.currentPath}` };
    },

    // Показать текущий каталог
    pwd() {
        return this.currentPath;
    },

    // =========================================================================
    // COPY/MOVE OPERATIONS - операции копирования и перемещения
    // =========================================================================

    // Копировать файл или каталог
    cp(source, destination) {
        const sourcePath = this.resolvePath(source);
        const destPath = this.resolvePath(destination);

        const sourceNode = this.getNode(sourcePath);
        if (!sourceNode) {
            return { success: false, error: `Источник не существует: ${sourcePath}` };
        }

        // Если получатель - каталог, копируем в него
        let targetPath = destPath;
        const destNode = this.getNode(destPath);

        if (destNode && destNode.type === 'directory') {
            const sourceName = this.getFileName(sourcePath);
            targetPath = destPath + '/' + sourceName;
        }

        // Проверить, существует ли уже цель
        if (this.exists(targetPath)) {
            return { success: false, error: `Уже существует: ${targetPath}` };
        }

        // Глубокое копирование узла
        const copy = this.deepCopyNode(sourceNode);
        copy.name = this.getFileName(targetPath);

        // Вставить копию в файловую систему
        const parentPath = this.getParentPath(targetPath);
        const parentNode = this.getNode(parentPath);
        const fileName = this.getFileName(targetPath);

        if (!parentNode.children) parentNode.children = {};
        parentNode.children[fileName] = copy;

        // Обновить размер родительского каталога
        this.updateDirectorySize(parentPath);

        this.saveToStorage();
        return { success: true, message: `Скопировано: ${sourcePath} -> ${targetPath}` };
    },

    // Переместить/переименовать
    mv(source, destination) {
        const sourcePath = this.resolvePath(source);
        const destPath = this.resolvePath(destination);

        // Сначала копируем
        const copyResult = this.cp(source, destination);
        if (!copyResult.success) {
            return copyResult;
        }

        // Затем удаляем оригинал
        const deleteResult = this.rm(sourcePath);
        if (!deleteResult.success) {
            // Если не удалось удалить, откатываем копирование
            const targetPath = this.resolvePath(destination);
            this.rm(targetPath);
            return { success: false, error: `Не удалось переместить: ${deleteResult.error}` };
        }

        return { success: true, message: `Перемещено: ${sourcePath} -> ${destPath}` };
    },

    // Глубокое копирование узла
    deepCopyNode(node) {
        const copy = JSON.parse(JSON.stringify(node));

        // Восстанавливаем даты
        copy.created = new Date();
        copy.modified = new Date();

        // Рекурсивно копируем детей для директорий
        if (copy.type === 'directory' && copy.children) {
            const childrenCopy = {};
            for (const childName in copy.children) {
                childrenCopy[childName] = this.deepCopyNode(copy.children[childName]);
            }
            copy.children = childrenCopy;
        }

        return copy;
    },

    // =========================================================================
    // SEARCH OPERATIONS - операции поиска
    // =========================================================================

    // Найти файлы
    find(pattern, startPath = '.') {
        const startNode = this.getNode(this.resolvePath(startPath));
        if (!startNode || startNode.type !== 'directory') {
            return { success: false, error: `Неверный начальный каталог: ${startPath}` };
        }

        const results = [];
        this.searchRecursive(startNode, pattern, this.resolvePath(startPath), results);

        return { success: true, results: results };
    },

    // Рекурсивный поиск
    searchRecursive(node, pattern, currentPath, results, options = {}) {
        if (!node.children) return;

        for (const childName in node.children) {
            const child = node.children[childName];
            const childPath = currentPath === '/' ? `/${childName}` : `${currentPath}/${childName}`;

            let matches = false;

            // Проверка разных типов паттернов
            if (options.regex) {
                try {
                    const regex = new RegExp(pattern);
                    matches = regex.test(childName);
                } catch (e) {
                    matches = childName.includes(pattern);
                }
            } else if (pattern.startsWith('*') && pattern.endsWith('*')) {
                // *текст* - содержит текст
                const searchText = pattern.slice(1, -1);
                matches = childName.includes(searchText);
            } else if (pattern.endsWith('*')) {
                // текст* - начинается с текста
                const searchText = pattern.slice(0, -1);
                matches = childName.startsWith(searchText);
            } else if (pattern.startsWith('*')) {
                // *текст - заканчивается текстом
                const searchText = pattern.slice(1);
                matches = childName.endsWith(searchText);
            } else {
                matches = childName === pattern;
            }

            if (matches) {
                results.push({
                    path: childPath,
                    type: child.type,
                    size: child.size || 0,
                    modified: child.modified
                });
            }

            // Рекурсивный поиск в подкаталогах
            if (child.type === 'directory' && options.recursive !== false) {
                this.searchRecursive(child, pattern, childPath, results, options);
            }
        }
    },

    // Проверка соответствия паттерну
    matchesPattern(filename, pattern) {
        // Простая проверка на вхождение подстроки
        if (!pattern.includes('*') && !pattern.includes('?')) {
            return filename.includes(pattern);
        }

        // Конвертируем простой паттерн в регулярное выражение
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');

        try {
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(filename);
        } catch (error) {
            return filename.includes(pattern);
        }
    },

    // =========================================================================
    // PERMISSION OPERATIONS - операции с правами доступа
    // =========================================================================

    // Изменить права доступа
    chmod(mode, path) {
        const node = this.getNode(path);

        if (!node) {
            return { success: false, error: `Не существует: ${path}` };
        }

        // Проверка формата прав доступа
        if (!/^[0-7]{3}$|^[rwx-]{9}$/.test(mode)) {
            return { success: false, error: `Неверный формат прав доступа: ${mode}` };
        }

        // Если переданы цифры (например, 755), конвертируем в символьный формат
        if (/^[0-7]{3}$/.test(mode)) {
            node.permissions = this.numericToSymbolic(mode);
        } else {
            node.permissions = mode;
        }

        node.modified = new Date();
        this.saveToStorage();

        return { success: true, message: `Права изменены: ${path} -> ${node.permissions}` };
    },

    // Конвертация числового формата в символьный
    numericToSymbolic(numeric) {
        const permissions = {
            '0': '---',
            '1': '--x',
            '2': '-w-',
            '3': '-wx',
            '4': 'r--',
            '5': 'r-x',
            '6': 'rw-',
            '7': 'rwx'
        };

        const owner = permissions[numeric[0]] || '---';
        const group = permissions[numeric[1]] || '---';
        const others = permissions[numeric[2]] || '---';

        return owner + group + others;
    },

    // Показать информацию о файле
    stat(path) {
        const node = this.getNode(path);

        if (!node) {
            return { success: false, error: `Не существует: ${path}` };
        }

        return {
            success: true,
            info: {
                name: node.name,
                path: path,
                type: node.type,
                size: this.getSize(node),
                sizeHuman: this.formatSize(this.getSize(node)),
                created: node.created,
                modified: node.modified,
                permissions: node.permissions,
                owner: node.owner,
                inode: this.getInode(node)
            }
        };
    },

    // Получить размер узла (рекурсивно для директорий)
    getSize(node) {
        if (node.type === 'file') {
            return node.size || 0;
        }

        if (node.type === 'directory' && node.children) {
            let totalSize = 0;
            for (const childName in node.children) {
                totalSize += this.getSize(node.children[childName]);
            }
            return totalSize;
        }

        return 0;
    },

    // Обновить размер директории
    updateDirectorySize(path) {
        const node = this.getNode(path);
        if (!node || node.type !== 'directory') return;

        node.size = this.getSize(node);

        // Рекурсивно обновить размеры родительских директорий
        if (path !== '/') {
            const parentPath = this.getParentPath(path);
            this.updateDirectorySize(parentPath);
        }
    },

    // Форматирование размера
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    },

    // Генерация уникального идентификатора (для стаба)
    getInode(node) {
        return Math.floor(Math.random() * 1000000);
    },

    // =========================================================================
    // UTILITIES - утилиты
    // =========================================================================

    // Получить полный путь к домашней директории
    getHomeDirectory() {
        return '/home/user';
    },

    // Сброс файловой системы
    reset() {
        this.createDefaultFS();
        this.currentPath = '/home/user';
        this.saveToStorage();
        return { success: true, message: 'Файловая система сброшена к состоянию по умолчанию' };
    },

    // Экспорт файловой системы
    exportFS() {
        return {
            filesystem: this.fs,
            currentPath: this.currentPath,
            timestamp: new Date().toISOString()
        };
    },

    // Импорт файловой системы
    importFS(data) {
        try {
            this.fs = data.filesystem || this.fs;
            this.currentPath = data.currentPath || '/home/user';
            this.restoreDates(this.fs['/']);
            this.saveToStorage();
            return { success: true, message: 'Файловая система импортирована' };
        } catch (error) {
            return { success: false, error: 'Ошибка импорта: ' + error.message };
        }
    }
};

// Автоматическая инициализация при загрузке
FileSystem.init();

// Экспорт для использования в других модулях
window.FileSystem = FileSystem;