// main.js

function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

function updateModifiers() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilities.forEach(ability => {
        const score = parseInt(document.getElementById(`${ability}Score`).value);
        const modifier = calculateModifier(score);
        document.getElementById(`${ability}Modifier`).textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
    });
}

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

let characterSheets = [];
let activeSheetIndex = 0;
let characterSelect;

// Функція для збереження даних у localStorage
function saveLocalData() {
    try {
        localStorage.setItem('darqie.characterSheets', JSON.stringify(characterSheets));
        localStorage.setItem('darqie.activeSheetIndex', activeSheetIndex.toString());
        console.log("Дані збережено локально.");
    } catch (error) {
        console.error("Помилка збереження даних у localStorage:", error);
        alert("Помилка збереження даних локально: " + error.message);
    }
}

// Функція для завантаження даних з localStorage
function loadLocalData() {
    try {
        const storedSheets = localStorage.getItem('darqie.characterSheets');
        const storedIndex = localStorage.getItem('darqie.activeSheetIndex');

        if (storedSheets) {
            characterSheets = JSON.parse(storedSheets);
            activeSheetIndex = parseInt(storedIndex) || 0;
            if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length > 0 ? characterSheets.length - 1 : 0;
            }
        } else {
            // Якщо локальних даних немає, ініціалізуємо перший порожній лист
            addCharacterSheet(); // Виклик цієї функції також збереже порожній лист
        }
    } catch (error) {
        console.error("Помилка завантаження даних з localStorage:", error);
        alert("Помилка завантаження даних локально: " + error.message);
        // Якщо помилка завантаження, і characterSheets порожні, ініціалізуємо базовий лист
        if (characterSheets.length === 0) {
            addCharacterSheet();
        }
    }
}


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

    updateModifiers();
}

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


function addCharacterSheet() {
    const newSheet = {
        name: '', classLevel: '', background: '', playerName: '',
        race: '', alignment: '', experiencePoints: 0,
        abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        hp: { max: 10, current: 10, temp: 0 }, photoUrl: ''
    };
    characterSheets.push(newSheet);
    activeSheetIndex = characterSheets.length - 1;
    updateCharacterSelect();
    loadCharacterSheet(newSheet);
    saveLocalData(); // Зберігаємо локально
}

function deleteCharacterSheet() {
    if (characterSheets.length > 1) {
        characterSheets.splice(activeSheetIndex, 1);
        activeSheetIndex = Math.max(0, activeSheetIndex - 1);
        updateCharacterSelect();
        loadCharacterSheet(characterSheets[activeSheetIndex]);
        saveLocalData(); // Зберігаємо локально
    } else if (characterSheets.length === 1) {
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
        saveLocalData(); // Зберігаємо локально
    }
}


// ОСНОВНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ (тепер без OBR.onReady)
function initializeExtension() {
    characterSelect = document.getElementById('characterSelect');

    const inputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer textarea, #characterSheetContainer select');
    inputElements.forEach(input => {
        input.addEventListener('input', () => {
            saveCharacterSheetData(characterSheets[activeSheetIndex]);
            saveLocalData(); // Зберігаємо локально
            if (input.classList.contains('score-input')) {
                updateModifiers();
            }
        });
    });

    document.getElementById('addCharacterButton').addEventListener('click', addCharacterSheet);
    document.getElementById('deleteCharacterButton').addEventListener('click', deleteCharacterSheet);
    characterSelect.addEventListener('change', (event) => {
        activeSheetIndex = parseInt(event.target.value);
        loadCharacterSheet(characterSheets[activeSheetIndex]);
    });

    document.getElementById('characterPhotoUrl').addEventListener('input', (event) => {
        updatePhotoPreview(event.target.value);
    });

    // Завантаження даних з localStorage при запуску
    loadLocalData(); 
    updateCharacterSelect();
    loadCharacterSheet(characterSheets[activeSheetIndex]);
}


// Викликаємо функцію ініціалізації після завантаження DOM
document.addEventListener('DOMContentLoaded', initializeExtension);
