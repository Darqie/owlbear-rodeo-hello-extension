import OBR from 'https://unpkg.com/@owlbear-rodeo/sdk'; //

// OBR SDK НЕ використовується, всі взаємодії з Owlbear Rodeo видалено.
// Зберігання даних відбувається ЛИШЕ у локальному сховищі браузера (localStorage).

const DARQIE_SHEETS_KEY = 'darqie.characterSheets'; // Ключ для збереження листів персонажів у localStorage
const DARQIE_ACTIVE_INDEX_KEY = 'darqie.activeSheetIndex'; // Ключ для збереження активного індексу у localStorage
const MAX_SHEETS = 10; //
const DEBOUNCE_DELAY = 300; // Затримка в мс для дебаунсингу

let characterSheets = []; //
let activeSheetIndex = 0; //
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
function debounce(func, delay) { //
    return function(...args) { //
        const context = this; //
        clearTimeout(saveTimer); // Очищаємо попередній таймер
        saveTimer = setTimeout(() => func.apply(context, args), delay); //
    };
}

// Функція для отримання всіх полів вводу та вибору з поточного листа
function getSheetInputElements() { //
    const container = document.getElementById('characterSheetContainer'); //
    // Перевіряємо, чи контейнер існує, перш ніж шукати елементи
    if (!container) { //
        console.error("Контейнер characterSheetContainer не знайдено!"); //
        return {}; // Повертаємо порожній об'єкт, щоб уникнути помилок
    }
    return { //
        characterName: container.querySelector('#characterName'), //
        characterClassLevel: container.querySelector('#characterClassLevel'), //
        background: container.querySelector('#background'), //
        playerName: container.querySelector('#playerName'), //
        characterRace: container.querySelector('#characterRace'), //
        alignment: container.querySelector('#alignment'), //
        experiencePoints: container.querySelector('#experiencePoints'), //
        characterPhotoUrl: container.querySelector('#characterPhotoUrl'), //

        strengthScore: container.querySelector('#strengthScore'), //
        dexterityScore: container.querySelector('#dexterityScore'), //
        constitutionScore: container.querySelector('#constitutionScore'), //
        intelligenceScore: container.querySelector('#intelligenceScore'), //
        wisdomScore: container.querySelector('#wisdomScore'), //
        charismaScore: container.querySelector('#charismaScore'), //

        strengthModifier: container.querySelector('#strengthModifier'), //
        dexterityModifier: container.querySelector('#dexterityModifier'), //
        constitutionModifier: container.querySelector('#constitutionModifier'), //
        intelligenceModifier: container.querySelector('#intelligenceModifier'), //
        wisdomModifier: container.querySelector('#wisdomModifier'), //
        charismaModifier: container.querySelector('#charismaModifier'), //

        maxHp: container.querySelector('#maxHp'), //
        currentHp: container.querySelector('#currentHp'), //
        tempHp: container.querySelector('#tempHp'), //
    };
}

// Функція для збереження даних активного листа в localStorage
function saveActiveSheetData() { //
    if (characterSheets.length === 0) { //
        console.warn("Спроба зберегти дані, коли characterSheets порожній."); //
        return; //
    }
    if (activeSheetIndex < 0 || activeSheetIndex >= characterSheets.length) { //
        console.error(`Некоректний activeSheetIndex: ${activeSheetIndex}. Доступно листів: ${characterSheets.length}.`); //
        return; //
    }

    const elements = getSheetInputElements(); //
    
    // Перевіряємо, чи всі ключові елементи існують
    if (!elements.characterName || !elements.strengthScore) { //
        console.warn("Не всі елементи листа персонажа доступні для збереження. Пропускаємо збереження."); //
        return; //
    }

    // Створюємо новий об'єкт для поточних даних, щоб уникнути посилань на старі об'єкти
    const currentSheetData = { //
        characterName: elements.characterName.value || '', //
        characterClassLevel: elements.characterClassLevel.value || '', //
        background: elements.background.value || '', //
        playerName: elements.playerName.value || '', //
        characterRace: elements.characterRace.value || '', //
        alignment: elements.alignment.value || '', //
        experiencePoints: elements.experiencePoints.value || '0', //
        strengthScore: elements.strengthScore.value || '10', //
        dexterityScore: elements.dexterityScore.value || '10', //
        constitutionScore: elements.constitutionScore.value || '10', //
        intelligenceScore: elements.intelligenceScore.value || '10', //
        wisdomScore: elements.wisdomScore.value || '10', //
        charismaScore: elements.charismaScore.value || '10', //
        maxHp: elements.maxHp.value || '10', //
        currentHp: elements.currentHp.value || '10', //
        tempHp: elements.tempHp.value || '0', //
        characterPhotoUrl: elements.characterPhotoUrl.value || '' //
    };

    // Замінюємо об'єкт у масиві повністю новою копією
    characterSheets[activeSheetIndex] = currentSheetData; //
    
    try {
        localStorage.setItem(DARQIE_SHEETS_KEY, JSON.stringify(characterSheets)); //
        localStorage.setItem(DARQIE_ACTIVE_INDEX_KEY, activeSheetIndex.toString()); //
        console.log(`Дані листа ${characterSheets[activeSheetIndex].characterName} (індекс ${activeSheetIndex}) збережено в localStorage:`, characterSheets[activeSheetIndex]); //
        // updateCharacterSelect(); // Цей рядок тут не потрібен, оскільки loadActiveSheetData викличе його після завантаження
    } catch (error) {
        console.error("Помилка збереження даних в localStorage:", error); //
        alert("Помилка збереження листа персонажа."); //
    }
}

