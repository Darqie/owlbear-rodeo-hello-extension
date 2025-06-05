// main.js

// Всі функції, які не залежать від DOM або OBR для їх визначення,
// можуть бути оголошені тут, у глобальній області видимості.
// Але їх виклики мають бути всередині initializeExtension().

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

// Глобальні змінні, які потребують доступу з різних функцій.
// Їх ініціалізація або перше використання має бути в initializeExtension.
let characterSheets = [];
let activeSheetIndex = 0;
let characterSelect; // Ініціалізується в initializeExtension()

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

// Функція для збереження даних у OBR Metadata
async function saveObrMetadata() {
    try {
        // Рядок 235: Цей виклик тепер абсолютно точно має виконуватися
        // лише після того, як OBR готовий завдяки OBR.onReady() та initializeExtension().
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
    saveObrMetadata();
}

function deleteCharacterSheet() {
    if (characterSheets.length > 1) {
        characterSheets.splice(activeSheetIndex, 1);
        activeSheetIndex = Math.max(0, activeSheetIndex - 1);
        updateCharacterSelect();
        loadCharacterSheet(characterSheets[activeSheetIndex]);
        saveObrMetadata();
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
        saveObrMetadata();
    }
}


// ОСНОВНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ РОЗШИРЕННЯ
// Ця функція викликається тільки після того, як OBR SDK повністю завантажений та готовий.
async function initializeExtension() {
    // Ініціалізуємо елементи DOM тут, коли DOM вже гарантовано готовий.
    characterSelect = document.getElementById('characterSelect');

    const inputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer textarea, #characterSheetContainer select');
    inputElements.forEach(input => {
        input.addEventListener('input', () => {
            saveCharacterSheetData(characterSheets[activeSheetIndex]);
            saveObrMetadata();
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

    // Завантаження даних з OBR Metadata при запуску розширення
    try {
        const metadata = await OBR.player.getMetadata();
        if (metadata && metadata['darqie.characterSheets']) {
            characterSheets = metadata['darqie.characterSheets'];
            activeSheetIndex = metadata['darqie.activeSheetIndex'] || 0;
            if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length > 0 ? characterSheets.length - 1 : 0;
            }
        } else {
            // Якщо метаданих немає, додаємо перший порожній лист
            addCharacterSheet();
        }
        updateCharacterSelect();
        loadCharacterSheet(characterSheets[activeSheetIndex]);
    } catch (error) {
        console.error("Помилка завантаження даних з OBR Metadata:", error);

        // Якщо помилка завантаження, і characterSheets порожні, ініціалізуємо базовий лист
        if (characterSheets.length === 0) {
            const emptySheet = {
                name: '', classLevel: '', background: '', playerName: '',
                race: '', alignment: '', experiencePoints: 0,
                abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
                hp: { max: 10, current: 10, temp: 0 }, photoUrl: ''
            };
            characterSheets.push(emptySheet);
            activeSheetIndex = 0;
            updateCharacterSelect();
            loadCharacterSheet(emptySheet);
            saveObrMetadata(); // Спроба зберегти порожній лист після ініціалізації
        }
    }
}


// *** КЛЮЧОВИЙ МОМЕНТ: OBR.onReady() ***
// Ця функція гарантує, що initializeExtension() буде викликана лише після того,
// як Owlbear Rodeo SDK повністю завантажений та готовий.
// Всі виклики функцій, що залежать від OBR, повинні відбуватися після цього.
OBR.onReady(() => {
    initializeExtension();
});
