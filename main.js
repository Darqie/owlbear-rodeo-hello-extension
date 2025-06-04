// main.js

// Це важливо: весь ваш код, що взаємодіє з DOM або OBR, повинен бути всередині initializeExtension()
// або викликатися після OBR.onReady().

// Функція для обчислення модифікатора характеристик
function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Функція для оновлення модифікаторів на основі введених значень характеристик
function updateModifiers() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilities.forEach(ability => {
        const score = parseInt(document.getElementById(`${ability}Score`).value);
        const modifier = calculateModifier(score);
        document.getElementById(`${ability}Modifier`).textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
    });
}

// Функція для оновлення превью фото персонажа
function updatePhotoPreview(url) {
    const imgElement = document.getElementById('characterPhotoPreview');
    if (url) {
        imgElement.src = url;
        imgElement.style.display = 'block';
    } else {
        imgElement.src = '';
        imgElement.style.display = 'none';
    }
}

// Глобальні змінні для зберігання листів персонажів та активного індексу
let characterSheets = [];
let activeSheetIndex = 0;
let characterSelect; // Буде ініціалізовано пізніше в initializeExtension()

// Функція для збереження даних з форми в об'єкт листа персонажа
function saveCharacterSheetData(sheet) {
    sheet.name = document.getElementById('characterName').value;
    sheet.classLevel = document.getElementById('characterClassLevel').value;
    sheet.background = document.getElementById('background').value;
    sheet.playerName = document.getElementById('playerName').value;
    sheet.race = document.getElementById('characterRace').value;
    sheet.alignment = document.getElementById('alignment').value;
    sheet.experiencePoints = parseInt(document.getElementById('experiencePoints').value) || 0;

    sheet.abilities.strength = parseInt(document.getElementById('strengthScore').value) || 10;
    sheet.abilities.dexterity = parseInt(document.getElementById('dexterityScore').value) || 10;
    sheet.abilities.constitution = parseInt(document.getElementById('constitutionScore').value) || 10;
    sheet.abilities.intelligence = parseInt(document.getElementById('intelligenceScore').value) || 10;
    sheet.abilities.wisdom = parseInt(document.getElementById('wisdomScore').value) || 10;
    sheet.abilities.charisma = parseInt(document.getElementById('charismaScore').value) || 10;

    sheet.hp.max = parseInt(document.getElementById('maxHp').value) || 10;
    sheet.hp.current = parseInt(document.getElementById('currentHp').value) || 10;
    sheet.hp.temp = parseInt(document.getElementById('tempHp').value) || 0;

    sheet.photoUrl = document.getElementById('characterPhotoUrl').value;
}

// Функція для завантаження даних для вибраного листа в форму
function loadCharacterSheet(sheet) {
    document.getElementById('characterName').value = sheet.name || '';
    document.getElementById('characterClassLevel').value = sheet.classLevel || '';
    document.getElementById('background').value = sheet.background || '';
    document.getElementById('playerName').value = sheet.playerName || '';
    document.getElementById('characterRace').value = sheet.race || '';
    document.getElementById('alignment').value = sheet.alignment || '';
    document.getElementById('experiencePoints').value = sheet.experiencePoints || 0;

    document.getElementById('strengthScore').value = sheet.abilities.strength || 10;
    document.getElementById('dexterityScore').value = sheet.abilities.dexterity || 10;
    document.getElementById('constitutionScore').value = sheet.abilities.constitution || 10;
    document.getElementById('intelligenceScore').value = sheet.abilities.intelligence || 10;
    document.getElementById('wisdomScore').value = sheet.abilities.wisdom || 10;
    document.getElementById('charismaScore').value = sheet.abilities.charisma || 10;

    document.getElementById('maxHp').value = sheet.hp.max || 10;
    document.getElementById('currentHp').value = sheet.hp.current || 10;
    document.getElementById('tempHp').value = sheet.hp.temp || 0;

    document.getElementById('characterPhotoUrl').value = sheet.photoUrl || '';
    updatePhotoPreview(sheet.photoUrl);

    updateModifiers(); // Оновлюємо модифікатори після завантаження
}

// Функція для оновлення випадаючого списку персонажів
function updateCharacterSelect() {
    characterSelect.innerHTML = '';
    characterSheets.forEach((sheet, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = sheet.name || `Персонаж ${index + 1}`;
        characterSelect.appendChild(option);
    });
    characterSelect.value = activeSheetIndex;
}

// Функція для збереження даних у OBR Metadata
async function saveObrMetadata() {
    try {
        await OBR.player.setMetadata({
            'darqie.characterSheets': characterSheets,
            'darqie.activeSheetIndex': activeSheetIndex
        });
        console.log("Дані збережено успішно.");
    } catch (error) {
        console.error("Помилка збереження даних через OBR Metadata:", error);
        alert("Помилка збереження даних: " + error.message);
    }
}