// Дебаунснута версія функції збереження
const debouncedSaveActiveSheetData = debounce(saveActiveSheetData, DEBOUNCE_DELAY); //


// Функція для завантаження даних активного листа з localStorage
function loadActiveSheetData() { //
    const characterSheetTemplate = document.getElementById('characterSheetTemplate'); //

    if (characterSheets.length === 0) { //
        if (characterSheetTemplate) { //
            characterSheetTemplate.style.display = 'none'; //
        }
        updateCharacterSelect(); //
        return; //
    }

    // Забезпечуємо, що activeSheetIndex знаходиться в межах допустимих значень
    if (activeSheetIndex < 0 || activeSheetIndex >= characterSheets.length) { //
        activeSheetIndex = Math.max(0, characterSheets.length - 1); //
        console.warn(`Скориговано activeSheetIndex до ${activeSheetIndex}`); //
    }

    // Створюємо глибоку копію активного листа для відображення.
    // Це ГАРАНТУЄ, що ми не працюємо з посиланням на об'єкт з characterSheets.
    const sheetData = JSON.parse(JSON.stringify(characterSheets[activeSheetIndex])); //
    
    const elements = getSheetInputElements(); //

    // Перевіряємо наявність елементів перед присвоєнням
    if (elements.characterName) elements.characterName.value = sheetData.characterName || ''; //
    if (elements.characterClassLevel) elements.characterClassLevel.value = sheetData.characterClassLevel || ''; //
    if (elements.background) elements.background.value = sheetData.background || ''; //
    if (elements.playerName) elements.playerName.value = sheetData.playerName || ''; //
    if (elements.characterRace) elements.characterRace.value = sheetData.characterRace || ''; //
    if (elements.alignment) elements.alignment.value = sheetData.alignment || ''; //
    if (elements.experiencePoints) elements.experiencePoints.value = sheetData.experiencePoints || '0'; //
    if (elements.strengthScore) elements.strengthScore.value = sheetData.strengthScore || '10'; //
    if (elements.dexterityScore) elements.dexterityScore.value = sheetData.dexterityScore || '10'; //
    if (elements.constitutionScore) elements.constitutionScore.value = sheetData.constitutionScore || '10'; //
    if (elements.intelligenceScore) elements.intelligenceScore.value = sheetData.intelligenceScore || '10'; //
    if (elements.wisdomScore) elements.wisdomScore.value = sheetData.wisdomScore || '10'; //
    if (elements.charismaScore) elements.charismaScore.value = sheetData.charismaScore || '10'; //
    if (elements.maxHp) elements.maxHp.value = sheetData.maxHp || '10'; //
    if (elements.currentHp) elements.currentHp.value = sheetData.currentHp || '10'; //
    if (elements.tempHp) elements.tempHp.value = sheetData.tempHp || '0'; //

    if (elements.characterPhotoUrl) elements.characterPhotoUrl.value = sheetData.characterPhotoUrl || ''; //
    if (elements.characterPhotoPreview) { //
        if (sheetData.characterPhotoUrl) { //
            elements.characterPhotoPreview.src = sheetData.characterPhotoUrl; //
            elements.characterPhotoPreview.style.display = 'block'; //
        } else {
            elements.characterPhotoPreview.src = ''; //
            elements.characterPhotoPreview.style.display = 'none'; //
        }
    }

    // Оновлюємо модифікатори, перевіряючи наявність елементів
    if (elements.strengthScore && elements.strengthModifier) updateAbilityModifier(elements.strengthScore, elements.strengthModifier); //
    if (elements.dexterityScore && elements.dexterityModifier) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier); //
    if (elements.constitutionScore && elements.constitutionModifier) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier); //
    if (elements.intelligenceScore && elements.intelligenceModifier) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier); //
    if (elements.wisdomScore && elements.wisdomModifier) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier); //
    if (elements.charismaScore && elements.charismaModifier) updateAbilityModifier(elements.charismaScore, elements.charismaModifier); //

    if (characterSheetTemplate) { //
        characterSheetTemplate.style.display = 'flex'; //
    }

    console.log(`Дані листа ${sheetData.characterName} (індекс ${activeSheetIndex}) завантажено та відображено.`); //
    updateCharacterSelect(); //
}

