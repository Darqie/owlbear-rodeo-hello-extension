// OBR SDK тепер передбачається доступним глобально.
// Всі взаємодії зі сховищем тепер через OBR.player.setMetadata / getMetadata.

const DARQIE_SHEETS_KEY = 'darqie.characterSheets'; // Ключ для зберігання листів персонажів у OBR metadata
const DARQIE_ACTIVE_INDEX_KEY = 'darqie.activeSheetIndex'; // Ключ для зберігання активного індексу у OBR metadata
const MAX_SHEETS = 10;
const DEBOUNCE_DELAY = 300; // Затримка в мс для дебаунсингу

let characterSheets = [];
let activeSheetIndex = 0;
let saveTimer = null; // Для дебаунсингу

// Утилітарна функція дебаунсингу
function debounce(func, delay) {
    return function(...args) {
        const context = this;
        clearTimeout(saveTimer); // Очищаємо попередній таймер
        saveTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Функція для отримання всіх полів вводу та вибору з поточного листа
function getSheetInputElements() {
    const container = document.getElementById('characterSheetContainer');
    // Перевіряємо, чи контейнер існує. Ця функція може викликатись дуже рано.
    if (!container) {
        return {};
    }
    return {
        characterName: container.querySelector('#characterName'),
        characterClassLevel: container.querySelector('#characterClassLevel'),
        background: container.querySelector('#background'),
        playerName: container.querySelector('#playerName'),
        characterRace: container.querySelector('#characterRace'),
        alignment: container.querySelector('#alignment'),
        experiencePoints: container.querySelector('#experiencePoints'),
        strengthScore: container.querySelector('#strengthScore'),
        dexterityScore: container.querySelector('#dexterityScore'),
        constitutionScore: container.querySelector('#constitutionScore'),
        intelligenceScore: container.querySelector('#intelligenceScore'),
        wisdomScore: container.querySelector('#wisdomScore'),
        charismaScore: container.querySelector('#charismaScore'),
        maxHp: container.querySelector('#maxHp'),
        currentHp: container.querySelector('#currentHp'),
        tempHp: container.querySelector('#tempHp'),
        characterPhotoUrl: container.querySelector('#characterPhotoUrl'),
        characterPhotoPreview: container.querySelector('#characterPhotoPreview'),

        strengthModifier: container.querySelector('#strengthModifier'),
        dexterityModifier: container.querySelector('#dexterityModifier'),
        constitutionModifier: container.querySelector('#constitutionModifier'),
        intelligenceModifier: container.querySelector('#intelligenceModifier'),
        wisdomModifier: container.querySelector('#wisdomModifier'),
        charismaModifier: container.querySelector('#charismaModifier'),
    };
}

// Функція для збереження даних активного листа за допомогою OBR.player.setMetadata
async function saveActiveSheetData() {
    if (characterSheets.length === 0) {
        console.warn("Спроба зберегти дані, коли characterSheets порожній.");
        return;
    }
    if (activeSheetIndex < 0 || activeSheetIndex >= characterSheets.length) {
        console.error(`Некоректний activeSheetIndex: ${activeSheetIndex}. Доступно листів: ${characterSheets.length}.`);
        return;
    }

    const elements = getSheetInputElements();
    
    // Збираємо дані з полів вводу. Використовуємо тернарний оператор для надійності,
    // якщо якийсь елемент раптом не буде знайдено (хоча його наявність очікується).
    const currentSheetData = {
        characterName: elements.characterName ? elements.characterName.value : '',
        characterClassLevel: elements.characterClassLevel ? elements.characterClassLevel.value : '',
        background: elements.background ? elements.background.value : '',
        playerName: elements.playerName ? elements.playerName.value : '',
        characterRace: elements.characterRace ? elements.characterRace.value : '',
        alignment: elements.alignment ? elements.alignment.value : '',
        experiencePoints: elements.experiencePoints ? elements.experiencePoints.value : '0',
        strengthScore: elements.strengthScore ? elements.strengthScore.value : '10',
        dexterityScore: elements.dexterityScore ? elements.dexterityScore.value : '10',
        constitutionScore: elements.constitutionScore ? elements.constitutionScore.value : '10',
        intelligenceScore: elements.intelligenceScore ? elements.intelligenceScore.value : '10',
        wisdomScore: elements.wisdomScore ? elements.wisdomScore.value : '10',
        charismaScore: elements.charismaScore ? elements.charismaScore.value : '10',
        maxHp: elements.maxHp ? elements.maxHp.value : '10',
        currentHp: elements.currentHp ? elements.currentHp.value : '10',
        tempHp: elements.tempHp ? elements.tempHp.value : '0',
        characterPhotoUrl: elements.characterPhotoUrl ? elements.characterPhotoUrl.value : ''
    };

    characterSheets[activeSheetIndex] = currentSheetData;
    
    try {
        // Зберігаємо весь масив листів та активний індекс у метаданих гравця OBR
        await OBR.player.setMetadata({
            [DARQIE_SHEETS_KEY]: characterSheets,
            [DARQIE_ACTIVE_INDEX_KEY]: activeSheetIndex
        });
        console.log(`Дані листа "${characterSheets[activeSheetIndex].characterName}" (індекс ${activeSheetIndex}) збережено через OBR Metadata.`);
        updateCharacterSelect();
    } catch (error) {
        console.error("Помилка збереження даних через OBR Metadata:", error);
        alert("Помилка збереження листа персонажа.");
    }
}

// Дебаунснута версія функції збереження
const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY);


// Функція для завантаження даних активного листа з OBR.player.getMetadata
async function loadActiveSheetData() {
    const characterSheetContainer = document.getElementById('characterSheetContainer'); // Змінено ID на characterSheetContainer

    if (characterSheets.length === 0) {
        if (characterSheetContainer) {
            characterSheetContainer.style.display = 'none';
        }
        updateCharacterSelect();
        return;
    }

    if (activeSheetIndex >= characterSheets.length) {
        activeSheetIndex = Math.max(0, characterSheets.length - 1);
        console.warn(`Скориговано activeSheetIndex до ${activeSheetIndex}`);
    }

    // Створюємо глибоку копію листа для відображення
    const sheetData = JSON.parse(JSON.stringify(characterSheets[activeSheetIndex]));
    
    const elements = getSheetInputElements();

    // Заповнюємо поля, перевіряючи наявність елементів
    if (elements.characterName) elements.characterName.value = sheetData.characterName || '';
    if (elements.characterClassLevel) elements.characterClassLevel.value = sheetData.characterClassLevel || '';
    if (elements.background) elements.background.value = sheetData.background || '';
    if (elements.playerName) elements.playerName.value = sheetData.playerName || '';
    if (elements.characterRace) elements.characterRace.value = sheetData.characterRace || '';
    if (elements.alignment) elements.alignment.value = sheetData.alignment || '';
    if (elements.experiencePoints) elements.experiencePoints.value = sheetData.experiencePoints || '0';
    if (elements.strengthScore) elements.strengthScore.value = sheetData.strengthScore || '10';
    if (elements.dexterityScore) elements.dexterityScore.value = sheetData.dexterityScore || '10';
    if (elements.constitutionScore) elements.constitutionScore.value = sheetData.constitutionScore || '10';
    if (elements.intelligenceScore) elements.intelligenceScore.value = sheetData.intelligenceScore || '10';
    if (elements.wisdomScore) elements.wisdomScore.value = sheetData.wisdomScore || '10';
    if (elements.charismaScore) elements.charismaScore.value = sheetData.charismaScore || '10';
    if (elements.maxHp) elements.maxHp.value = sheetData.maxHp || '10';
    if (elements.currentHp) elements.currentHp.value = sheetData.currentHp || '10';
    if (elements.tempHp) elements.tempHp.value = sheetData.tempHp || '0';

    if (elements.characterPhotoUrl) elements.characterPhotoUrl.value = sheetData.characterPhotoUrl || '';
    if (elements.characterPhotoPreview) {
        if (sheetData.characterPhotoUrl) {
            elements.characterPhotoPreview.src = sheetData.characterPhotoUrl;
            elements.characterPhotoPreview.style.display = 'block';
        } else {
            elements.characterPhotoPreview.src = '';
            elements.characterPhotoPreview.style.display = 'none';
        }
    }

    // Оновлюємо модифікатори, перевіряючи наявність елементів
    if (elements.strengthScore && elements.strengthModifier) updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    if (elements.dexterityScore && elements.dexterityModifier) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    if (elements.constitutionScore && elements.constitutionModifier) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    if (elements.intelligenceScore && elements.intelligenceModifier) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    if (elements.wisdomScore && elements.wisdomModifier) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    if (elements.charismaScore && elements.charismaModifier) updateAbilityModifier(elements.charismaScore, elements.charismaModifier);

    if (characterSheetContainer) {
        characterSheetContainer.style.display = 'flex';
    }

    console.log(`Дані листа "${sheetData.characterName}" (індекс ${activeSheetIndex}) завантажено та відображено.`);
    updateCharacterSelect();
}

function updateAbilityModifier(scoreInput, modifierElement) {
    const score = parseInt(scoreInput.value || '0');
    const modifier = Math.floor((score - 10) / 2);
    modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
}


async function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        alert(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`);
        return;
    }

    if (characterSheets.length > 0) {
        await saveActiveSheetData(); // Чекаємо збереження поточного листа
    }

    const newSheetData = {
        characterName: `Новий Персонаж ${characterSheets.length + 1}`,
        characterClassLevel: '',
        background: '',
        playerName: '',
        characterRace: '',
        alignment: '',
        experiencePoints: '0',
        strengthScore: '10',
        dexterityScore: '10',
        constitutionScore: '10',
        intelligenceScore: '10',
        wisdomScore: '10',
        charismaScore: '10',
        maxHp: '10',
        currentHp: '10',
        tempHp: '0',
        characterPhotoUrl: ''
    };
    characterSheets.push(newSheetData);
    activeSheetIndex = characterSheets.length - 1;

    await saveActiveSheetData(); // Зберігаємо новий лист у OBR metadata
    await loadActiveSheetData(); // Завантажуємо та відображаємо новий лист
    console.log('Додано новий лист персонажа. Загалом листів:', characterSheets.length);
}

async function deleteCharacterSheet() {
    if (characterSheets.length === 0) {
        alert('Немає листів для видалення.');
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) {
        const deletedIndex = activeSheetIndex;
        characterSheets.splice(deletedIndex, 1);

        if (characterSheets.length === 0) {
            activeSheetIndex = 0;
            await addCharacterSheet(); // Створюємо новий порожній лист
            return;
        } else if (activeSheetIndex >= characterSheets.length) {
            activeSheetIndex = characterSheets.length - 1;
        }
        
        await saveActiveSheetData(); // Зберігаємо зміни після видалення
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        await loadActiveSheetData(); // Завантажуємо новий активний лист
    }
}

async function switchCharacterSheet(index) {
    if (index === activeSheetIndex) {
        console.log(`Спроба переключитися на той самий лист (індекс ${index}). Нічого не робимо.`);
        return;
    }

    console.log(`Зберігаємо поточний лист (індекс ${activeSheetIndex}) перед перемиканням на індекс ${index}.`);
    clearTimeout(saveTimer);
    await saveActiveSheetData(); // Явно чекаємо завершення збереження поточного листа

    activeSheetIndex = index;
    
    console.log(`Перемикаємося на лист з індексом ${activeSheetIndex}.`);
    await loadActiveSheetData();
}

function updateCharacterSelect() {
    const characterSelect = document.getElementById('characterSelect');
    if (!characterSelect) {
        return;
    }
    characterSelect.innerHTML = '';

    characterSheets.forEach((sheet, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = sheet.characterName || `Персонаж ${index + 1}`;
        if (index === activeSheetIndex) {
            option.selected = true;
        }
        characterSelect.appendChild(option);
    });

    // Додаємо слухача лише один раз
    if (!characterSelect.dataset.hasChangeListener) {
        characterSelect.addEventListener('change', async (event) => {
            await switchCharacterSheet(parseInt(event.target.value));
        });
        characterSelect.dataset.hasChangeListener = true;
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const addCharacterButton = document.getElementById('addCharacterButton');
    const deleteCharacterButton = document.getElementById('deleteCharacterButton');
    const characterPhotoUrlInput = document.getElementById('characterPhotoUrl');
    const characterPhotoPreview = document.getElementById('characterPhotoPreview');
    const characterSelect = document.getElementById('characterSelect');

    if (addCharacterButton) {
        addCharacterButton.addEventListener('click', addCharacterSheet);
    }
    if (deleteCharacterButton) {
        deleteCharacterButton.addEventListener('click', deleteCharacterSheet);
    }
    if (characterPhotoUrlInput) {
        characterPhotoUrlInput.addEventListener('input', debouncedSaveActiveSheetData);
    }

    // Завантажуємо дані з OBR.player.metadata при старті
    try {
        // Очікуємо ініціалізації OBR SDK, якщо вона ще не відбулася
        // (хоча DOMContentLoaded спрацьовує пізніше, ніж зазвичай доступний OBR)
        // Для надійності можна використовувати OBR.onReady, але для цієї простої структури це може бути зайвим.
        const metadata = await OBR.player.getMetadata();
        const savedSheets = metadata[DARQIE_SHEETS_KEY];
        const savedActiveIndex = metadata[DARQIE_ACTIVE_INDEX_KEY];

        if (savedSheets && Array.isArray(savedSheets) && savedSheets.length > 0) {
            characterSheets = savedSheets;
            const parsedIndex = parseInt(savedActiveIndex);
            if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < characterSheets.length) {
                activeSheetIndex = parsedIndex;
            } else {
                activeSheetIndex = 0; // Повертаємося до першого листа, якщо індекс некоректний
            }
        } else {
            console.log("Дані персонажів в OBR Metadata не знайдено. Створення нового листа.");
            await addCharacterSheet(); // Створюємо новий лист, якщо даних немає
        }
    } catch (error) {
        console.error("Помилка завантаження даних з OBR Metadata:", error);
        alert("Помилка завантаження листів персонажів. Можливо, пошкоджені дані або OBR API недоступний.");
        // На випадок помилки, все одно спробуємо створити лист
        if (characterSheets.length === 0) {
            await addCharacterSheet();
        }
    }

    // Завантажуємо та відображаємо дані після ініціалізації characterSheets
    await loadActiveSheetData(); 

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select');
    allInputElements.forEach(element => {
        element.addEventListener('input', debouncedSaveActiveSheetData);
        element.addEventListener('change', debouncedSaveActiveSheetData);

        if (element.classList.contains('score-input')) {
            element.addEventListener('input', () => {
                const modifierId = element.id.replace('Score', 'Modifier');
                const modifierElement = document.getElementById(modifierId);
                if (modifierElement) {
                    updateAbilityModifier(element, modifierElement);
                }
            });
        }
    });

    // Оновлення модифікаторів при старті (хоча вже зроблено в loadActiveSheetData)
    const elements = getSheetInputElements();
    if (elements.strengthScore) updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    if (elements.dexterityScore) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    if (elements.constitutionScore) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    if (elements.intelligenceScore) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    if (elements.wisdomScore) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    if (elements.charismaScore) updateAbilityModifier(elements.charismaScore, elements.charismaModifier);

    // Додаємо слухача для змін метаданих гравця (наприклад, якщо DM змінює метадані)
    OBR.player.onChange(async (player) => {
        // Отримуємо нові дані з метаданих гравця
        const newSheets = player.metadata[DARQIE_SHEETS_KEY];
        const newActiveIndex = player.metadata[DARQIE_ACTIVE_INDEX_KEY];

        // Порівнюємо, щоб уникнути нескінченних циклів або зайвих оновлень,
        // а також перевіряємо, чи змінились саме наші дані.
        if (JSON.stringify(newSheets) !== JSON.stringify(characterSheets) ||
            (newActiveIndex !== undefined && newActiveIndex !== activeSheetIndex)) {
            
            console.log("OBR player metadata changed, reloading sheets...");
            clearTimeout(saveTimer); // Скасовуємо будь-яке поточне збереження, щоб не перезаписати свіжі дані
            
            characterSheets = newSheets || []; // Оновлюємо масив листів
            activeSheetIndex = newActiveIndex !== undefined ? newActiveIndex : 0; // Оновлюємо активний індекс

            if (characterSheets.length === 0) {
                // Якщо раптом листи були видалені (наприклад, DM очистив метадані), створити новий
                await addCharacterSheet();
            } else {
                await loadActiveSheetData(); // Завантажуємо та відображаємо оновлені дані
            }
        }
    });
});
