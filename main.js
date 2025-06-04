import OBR from '@owlbear-rodeo/sdk'; // Імпортуємо OBR SDK

const DARQIE_SHEETS_KEY = 'darqie.characterSheets'; // Ключ для збереження листів персонажів
const DARQIE_ACTIVE_INDEX_KEY = 'darqie.activeSheetIndex'; // Ключ для збереження активного індексу
const MAX_SHEETS = 10;
const DEBOUNCE_DELAY = 300; // Затримка в мс для дебаунсингу

let characterSheets = [];
let activeSheetIndex = 0;
let saveTimer = null; // Для дебаунсингу

// Утилітарна функція дебаунсингу
function debounce(func, delay) {
    return function(...args) {
        const context = this;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Функція для отримання всіх полів вводу та вибору з поточного листа
function getSheetInputElements() {
    const container = document.getElementById('characterSheetContainer');
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

        // Модифікатори
        strengthModifier: container.querySelector('#strengthModifier'),
        dexterityModifier: container.querySelector('#dexterityModifier'),
        constitutionModifier: container.querySelector('#constitutionModifier'),
        intelligenceModifier: container.querySelector('#intelligenceModifier'),
        wisdomModifier: container.querySelector('#wisdomModifier'),
        charismaModifier: container.querySelector('#charismaModifier'),
    };
}

// Функція для збереження даних активного листа в OBR.player.data
async function saveActiveSheetData() {
    if (characterSheets.length === 0) return;

    const elements = getSheetInputElements();
    const currentSheetData = {
        characterName: elements.characterName.value,
        characterClassLevel: elements.characterClassLevel.value,
        background: elements.background.value,
        playerName: elements.playerName.value,
        characterRace: elements.characterRace.value,
        alignment: elements.alignment.value,
        experiencePoints: elements.experiencePoints.value,
        strengthScore: elements.strengthScore.value,
        dexterityScore: elements.dexterityScore.value,
        constitutionScore: elements.constitutionScore.value,
        intelligenceScore: elements.intelligenceScore.value,
        wisdomScore: elements.wisdomScore.value,
        charismaScore: elements.charismaScore.value,
        maxHp: elements.maxHp.value,
        currentHp: elements.currentHp.value,
        tempHp: elements.tempHp.value,
        characterPhotoUrl: elements.characterPhotoUrl.value
    };

    characterSheets[activeSheetIndex] = currentSheetData;
    try {
        await OBR.player.data.set(DARQIE_SHEETS_KEY, characterSheets);
        await OBR.player.data.set(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex);
        console.log('Дані активного листа збережено в OBR.player.data:', characterSheets[activeSheetIndex]);
        updateCharacterTabs(); // Оновлюємо вкладки, щоб відобразити нові імена, якщо змінились
    } catch (error) {
        console.error("Помилка збереження даних в OBR:", error);
        OBR.notification.show("Помилка збереження листа персонажа.", "ERROR");
    }
}

// Дебаунснута версія функції збереження
const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY);


// Функція для завантаження даних активного листа з OBR.player.data
function loadActiveSheetData() {
    if (characterSheets.length === 0) {
        // Якщо листів немає, функція addCharacterSheet() вже викликається під час ініціалізації.
        // Тому тут просто оновлюємо вкладки.
        updateCharacterTabs();
        return;
    }

    // Коригуємо індекс, якщо він став некоректним (наприклад, після видалення останнього листа)
    if (activeSheetIndex >= characterSheets.length) {
        activeSheetIndex = Math.max(0, characterSheets.length - 1);
    }

    const sheetData = characterSheets[activeSheetIndex];
    const elements = getSheetInputElements();

    elements.characterName.value = sheetData.characterName || '';
    elements.characterClassLevel.value = sheetData.characterClassLevel || '';
    elements.background.value = sheetData.background || '';
    elements.playerName.value = sheetData.playerName || '';
    elements.characterRace.value = sheetData.characterRace || '';
    elements.alignment.value = sheetData.alignment || '';
    elements.experiencePoints.value = sheetData.experiencePoints || '0';
    elements.strengthScore.value = sheetData.strengthScore || '10';
    elements.dexterityScore.value = sheetData.dexterityScore || '10';
    elements.constitutionScore.value = sheetData.constitutionScore || '10';
    elements.intelligenceScore.value = sheetData.intelligenceScore || '10';
    elements.wisdomScore.value = sheetData.wisdomScore || '10';
    elements.charismaScore.value = sheetData.charismaScore || '10';
    elements.maxHp.value = sheetData.maxHp || '10';
    elements.currentHp.value = sheetData.currentHp || '10';
    elements.tempHp.value = sheetData.tempHp || '0';

    // Завантажуємо фото
    elements.characterPhotoUrl.value = sheetData.characterPhotoUrl || '';
    if (sheetData.characterPhotoUrl) {
        elements.characterPhotoPreview.src = sheetData.characterPhotoUrl;
        elements.characterPhotoPreview.style.display = 'block';
    } else {
        elements.characterPhotoPreview.src = '';
        elements.characterPhotoPreview.style.display = 'none';
    }

    // Оновлюємо модифікатори
    updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    updateAbilityModifier(elements.charismaScore, elements.charismaModifier);

    console.log('Дані активного листа завантажено:', sheetData);
    updateCharacterTabs();
}

// Функція для розрахунку та оновлення модифікатора здібності
function updateAbilityModifier(scoreInput, modifierElement) {
    const score = parseInt(scoreInput.value || '0');
    const modifier = Math.floor((score - 10) / 2);
    modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
}


