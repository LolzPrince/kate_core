/* ============================================================================
   CORE TERMINAL SYSTEM v2.1
   Основная система терминала с автодополнением
   ============================================================================ */

const Terminal = {
    // Глобальные переменные
    output: document.getElementById("output"),
    cmd: document.getElementById("cmd"),
    inputLine: document.getElementById("input-line"),
    prompt: document.getElementById("prompt"),
    caret: document.getElementById("caret"),

    // История команд
    history: [],
    historyPos: -1,

    // Состояние автодополнения
    tabPressCount: 0,
    lastTabTime: 0,
    currentCompletions: [],

    // Инициализация
    init() {
        this.print(this.getBanner());
        this.cmd.focus();

        // Убираем эффект включения CRT
        setTimeout(() => {
            document.body.classList.remove('crt-flash');
        }, 500);

        // Назначаем обработчики событий
        this.bindEvents();

        // Инициализируем позицию каретки
        this.updateCaretPosition();
    },

    // Вывод текста в консоль
    print(text) {
        this.output.innerHTML += text + "\n";
        this.output.scrollTop = this.output.scrollHeight;
    },

    // Очистка консоли
    clear() {
        this.output.innerHTML = "";
        return "";
    },

    // Получение баннера
    getBanner() {
        return `
   ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄  ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄
   █ ▄▄▄ █ █ ▄▄▄ █ █ ▄▄▄ █ █ ▄▄▄▄█ █ ▄▄▄ █ █ ▄▄▄ █
   █ ███ █ █ ███ █ █ ███ █ █ ████▀ █ ███ █ █ ███ █
   █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█ █▄▄▄▄▄█
   ▄▄▄▄▄▄▄ ▄ ▄ ▄ ▄▄▄▄▄ ▄ ▄▄▄ ▄▄▄ █ ▄▄▄▄▄▄▄ ▄▄▄▄▄ ▄
   █ ▄▄▄ █ ██ ▀▄█  ▄▄▀██ ██▀▄▀▄▀▄█ █ ▄▄▄ █ ▀█▄▄ ▀█
   █ ███ █▄██▄▀▄██▄▀▄▄▀▀▄▀▀ ▄███▄▀ █ ███ █ ▄▀▀▀██▄
   █▄▄▄▄▄█▄█▄█▄█▄▄▄██▄▄▄▄▄▄██▄▄▄██ █▄▄▄▄▄█▄█▄█▄█▄█

   DarkCore v2.1 — CRT Edition
   Загрузка завершена: ${new Date().toLocaleString()}
   Введите "help" для начала
   
   Подсказка: Нажмите Tab для автодополнения путей и команд
`;
    },

    // Обновление позиции каретки
    updateCaretPosition() {
        if (!this.caret || !this.cmd) return;

        // Создаём временный span для измерения текста
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            font: ${getComputedStyle(this.cmd).font};
            white-space: pre;
        `;

        // Получаем текст до курсора
        const textBeforeCaret = this.cmd.value.substring(0, this.cmd.selectionStart);
        tempSpan.textContent = textBeforeCaret;

        // Добавляем в DOM для измерения
        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.offsetWidth;

        // Убираем временный элемент
        document.body.removeChild(tempSpan);

        // Получаем позицию символа приглашения
        const promptRect = this.prompt.getBoundingClientRect();
        const inputLineRect = this.inputLine.getBoundingClientRect();

        // Вычисляем позицию каретки
        // Относительная позиция = ширина текста + отступ от промпта
        const relativePosition = textWidth;

        // Устанавливаем позицию каретки
        this.caret.style.left = `${promptRect.width + 12 + relativePosition}px`;
    },

    // Привязка обработчиков событий
    bindEvents() {
        // Фокус на поле ввода при клике
        document.addEventListener("mousedown", () => {
            this.cmd.focus();
        });

        // Обработка нажатий клавиш
        this.cmd.addEventListener("keydown", (e) => this.handleKeyDown(e));
        this.cmd.addEventListener("input", () => {
            Visuals.triggerRGBShift();
            this.updateCaretPosition(); // Обновляем позицию каретки при вводе
        });

        // Обновление позиции каретки при клике
        this.cmd.addEventListener("click", () => {
            this.updateCaretPosition();
        });

        // Обновление при изменении selection (стрелками, мышкой)
        this.cmd.addEventListener("select", () => this.updateCaretPosition());

        // Обновление при любом изменении
        this.cmd.addEventListener("keyup", () => this.updateCaretPosition());

        // Сохранение фокуса
        this.cmd.addEventListener("blur", () => {
            setTimeout(() => this.cmd.focus(), 10);
        });
    },

    // Обработка нажатий клавиш
    handleKeyDown(e) {
        // Режим редактора
        if (Editor.nanoMode) {
            Editor.handleNanoKey(e);
            return;
        }


        // Обработка Tab для автодополнения
        if (e.key === "Tab") {
            e.preventDefault();
            this.handleTabCompletion(e.shiftKey);
            return;
        }

        // RGB Shift эффект при любом нажатии клавиши
        if (e.key.length === 1 && !e.ctrlKey) {
            Visuals.triggerRGBShift();
        }

        // Навигация по истории
        if (e.key === "ArrowUp") {
            e.preventDefault();
            this.navigateHistory(-1);
            setTimeout(() => this.updateCaretPosition(), 10);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            this.navigateHistory(1);
            setTimeout(() => this.updateCaretPosition(), 10);
            return;
        }

        // Стрелки влево/вправо
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            // Позволяем стандартное поведение, но обновляем каретку
            setTimeout(() => this.updateCaretPosition(), 10);
            return;
        }

        // Выполнение команды
        if (e.key === "Enter") {
            this.executeCommand();
        }

        // Ctrl+X для выхода из редактора
        if (e.ctrlKey && e.key.toLowerCase() === "x" && Editor.nanoMode) {
            e.preventDefault();
            Editor.forceExit();
            return;
        }

        // Ctrl+L для очистки экрана
        if (e.ctrlKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            this.clear();
            return;
        }

        // Для всех других клавиш обновляем каретку
        if (!e.ctrlKey) {
            setTimeout(() => this.updateCaretPosition(), 10);
        }
    },

    // Обработка автодополнения по Tab
    handleTabCompletion(reverse = false) {
        const currentTime = Date.now();
        const input = this.cmd.value;
        const cursorPos = this.cmd.selectionStart;

        // Сбрасываем счетчик, если прошло больше 1 секунды
        if (currentTime - this.lastTabTime > 1000) {
            this.tabPressCount = 0;
        }

        this.lastTabTime = currentTime;

        let result;

        if (this.tabPressCount === 0) {
            // Первое нажатие Tab - пытаемся автодополнить
            result = Autocomplete.complete(input, cursorPos);
        } else {
            // Последующие нажатия - циклическое переключение
            const direction = reverse ? 'prev' : 'next';
            result = Autocomplete.cycleCompletions(input, cursorPos, direction);
        }

        // Обновляем поле ввода
        this.cmd.value = result.input;
        this.cmd.selectionStart = result.cursorPos;
        this.cmd.selectionEnd = result.cursorPos;

        // Увеличиваем счетчик нажатий Tab
        this.tabPressCount++;

        // Обновляем каретку
        this.updateCaretPosition();
    },

    // Навигация по истории команд
    navigateHistory(direction) {
        if (direction === -1 && this.historyPos > 0) {
            this.historyPos--;
        } else if (direction === 1 && this.historyPos < this.history.length - 1) {
            this.historyPos++;
        } else if (direction === 1) {
            this.historyPos = this.history.length;
        }

        this.cmd.value = this.history[this.historyPos] || "";
        this.updateCaretPosition();
    },

    // Выполнение команды
    executeCommand() {
        const raw = this.cmd.value.trim();
        this.print("❯ " + raw);

        if (!raw) {
            this.cmd.value = "";
            this.updateCaretPosition();
            return;
        }

        // Добавляем в историю
        this.history.push(raw);
        this.historyPos = this.history.length;

        // Сбрасываем счетчик Tab
        this.tabPressCount = 0;

        // Парсим команду
        const [name, ...args] = raw.split(" ");

        // Выполняем команду
        let result = "";
        if (Commands[name]) {
            result = Commands[name](args);
        } else {
            result = `Неизвестная команда: ${name}`;
        }

        // Выводим результат
        if (result) {
            this.print(result);
        }

        // Очищаем поле ввода
        this.cmd.value = "";
        this.updateCaretPosition();

        // Случайный эффект после выполнения команды
        if (Math.random() > 0.7) {
            setTimeout(Visuals.randomGlitch, 300);
        }
    }
};

window.Terminal = Terminal;