/* ===========================
   ENHANCED NANO EDITOR
=========================== */

const Editor = {
    nanoMode: false,
    nanoFile: null,
    nanoBuffer: [],
    cursor: { row: 0, col: 0 },
    originalContent: "",

    // Вход в режим редактора
    enter(file) {
        this.nanoMode = true;
        this.nanoFile = file;
        this.nanoBuffer = Filesystem.exists(file)
            ? Filesystem.read(file).split("\n")
            : [""];
        this.originalContent = this.nanoBuffer.join("\n");
        this.cursor = { row: 0, col: this.nanoBuffer[0]?.length || 0 };

        Terminal.print(`\n┌─[ NANO: ${file} ]────────────────────────────┐`);
        Terminal.print("│ Ctrl+S: Сохранить   Ctrl+X: Выход        │");
        Terminal.print("│ Стрелки: Навигация  Enter: Новая строка │");
        Terminal.print("└──────────────────────────────────────────┘\n");

        this.display();
        this.updateCursorDisplay();
    },

    // Отображение содержимого редактора с курсором
    display() {
        Terminal.output.innerHTML = "";
        Terminal.print(`┌─[ NANO: ${this.nanoFile} ]────────────────────────────┐`);
        Terminal.print("│ Ctrl+S: Сохранить   Ctrl+X: Выход        │");
        Terminal.print("│ Стрелки: Навигация  Enter: Новая строка │");
        Terminal.print("└──────────────────────────────────────────┘\n");

        this.nanoBuffer.forEach((line, i) => {
            let lineNum = (i + 1).toString().padStart(3, ' ');

            if (i === this.cursor.row) {
                // Показываем курсор на текущей строке
                let beforeCursor = line.substring(0, this.cursor.col);
                let afterCursor = line.substring(this.cursor.col);
                Terminal.print(`${lineNum}  ${beforeCursor}<span class="cursor">█</span>${afterCursor}`);
            } else {
                Terminal.print(`${lineNum}  ${line}`);
            }
        });

        Terminal.print(`\n[Строка ${this.cursor.row + 1}, Колонка ${this.cursor.col + 1} | Всего строк: ${this.nanoBuffer.length}]`);
    },

    // Обновление только курсора (без полной перерисовки)
    updateCursorDisplay() {
        // Для простоты перерисовываем весь экран
        this.display();
    },

    // Обработка нажатий клавиш в редакторе
    handleNanoKey(e) {
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

        // Сохранение
        if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            this.save();
            return;
        }

        // Выход
        if (e.ctrlKey && e.key.toLowerCase() === "x") {
            e.preventDefault();
            this.exit();
            return;
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
        Filesystem.write(this.nanoFile, newContent);

        // Проверяем изменения
        if (newContent !== this.originalContent) {
            Terminal.print("\n[СОХРАНЕНО]");
        } else {
            Terminal.print("\n[НЕТ ИЗМЕНЕНИЙ]");
        }

        this.originalContent = newContent;
        this.updateCursorDisplay();
    },

    // Выход из редактора
    exit() {
        const newContent = this.nanoBuffer.join("\n");

        // Проверяем наличие несохраненных изменений
        if (newContent !== this.originalContent) {
            Terminal.print("\n[НЕСОХРАНЕННЫЕ ИЗМЕНЕНИЯ!]");
            Terminal.print("Нажмите Ctrl+S для сохранения или Ctrl+X для выхода без сохранения");
            return;
        }

        this.nanoMode = false;
        this.nanoFile = null;
        this.nanoBuffer = [];
        this.cursor = { row: 0, col: 0 };
        Terminal.print("\n[ВЫХОД ИЗ РЕДАКТОРА]");
        Terminal.cmd.value = "";
        Terminal.cmd.focus();
    },

    // Быстрый выход без проверки
    forceExit() {
        this.nanoMode = false;
        this.nanoFile = null;
        this.nanoBuffer = [];
        this.cursor = { row: 0, col: 0 };
        Terminal.print("\n[ВЫХОД БЕЗ СОХРАНЕНИЯ]");
        Terminal.cmd.value = "";
        Terminal.cmd.focus();
    }
};