function updateAbilityModifier(scoreInput, modifierElement) { //
    const score = parseInt(scoreInput.value || '0'); //
    const modifier = Math.floor((score - 10) / 2); //
    modifierElement.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`; //
}


function addCharacterSheet() { //
    if (characterSheets.length >= MAX_SHEETS) { //
        alert(`Ви можете мати не більше ${MAX_SHEETS} листів персонажів.`); //
        return; //
    }

    // Зберігаємо дані поточного листа перед перемиканням на новий
    if (characterSheets.length > 0) { //
        saveActiveSheetData(); //
    }

    const newSheetData = { //
        characterName: `Новий Персонаж ${characterSheets.length + 1}`, //
        characterClassLevel: '', //
        background: '', //
        playerName: '', //
        characterRace: '', //
        alignment: '', //
        experiencePoints: '0', //
        strengthScore: '10', //
        dexterityScore: '10', //
        constitutionScore: '10', //
        intelligenceScore: '10', //
        wisdomScore: '10', //
        charismaScore: '10', //
        maxHp: '10', //
        currentHp: '10', //
        tempHp: '0', //
        characterPhotoUrl: '' //
    };
    characterSheets.push(newSheetData); //
    activeSheetIndex = characterSheets.length - 1; //

    saveActiveSheetData(); // Зберігаємо новий лист у localStorage
    loadActiveSheetData(); // Завантажуємо та відображаємо новий лист
    console.log('Додано новий лист персонажа. Загалом листів:', characterSheets.length); //
}

function deleteCharacterSheet() { //
    if (characterSheets.length === 0) { //
        alert('Немає листів для видалення.'); //
        return; //
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) { //
        const deletedIndex = activeSheetIndex; // Зберігаємо індекс, який видаляємо
        characterSheets.splice(deletedIndex, 1); //

        if (characterSheets.length === 0) { //
            activeSheetIndex = 0; //
            addCharacterSheet(); // Створюємо новий порожній лист
            return; //
        } else if (activeSheetIndex >= characterSheets.length) { //
            // Якщо активний індекс був останнім, або після нього нічого не залишилось
            activeSheetIndex = characterSheets.length - 1; //
        }
        // Якщо видалили лист перед активним, активний індекс не змінюється

        saveActiveSheetData(); // Зберігаємо зміни після видалення
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length); //
        loadActiveSheetData(); // Завантажуємо новий активний лист
    }
}

function switchCharacterSheet(index) { //
    if (index === activeSheetIndex) { //
        console.log(`Спроба переключитися на той самий лист (індекс ${index}). Нічого не робимо.`); //
        return; //
    }

    // Зберігаємо дані поточного листа ПЕРЕД перемиканням
    console.log(`Зберігаємо поточний лист (індекс ${activeSheetIndex}) перед перемиканням на індекс ${index}.`); //
    clearTimeout(saveTimer); // Гарантуємо, що поточний дебаунс збереження завершиться негайно або буде скасований
    saveActiveSheetData(); // Явно викликаємо збереження

    activeSheetIndex = index; //
    // saveActiveSheetData(); // Цей виклик тут не потрібен, оскільки loadActiveSheetData викличе updateCharacterSelect, який збереже активний індекс
    
    console.log(`Перемикаємося на лист з індексом ${activeSheetIndex}.`); //
    loadActiveSheetData(); //
}

function updateCharacterSelect() { //
    const characterSelect = document.getElementById('characterSelect'); //
    if (!characterSelect) { //
        console.error("Елемент #characterSelect не знайдено!"); //
        return; //
    }
    characterSelect.innerHTML = ''; //

    characterSheets.forEach((sheet, index) => { //
        const option = document.createElement('option'); //
        option.value = index; //
        option.textContent = sheet.characterName || `Персонаж ${index + 1}`; //
        if (index === activeSheetIndex) { //
            option.selected = true; //
        }
        characterSelect.appendChild(option); //
    });

    if (!characterSelect.dataset.hasChangeListener) { //
        characterSelect.addEventListener('change', (event) => { //
            switchCharacterSheet(parseInt(event.target.value)); //
        });
        characterSelect.dataset.hasChangeListener = true; //
    }
}


document.addEventListener('DOMContentLoaded', () => { //
    const addCharacterButton = document.getElementById('addCharacterButton'); //
    const deleteCharacterButton = document.getElementById('deleteCharacterButton'); //
    const characterPhotoUrlInput = document.getElementById('characterPhotoUrl'); //
    const characterPhotoPreview = document.getElementById('characterPhotoPreview'); //
    const characterSelect = document.getElementById('characterSelect'); //

    if (addCharacterButton) { //
        addCharacterButton.addEventListener('click', addCharacterSheet); //
    }
    if (deleteCharacterButton) { //
        deleteCharacterButton.addEventListener('click', deleteCharacterSheet); //
    }
    if (characterPhotoUrlInput) { //
        characterPhotoUrlInput.addEventListener('input', () => { //
            const url = characterPhotoUrlInput.value; //
            if (url) { //
                characterPhotoPreview.src = url; //
                characterPhotoPreview.style.display = 'block'; //
            } else {
                characterPhotoPreview.src = ''; //
                characterPhotoPreview.style.display = 'none'; //
            }
            debouncedSaveActiveSheetData(); //
        });
    }

    // Завантажуємо всі листи з localStorage при старті
    try {
        const savedSheetsString = localStorage.getItem(DARQIE_SHEETS_KEY); //
        if (savedSheetsString) { //
            characterSheets = JSON.parse(savedSheetsString); //
            if (characterSheets.length > 0) { //
                const lastActiveIndexString = localStorage.getItem(DARQIE_ACTIVE_INDEX_KEY); //
                const parsedIndex = parseInt(lastActiveIndexString); //
                if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < characterSheets.length) { //
                    activeSheetIndex = parsedIndex; //
                } else {
                    activeSheetIndex = 0; //
                }
            } else {
                addCharacterSheet(); //
            }
        } else {
            addCharacterSheet(); //
        }
    } catch (error) {
        console.error("Помилка завантаження даних з localStorage:", error); //
        alert("Помилка завантаження листів персонажів. Можливо, пошкоджені дані."); //
        if (characterSheets.length === 0) { //
            addCharacterSheet(); //
        }
    }

    // Викликаємо loadActiveSheetData тільки один раз після ініціалізації characterSheets
    loadActiveSheetData(); //

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select'); //
    allInputElements.forEach(element => { //
        element.addEventListener('input', debouncedSaveActiveSheetData); //
        element.addEventListener('change', debouncedSaveActiveSheetData); //

        if (element.classList.contains('score-input')) { //
            element.addEventListener('input', () => { //
                const modifierId = element.id.replace('Score', 'Modifier'); //
                const modifierElement = document.getElementById(modifierId); //
                if (modifierElement) { //
                    updateAbilityModifier(element, modifierElement); //
                }
            });
        }
    });

    // Оновлення модифікаторів після завантаження даних (вже зроблено в loadActiveSheetData, але можна залишити для надійності)
    const elements = getSheetInputElements(); //
    if (elements.strengthScore) updateAbilityModifier(elements.strengthScore, elements.strengthModifier); //
    if (elements.dexterityScore) updateAbilityModifier(elements.dexterityScore, elements.dexterityModifier); //
    if (elements.constitutionScore) updateAbilityModifier(elements.constitutionScore, elements.constitutionModifier); //
    if (elements.intelligenceScore) updateAbilityModifier(elements.intelligenceScore, elements.intelligenceModifier); //
    if (elements.wisdomScore) updateAbilityModifier(elements.wisdomScore, elements.wisdomModifier); //
    if (elements.charismaScore) updateAbilityModifier(elements.charismaScore, elements.charismaModifier); //
});
