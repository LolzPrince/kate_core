/* ===========================
   COMMAND DEFINITIONS
=========================== */

const Commands = {
    help: () => `
Доступные команды:
  help           показать эту справку
  clear          очистить экран
  echo [text]    вывести текст
  time           показать время системы
  ls             список файлов
  cat [file]     просмотреть файл
  nano [file]    открыть редактор
  write [file]   создать пустой файл
  rm [file]      удалить файл
  about          информация о системе
  banner         показать баннер
  glitch         тест визуальных эффектов
  files          детальная информация о файлах
  history        показать историю команд
  edit [file]    создать/редактировать файл

Редактор Nano:
  Ctrl+S        сохранить файл
  Ctrl+X        выйти из редактора
  Стрелки       перемещение курсора
  Enter         новая строка
  Backspace     удалить символ
  Delete        удалить символ вперед
  Home/End      начало/конец строки
`,

    clear: () => Terminal.clear(),

    echo: (args) => args.join(" "),

    about: () => "DarkCore Terminal v2.1 — Эмуляция CRT монитора 80-х\nПостоянная файловая система, редактор nano, визуальные эффекты.",

    time: () => {
        const now = new Date();
        return `${now.toLocaleString()}\nСистемное время: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    },

    banner: () => Terminal.getBanner(),

    ls: () => {
        const files = Filesystem.list();
        if (files.length === 0) return "Каталог пуст.";
        return files.map(f => `📄 ${f}`).join('\n');
    },

    cat: (args) => {
        if (!args[0]) return "Использование: cat [имя_файла]";
        const content = Filesystem.read(args[0]);
        if (content === undefined) return "Файл не найден.";
        return content;
    },

    write: (args) => {
        if (!args[0]) return "Использование: write [имя_файла]";
        Filesystem.write(args[0]);
        return `Создан файл: ${args[0]}`;
    },

    edit: (args) => {
        if (!args[0]) return "Использование: edit [имя_файла]";
        Filesystem.write(args[0], Filesystem.exists(args[0]) ? Filesystem.read(args[0]) : "");
        Editor.enter(args[0]);
        return "";
    },

    rm: (args) => {
        if (!args[0]) return "Использование: rm [имя_файла]";
        if (Filesystem.remove(args[0])) {
            return `Удалён: ${args[0]}`;
        }
        return "Файл не найден.";
    },

    nano: (args) => {
        if (!args[0]) return "Использование: nano [имя_файла]";
        Editor.enter(args[0]);
        return "";
    },

    glitch: () => {
        for(let i = 0; i < 5; i++) {
            setTimeout(Visuals.randomGlitch, i * 100);
        }
        return "Тест визуальных эффектов...";
    },

    files: () => {
        const files = Filesystem.list();
        if (files.length === 0) return "Нет файлов.";

        let output = "Файловая система:\n";
        output += "─".repeat(50) + "\n";

        files.forEach(file => {
            const info = Filesystem.getInfo(file);
            if (info) {
                output += `📄 ${info.name}\n`;
                output += `   Размер: ${info.size} байт\n`;
                output += `   Строк: ${info.lines}\n`;
                output += `─`.repeat(50) + "\n";
            }
        });

        return output;
    },

    history: () => {
        if (Terminal.history.length === 0) return "История команд пуста.";
        return Terminal.history.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
    }
};