/* ============================================================================
   ENHANCED NANO EDITOR v2.0
   Улучшенный редактор с подтверждениями и автодополнением
   ============================================================================ */

const Editor = {
    // Состояние редактора
    nanoMode: false,
    nanoFile: null,
    nanoBuffer: [],
    cursor: { row: 0, col: 0 },
    originalContent: "",

    // Состояние подтверждения
    confirmationMode: false,
    confirmationAction: null, // 'exit', 'exitWithoutSave', 'discard'
    confirmationMessage: "",

    // Вход в режим редактора
    enter(file) {
        const resolvedPath = FileSystem.resolvePath(file);

        // Проверить, существует ли файл
        if (FileSystem.exists(resolvedPath)) {
            const readResult = FileSystem.readFile(resolvedPath);

            if (!readResult.success) {
                Terminal.print(`Ошибка: ${readResult.error}`);
                return;
            }

            this.nanoBuffer = readResult.content.split("\n");
            this.originalContent = readResult.content;
        } else {
            // Создать новый файл
            this.nanoBuffer = [""];
            this.originalContent = "";
        }

        this.nanoMode = true;
        this.confirmationMode = false;
        this.nanoFile = resolvedPath;
        this.cursor = { row: 0, col: this.nanoBuffer[0]?.length || 0 };

        this.display();
    },

    // Получить имя файла из пути
    getFileName(path) {
        const parts = path.split('/').filter(p => p);
        return parts.length > 0 ? parts[parts.length - 1] : path;
    },

    // Отображение содержимого редактора с курсором
    display() {
        Terminal.output.innerHTML = "";

        if (this.confirmationMode) {
            this.displayConfirmation();
            return;
        }

        Terminal.print(`\n┌─[ NANO: ${this.getFileName(this.nanoFile)} ]${'─'.repeat(40)}┐`);
        Terminal.print("│ Ctrl+S: Сохранить   Ctrl+X: Выход        │");
        Terminal.print("│ Стрелки: Навигация  Enter: Новая строка │");
        Terminal.print(`└${'─'.repeat(54)}┘\n`);

        // Показать номер строки и содержимое
        const startLine = Math.max(0, this.cursor.row - 10);
        const endLine = Math.min(this.nanoBuffer.length, startLine + 20);

        for (let i = startLine; i < endLine; i++) {
            let lineNum = (i + 1).toString().padStart(3, ' ');

            if (i === this.cursor.row) {
                // Показываем курсор на текущей строке
                let beforeCursor = this.nanoBuffer[i].substring(0, this.cursor.col);
                let afterCursor = this.nanoBuffer[i].substring(this.cursor.col);
                Terminal.print(`${lineNum}  ${beforeCursor}<span class="cursor">█</span>${afterCursor}`);
            } else {
                Terminal.print(`${lineNum}  ${this.nanoBuffer[i]}`);
            }
        }

        // Статистика
        const totalLines = this.nanoBuffer.length;
        const currentLine = this.cursor.row + 1;
        const currentCol = this.cursor.col + 1;
        const fileSize = this.nanoBuffer.join("\n").length;

        Terminal.print(`\n┌${'─'.repeat(54)}┐`);
        Terminal.print(`│ Строка ${currentLine}/${totalLines}, Колонка ${currentCol} │ Размер: ${fileSize} байт │`);
        Terminal.print(`└${'─'.repeat(54)}┘`);

        // Предупреждение о несохранённых изменениях
        const newContent = this.nanoBuffer.join("\n");
        if (newContent !== this.originalContent) {
            Terminal.print(`\n[!] Есть несохранённые изменения. Ctrl+S для сохранения.`);
        }
    },

    // Отображение окна подтверждения
    displayConfirmation() {
        Terminal.print(`\n┌─[ ПОДТВЕРЖДЕНИЕ ]${'─'.repeat(45)}┐`);
        Terminal.print(`│ ${this.confirmationMessage.padEnd(55)}│`);
        Terminal.print(`│${' '.repeat(57)}│`);
        Terminal.print(`│ [Y] Да    [N] Нет                                │`);
        Terminal.print(`└${'─'.repeat(57)}┘\n`);
        Terminal.print("Введите Y (Да) или N (Нет):");
    },

    // Запрос подтверждения
    askConfirmation(action, message) {
        this.confirmationMode = true;
        this.confirmationAction = action;
        this.confirmationMessage = message;
        this.display();
    },

    // Обработка ответа на подтверждение
    handleConfirmation(response) {
        this.confirmationMode = false;

        if (response === 'y' || response === 'Y' || response === 'д' || response === 'Д') {
            // Пользователь подтвердил
            switch (this.confirmationAction) {
                case 'exit':
                    this.performExit();
                    break;
                case 'exitWithoutSave':
                    this.performForceExit();
                    break;
                case 'discard':
                    this.discardChanges();
                    break;
            }
        } else {
            // Пользователь отказался
            this.display();
        }
    },

    // Обновление только курсора (без полной перерисовки)
    updateCursorDisplay() {
        this.display();
    },

    // Обработка нажатий клавиш в редакторе
    handleNanoKey(e) {
        // Режим подтверждения
        if (this.confirmationMode) {
            if (e.key === 'y' || e.key === 'Y' || e.key === 'д' || e.key === 'Д') {
                e.preventDefault();
                this.handleConfirmation('y');
                return;
            } else if (e.key === 'n' || e.key === 'N' || e.key === 'н' || e.key === 'Н') {
                e.preventDefault();
                this.handleConfirmation('n');
                return;
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.confirmationMode = false;
                this.display();
                return;
            }

            // Игнорируем другие клавиши в режиме подтверждения
            e.preventDefault();
            return;
        }

        // Навигация
        if (e.key === "ArrowUp") {
            e.preventDefault();
            this.moveCursor(-1, 0);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.moveCursor(1, 0);
            return;
        }

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            this.moveCursor(0, -1);
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            this.moveCursor(0, 1);
            return;
        }

        // Новая строка
        if (e.key === "Enter") {
            e.preventDefault();
            this.insertNewline();
            return;
        }

        // Backspace
        if (e.key === "Backspace") {
            e.preventDefault();
            this.backspace();
            return;
        }

        // Delete
        if (e.key === "Delete") {
            e.preventDefault();
            this.deleteChar();
            return;
        }

        // Home
        if (e.key === "Home") {
            e.preventDefault();
            this.cursor.col = 0;
            this.updateCursorDisplay();
            return;
        }

        // End
        if (e.key === "End") {
            e.preventDefault();
            this.cursor.col = this.nanoBuffer[this.cursor.row].length;
            this.updateCursorDisplay();
            return;
        }

        // Page Up
        if (e.key === "PageUp") {
            e.preventDefault();
            this.moveCursor(-10, 0);
            return;
        }

        // Page Down
        if (e.key === "PageDown") {
            e.preventDefault();
            this.moveCursor(10, 0);
            return;
        }

        // Сохранение
        if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            this.save();
            return;
        }

        // Выход с подтверждением
        if (e.ctrlKey && e.key.toLowerCase() === "x") {
            e.preventDefault();

            // Если в режиме редактора - выходим
            if (Editor.nanoMode) {
                // Если есть изменения, спрашиваем подтверждение
                const newContent = Editor.nanoBuffer.join("\n");
                if (newContent !== Editor.originalContent) {
                    Editor.askConfirmation(
                        'exit',
                        'Есть несохранённые изменения. Выйти без сохранения?'
                    );
                } else {
                    Editor.performExit();
                }
                return;
            }
        }

        // Ввод текста
        if (e.key.length === 1 && !e.ctrlKey) {
            e.preventDefault();
            this.insertText(e.key);
            return;
        }

        // Tab
        if (e.key === "Tab") {
            e.preventDefault();
            this.insertText("    ");
            return;
        }

        // Escape - отмена любых действий
        if (e.key === "Escape") {
            e.preventDefault();
            this.cancelOperations();
            return;
        }
    },

    // Запрос выхода с проверкой изменений
    requestExit() {
        const newContent = this.nanoBuffer.join("\n");

        if (newContent !== this.originalContent) {
            // Есть несохранённые изменения
            this.askConfirmation(
                'exit',
                'Есть несохранённые изменения. Выйти без сохранения?'
            );
        } else {
            // Нет изменений - просто выходим
            this.performExit();
        }
    },

    forceExit: function() {
        if (this.confirmationMode) {
            this.confirmationMode = false;
        }

        this.nanoMode = false;
        this.nanoFile = null;
        this.nanoBuffer = [];
        this.cursor = { row: 0, col: 0 };

        // Полная очистка вывода
        Terminal.output.innerHTML = "";
        Terminal.print("[ВЫХОД ИЗ РЕДАКТОРА БЕЗ СОХРАНЕНИЯ]");
        Terminal.cmd.value = "";
        Terminal.cmd.focus();

        // Обновляем каретку
        setTimeout(() => Terminal.updateCaretPosition(), 10);
    },

    // Выполнение выхода
    performExit: function() {
        this.nanoMode = false;
        this.confirmationMode = false;
        this.nanoFile = null;
        this.nanoBuffer = [];
        this.cursor = { row: 0, col: 0 };

        // Полная очистка вывода
        Terminal.output.innerHTML = "";
        Terminal.print("[ВЫХОД ИЗ РЕДАКТОРА]");
        Terminal.cmd.value = "";
        Terminal.cmd.focus();

        // Обновляем каретку
        setTimeout(() => Terminal.updateCaretPosition(), 10);
    },

    // Выход без сохранения (принудительный)
    performForceExit() {
        this.nanoMode = false;
        this.confirmationMode = false;
        this.nanoFile = null;
        this.nanoBuffer = [];
        this.cursor = { row: 0, col: 0 };
        Terminal.print("\n[ВЫХОД БЕЗ СОХРАНЕНИЯ]");
        Terminal.cmd.value = "";
        Terminal.cmd.focus();
    },

    // Отмена изменений
    discardChanges() {
        this.nanoBuffer = this.originalContent.split("\n");
        this.cursor = { row: 0, col: 0 };
        Terminal.print("\n[ИЗМЕНЕНИЯ ОТМЕНЕНЫ]");
        this.display();
    },

    // Отмена операций
    cancelOperations() {
        if (this.confirmationMode) {
            this.confirmationMode = false;
            this.display();
        } else {
            Terminal.print("\n[ОПЕРАЦИЯ ОТМЕНЕНА]");
        }
    },

    // Перемещение курсора
    moveCursor(rowDelta, colDelta) {
        let newRow = this.cursor.row + rowDelta;
        let newCol = this.cursor.col + colDelta;

        // Проверяем границы строк
        if (newRow < 0) newRow = 0;
        if (newRow >= this.nanoBuffer.length) newRow = this.nanoBuffer.length - 1;

        // Получаем текущую строку
        const currentLine = this.nanoBuffer[newRow];

        // Проверяем границы столбцов
        if (newCol < 0) {
            // Переход на предыдущую строку
            if (newRow > 0) {
                newRow--;
                newCol = this.nanoBuffer[newRow].length;
            } else {
                newCol = 0;
            }
        } else if (newCol > currentLine.length) {
            // Переход на следующую строку
            if (newRow < this.nanoBuffer.length - 1) {
                newRow++;
                newCol = 0;
            } else {
                newCol = currentLine.length;
            }
        }

        this.cursor = { row: newRow, col: newCol };
        this.updateCursorDisplay();
    },

    // Вставка текста
    insertText(text) {
        const line = this.nanoBuffer[this.cursor.row];
        const before = line.substring(0, this.cursor.col);
        const after = line.substring(this.cursor.col);

        this.nanoBuffer[this.cursor.row] = before + text + after;
        this.cursor.col += text.length;
        this.updateCursorDisplay();
    },

    // Вставка новой строки
    insertNewline() {
        const line = this.nanoBuffer[this.cursor.row];
        const before = line.substring(0, this.cursor.col);
        const after = line.substring(this.cursor.col);

        // Обновляем текущую строку
        this.nanoBuffer[this.cursor.row] = before;

        // Вставляем новую строку
        this.nanoBuffer.splice(this.cursor.row + 1, 0, after);

        // Перемещаем курсор
        this.cursor.row++;
        this.cursor.col = 0;

        this.updateCursorDisplay();
    },

    // Удаление символа (Backspace)
    backspace() {
        if (this.cursor.col > 0) {
            // Удаляем символ в текущей строке
            const line = this.nanoBuffer[this.cursor.row];
            const before = line.substring(0, this.cursor.col - 1);
            const after = line.substring(this.cursor.col);

            this.nanoBuffer[this.cursor.row] = before + after;
            this.cursor.col--;
        } else if (this.cursor.row > 0) {
            // Объединяем с предыдущей строкой
            const prevLine = this.nanoBuffer[this.cursor.row - 1];
            const currentLine = this.nanoBuffer[this.cursor.row];

            this.nanoBuffer[this.cursor.row - 1] = prevLine + currentLine;
            this.nanoBuffer.splice(this.cursor.row, 1);

            this.cursor.row--;
            this.cursor.col = prevLine.length;
        }

        this.updateCursorDisplay();
    },

    // Удаление символа (Delete)
    deleteChar() {
        const line = this.nanoBuffer[this.cursor.row];

        if (this.cursor.col < line.length) {
            // Удаляем символ после курсора
            const before = line.substring(0, this.cursor.col);
            const after = line.substring(this.cursor.col + 1);

            this.nanoBuffer[this.cursor.row] = before + after;
        } else if (this.cursor.row < this.nanoBuffer.length - 1) {
            // Объединяем со следующей строкой
            const currentLine = this.nanoBuffer[this.cursor.row];
            const nextLine = this.nanoBuffer[this.cursor.row + 1];

            this.nanoBuffer[this.cursor.row] = currentLine + nextLine;
            this.nanoBuffer.splice(this.cursor.row + 1, 1);
        }

        this.updateCursorDisplay();
    },

    // Сохранение файла
    save() {
        const newContent = this.nanoBuffer.join("\n");
        const result = FileSystem.writeFile(this.nanoFile, newContent);

        if (result.success) {
            this.originalContent = newContent;
            Terminal.print("\n[СОХРАНЕНО]");
        } else {
            Terminal.print(`\n[ОШИБКА: ${result.error}]`);
        }

        this.updateCursorDisplay();
    }
};

window.Editor = Editor;