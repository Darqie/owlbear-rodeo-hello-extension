import OBR from 'https://unpkg.com/@owlbear-rodeo/sdk';

// OBR SDK НЕ використовується, всі взаємодії з Owlbear Rodeo видалено.
// Зберігання даних відбувається ЛИШЕ у локальному сховищі браузера (localStorage).

const DARQIE_SHEETS_KEY = 'darqie.characterSheets'; // Ключ для збереження листів персонажів у localStorage
const DARQIE_ACTIVE_INDEX_KEY = 'darqie.activeSheetIndex'; // Ключ для збереження активного індексу у localStorage
const MAX_SHEETS = 10;
const DEBOUNCE_DELAY = 300; // Затримка в мс для дебаунсингу

let characterSheets = [];
let activeSheetIndex = 0;
let saveTimer = null; // Для дебаунсингу

// OBR SDK Initialization
Obr.onReady(() => {
    console.log("Owlbear Rodeo SDK is ready!");
    // Тут можна буде додавати логіку взаємодії з OBR
    // Наприклад, отримати інформацію про поточного гравця
    Obr.player.getMetadata().then(metadata => {
        console.log("Player metadata:", metadata);
    });
});

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
    // Перевіряємо, чи контейнер існує, перш ніж шукати елементи
    if (!container) {
        console.error("Контейнер characterSheetContainer не знайдено!");
        return {}; // Повертаємо порожній об'єкт, щоб уникнути помилок
    }
    return {
        characterName: container.querySelector('#characterName'),
        characterClassLevel: container.querySelector('#characterClassLevel'),
        background: container.querySelector('#background'),
        playerName: container.querySelector('#playerName'),
        characterRace: container.querySelector('#characterRace'),
        alignment: container.querySelector('#alignment'),
        experiencePoints: container.querySelector('#experiencePoints'),
        characterPhotoUrl: container.querySelector('#characterPhotoUrl'),

        strengthScore: container.querySelector('#strengthScore'),
        dexterityScore: container.querySelector('#dexterityScore'),
        constitutionScore: container.querySelector('#constitutionScore'),
        intelligenceScore: container.querySelector('#intelligenceScore'),
        wisdomScore: container.querySelector('#wisdomScore'),
        charismaScore: container.querySelector('#charismaScore'),

        strengthModifier: container.querySelector('#strengthModifier'),
        dexterityModifier: container.querySelector('#dexterityModifier'),
        constitutionModifier: container.querySelector('#constitutionModifier'),
        intelligenceModifier: container.querySelector('#intelligenceModifier'),
        wisdomModifier: container.querySelector('#wisdomModifier'),
        charismaModifier: container.querySelector('#charismaModifier'),

        maxHp: container.querySelector('#maxHp'),
        currentHp: container.querySelector('#currentHp'),
        tempHp: container.querySelector('#tempHp'),
    };
}

// Функція для збереження даних активного листа в localStorage
function saveActiveSheetData() {
    if (activeSheetIndex < 0 || activeSheetIndex >= characterSheets.length) {
        return;
    }

    const elements = getSheetInputElements();
    const currentSheet = characterSheets[activeSheetIndex];

    currentSheet.characterName = elements.characterName.value;
    currentSheet.characterClassLevel = elements.characterClassLevel.value;
    currentSheet.background = elements.background.value;
    currentSheet.playerName = elements.playerName.value;
    currentSheet.characterRace = elements.characterRace.value;
    currentSheet.alignment = elements.alignment.value;
    currentSheet.experiencePoints = elements.experiencePoints.value;
    currentSheet.characterPhotoUrl = elements.characterPhotoUrl.value;

    currentSheet.abilityScores = {
        strength: parseInt(elements.strengthScore.value) || 0,
        dexterity: parseInt(elements.dexterityScore.value) || 0,
        constitution: parseInt(elements.constitutionScore.value) || 0,
        intelligence: parseInt(elements.intelligenceScore.value) || 0,
        wisdom: parseInt(elements.wisdomScore.value) || 0,
        charisma: parseInt(elements.charismaScore.value) || 0,
    };

    currentSheet.hp = {
        max: parseInt(elements.maxHp.value) || 0,
        current: parseInt(elements.currentHp.value) || 0,
        temp: parseInt(elements.tempHp.value) || 0,
    };

    localStorage.setItem(DARQIE_SHEETS_KEY, JSON.stringify(characterSheets));
    console.log(`Лист "${currentSheet.characterName}" збережено.`);
}

const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY);

// Функція для завантаження даних активного листа з localStorage та відображення
function loadActiveSheetData() {
    if (characterSheets.length === 0) {
        document.getElementById('characterSheetContainer').style.display = 'none';
        return;
    }

    document.getElementById('characterSheetContainer').style.display = 'block';

    const elements = getSheetInputElements();
    const currentSheet = characterSheets[activeSheetIndex];

    elements.characterName.value = currentSheet.characterName || '';
    elements.characterClassLevel.value = currentSheet.characterClassLevel || '';
    elements.background.value = currentSheet.background || '';
    elements.playerName.value = currentSheet.playerName || '';
    elements.characterRace.value = currentSheet.characterRace || '';
    elements.alignment.value = currentSheet.alignment || '';
    elements.experiencePoints.value = currentSheet.experiencePoints || '';
    elements.characterPhotoUrl.value = currentSheet.characterPhotoUrl || '';
    updateCharacterPhotoPreview(elements.characterPhotoUrl.value);

    elements.strengthScore.value = currentSheet.abilityScores?.strength || 10;
    elements.dexterityScore.value = currentSheet.abilityScores?.dexterity || 10;
    elements.constitutionScore.value = currentSheet.abilityScores?.constitution || 10;
    elements.intelligenceScore.value = currentSheet.abilityScores?.intelligence || 10;
    elements.wisdomScore.value = currentSheet.abilityScores?.wisdom || 10;
    elements.charismaScore.value = currentSheet.abilityScores?.charisma || 10;

    elements.maxHp.value = currentSheet.hp?.max || 10;
    elements.currentHp.value = currentSheet.hp?.current || 10;
    elements.tempHp.value = currentSheet.hp?.temp || 0;

    // Оновлення модифікаторів після завантаження
    updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    updateAbilityModifier(elements.charismaScore, elements.charismaModifier);

    console.log(`Лист "${currentSheet.characterName}" завантажено.`);
}

