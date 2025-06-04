// Функція для збереження даних у localStorage
function saveCharacterData() {
    const characterData = {
        characterName: document.getElementById('characterName').value,
        characterClassLevel: document.getElementById('characterClassLevel').value,
        background: document.getElementById('background').value,
        playerName: document.getElementById('playerName').value,
        characterRace: document.getElementById('characterRace').value,
        alignment: document.getElementById('alignment').value,
        experiencePoints: document.getElementById('experiencePoints').value
        // Додавайте сюди інші поля, які ви хочете зберігати
    };
    localStorage.setItem('dndCharacterSheetData', JSON.stringify(characterData));
    console.log('Дані персонажа збережено:', characterData);
}

// Функція для завантаження даних з localStorage
function loadCharacterData() {
    const savedData = localStorage.getItem('dndCharacterSheetData');
    if (savedData) {
        const characterData = JSON.parse(savedData);
        document.getElementById('characterName').value = characterData.characterName || '';
        document.getElementById('characterClassLevel').value = characterData.characterClassLevel || '';
        document.getElementById('background').value = characterData.background || '';
        document.getElementById('playerName').value = characterData.playerName || '';
        document.getElementById('characterRace').value = characterData.characterRace || '';
        document.getElementById('alignment').value = characterData.alignment || '';
        document.getElementById('experiencePoints').value = characterData.experiencePoints || '';
        // Завантажуйте інші поля
        console.log('Дані персонажа завантажено:', characterData);
    }
}

// Додаємо слухачів подій до полів для збереження при зміні
document.addEventListener('DOMContentLoaded', () => {
    // Завантажуємо дані при завантаженні сторінки
    loadCharacterData();

    // Отримуємо посилання на всі поля вводу та вибору
    const inputs = document.querySelectorAll('.header-item input, .header-item select');

    // Додаємо слухача подій 'input' (для текстових полів) та 'change' (для select)
    inputs.forEach(input => {
        input.addEventListener('input', saveCharacterData); // Для text, number, textarea
        input.addEventListener('change', saveCharacterData); // Для select
    });

    // Приклад: якщо ви захочете додавати кнопки і реагувати на них через Owlbear Rodeo SDK:
    // const myButton = document.getElementById('myButton');
    // if (myButton) {
    //     myButton.addEventListener('click', () => {
    //         // Тут буде логіка взаємодії з Owlbear Rodeo
    //         console.log('Кнопку натиснуто!');
    //     });
    // }
});