// Функція для додавання нового персонажа
function addCharacterSheet() {
    const newSheet = {
        name: '',
        classLevel: '',
        background: '',
        playerName: '',
        race: '',
        alignment: '',
        experiencePoints: 0,
        abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        hp: { max: 10, current: 10, temp: 0 },
        photoUrl: ''
    };
    characterSheets.push(newSheet);
    activeSheetIndex = characterSheets.length - 1;
    updateCharacterSelect();
    loadCharacterSheet(newSheet);
    saveObrMetadata(); // Зберігаємо дані після додавання
}

// Функція для видалення поточного персонажа
function deleteCharacterSheet() {
    if (characterSheets.length > 1) {
        characterSheets.splice(activeSheetIndex, 1);
        activeSheetIndex = Math.max(0, activeSheetIndex - 1); // Залишаємось на першому або попередньому
        updateCharacterSelect();
        loadCharacterSheet(characterSheets[activeSheetIndex]);
        saveObrMetadata(); // Зберігаємо після видалення
    } else if (characterSheets.length === 1) {
        // Якщо залишився один, очистити його, але не видаляти сам об'єкт
        const emptySheet = {
            name: '', classLevel: '', background: '', playerName: '',
            race: '', alignment: '', experiencePoints: 0,
            abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
            hp: { max: 10, current: 10, temp: 0 }, photoUrl: ''
        };
        characterSheets[0] = emptySheet;
        activeSheetIndex = 0;
        updateCharacterSelect();
        loadCharacterSheet(emptySheet);
        saveObrMetadata();
    }
}


// ОСНОВНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ РОЗШИРЕННЯ
// Вона буде викликана, коли OBR SDK повністю завантажиться та буде готовий.
async function initializeExtension() {
    // Ініціалізуємо characterSelect тут, після того як DOM готовий
    characterSelect = document.getElementById('characterSelect');

    // Обираємо всі поля вводу для збереження даних
    const inputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer textarea, #characterSheetContainer select');

    inputElements.forEach(input => {
        input.addEventListener('input', () => {
            saveCharacterSheetData(characterSheets[activeSheetIndex]);
            saveObrMetadata(); // Зберігаємо зміни до OBR metadata
            // Оновлюємо модифікатори, якщо змінилася характеристика
            if (input.classList.contains('score-input')) {
                updateModifiers();
            }
        });
    });

    // Обробники подій для кнопок та випадаючого списку
    document.getElementById('addCharacterButton').addEventListener('click', addCharacterSheet);
    document.getElementById('deleteCharacterButton').addEventListener('click', deleteCharacterSheet);
    characterSelect.addEventListener('change', (event) => {
        activeSheetIndex = parseInt(event.target.value);
        loadCharacterSheet(characterSheets[activeSheetIndex]);
    });

    // Обробник для оновлення фото
    document.getElementById('characterPhotoUrl').addEventListener('input', (event) => {
        updatePhotoPreview(event.target.value);
    });

    // Завантаження даних з OBR Metadata при запуску розширення
    try {
        const metadata = await OBR.player.getMetadata();
        // Перевіряємо, чи існують наші метадані
        if (metadata && metadata['darqie.characterSheets']) {
            characterSheets = metadata['darqie.characterSheets'];
            activeSheetIndex = metadata['darqie.activeSheetIndex'] || 0;
            // Перевірка на валідність activeSheetIndex
            if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length > 0 ? characterSheets.length - 1 : 0;
            }
        } else {
            // Якщо метаданих немає або вони порожні, створюємо перший порожній лист
            addCharacterSheet();
        }
        updateCharacterSelect();
        loadCharacterSheet(characterSheets[activeSheetIndex]);
    } catch (error) {
        console.error("Помилка завантаження даних з OBR Metadata:", error);
        alert("Помилка завантаження листів персонажів. Можливо, пошкоджені дані або OBR API недоступний."); // Це повідомлення з вашого скріншоту
        // Якщо виникла помилка, переконайтеся, що розширення хоча б відображає порожній лист
        if (characterSheets.length === 0) {
            addCharacterSheet(); // Створити порожній лист, щоб розширення могло працювати
        }
    }
}


// *** ЦЕЙ РЯДОК Є КЛЮЧОВИМ! ***
// OBR.onReady() гарантує, що функція initializeExtension() буде викликана лише після того,
// як OBR SDK повністю завантажений та ініціалізований.
// Це вирішує проблему "OBR is not defined", оскільки ваш код не намагатиметься
// використовувати OBR до його готовності.
OBR.onReady(() => {
    // Всі взаємодії з DOM та OBR тепер мають бути всередині або викликатися звідси.
    // DOMContentLoaded тут вже не потрібен, оскільки OBR.onReady чекає, поки DOM буде готовий.
    initializeExtension();
});
