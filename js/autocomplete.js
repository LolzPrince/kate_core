/* ============================================================================
   AUTOCOMPLETE SYSTEM
   Система автодополнения путей и команд по Tab
   ============================================================================ */

const Autocomplete = {
    // История автодополнений
    completionHistory: {},

    // Инициализация
    init() {
        this.completionHistory = JSON.parse(localStorage.getItem('darkcore_completion_history') || '{}');
    },

    // Сохранение истории
    saveHistory() {
        localStorage.setItem('darkcore_completion_history', JSON.stringify(this.completionHistory));
    },

    // Получение текущего токена для автодополнения
    getCurrentToken(input, cursorPos) {
        // Получаем текст до курсора
        const textBeforeCursor = input.substring(0, cursorPos);

        // Разбиваем на слова
        const words = textBeforeCursor.split(/\s+/);
        const currentWord = words[words.length - 1];

        // Определяем, где начинается текущее слово
        const wordStart = textBeforeCursor.lastIndexOf(' ') + 1;

        return {
            word: currentWord,
            start: wordStart,
            end: cursorPos,
            isFirstWord: words.length === 1
        };
    },

    // Автодополнение команды или пути
    complete(input, cursorPos) {
        const token = this.getCurrentToken(input, cursorPos);

        if (!token.word) {
            return { input: input, cursorPos: cursorPos };
        }

        let completions = [];

        // Проверяем, является ли это командой (первое слово)
        if (token.isFirstWord) {
            completions = this.getCommandCompletions(token.word);
        } else {
            // Иначе это путь или аргумент
            completions = this.getPathCompletions(token.word);
        }

        if (completions.length === 0) {
            // Нет совпадений
            Terminal.print(`\n[Нет совпадений для: ${token.word}]`);
            return { input: input, cursorPos: cursorPos };
        } else if (completions.length === 1) {
            // Одно совпадение - автоматически дополняем
            return this.applyCompletion(input, token, completions[0]);
        } else {
            // Несколько совпадений - показываем список
            this.showCompletions(completions, token.word);
            return { input: input, cursorPos: cursorPos };
        }
    },

    // Получение автодополнений для команд
    getCommandCompletions(partial) {
        const commands = Object.keys(Commands);
        return commands.filter(cmd =>
            cmd.toLowerCase().startsWith(partial.toLowerCase())
        ).sort();
    },

    // Получение автодополнений для путей
    getPathCompletions(partial) {
        const completions = [];

        // Проверяем, является ли это путем
        if (partial.includes('/') || partial === '.' || partial === '..') {
            // Это путь - ищем файлы и каталоги
            const dirPath = this.getDirectoryFromPath(partial);
            const fileName = this.getFileNameFromPath(partial);

            try {
                const listResult = FileSystem.listDirectory(dirPath || '.');

                if (listResult.success) {
                    for (const item of listResult.items) {
                        if (item.name.toLowerCase().startsWith(fileName.toLowerCase())) {
                            let completion = dirPath ? `${dirPath}/${item.name}` : item.name;

                            // Добавляем / для каталогов
                            if (item.type === 'directory') {
                                completion += '/';
                            }

                            completions.push(completion);
                        }
                    }
                }
            } catch (error) {
                console.error('Error getting path completions:', error);
            }
        } else {
            // Просто имя файла в текущем каталоге
            const listResult = FileSystem.listDirectory('.');

            if (listResult.success) {
                for (const item of listResult.items) {
                    if (item.name.toLowerCase().startsWith(partial.toLowerCase())) {
                        let completion = item.name;

                        // Добавляем / для каталогов
                        if (item.type === 'directory') {
                            completion += '/';
                        }

                        completions.push(completion);
                    }
                }
            }
        }

        return completions.sort();
    },

    // Получение директории из пути
    getDirectoryFromPath(path) {
        if (path === '' || path === '.' || path === '..') {
            return '';
        }

        const lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) {
            return '';
        }

        return path.substring(0, lastSlash) || '/';
    },

    // Получение имени файла из пути
    getFileNameFromPath(path) {
        if (path === '' || path === '.' || path === '..') {
            return path;
        }

        const lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) {
            return path;
        }

        return path.substring(lastSlash + 1);
    },

    // Применение автодополнения
    applyCompletion(input, token, completion) {
        const beforeWord = input.substring(0, token.start);
        const afterWord = input.substring(token.end);

        const newInput = beforeWord + completion + afterWord;
        const newCursorPos = token.start + completion.length;

        // Запоминаем в истории
        this.recordCompletion(token.word, completion);

        return {
            input: newInput,
            cursorPos: newCursorPos
        };
    },

    // Показ списка автодополнений
    showCompletions(completions, partial) {
        if (completions.length > 20) {
            Terminal.print(`\n[Слишком много совпадений (${completions.length}). Уточните запрос.]`);
            return;
        }

        Terminal.print(`\nВозможные автодополнения для "${partial}":`);
        Terminal.print('-'.repeat(60));

        // Группируем по типам
        const dirs = completions.filter(c => c.endsWith('/'));
        const files = completions.filter(c => !c.endsWith('/'));

        if (dirs.length > 0) {
            Terminal.print('Каталоги:');
            this.printCompletionsGrid(dirs);
        }

        if (files.length > 0) {
            if (dirs.length > 0) Terminal.print('');
            Terminal.print('Файлы:');
            this.printCompletionsGrid(files);
        }

        Terminal.print(`\nВсего: ${completions.length} совпадений`);
        Terminal.print('Нажмите Tab ещё раз для циклического перебора');
    },

    // Вывод сетки автодополнений
    printCompletionsGrid(items, columns = 3) {
        const maxWidth = Math.max(...items.map(item => item.length)) + 2;
        const terminalWidth = 80; // Примерная ширина терминала
        const actualColumns = Math.min(columns, Math.floor(terminalWidth / maxWidth));

        for (let i = 0; i < items.length; i += actualColumns) {
            let row = '';
            for (let j = 0; j < actualColumns; j++) {
                const index = i + j;
                if (index < items.length) {
                    row += items[index].padEnd(maxWidth);
                }
            }
            Terminal.print(row);
        }
    },

    // Циклическое автодополнение
    cycleCompletions(input, cursorPos, direction = 'next') {
        const token = this.getCurrentToken(input, cursorPos);
        const historyKey = token.isFirstWord ? 'commands' : 'paths';

        if (!this.completionHistory[historyKey]) {
            this.completionHistory[historyKey] = {};
        }

        const wordHistory = this.completionHistory[historyKey][token.word] || [];

        if (wordHistory.length === 0) {
            // Нет истории - получаем новые совпадения
            let completions = [];

            if (token.isFirstWord) {
                completions = this.getCommandCompletions(token.word);
            } else {
                completions = this.getPathCompletions(token.word);
            }

            if (completions.length === 0) {
                return { input: input, cursorPos: cursorPos };
            }

            this.completionHistory[historyKey][token.word] = completions;
            this.saveHistory();
        }

        const completions = this.completionHistory[historyKey][token.word];
        const currentIndex = this.getCurrentCompletionIndex(input, token, completions);

        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % completions.length;
        } else {
            nextIndex = (currentIndex - 1 + completions.length) % completions.length;
        }

        return this.applyCompletion(input, token, completions[nextIndex]);
    },

    // Получение текущего индекса автодополнения
    getCurrentCompletionIndex(input, token, completions) {
        const currentText = input.substring(token.start, token.end);

        for (let i = 0; i < completions.length; i++) {
            if (completions[i] === currentText) {
                return i;
            }
        }

        // Если текущий текст не найден, ищем частичное совпадение
        for (let i = 0; i < completions.length; i++) {
            if (completions[i].startsWith(currentText)) {
                return i;
            }
        }

        return 0;
    },

    // Запись автодополнения в историю
    recordCompletion(partial, completion) {
        const historyKey = partial.includes('/') ? 'paths' : 'commands';

        if (!this.completionHistory[historyKey]) {
            this.completionHistory[historyKey] = {};
        }

        if (!this.completionHistory[historyKey][partial]) {
            this.completionHistory[historyKey][partial] = [];
        }

        // Добавляем в начало и удаляем дубликаты
        const history = this.completionHistory[historyKey][partial];
        const index = history.indexOf(completion);

        if (index !== -1) {
            history.splice(index, 1);
        }

        history.unshift(completion);

        // Ограничиваем размер истории
        if (history.length > 50) {
            history.pop();
        }

        this.saveHistory();
    },

    // Очистка истории автодополнений
    clearHistory() {
        this.completionHistory = {};
        this.saveHistory();
        return 'История автодополнений очищена.';
    },

    // Показать статистику истории
    showHistory() {
        let output = 'Статистика автодополнений:\n';
        output += '-'.repeat(40) + '\n';

        const commandCount = Object.keys(this.completionHistory.commands || {}).length;
        const pathCount = Object.keys(this.completionHistory.paths || {}).length;

        output += `Команд запомнено: ${commandCount}\n`;
        output += `Путей запомнено: ${pathCount}\n`;

        // Самые частые автодополнения
        if (commandCount > 0) {
            output += '\nЧасто используемые команды:\n';
            const commands = Object.entries(this.completionHistory.commands || {})
                .sort((a, b) => b[1].length - a[1].length)
                .slice(0, 5);

            commands.forEach(([cmd, history], index) => {
                output += `  ${index + 1}. ${cmd} (${history.length} раз)\n`;
            });
        }

        return output;
    }
};

// Инициализация при загрузке
Autocomplete.init();
window.Autocomplete = Autocomplete;