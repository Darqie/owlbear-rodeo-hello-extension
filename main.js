const LOCAL_STORAGE_KEY = 'dndCharacterSheets';
const MAX_SHEETS = 10;

let characterSheets = [];
let activeSheetIndex = 0;

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
        characterPhotoUrl: container.querySelector('#characterPhotoUrl'), // Додано поле фото
        characterPhotoPreview: container.querySelector('#characterPhotoPreview') // Додано прев'ю фото
    };
}

// Функція для збереження даних активного листа в масив characterSheets
function saveActiveSheetData() {
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
        characterPhotoUrl: elements.characterPhotoUrl.value // Зберігаємо URL фото
    };

    characterSheets[activeSheetIndex] = currentSheetData;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
    localStorage.setItem('activeSheetIndex', activeSheetIndex.toString()); // Зберігаємо активний індекс
    console.log('Дані активного листа збережено:', characterSheets[activeSheetIndex]);
    updateCharacterTabs(); // Оновлюємо вкладки, щоб відобразити нові імена, якщо змінились
}

// Функція для завантаження даних активного листа з масиву characterSheets
function loadActiveSheetData() {
    if (characterSheets.length === 0) {
        addCharacterSheet();
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

    console.log('Дані активного листа завантажено:', sheetData);
    updateCharacterTabs();
}

// Функція для додавання нового листа персонажа
function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        alert(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`);
        return;
    }

    if (characterSheets.length > 0) {
        saveActiveSheetData();
    }

    const newSheetData = {
        characterName: `Новий Персонаж ${characterSheets.length + 1}`, // Унікальне ім'я за замовчуванням
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

// Функція для видалення активного листа персонажа
function deleteCharacterSheet() {
    if (characterSheets.length === 0) {
        alert('Немає листів для видалення.');
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(activeSheetIndex, 1); // Видаляємо поточний лист

        // Оновлюємо activeSheetIndex після видалення
        if (characterSheets.length === 0) {
            activeSheetIndex = 0; // Немає листів
            addCharacterSheet(); // Створюємо новий порожній лист
        } else if (activeSheetIndex >= characterSheets.length) {
            activeSheetIndex = characterSheets.length - 1; // Якщо видалили останній, переходимо на попередній
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
        localStorage.setItem('activeSheetIndex', activeSheetIndex.toString());
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData(); // Завантажуємо новий активний лист
    }
}

// Функція для перемикання між листами
function switchCharacterSheet(index) {
    if (index === activeSheetIndex) return;

    saveActiveSheetData();
    activeSheetIndex = index;
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

        // Кнопка закриття (видалення) вкладки
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-tab');
        closeBtn.textContent = 'x';
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Зупиняємо розповсюдження події, щоб не спрацював клік по вкладці
            deleteCharacterSheetByIndex(index);
        });
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => switchCharacterSheet(index));
        characterTabsContainer.appendChild(tab);
    });
}

// Функція для видалення листа за індексом (викликається з вкладки)
function deleteCharacterSheetByIndex(indexToDelete) {
    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[indexToDelete].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(indexToDelete, 1);

        // Коригуємо activeSheetIndex, якщо видалено активну вкладку або вкладку перед активною
        if (activeSheetIndex === indexToDelete) {
            // Якщо видалили активний лист
            if (characterSheets.length === 0) {
                activeSheetIndex = 0; // Встановлюємо 0, щоб потім додати новий
                addCharacterSheet(); // Створюємо новий, оскільки листів не залишилось
                return; // Виходимо, щоб не завантажувати старий індекс
            } else if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length - 1; // Якщо видалили останній, переходимо на попередній
            }
        } else if (activeSheetIndex > indexToDelete) {
            activeSheetIndex--; // Якщо видалили лист перед активним, зменшуємо індекс активного
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
        localStorage.setItem('activeSheetIndex', activeSheetIndex.toString());
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
    }
}


// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    const addCharacterButton = document.getElementById('addCharacterButton');
    const deleteCharacterButton = document.getElementById('deleteCharacterButton');
    const characterPhotoUrlInput = document.getElementById('characterPhotoUrl');
    const characterPhotoPreview = document.getElementById('characterPhotoPreview');

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
            saveActiveSheetData(); // Зберігаємо URL фото при зміні
        });
    }


    // Завантажуємо всі листи з localStorage при старті
    const savedSheets = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSheets) {
        characterSheets = JSON.parse(savedSheets);
        if (characterSheets.length > 0) {
            const lastActiveIndex = localStorage.getItem('activeSheetIndex');
            if (lastActiveIndex !== null && parseInt(lastActiveIndex) < characterSheets.length) {
                activeSheetIndex = parseInt(lastActiveIndex);
            } else {
                activeSheetIndex = 0;
            }
        } else {
            addCharacterSheet();
        }
    } else {
        addCharacterSheet();
    }

    loadActiveSheetData(); // Завантажуємо та відображаємо активний лист

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    // Важливо: слухачі додаються до елементів, які є частиною DOM на старті
    // і будуть оновлюватися функцією loadActiveSheetData
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select');
    allInputElements.forEach(element => {
        element.addEventListener('input', saveActiveSheetData);
        element.addEventListener('change', saveActiveSheetData);
    });
});
