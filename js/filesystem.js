/* ===========================
   FILESYSTEM MANAGER
=========================== */

const Filesystem = {
    fs: {},

    // Загрузка файловой системы из localStorage
    load() {
        const raw = localStorage.getItem("darkcore_fs");
        this.fs = raw ? JSON.parse(raw) : this.getDefaultFiles();
        return this.fs;
    },

    // Сохранение файловой системы
    save() {
        localStorage.setItem("darkcore_fs", JSON.stringify(this.fs));
    },

    // Файлы по умолчанию
    getDefaultFiles() {
        return {
            "readme.txt": `DarkCore Terminal v2.1 — CRT Edition
Система сохраняет файлы между сессиями.

Используйте nano для редактирования,
help для списка команд.`,

            "lore.txt": `В неоновых руинах кремниевой пустоши...
Кибер-маги дремлют в кэш-памяти древних серверов.
Терминал DarkCore — последний портал в забытые сети.
            
[СИСТЕМНЫЙ ЖУРНАЛ]
Дата: ${new Date().toLocaleDateString()}
Статус: ОПЕРАТИВНО`,

            "system.log": `Загрузка... [OK]
Память: 640K доступно
Видео: CGA эмуляция
Звук: PC Speaker [OFF]
Сеть: BBS подключение... [ERROR]

Статус: ОПЕРАТИВНО
Время загрузки: ${new Date().toLocaleTimeString()}`
        };
    },

    // Список файлов
    list() {
        return Object.keys(this.fs);
    },

    // Чтение файла
    read(filename) {
        return this.fs[filename];
    },

    // Запись файла
    write(filename, content = "") {
        this.fs[filename] = content;
        this.save();
        return filename;
    },

    // Удаление файла
    remove(filename) {
        if (this.fs[filename]) {
            delete this.fs[filename];
            this.save();
            return true;
        }
        return false;
    },

    // Проверка существования файла
    exists(filename) {
        return this.fs.hasOwnProperty(filename);
    },

    // Получение информации о файле
    getInfo(filename) {
        if (!this.exists(filename)) return null;

        const content = this.fs[filename];
        return {
            name: filename,
            size: content.length,
            lines: content.split('\n').length,
            created: localStorage.getItem(`darkcore_fs_created_${filename}`) || 'unknown'
        };
    }
};

// Инициализация файловой системы
Filesystem.load();