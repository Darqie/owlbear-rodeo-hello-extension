// Owlbear Rodeo SDK - оголошення, що потрібно для використання OBR об'єкту
// Якщо ви підключаєте OBR SDK як <script src="https://www.owlbear.rodeo/assets/sdk/latest.js"></script>
// то цей рядок не потрібен, OBR буде глобальним.
// Але для перестраховки та сучасних практик:
if (typeof OBR === 'undefined') {
    console.warn("Owlbear Rodeo SDK (OBR) не знайдено. Функції, що залежать від OBR, можуть не працювати.");
    // Додайте тут заглушки або повідомлення для розробки поза Owlbear Rodeo
    window.OBR = {
        // Модальні вікна (для завантаження файлів)
        modal: {
            open: async (url, options) => {
                console.log(`[MOCK OBR.modal.open] Opening modal for ${url} with options:`, options);
                alert("MOCK: OBR.modal.open called. File upload would happen here.");
                // Повертаємо тестовий URL або null
                return Promise.resolve("https://via.placeholder.com/150/0000FF/FFFFFF?text=MockPhoto");
            },
            close: () => console.log("[MOCK OBR.modal.close] Modal closed.")
        },
        // Інші заглушки, якщо потрібні
        player: {
            getRole: async () => 'GM' // Для тестування ролі
        },
        onReady: (callback) => callback(), // Викликаємо одразу для тестування
        // Додайте інші API, які ви плануєте використовувати, як заглушки
    };
}


const LOCAL_STORAGE_KEY = 'dndCharacterSheets';
const MAX_SHEETS = 10; // Максимальна кількість листів персонажів

let characterSheets = []; // Масив для зберігання всіх листів персонажів
let activeSheetIndex = 0; // Індекс активного листа

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
        // Нові елементи для фото
        characterPhotoUpload: container.querySelector('#characterPhotoUpload'),
        characterPhotoPreview: container.querySelector('#characterPhotoPreview'),
        photoSettingsButton: container.querySelector('#photoSettingsButton'),
        photoSettingsDropdown: container.querySelector('#photoSettingsButton .dropdown-content'),
        replacePhotoButton: container.querySelector('#replacePhotoButton'),
        removePhotoButton: container.querySelector('#removePhotoButton')
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
        characterPhotoUrl: elements.characterPhotoPreview.src === window.location.href + '#' || elements.characterPhotoPreview.src === '' ? '' : elements.characterPhotoPreview.src // Оновлено для URL фото
    };

    characterSheets[activeSheetIndex] = currentSheetData;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
    localStorage.setItem('activeSheetIndex', activeSheetIndex.toString());
    console.log('Дані активного листа збережено:', characterSheets[activeSheetIndex]);
    updateCharacterTabs(); // Оновлюємо вкладки, щоб відобразити нові імена, якщо змінились
}

