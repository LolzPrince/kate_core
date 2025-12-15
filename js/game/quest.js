/* ============================================================================
   DARK QUEST - Pixel Art Adventure
   Текстовый квест в стиле dark fantasy фильмов 80-х
   ============================================================================ */

const DarkQuest = {
    // Состояние игры
    gameState: {
        active: false,
        currentScene: 'intro',
        player: {
            name: 'Сэр Гаррет',
            health: 100,
            gold: 50,
            items: ['⚔️ Стальной меч', '🛡️ Родовой щит'],
            companions: [],
            reputation: 0,
            choices: []
        },
        story: {
            chapter: 1,
            time: 'ночь',
            location: 'Замок Штормгард',
            events: []
        },
        flags: {
            metWizard: false,
            foundKey: false,
            betrayedLord: false,
            dragonAlive: true,
            villageSaved: false
        }
    },

    // Сцены квеста (дерево решений)
    scenes: {
        intro: {
            title: "Ночь в Штормгарде",
            description: "1987 год. Вы - Сэр Гаррет, последний рыцарь Штормгарда. " +
                "Замок окружён туманом, а из подземелий доносятся странные звуки. " +
                "Старый лорд только что умер при загадочных обстоятельствах.",
            art: 'castle',
            choices: [
                {
                    text: "🔍 Исследовать покои лорда",
                    next: 'lord_chamber',
                    effect: 'addItem',
                    effectParam: '🗝️ Ключ от подземелья'
                },
                {
                    text: "🗡️ Спуститься в подземелье",
                    next: 'dungeon_entrance',
                    effect: 'updateHealth',
                    effectParam: -10
                },
                {
                    text: "🏃 Бежать из замка",
                    next: 'escape',
                    effect: 'addEvent',
                    effectParam: "Вы покинули замок как трус"
                }
            ]
        },

        lord_chamber: {
            title: "Покои Лорда",
            description: "В комнате царит беспорядок. На столе - недописанное письмо: " +
                "'Они пробудились... древние... пещеры...'. " +
                "В углу вы находите старый дневник и странный ключ.",
            art: 'castle',
            choices: [
                {
                    text: "📖 Прочитать дневник",
                    next: 'diary',
                    effect: 'addItem',
                    effectParam: '📜 Дневник лорда'
                },
                {
                    text: "🗝️ Использовать ключ",
                    next: 'secret_door',
                    effect: 'setFlag',
                    effectParam: ['foundKey', true]
                },
                {
                    text: "🔙 Вернуться в зал",
                    next: 'intro'
                }
            ]
        },

        diary: {
            title: "Дневник Лорда",
            description: "'Год 1986. Нашли древнюю пещеру под замком. Там что-то есть... " +
                "Оно шепчет по ночам. Гвардейцы сходят с ума. " +
                "Запечатал вход, но знаю - оно выберется.'",
            art: 'castle',
            choices: [
                {
                    text: "😱 Уничтожить дневник",
                    next: 'intro',
                    effect: 'removeItem',
                    effectParam: '📜 Дневник лорда'
                },
                {
                    text: "👣 Искать пещеру",
                    next: 'cave_search',
                    effect: 'addEvent',
                    effectParam: "Вы отправились на поиски пещеры"
                },
                {
                    text: "⚔️ Подготовиться к битве",
                    next: 'prepare',
                    effect: 'updateHealth',
                    effectParam: 20
                }
            ]
        },

        dungeon_entrance: {
            title: "Вход в Подземелье",
            description: "Сырость и запах гнили. Стены покрыты странными символами. " +
                "Вдалеке слышны шаги... или когти по камню?",
            art: 'dungeon',
            choices: [
                {
                    text: "🔦 Зажечь факел",
                    next: 'dungeon_deep',
                    effect: 'addItem',
                    effectParam: '🔥 Факел'
                },
                {
                    text: "👂 Прислушаться",
                    next: 'dungeon_sounds',
                    effect: 'addEvent',
                    effectParam: "Вы услышали странное бормотание"
                },
                {
                    text: "🏃 Отступить",
                    next: 'intro',
                    effect: 'addEvent',
                    effectParam: "Вы отступили из подземелья"
                }
            ]
        },

        dungeon_deep: {
            title: "Глубины Подземелья",
            description: "Факел освещает кости и ржавое оружие. " +
                "Перед вами - развилка: левый туннель пахнет серой, " +
                "правый - слышен звук воды.",
            art: 'dungeon',
            choices: [
                {
                    text: "⬅️ Идти налево",
                    next: 'lava_cave',
                    effect: 'updateHealth',
                    effectParam: -15
                },
                {
                    text: "➡️ Идти направо",
                    next: 'water_cave',
                    effect: 'addItem',
                    effectParam: '💎 Синий кристалл'
                },
                {
                    text: "📜 Прочитать символы",
                    next: 'symbols',
                    condition: () => this.hasItem('📜 Дневник лорда')
                }
            ]
        },

        lava_cave: {
            title: "Пещера Лавы",
            description: "Невыносимая жара. В центре пещеры - озеро лавы. " +
                "На островке посреди лавы что-то блестит.",
            art: 'cave',
            choices: [
                {
                    text: "🔥 Попытаться достать",
                    next: 'death_lava',
                    effect: 'gameOver',
                    effectParam: 'Вы упали в лаву'
                },
                {
                    text: "🧗 Искать обходной путь",
                    next: 'secret_path',
                    condition: () => this.gameState.player.health > 50
                },
                {
                    text: "🔙 Вернуться",
                    next: 'dungeon_deep'
                }
            ]
        },

        water_cave: {
            title: "Затопленная Пещера",
            description: "Здесь прохладно и влажно. В воде плавают светящиеся грибы. " +
                "Статуя древнего бога держит что-то в руках.",
            art: 'cave',
            choices: [
                {
                    text: "🤲 Взять предмет",
                    next: 'artifact',
                    effect: 'addItem',
                    effectParam: '👑 Корона древних'
                },
                {
                    text: "🙏 Помолиться статуе",
                    next: 'blessing',
                    effect: () => {
                        this.updateHealth(30);
                        this.addEvent("Статуя благословила вас");
                    }
                },
                {
                    text: "💧 Выпить воды",
                    next: 'poison_water',
                    effect: () => {
                        this.updateHealth(-40);
                        this.addEvent("Вода оказалась отравленной!");
                    }
                }
            ]
        },

        secret_door: {
            title: "Потайная Дверь",
            description: "Ключ подошёл! За дверью - библиотека запретных знаний. " +
                "Старый волшебник изучает древний фолиант.",
            art: 'castle',
            choices: [
                {
                    text: "🧙 Поговорить с волшебником",
                    next: 'wizard',
                    effect: 'setFlag',
                    effectParam: ['metWizard', true]
                },
                {
                    text: "📚 Украсть книгу",
                    next: 'steal_book',
                    effect: () => {
                        this.addItem('📖 Книга Теней');
                        this.updateReputation(-10);
                    }
                },
                {
                    text: "🚪 Закрыть дверь",
                    next: 'intro',
                    effect: 'addEvent',
                    effectParam: "Вы решили не искушать судьбу"
                }
            ]
        },

        wizard: {
            title: "Волшебник Мерлин",
            description: "'А, ещё один любопытный рыцарь! - говорит старик. - " +
                "Твой лорд был глупцом. Он разбудил того, кто должен был спать.'",
            art: 'castle',
            choices: [
                {
                    text: "❓ Спросить о древнем",
                    next: 'wizard_info',
                    effect: 'addEvent',
                    effectParam: "Вы узнали страшную правду"
                },
                {
                    text: "⚔️ Атаковать волшебника",
                    next: 'wizard_battle',
                    effect: 'addEvent',
                    effectParam: "Вы напали на волшебника"
                },
                {
                    text: "🤝 Предложить помощь",
                    next: 'wizard_alliance',
                    effect: () => {
                        this.addCompanion('🧙 Волшебник Мерлин');
                        this.updateReputation(15);
                    }
                }
            ]
        },

        wizard_info: {
            title: "Правда",
            description: "'Это дракон, но не простой. Древнее божество, спавшее под замком. " +
                "Лорд хотел использовать его силу. Теперь оно свободно.'",
            art: 'dragon',
            choices: [
                {
                    text: "🐉 Искать дракона",
                    next: 'dragon_lair',
                    effect: 'addEvent',
                    effectParam: "Вы отправились к логову дракона"
                },
                {
                    text: "🏃 Бежать",
                    next: 'escape',
                    effect: 'addEvent',
                    effectParam: "Вы сбежали от ужаса"
                },
                {
                    text: "🛡️ Подготовить оборону",
                    next: 'defense',
                    effect: 'updateHealth',
                    effectParam: 25
                }
            ]
        },

        dragon_lair: {
            title: "Логово Дракона",
            description: "Пещера размером с собор. В центре, на горе золота, спит чёрный дракон. " +
                "Его дыхание раскаляет воздух.",
            art: 'dragon',
            choices: [
                {
                    text: "⚔️ Атаковать спящего",
                    next: 'dragon_battle',
                    effect: 'setFlag',
                    effectParam: ['dragonAlive', false]
                },
                {
                    text: "💰 Взять золото",
                    next: 'treasure',
                    effect: () => {
                        this.gameState.player.gold += 1000;
                        this.addEvent("Вы стали богаты, но разбудили дракона");
                    }
                },
                {
                    text: "🗣️ Попытаться договориться",
                    next: 'dragon_talk',
                    condition: () => this.hasItem('👑 Корона древних')
                }
            ]
        },

        dragon_battle: {
            title: "Битва с Драконом",
            description: "ДРАКОН ПРОСЫПАЕТСЯ! Его рёв сотрясает пещеру. " +
                "Огненные когти, стальные чешуйки - вы против древнего зла.",
            art: 'battle',
            choices: [
                {
                    text: "🗡️ Атаковать в лоб",
                    next: 'death_dragon',
                    condition: () => this.gameState.player.health < 70,
                    effect: 'gameOver',
                    effectParam: 'Дракон сжёг вас дотла'
                },
                {
                    text: "🛡️ Защищаться и искать слабое место",
                    next: 'dragon_weakness',
                    effect: 'updateHealth',
                    effectParam: -30
                },
                {
                    text: "🧙 Использовать магию",
                    next: 'magic_attack',
                    condition: () => this.hasCompanion('🧙 Волшебник Мерлин')
                }
            ]
        },

        dragon_weakness: {
            title: "Слабое Место",
            description: "Вы заметили - на груди дракона старая рана не зажила. " +
                "Там чешуя отсутствует! Это ваш шанс.",
            art: 'battle',
            choices: [
                {
                    text: "🎯 Меткий выстрел",
                    next: 'dragon_victory',
                    condition: () => this.gameState.player.health > 30,
                    effect: () => {
                        this.setFlag('dragonAlive', false);
                        this.addEvent("ВЫ ПОБЕДИЛИ ДРАКОНА!");
                    }
                },
                {
                    text: "💥 Бросить всё золото",
                    next: 'distraction',
                    effect: () => {
                        this.gameState.player.gold = 0;
                        this.addEvent("Вы отвлекли дракона золотом и сбежали");
                    }
                }
            ]
        },

        dragon_victory: {
            title: "ПОБЕДА!",
            description: "Меч пронзил драконье сердце. Чудовище рухнуло. " +
                "Вы - герой, победивший древнее зло. Но цена велика...",
            art: 'castle',
            ending: 'good',
            choices: [
                {
                    text: "🏆 Начать новую игру",
                    next: 'restart'
                }
            ]
        },

        dragon_talk: {
            title: "Договор с Драконом",
            description: "Дракон открывает один глаз. 'Ты носишь Корону... значит, наследник.' " +
                "Он предлагает союз против истинного врага - Короля-Лича.",
            art: 'dragon',
            choices: [
                {
                    text: "🤝 Принять союз",
                    next: 'dragon_alliance',
                    effect: () => {
                        this.addCompanion('🐉 Древний Дракон');
                        this.updateReputation(25);
                        this.addEvent("Вы заключили союз с драконом");
                    }
                },
                {
                    text: "⚔️ Всё равно атаковать",
                    next: 'dragon_battle'
                }
            ]
        },

        escape: {
            title: "Бегство",
            description: "Вы покинули Штормгард. Замок исчезает в тумане. " +
                "Но чувство, что вы что-то упустили, не покидает вас...",
            art: 'forest',
            ending: 'neutral',
            choices: [
                {
                    text: "🔄 Начать заново",
                    next: 'restart'
                }
            ]
        },

        death_lava: {
            title: "ГИБЕЛЬ В ЛАВЕ",
            description: "Камень под ногами обрушился. Последнее, что вы видели - " +
                "огненное озеро, приближающееся к вам...",
            art: 'cave',
            ending: 'bad',
            choices: [
                {
                    text: "💀 Начать заново",
                    next: 'restart'
                }
            ]
        },

        death_dragon: {
            title: "ГИБЕЛЬ ОТ ДРАКОНА",
            description: "Дыхание дракона испепелило вашу броню. " +
                "Последнее, что вы слышали - его победный рёв...",
            art: 'dragon',
            ending: 'bad',
            choices: [
                {
                    text: "💀 Начать заново",
                    next: 'restart'
                }
            ]
        },

        restart: {
            title: "НОВАЯ ИГРА",
            description: "Тьма сгущается вновь... Готовы ли вы к новому приключению?",
            art: 'castle',
            choices: [
                {
                    text: "⚔️ Начать новое приключение",
                    next: 'intro',
                    effect: 'resetGame'
                }
            ]
        }
    },

    // Инициализация игры
    init() {
        if (this.gameState.active) {
            return "Квест уже запущен! Введите 'quest exit' для выхода.";
        }

        this.gameState.active = true;
        this.resetGame();

        // Загружаем CSS
        this.loadQuestCSS();

        // Показываем первую сцену
        return this.showScene('intro');
    },

    // Загрузка CSS
    loadQuestCSS() {
        if (!document.getElementById('quest-css')) {
            const link = document.createElement('link');
            link.id = 'quest-css';
            link.rel = 'stylesheet';
            link.href = 'js/game/quest.css';
            document.head.appendChild(link);
        }
    },

    // Сброс игры
    resetGame() {
        this.gameState = {
            active: true,
            currentScene: 'intro',
            player: {
                name: 'Сэр Гаррет',
                health: 100,
                gold: 50,
                items: ['⚔️ Стальной меч', '🛡️ Родовой щит'],
                companions: [],
                reputation: 0,
                choices: []
            },
            story: {
                chapter: 1,
                time: 'ночь',
                location: 'Замок Штормгард',
                events: []
            },
            flags: {
                metWizard: false,
                foundKey: false,
                betrayedLord: false,
                dragonAlive: true,
                villageSaved: false
            }
        };
        return "Игра сброшена. Начинаем новое приключение!";
    },

    // Показать сцену
    showScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) {
            return this.showScene('intro');
        }

        this.gameState.currentScene = sceneId;
        this.addEvent(`Переход: ${scene.title}`);

        const html = `
            <div class="quest-container" id="dark-quest">
                <div class="vhs-effect"></div>
                
                <div class="quest-title">${scene.title}</div>
                
                <div class="scene-container">
                    <div class="ascii-art">
                        ${QuestGraphics.getScene(scene.art)}
                    </div>
                    
                    <div class="scene-description typewriter">
                        ${scene.description}
                    </div>
                </div>
                
                ${this.getStatusPanel()}
                
                <div class="choice-panel">
                    ${scene.choices
            .filter(choice => !choice.condition || choice.condition())
            .map((choice, index) => `
                            <button class="quest-choice" 
                                    onclick="DarkQuest.makeChoice(${index})">
                                ${choice.text}
                            </button>
                        `).join('')}
                </div>
                
                ${this.getInventoryPanel()}
                
                ${scene.ending ? `
                    <div class="quest-log">
                        <div class="${'ending-' + scene.ending}">
                            <h3>${scene.ending === 'good' ? '🎉 ХОРОШАЯ КОНЦОВКА' :
            scene.ending === 'bad' ? '💀 ПЛОХАЯ КОНЦОВКА' :
                '🌀 НЕЙТРАЛЬНАЯ КОНЦОВКА'}</h3>
                            <p>${scene.description}</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="quest-log">
                    <div class="inventory-title">📜 Журнал Событий</div>
                    ${this.gameState.story.events.slice(-5).map(event =>
            `<div class="log-entry">${event}</div>`
        ).join('')}
                </div>
            </div>
        `;

        Terminal.output.innerHTML += html;

        // Прокручиваем к квесту
        setTimeout(() => {
            Terminal.output.scrollTop = Terminal.output.scrollHeight;
            const questElement = document.getElementById('dark-quest');
            if (questElement) {
                questElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);

        return "";
    },

    // Сделать выбор
    makeChoice(choiceIndex) {
        const scene = this.scenes[this.gameState.currentScene];
        const choice = scene.choices[choiceIndex];

        if (!choice) return;

        // Применяем эффект выбора
        if (choice.effect) {
            if (typeof choice.effect === 'function') {
                // Если эффект - функция, вызываем её
                choice.effect();
            } else if (typeof choice.effect === 'string') {
                // Если эффект - строка, вызываем соответствующий метод
                this.executeEffect(choice.effect, choice.effectParam);
            }
        }

        // Запоминаем выбор
        this.gameState.player.choices.push({
            scene: this.gameState.currentScene,
            choice: choice.text,
            timestamp: new Date().toLocaleTimeString()
        });

        // Показываем следующую сцену
        this.showScene(choice.next);
    },

    // Выполнить эффект
    executeEffect(effectName, param) {
        switch(effectName) {
            case 'addItem':
                this.addItem(param);
                break;
            case 'removeItem':
                this.removeItem(param);
                break;
            case 'updateHealth':
                this.updateHealth(param);
                break;
            case 'updateReputation':
                this.updateReputation(param);
                break;
            case 'addEvent':
                this.addEvent(param);
                break;
            case 'setFlag':
                this.setFlag(param[0], param[1]);
                break;
            case 'gameOver':
                this.gameOver(param);
                break;
            case 'resetGame':
                this.resetGame();
                break;
        }
    },

    // Получить панель статуса
    getStatusPanel() {
        return `
            <div class="quest-status">
                <div class="stat-item">
                    <span class="stat-label">Здоровье</span>
                    <span class="stat-value">${this.gameState.player.health}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Золото</span>
                    <span class="stat-value">${this.gameState.player.gold}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Репутация</span>
                    <span class="stat-value">${this.gameState.player.reputation}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Глава</span>
                    <span class="stat-value">${this.gameState.story.chapter}</span>
                </div>
            </div>
        `;
    },

    // Получить панель инвентаря
    getInventoryPanel() {
        if (this.gameState.player.items.length === 0 &&
            this.gameState.player.companions.length === 0) {
            return '';
        }

        return `
            <div class="inventory-panel">
                <div class="inventory-title">🎒 Инвентарь</div>
                <div class="inventory-items">
                    ${this.gameState.player.items.map(item =>
            `<span class="inventory-item">${item}</span>`
        ).join('')}
                    ${this.gameState.player.companions.map(companion =>
            `<span class="inventory-item">${companion}</span>`
        ).join('')}
                </div>
            </div>
        `;
    },

    // Вспомогательные методы
    updateHealth(amount) {
        this.gameState.player.health = Math.max(0, Math.min(100,
            this.gameState.player.health + amount));

        if (amount > 0) {
            this.addEvent(`❤️ Здоровье +${amount}`);
        } else {
            this.addEvent(`💔 Здоровье ${amount}`);
        }

        if (this.gameState.player.health <= 0) {
            this.gameOver("Вы погибли");
        }
    },

    updateReputation(amount) {
        this.gameState.player.reputation += amount;
        this.addEvent(`🎭 Репутация ${amount > 0 ? '+' : ''}${amount}`);
    },

    addItem(item) {
        if (!this.gameState.player.items.includes(item)) {
            this.gameState.player.items.push(item);
            this.addEvent(`🎁 Получен: ${item}`);
        }
    },

    removeItem(item) {
        const index = this.gameState.player.items.indexOf(item);
        if (index > -1) {
            this.gameState.player.items.splice(index, 1);
            this.addEvent(`🗑️ Утерян: ${item}`);
        }
    },

    hasItem(item) {
        return this.gameState.player.items.some(i => i.includes(item));
    },

    addCompanion(companion) {
        if (!this.gameState.player.companions.includes(companion)) {
            this.gameState.player.companions.push(companion);
            this.addEvent(`👥 К вам присоединился: ${companion}`);
        }
    },

    hasCompanion(companion) {
        return this.gameState.player.companions.includes(companion);
    },

    addEvent(event) {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        this.gameState.story.events.push(`[${timestamp}] ${event}`);
    },

    setFlag(flag, value) {
        this.gameState.flags[flag] = value;
    },

    // Конец игры
    gameOver(reason) {
        const endings = {
            good: [
                "Вы стали легендой!",
                "Королевство спасено!",
                "Ваше имя войдёт в историю!"
            ],
            bad: [
                "Тьма поглотила всё...",
                "Это был ваш последний бой.",
                "Конец наступил внезапно."
            ],
            neutral: [
                "Вы выжили, но какой ценой?",
                "Приключение закончилось.",
                "Жизнь продолжается..."
            ]
        };

        const type = reason.includes("победил") ? 'good' :
            reason.includes("погиб") ? 'bad' : 'neutral';

        const randomEnding = endings[type][Math.floor(Math.random() * endings[type].length)];

        this.addEvent(`💀 КОНЕЦ ИГРЫ: ${reason}. ${randomEnding}`);

        // Показываем сцену смерти
        if (reason.includes("лаву")) {
            this.showScene('death_lava');
        } else if (reason.includes("дракон")) {
            this.showScene('death_dragon');
        } else {
            this.showScene('restart');
        }
    },

    // Сохранить игру
    save() {
        try {
            localStorage.setItem('dark_quest_save', JSON.stringify(this.gameState));
            this.showNotification("💾 Игра сохранена!");
            return "Квест сохранен!";
        } catch (error) {
            return "Ошибка сохранения: " + error.message;
        }
    },

    // Загрузить игру
    load() {
        try {
            const saved = localStorage.getItem('dark_quest_save');
            if (saved) {
                this.gameState = JSON.parse(saved);
                this.gameState.active = true;
                this.showNotification("💾 Игра загружена!");
                return this.showScene(this.gameState.currentScene);
            } else {
                return "Сохранение не найдено!";
            }
        } catch (error) {
            return "Ошибка загрузки: " + error.message;
        }
    },

    // Выйти из игры
    exit() {
        if (confirm("Выйти из квеста? Несохраненный прогресс будет потерян.")) {
            this.gameState.active = false;
            Terminal.print("Вы вышли из Dark Quest.");
            Terminal.cmd.focus();
        }
        return "";
    },

    // Показать уведомление
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Справка
    getHelp() {
        return `
