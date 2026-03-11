// ============================================
// ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
// ============================================

let tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Растягиваем на весь экран

console.log('NFT App инициализирован');

// ============================================
// СИСТЕМА БАЛАНСА
// ============================================

let userBalance = 0;
let userInventory = [];

// Загружаем данные пользователя из localStorage
function loadUserData() {
    try {
        const savedBalance = localStorage.getItem('nft_balance');
        const savedInventory = localStorage.getItem('nft_inventory');
        
        userBalance = savedBalance ? parseInt(savedBalance) : 0;
        userInventory = savedInventory ? JSON.parse(savedInventory) : [];
        
        console.log('Данные загружены, баланс:', userBalance);
        updateBalance();
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
        userBalance = 0;
        userInventory = [];
    }
}

// Сохраняем данные пользователя
function saveUserData() {
    try {
        localStorage.setItem('nft_balance', userBalance.toString());
        localStorage.setItem('nft_inventory', JSON.stringify(userInventory));
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

// Обновляем отображение баланса на всех страницах
function updateBalance() {
    const balanceElements = document.querySelectorAll('#balance');
    balanceElements.forEach(el => {
        if (el) {
            // Для нового дизайна (только цифры)
            if (el.classList.contains('balance-amount')) {
                el.textContent = userBalance;
            } 
            // Для старого дизайна (с цифрами и звездой)
            else {
                el.textContent = userBalance + ' ⭐';
            }
        }
    });
    
    // Также обновляем элемент balance-amount если он есть
    const balanceAmount = document.getElementById('balance-amount');
    if (balanceAmount) {
        balanceAmount.textContent = userBalance;
    }
}

// Добавляем звёзды на баланс
function addStars(amount) {
    if (amount > 0) {
        userBalance += amount;
        saveUserData();
        updateBalance();
        
        // Показываем уведомление
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert(`+${amount} ⭐`);
            // Вибрация при выигрыше
            try {
                window.Telegram.WebApp.HapticFeedback.notification('success');
            } catch (e) {}
        }
    }
}

// Добавляем предмет в инвентарь
function addToInventory(item) {
    if (item) {
        userInventory.push(item);
        saveUserData();
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function goToHome() {
    window.location.href = 'index.html';
}

function goToProfile() {
    window.location.href = 'profile.html';
}

function goToTopUp() {
    window.location.href = 'topup.html';
}

function goBack() {
    window.history.back();
}

// ============================================
// ИГРОВЫЕ ФУНКЦИИ
// ============================================

// Открытие ежедневного кейса
function openDailyCase() {
    window.location.href = 'daily-case.html';
}

// Открытие рулетки с кейсами
function openRoulette() {
    window.location.href = 'roulette.html';
}

// Открытие краша (в разработке)
function openCrash() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert('Краш появится скоро!');
        try {
            window.Telegram.WebApp.HapticFeedback.notification('warning');
        } catch (e) {}
    } else {
        alert('Краш появится скоро!');
    }
}

// Открытие рейтинга
function goToRating() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert('Рейтинг появится скоро!');
        try {
            window.Telegram.WebApp.HapticFeedback.impact('light');
        } catch (e) {}
    } else {
        alert('Рейтинг появится скоро!');
    }
}

// Открытие кейса (общая функция)
function openCase(caseType, cost) {
    if (caseType === 'daily') {
        window.location.href = 'daily-case.html';
        return;
    }
    
    // Проверяем баланс для платных кейсов
    if (userBalance < cost) {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert(`Недостаточно звёзд! Нужно ${cost} ⭐`);
            try {
                window.Telegram.WebApp.HapticFeedback.notification('error');
            } catch (e) {}
        }
        return;
    }
    
    // Передаём параметры кейса
    window.location.href = `case-open.html?type=${caseType}`;
}

// ============================================
// ПОКУПКА ЗВЁЗД
// ============================================

function buyStars(amount) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showConfirm(
            `Купить ${amount} ⭐ за ${amount} звёзд Telegram?`,
            function(confirmed) {
                if (confirmed) {
                    initiateStarPurchase(amount);
                }
            }
        );
    } else {
        // Для тестирования
        simulatePurchase(amount);
    }
}

function initiateStarPurchase(amount) {
    showLoading();
    
    // Симуляция покупки (в реальном проекте здесь будет запрос к бэкенду)
    setTimeout(() => {
        // 90% успеха для теста
        const success = Math.random() > 0.1;
        
        if (success) {
            completePurchase(amount);
        } else {
            showError("Платёж не прошёл. Попробуйте ещё раз.");
        }
        
        hideLoading();
    }, 2000);
}

function completePurchase(amount) {
    // Бонусы за крупные покупки
    let bonus = 0;
    if (amount >= 500) bonus = 25;
    if (amount >= 1000) bonus = 75;
    if (amount >= 2500) bonus = 250;
    
    const totalAmount = amount + bonus;
    
    // Добавляем на баланс
    userBalance += totalAmount;
    saveUserData();
    updateBalance();
    
    // Сохраняем историю
    savePurchaseHistory(amount, bonus, totalAmount);
    
    // Уведомление
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(
            `✅ Успешно!\n\nКуплено: ${amount} ⭐\nБонус: ${bonus} ⭐\nВсего: ${totalAmount} ⭐`
        );
        try {
            window.Telegram.WebApp.HapticFeedback.notification('success');
        } catch (e) {}
    }
}

function savePurchaseHistory(amount, bonus, total) {
    try {
        const history = JSON.parse(localStorage.getItem('purchase_history') || '[]');
        history.unshift({
            date: new Date().toISOString(),
            amount: amount,
            bonus: bonus,
            total: total
        });
        localStorage.setItem('purchase_history', JSON.stringify(history));
    } catch (e) {
        console.error('Ошибка сохранения истории:', e);
    }
}

function simulatePurchase(amount) {
    completePurchase(amount);
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function showLoading() {
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        overlay.innerHTML = `
            <div style="
                width: 50px;
                height: 50px;
                border: 3px solid #404040;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 15px;
            "></div>
            <div style="color: #ffffff; font-size: 16px;">Обработка платежа...</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function showError(message) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(`❌ Ошибка: ${message}`);
        try {
            window.Telegram.WebApp.HapticFeedback.notification('error');
        } catch (e) {}
    } else {
        alert(`Ошибка: ${message}`);
    }
}

// ============================================
// ЗАГРУЗКА ДАННЫХ ПРИ СТАРТЕ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    
    // Получаем данные пользователя Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('Пользователь Telegram:', user.first_name);
    }
});

// ============================================
// ЭКСПОРТ ФУНКЦИЙ (для глобального доступа)
// ============================================

// Все функции уже глобальные, но на всякий случай
window.goToHome = goToHome;
window.goToProfile = goToProfile;
window.goToTopUp = goToTopUp;
window.goBack = goBack;
window.openDailyCase = openDailyCase;
window.openRoulette = openRoulette;
window.openCrash = openCrash;
window.goToRating = goToRating;
window.buyStars = buyStars;
window.addStars = addStars;
window.openCase = openCase;