// Функція для завантаження даних активного листа з масиву characterSheets
function loadActiveSheetData() {
    if (characterSheets.length === 0) {
        addCharacterSheet();
        return;
    }
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
    const photoUrl = sheetData.characterPhotoUrl || '';
    if (photoUrl) {
        elements.characterPhotoPreview.src = photoUrl;
        elements.characterPhotoPreview.style.display = 'block';
        elements.characterPhotoUpload.querySelector('.fa-plus').style.display = 'none'; // Приховуємо плюс
        elements.photoSettingsButton.style.display = 'flex'; // Показуємо шестерню
    } else {
        elements.characterPhotoPreview.src = '';
        elements.characterPhotoPreview.style.display = 'none';
        elements.characterPhotoUpload.querySelector('.fa-plus').style.display = 'block'; // Показуємо плюс
        elements.photoSettingsButton.style.display = 'none'; // Приховуємо шестерню
    }

    // Закриваємо випадаюче меню налаштувань фото, якщо воно було відкрите
    if (elements.photoSettingsDropdown) {
        elements.photoSettingsDropdown.style.display = 'none';
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
        characterPhotoUrl: '' // Порожній URL для нового фото
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

    // Запит підтвердження
    if (confirm(`Ви впевнені, що хочете видалити активний лист "${characterSheets[activeSheetIndex].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(activeSheetIndex, 1);

        if (characterSheets.length === 0) {
            activeSheetIndex = 0;
            addCharacterSheet();
            return;
        } else if (activeSheetIndex >= characterSheets.length) {
            activeSheetIndex = characterSheets.length - 1;
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
        localStorage.setItem('activeSheetIndex', activeSheetIndex.toString());
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
    }
}

// Функція для видалення листа за індексом (викликається з вкладки)
function deleteCharacterSheetByIndex(indexToDelete) {
    if (characterSheets.length === 1) { // Якщо залишився лише один лист
        alert('Не можна видалити останній лист. Якщо ви хочете очистити його, ви можете просто видалити дані.');
        return;
    }

    if (confirm(`Ви впевнені, що хочете видалити лист "${characterSheets[indexToDelete].characterName || 'Без назви'}"?`)) {
        characterSheets.splice(indexToDelete, 1);

        if (activeSheetIndex === indexToDelete) {
            if (activeSheetIndex >= characterSheets.length) {
                activeSheetIndex = characterSheets.length - 1;
            }
        } else if (activeSheetIndex > indexToDelete) {
            activeSheetIndex--;
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(characterSheets));
        localStorage.setItem('activeSheetIndex', activeSheetIndex.toString());
        console.log('Лист персонажа видалено. Залишилось листів:', characterSheets.length);
        loadActiveSheetData();
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

// ***** Функції для роботи з фото через Owlbear Rodeo SDK *****

// Функція для відкриття вікна завантаження файлу через OBR
async function uploadCharacterPhoto() {
    console.log("Attempting to upload photo via OBR SDK...");
    try {
        const result = await OBR.modal.open({
            url: "/upload-modal.html", // Або інший URL, якщо у вас є спеціальна модалка для завантаження
                                       // Owlbear Rodeo може мати вбудований API для файлів,
                                       // тому ми можемо шукати OBR.file.upload() або подібне.
                                       // Для прикладу, використаємо OBR.modal.open і припустимо,
                                       // що він повертає URL.
            width: 400,
            height: 300,
            disableInteraction: false,
            // Якщо OBR має прямий метод завантаження:
            // return await OBR.image.upload(); // Приклад, перевірте актуальну документацію OBR
        });

        // OBR.modal.open зазвичай повертає дані, які передала модалка після закриття
        // Припускаємо, що модалка повертає URL зображення.
        if (result && typeof result === 'string') { // Припускаємо, що result - це URL
            const elements = getSheetInputElements();
            elements.characterPhotoPreview.src = result;
            elements.characterPhotoPreview.style.display = 'block';
            elements.characterPhotoUpload.querySelector('.fa-plus').style.display = 'none';
            elements.photoSettingsButton.style.display = 'flex'; // Показуємо шестерню
            saveActiveSheetData();
            console.log("Photo uploaded and URL set:", result);
        } else {
            console.warn("Upload modal did not return a valid URL or was cancelled.");
        }
    } catch (error) {
        console.error("Error uploading photo with OBR SDK:", error);
        alert("Не вдалося завантажити фото. Перевірте консоль для деталей або спробуйте ще раз.");
    }
}

// Функція для видалення фото
function removeCharacterPhoto() {
    const elements = getSheetInputElements();
    elements.characterPhotoPreview.src = '';
    elements.characterPhotoPreview.style.display = 'none';
    elements.characterPhotoUpload.querySelector('.fa-plus').style.display = 'block';
    elements.photoSettingsButton.style.display = 'none';
    elements.photoSettingsDropdown.style.display = 'none'; // Закриваємо випадаюче меню
    saveActiveSheetData();
    console.log("Photo removed.");
}

// Функція для показу/приховування випадаючого меню шестерні
function togglePhotoSettingsDropdown() {
    const elements = getSheetInputElements();
    const dropdown = elements.photoSettingsDropdown;
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}


// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    const addCharacterButton = document.getElementById('addCharacterButton');
    const deleteCharacterButton = document.getElementById('deleteCharacterButton');
    const characterPhotoUploadDiv = document.getElementById('characterPhotoUpload');
    const photoSettingsButton = document.getElementById('photoSettingsButton');
    const replacePhotoButton = document.getElementById('replacePhotoButton');
    const removePhotoButton = document.getElementById('removePhotoButton');


    if (addCharacterButton) {
        addCharacterButton.addEventListener('click', addCharacterSheet);
    }
    if (deleteCharacterButton) {
        deleteCharacterButton.addEventListener('click', deleteCharacterSheet);
    }

    // Обробники для фото
    if (characterPhotoUploadDiv) {
        characterPhotoUploadDiv.addEventListener('click', () => {
            // Клік на будь-яку частину квадрата для завантаження, якщо фото немає
            const elements = getSheetInputElements();
            if (!elements.characterPhotoPreview.src || elements.characterPhotoPreview.src === window.location.href + '#') {
                uploadCharacterPhoto();
            }
        });
    }

    if (photoSettingsButton) {
        photoSettingsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Запобігаємо закриттю при кліку на саму шестерню
            togglePhotoSettingsDropdown();
        });
    }

    if (replacePhotoButton) {
        replacePhotoButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Зупиняємо, щоб не закрити одразу
            togglePhotoSettingsDropdown(); // Закриваємо меню після вибору
            uploadCharacterPhoto(); // Завантажуємо нове фото
        });
    }

    if (removePhotoButton) {
        removePhotoButton.addEventListener('click', (event) => {
            event.stopPropagation();
            togglePhotoSettingsDropdown(); // Закриваємо меню після вибору
            removeCharacterPhoto(); // Видаляємо фото
        });
    }

    // Закриття випадаючого меню, якщо клікнули поза ним
    document.addEventListener('click', (event) => {
        const elements = getSheetInputElements();
        if (elements.photoSettingsDropdown && elements.photoSettingsDropdown.style.display === 'block' &&
            !elements.photoSettingsButton.contains(event.target)) {
            elements.photoSettingsDropdown.style.display = 'none';
        }
    });


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

    // Завантажуємо та відображаємо активний лист
    loadActiveSheetData();

    // Додаємо слухачів подій до всіх полів для збереження при зміні
    // Важливо: слухачі додаються до елементів, які є частиною DOM на старті
    // і будуть оновлюватися функцією loadActiveSheetData
    const allInputElements = document.querySelectorAll('#characterSheetContainer input, #characterSheetContainer select');
    allInputElements.forEach(element => {
        element.addEventListener('input', saveActiveSheetData);
        element.addEventListener('change', saveActiveSheetData);
    });

    // Модифікація для відображення модифікаторів здібностей
    const abilityScoreInputs = document.querySelectorAll('.ability .score-input');
    abilityScoreInputs.forEach(input => {
        const modifierDiv = input.nextElementSibling; // div з класом 'modifier'
        const updateModifier = () => {
            const score = parseInt(input.value);
            if (!isNaN(score)) {
                const modifier = Math.floor((score - 10) / 2);
                modifierDiv.textContent = `(${modifier >= 0 ? '+' : ''}${modifier})`;
            } else {
                modifierDiv.textContent = `(+0)`; // За замовчуванням
            }
            saveActiveSheetData(); // Зберігаємо дані при зміні
        };
        input.addEventListener('input', updateModifier);
        updateModifier(); // Викликаємо при завантаженні, щоб встановити початкові модифікатори
    });
});