// Функція для додавання нового листа персонажа
async function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        OBR.notification.show(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`, "INFO");
        return;
    }

    if (characterSheets.length > 0) {
        await saveActiveSheetData(); // Зберігаємо дані поточного листа перед перемиканням
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

    await saveActiveSheetData();
    loadActiveSheetData();
    console.log('Додано новий лист персонажа. Загалом листів:', characterSheets.length);
}

// Функція для видалення активного листа персонажа
async function deleteCharacterSheet() {
    if (characterSheets.length === 0) {
        OBR.notification.show('Немає листів для видалення.', "INFO");
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(activeSheetIndex, 1);

        if (characterSheets.length === 0) {
            activeSheetIndex = 0;
            await addCharacterSheet(); // Створюємо новий порожній лист
            return;
        } else if (activeSheetIndex >= characterSheets.length) {
            activeSheetIndex = characterSheets.length - 1;
        }

        await saveActiveSheetData();
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
    }
}

// Функція для перемикання між листами
async function switchCharacterSheet(index) {
    if (index === activeSheetIndex) return;

    await saveActiveSheetData(); // Зберігаємо дані поточного листа перед перемиканням
    activeSheetIndex = index;
    await saveActiveSheetData(); // Зберігаємо новий активний індекс
    loadActiveSheetData();
}

// Функція для оновлення вкладок персонажів
function updateCharacterTabs() {
    const characterTabsContainer = document.getElementById('characterTabs');
    characterTabsContainer.innerHTML = '';

    characterSheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.classList.add('character-tab');
        if (index === activeSheetIndex) {
            tab.classList.add('active');
        }
        tab.textContent = sheet.characterName || `Персонаж ${index + 1}`;
        tab.dataset.index = index;

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-tab');
        closeBtn.textContent = 'x';
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteCharacterSheetByIndex(index);
        });
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => switchCharacterSheet(index));
        characterTabsContainer.appendChild(tab);
    });
}

// Функція для видалення листа за індексом (викликається з вкладки)
async function deleteCharacterSheetByIndex(indexToDelete) {
    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[indexToDelete].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(indexToDelete, 1);

        if (activeSheetIndex === indexToDelete) {
            if (characterSheets.length === 0) {
                activeSheetIndex = 0;
                await addCharacterSheet();
                return;
            } else if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length - 1;
            }
        } else if (activeSheetIndex > indexToDelete) {
            activeSheetIndex--;
        }

        await saveActiveSheetData();
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
    }
}


// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', async () => { // Додаємо 'async' сюди
    const addCharacterButton = document.getElementById('addCharacterButton');
    const deleteCharacterButton = document.getElementById('deleteCharacterButton');
    const characterPhotoUrlInput = document.getElementById('characterPhotoUrl');
    const characterPhotoPreview = document.getElementById('characterPhotoPreview');

    // Очікуємо готовності OBR SDK
    await OBR.ready();

    if (addCharacterButton) {
        addCharacterButton.addEventListener('click', addCharacterSheet);
    }
    if (deleteCharacterButton) {
        deleteCharacterButton.addEventListener('click', deleteCharacterSheet);
    }
    if (characterPhotoUrlInput) {
        characterPhotoUrlInput.addEventListener('input', () => {
            const url = characterPhotoUrlInput.value;
            if (url) {
                characterPhotoPreview.src = url;
                characterPhotoPreview.style.display = 'block';
            } else {
                characterPhotoPreview.src = '';
                characterPhotoPreview.style.display = 'none';
            }
            debouncedSaveActiveSheetData(); // Використовуємо дебаунснуту функцію
        });
    }

    // Завантажуємо всі листи з OBR.player.data при старті
    try {
        const savedSheets = await OBR.player.data.get(DARQIE_SHEETS_KEY);
        if (savedSheets) {
            characterSheets = savedSheets;
            if (characterSheets.length > 0) {
                const lastActiveIndex = await OBR.player.data.get(DARQIE_ACTIVE_INDEX_KEY);
                if (lastActiveIndex !== null && typeof lastActiveIndex === 'number' && parseInt(lastActiveIndex) < characterSheets.length) {
                    activeSheetIndex = parseInt(lastActiveIndex);
                } else {
                    activeSheetIndex = 0;
                }
            } else {
                await addCharacterSheet(); // Обов'язково чекаємо, щоб створити перший лист
            }
        } else {
            await addCharacterSheet(); // Обов'язково чекаємо, щоб створити перший лист
        }
    } catch (error) {
        console.error("Помилка завантаження даних з OBR:", error);
        OBR.notification.show("Помилка завантаження листів персонажів.", "ERROR");
        // Забезпечуємо, що є принаймні один порожній лист, якщо завантаження не вдалось
        if (characterSheets.length === 0) {
            await addCharacterSheet();
        }
    }

    loadActiveSheetData(); // Завантажуємо та відображаємо активний лист

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select');
    allInputElements.forEach(element => {
        // Використовуємо дебаунснуту функцію для всіх input/change подій
        element.addEventListener('input', debouncedSaveActiveSheetData);
        element.addEventListener('change', debouncedSaveActiveSheetData);

        // Додаємо слухачів для оновлення модифікаторів здібностей
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

    // Оновлюємо модифікатори при першому завантаженні
    const elements = getSheetInputElements();
    updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    updateAbilityModifier(elements.charismaScore, elements.charismaModifier);
});
