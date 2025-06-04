// OBR SDK НЕ використовується, всі взаємодії з Owlbear Rodeo видалено.
// Зберігання даних відбувається ЛИШЕ у локальному сховищі браузера (localStorage).

const DARQIE_SHEETS_KEY = 'darqie.characterSheets'; // Ключ для збереження листів персонажів у localStorage
const DARQIE_ACTIVE_INDEX_KEY = 'darqie.activeSheetIndex'; // Ключ для збереження активного індексу у localStorage
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

// Функція для збереження даних активного листа в localStorage
function saveActiveSheetData() {
    if (characterSheets.length === 0) return;

    const elements = getSheetInputElements();
    // Створюємо новий об'єкт для поточних даних, щоб уникнути посилань
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

    // Замінюємо об'єкт у масиві повністю
    characterSheets[activeSheetIndex] = currentSheetData;
    try {
        localStorage.setItem(DARQIE_SHEETS_KEY, JSON.stringify(characterSheets));
        localStorage.setItem(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex.toString());
        console.log('Дані активного листа збережено в localStorage:', characterSheets[activeSheetIndex]);
        updateCharacterSelect();
    } catch (error) {
        console.error("Помилка збереження даних в localStorage:", error);
        alert("Помилка збереження листа персонажа.");
    }
}

// Дебаунснута версія функції збереження
const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY);


// Функція для завантаження даних активного листа з localStorage
function loadActiveSheetData() {
    const characterSheetTemplate = document.getElementById('characterSheetTemplate');

    if (characterSheets.length === 0) {
        if (characterSheetTemplate) {
            characterSheetTemplate.style.display = 'none';
        }
        updateCharacterSelect();
        return;
    }

    if (activeSheetIndex >= characterSheets.length) {
        activeSheetIndex = Math.max(0, characterSheets.length - 1);
    }

    // Створюємо глибоку копію листа для відображення, щоб уникнути прямих посилань
    // до об'єктів у characterSheets при роботі з полями вводу.
    // Хоча saveActiveSheetData створює новий об'єкт, це додає додатковий рівень безпеки
    // та робить логіку більш надійною.
    const sheetData = JSON.parse(JSON.stringify(characterSheets[activeSheetIndex]));

    const elements = getSheetInputElements();

    elements.characterName.value = sheetData.characterName || '';
    elements.characterClassLevel.value = sheetData.characterClassLevel || '';
    elements.background.value = sheetData.background || '';
    elements.playerName.value = sheetData.playerName || '';
    elements.characterRace.value = sheetData.characterRace || '';
    elements.alignment.value = sheetData.alignment || '';
    elements.experiencePoints.value = sheetData.experiencePoints || '0';
    elements.strengthScore.value = sheetData.strengthScore || '10';
    elements.dexterityScore.value = sheetData.dexterityScore || '10'; // Переконайтеся, що це коректно завантажується
    elements.constitutionScore.value = sheetData.constitutionScore || '10';
    elements.intelligenceScore.value = sheetData.intelligenceScore || '10';
    elements.wisdomScore.value = sheetData.wisdomScore || '10';
    elements.charismaScore.value = sheetData.charismaScore || '10';
    elements.maxHp.value = sheetData.maxHp || '10';
    elements.currentHp.value = sheetData.currentHp || '10';
    elements.tempHp.value = sheetData.tempHp || '0';

    elements.characterPhotoUrl.value = sheetData.characterPhotoUrl || '';
    if (sheetData.characterPhotoUrl) {
        elements.characterPhotoPreview.src = sheetData.characterPhotoUrl;
        elements.characterPhotoPreview.style.display = 'block';
    } else {
        elements.characterPhotoPreview.src = '';
        elements.characterPhotoPreview.style.display = 'none';
    }

    updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    updateAbilityModifier(elements.charismaScore, elements.charismaModifier);

    if (characterSheetTemplate) {
        characterSheetTemplate.style.display = 'flex';
    }

    console.log('Дані активного листа завантажено:', sheetData);
    updateCharacterSelect();
}

function updateAbilityModifier(scoreInput, modifierElement) {
    const score = parseInt(scoreInput.value || '0');
    const modifier = Math.floor((score - 10) / 2);
    modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
}


function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        alert(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`);
        return;
    }

    if (characterSheets.length > 0) {
        saveActiveSheetData();
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

    saveActiveSheetData();
    loadActiveSheetData();
    console.log('Додано новий лист персонажа. Загалом листів:', characterSheets.length);
}

function deleteCharacterSheet() {
    if (characterSheets.length === 0) {
        alert('Немає листів для видалення.');
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(activeSheetIndex, 1);

        if (characterSheets.length === 0) {
            activeSheetIndex = 0;
            addCharacterSheet();
            return;
        } else if (activeSheetIndex >= characterSheets.length) {
            activeSheetIndex = characterSheets.length - 1;
        }

        saveActiveSheetData();
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
    }
}

function switchCharacterSheet(index) {
    if (index === activeSheetIndex) return;

    saveActiveSheetData();
    activeSheetIndex = index;
    saveActiveSheetData();
    loadActiveSheetData();
}

function updateCharacterSelect() {
    const characterSelect = document.getElementById('characterSelect');
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

    if (!characterSelect.dataset.hasChangeListener) {
        characterSelect.addEventListener('change', (event) => {
            switchCharacterSheet(parseInt(event.target.value));
        });
        characterSelect.dataset.hasChangeListener = true;
    }
}


document.addEventListener('DOMContentLoaded', () => {
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
        characterPhotoUrlInput.addEventListener('input', () => {
            const url = characterPhotoUrlInput.value;
            if (url) {
                characterPhotoPreview.src = url;
                characterPhotoPreview.style.display = 'block';
            } else {
                characterPhotoPreview.src = '';
                characterPhotoPreview.style.display = 'none';
            }
            debouncedSaveActiveSheetData();
        });
    }

    try {
        const savedSheetsString = localStorage.getItem(DARQIE_SHEETS_KEY);
        if (savedSheetsString) {
            characterSheets = JSON.parse(savedSheetsString);
            if (characterSheets.length > 0) {
                const lastActiveIndexString = localStorage.getItem(DARQIE_ACTIVE_INDEX_KEY);
                const parsedIndex = parseInt(lastActiveIndexString);
                if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < characterSheets.length) {
                    activeSheetIndex = parsedIndex;
                } else {
                    activeSheetIndex = 0;
                }
            } else {
                addCharacterSheet();
            }
        } else {
            addCharacterSheet();
        }
    } catch (error) {
        console.error("Помилка завантаження даних з localStorage:", error);
        alert("Помилка завантаження листів персонажів. Можливо, пошкоджені дані.");
        if (characterSheets.length === 0) {
            addCharacterSheet();
        }
    }

    loadActiveSheetData();

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

    const elements = getSheetInputElements();
    // Ці оновлення повинні бути викликані вже після loadActiveSheetData(),
    // яка вже викликає updateAbilityModifier для всіх елементів.
    // Залишаємо їх тут як додаткову перевірку, але вони можуть бути надмірними.
    if (elements.strengthScore) updateAbilityModifier(elements.strengthScore, elements.strengthModifier);
    if (elements.dexterityScore) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier);
    if (elements.constitutionScore) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier);
    if (elements.intelligenceScore) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier);
    if (elements.wisdomScore) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier);
    if (elements.charismaScore) updateAbilityModifier(elements.charismaScore, elements.charismaModifier);
});