const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY);

// Функція для оновлення випадаючого списку персонажів
function updateCharacterSelect() {
    const characterSelect = document.getElementById('characterSelect');
    characterSelect.innerHTML = ''; // Очистити поточні опції

    if (characterSheets.length === 0) {
        characterSelect.innerHTML = '<option value="-1">Немає персонажів</option>';
        characterSelect.disabled = true;
        document.getElementById('deleteCharacterButton').disabled = true;
        document.getElementById('characterSheetContainer').style.display = 'none';
        return;
    }

    characterSelect.disabled = false;
    document.getElementById('deleteCharacterButton').disabled = false;

    characterSheets.forEach((sheet, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = sheet.characterName || `Персонаж ${index + 1}`;
        characterSelect.appendChild(option);
    });

    characterSelect.value = activeSheetIndex;
    loadActiveSheetData(); // Завантажити дані активного листа після оновлення селекта
}

// Функція для ініціалізації або завантаження даних
function initializeSheets() {
    const storedSheets = localStorage.getItem(DARQIE_SHEETS_KEY);
    const storedActiveIndex = localStorage.getItem(DARQIE_ACTIVE_INDEX_KEY);

    if (storedSheets) {
        characterSheets = JSON.parse(storedSheets);
        if (storedActiveIndex !== null && storedActiveIndex < characterSheets.length) {
            activeSheetIndex = parseInt(storedActiveIndex);
        } else {
            activeSheetIndex = 0; // Якщо індекс недійсний, встановлюємо 0
        }
    } else {
        // Якщо немає збережених листів, створити один за замовчуванням
        addCharacterSheet();
        activeSheetIndex = 0;
    }
    updateCharacterSelect();
}

// Функція для додавання нового листа персонажа
function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        alert(`Ви можете створити не більше ${MAX_SHEETS} листів персонажів.`);
        return;
    }
    const newSheet = {
        characterName: `Новий Персонаж ${characterSheets.length + 1}`,
        characterClassLevel: '',
        background: '',
        playerName: '',
        characterRace: '',
        alignment: '',
        experiencePoints: 0,
        characterPhotoUrl: '',
        abilityScores: {
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10,
        },
        hp: { max: 10, current: 10, temp: 0 },
        // ... інші поля за замовчуванням
    };
    characterSheets.push(newSheet);
    activeSheetIndex = characterSheets.length - 1; // Зробити новий лист активним
    localStorage.setItem(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex);
    updateCharacterSelect();
    saveActiveSheetData(); // Зберегти після додавання
}

// Функція для видалення поточного листа персонажа
function deleteCharacterSheet() {
    if (characterSheets.length === 0) {
        return;
    }
    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'цей персонаж'}"?`)) {
        characterSheets.splice(activeSheetIndex, 1);
        if (characterSheets.length > 0) {
            activeSheetIndex = Math.max(0, activeSheetIndex - 1); // Переключитися на попередній або перший
        } else {
            activeSheetIndex = 0; // Немає листів, скинути індекс
        }
        localStorage.setItem(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex);
        localStorage.setItem(DARQIE_SHEETS_KEY, JSON.stringify(characterSheets)); // Зберегти змінений масив
        updateCharacterSelect(); // Оновити UI
    }
}

// Функція для обчислення модифікатора
function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Функція для оновлення модифікатора характеристики
function updateAbilityModifier(scoreInput, modifierElement) {
    const score = parseInt(scoreInput.value);
    const modifier = calculateModifier(score);
    modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
}

// Функція для оновлення прев'ю фото
function updateCharacterPhotoPreview(url) {
    const imgElement = document.getElementById('characterPhotoPreview');
    if (url) {
        imgElement.src = url;
        imgElement.style.display = 'block';
    } else {
        imgElement.src = '';
        imgElement.style.display = 'none';
    }
}

// Додаємо обробники подій
document.addEventListener('DOMContentLoaded', () => {
    initializeSheets();

    document.getElementById('addCharacterButton').addEventListener('click', addCharacterSheet);
    document.getElementById('deleteCharacterButton').addEventListener('click', deleteCharacterSheet);
    document.getElementById('characterSelect').addEventListener('change', (event) => {
        activeSheetIndex = parseInt(event.target.value);
        localStorage.setItem(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex);
        loadActiveSheetData();
    });

    const characterPhotoUrlInput = document.getElementById('characterPhotoUrl');
    if (characterPhotoUrlInput) {
        characterPhotoUrlInput.addEventListener('input', (event) => {
            updateCharacterPhotoPreview(event.target.value);
            debouncedSaveActiveSheetData(); // Зберігаємо URL після зміни
        });
    }

    // Обробники подій для всіх полів вводу та вибору
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

    // Оновлення модифікаторів після завантаження даних (вже зроблено в loadActiveSheetData, але можна залишити для надійності)
    const elements = getSheetInputElements();
    if (elements.strengthScore) updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    if (elements.dexterityScore) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    if (elements.constitutionScore) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    if (elements.intelligenceScore) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    if (elements.wisdomScore) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    if (elements.charismaScore) updateAbilityModifier(elements.charismaScore, elements.charismaModifier);
});
