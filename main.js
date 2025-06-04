const LOCAL_STORAGE_KEY = 'dndCharacterSheets'; // Ключ для зберігання всіх листів
const MAX_SHEETS = 10; // Максимальна кількість листів персонажів

let characterSheets = []; // Масив для зберігання всіх листів персонажів
let activeSheetIndex = 0; // Індекс активного листа

// Функція для отримання всіх полів вводу та вибору з поточного листа
function getSheetInputElements() {
    const container = document.getElementById('characterSheetContainer');
    // Отримуємо всі input та select елементи, які є частиною листа
    // Важливо, щоб вони були унікальними для кожного листа, коли ми їх клонуємо.
    // Наразі ми працюємо з елементами, які є унікальними в DOM.
    // Якщо будемо клонувати, id's потрібно буде змінювати.
    // Для простоти, на першому етапі, ми просто беремо елементи з DOM.
    // Це буде оновлено, коли ми почнемо клонувати.
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
        tempHp: container.querySelector('#tempHp')
        // Додавайте сюди інші поля, які ви хочете зберігати
    };
}

// Функція для збереження даних активного листа в масив characterSheets
function saveActiveSheetData() {
    if (characterSheets.length === 0) return; // Немає листів для збереження

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
        tempHp: elements.tempHp.value
    };

    characterSheets[activeSheetIndex] = currentSheetData;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
    console.log('Дані активного листа збережено:', characterSheets[activeSheetIndex]);
    updateCharacterTabs(); // Оновлюємо вкладки, щоб відобразити нові імена, якщо змінились
}

// Функція для завантаження даних активного листа з масиву characterSheets
function loadActiveSheetData() {
    if (characterSheets.length === 0) {
        addCharacterSheet(); // Якщо немає листів, додаємо перший
        return;
    }
    if (activeSheetIndex >= characterSheets.length) {
        activeSheetIndex = characterSheets.length - 1; // Коригуємо індекс, якщо він за межами масиву
    }

    const sheetData = characterSheets[activeSheetIndex];
    const elements = getSheetInputElements();

    elements.characterName.value = sheetData.characterName || '';
    elements.characterClassLevel.value = sheetData.characterClassLevel || '';
    elements.background.value = sheetData.background || '';
    elements.playerName.value = sheetData.playerName || '';
    elements.characterRace.value = sheetData.characterRace || '';
    elements.alignment.value = sheetData.alignment || '';
    elements.experiencePoints.value = sheetData.experiencePoints || '';
    elements.strengthScore.value = sheetData.strengthScore || '10';
    elements.dexterityScore.value = sheetData.dexterityScore || '10';
    elements.constitutionScore.value = sheetData.constitutionScore || '10';
    elements.intelligenceScore.value = sheetData.intelligenceScore || '10';
    elements.wisdomScore.value = sheetData.wisdomScore || '10';
    elements.charismaScore.value = sheetData.charismaScore || '10';
    elements.maxHp.value = sheetData.maxHp || '10';
    elements.currentHp.value = sheetData.currentHp || '10';
    elements.tempHp.value = sheetData.tempHp || '0';

    console.log('Дані активного листа завантажено:', sheetData);
    updateCharacterTabs(); // Оновлюємо вкладки, щоб відобразити активний
}

// Функція для додавання нового листа персонажа
function addCharacterSheet() {
    if (characterSheets.length >= MAX_SHEETS) {
        alert(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`);
        return;
    }

    // Зберігаємо поточний лист перед створенням нового, якщо він є
    if (characterSheets.length > 0) {
        saveActiveSheetData();
    }

    const newSheetData = {
        characterName: 'Новий Персонаж',
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
        tempHp: '0'
    };
    characterSheets.push(newSheetData);
    activeSheetIndex = characterSheets.length - 1; // Робимо новий лист активним

    saveActiveSheetData(); // Зберігаємо весь масив, включаючи новий лист
    loadActiveSheetData(); // Завантажуємо та відображаємо новий лист
    console.log('Додано новий лист персонажа. Загалом листів:', characterSheets.length);
}

// Функція для перемикання між листами
function switchCharacterSheet(index) {
    if (index === activeSheetIndex) return; // Якщо клікнули на активну вкладку

    saveActiveSheetData(); // Зберігаємо дані поточного листа перед перемиканням
    activeSheetIndex = index;
    loadActiveSheetData(); // Завантажуємо дані нового активного листа
}

// Функція для оновлення вкладок персонажів
function updateCharacterTabs() {
    const characterTabsContainer = document.getElementById('characterTabs');
    characterTabsContainer.innerHTML = ''; // Очищаємо всі існуючі вкладки

    characterSheets.forEach((sheet, index) => {
        const tab = document.createElement('div');
        tab.classList.add('character-tab');
        if (index === activeSheetIndex) {
            tab.classList.add('active');
        }
        // Використовуємо ім'я персонажа для вкладки, або "Новий Персонаж N"
        tab.textContent = sheet.characterName || `Персонаж ${index + 1}`;
        tab.dataset.index = index; // Зберігаємо індекс для перемикання

        tab.addEventListener('click', () => switchCharacterSheet(index));
        characterTabsContainer.appendChild(tab);
    });
}

// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    const addCharacterButton = document.getElementById('addCharacterButton');
    if (addCharacterButton) {
        addCharacterButton.addEventListener('click', addCharacterSheet);
    }

    // Завантажуємо всі листи з localStorage при старті
    const savedSheets = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSheets) {
        characterSheets = JSON.parse(savedSheets);
        if (characterSheets.length > 0) {
            // Перевіряємо активний індекс, щоб уникнути помилок, якщо вкладка була видалена
            const lastActiveIndex = localStorage.getItem('activeSheetIndex');
            if (lastActiveIndex !== null && parseInt(lastActiveIndex) < characterSheets.length) {
                activeSheetIndex = parseInt(lastActiveIndex);
            } else {
                activeSheetIndex = 0; // Якщо індекс некоректний, встановлюємо 0
            }
        } else {
            addCharacterSheet(); // Якщо localStorage порожній, додаємо перший лист
        }
    } else {
        addCharacterSheet(); // Якщо localStorage порожній, додаємо перший лист
    }

    // Після завантаження даних, відображаємо активний лист і вкладки
    loadActiveSheetData();

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    // Важливо: ми тепер додаємо слухачів до елементів, які *уже існують* на момент DOMContentLoaded.
    // При перемиканні листів, ми будемо перезавантажувати дані в *ті ж самі* елементи.
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select');
    allInputElements.forEach(element => {
        element.addEventListener('input', saveActiveSheetData);
        element.addEventListener('change', saveActiveSheetData);
    });
});