🏰 DARK QUEST - Pixel Art Adventure (80s Dark Fantasy)
=====================================================

Текстовый квест в стиле фильмов ужасов 80-х!
Вы - рыцарь в проклятом замке, исследующий тайны и делающий выбор.

🎮 КОМАНДЫ:
  quest start   - Начать новый квест
  quest load    - Загрузить сохранение
  quest save    - Сохранить прогресс
  quest help    - Эта справка
  quest exit    - Выйти из квеста

🎯 ГЕЙМПЛЕЙ:
  • Делайте выбор, нажимая на кнопки
  • Следите за здоровьем и репутацией
  • Собирайте предметы и союзников
  • Исследуйте все возможные концовки

📖 СЮЖЕТ:
  1987 год. Замок Штормгард. Лорд мёртв при загадочных 
  обстоятельствах. Из подземелий доносятся странные звуки.
  Вы - последний рыцарь, который должен раскрыть тайну...

🎨 СТИЛЬ:
  • Пиксель-арт ASCII графика
  • Атмосфера фильмов ужасов 80-х
  • Тёмное фэнтези с элементами нуара
  • Множественные концовки

⚔️ СОВЕТЫ:
  1. Исследуйте всё внимательно
  2. Не все выборы очевидны
  3. Сохраняйтесь перед важными решениями
  4. Попробуйте разные пути для всех концовок

🌙 Удачи в тёмных коридорах Штормгарда!
        `;
    }
};

window.DarkQuest = DarkQuest;