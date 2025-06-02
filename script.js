document.addEventListener('DOMContentLoaded', () => {
    const dayTabsContainer = document.getElementById('day-tabs');
    const menuContainer = document.getElementById('menu-container');
    const dayPrevBtn = document.getElementById('day-prev');
    const dayNextBtn = document.getElementById('day-next');
    let menuData = [];
    let currentDayIndex = 0;

    // localStorage'dan veriyi yükle, yoksa JSON'dan yükle
    async function loadMenuData() {
        const storedMenu = localStorage.getItem('weeklyMenu');
        if (storedMenu) {
            menuData = JSON.parse(storedMenu);
            console.log('Menü localStorage\'dan yüklendi.');
        } else {
            try {
                const response = await fetch('menu.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                menuData = await response.json();
                console.log('Menü menu.json\'dan yüklendi.');
                // İsteğe bağlı: JSON'dan yüklenen veriyi localStorage'a kaydet
                // localStorage.setItem('weeklyMenu', JSON.stringify(menuData));
            } catch (error) {
                console.error("Menü yüklenirken hata oluştu:", error);
                if (menuContainer) {
                    menuContainer.innerHTML = '<p>Menü yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
                }
                return;
            }
        }
        createDayTabs();
        if (menuData.length > 0) {
            showDay(0);
        }
    }

    function createDayTabs() {
        if (!dayTabsContainer) return;
        dayTabsContainer.innerHTML = '';
        menuData.forEach((dayData, i) => {
            const tabButton = document.createElement('button');
            tabButton.classList.add('tab-button');
            tabButton.textContent = dayData.gun;
            tabButton.dataset.day = dayData.gun;
            tabButton.addEventListener('click', () => {
                showDay(i);
            });
            dayTabsContainer.appendChild(tabButton);
        });
    }

    function showDay(index) {
        if (!menuData[index]) return;
        currentDayIndex = index;
        displayMenuForDay(menuData[index].gun);
        activateTab(menuData[index].gun);
        updateSliderArrows();
        scrollTabIntoView(index);
    }

    function activateTab(selectedDay) {
        if (!dayTabsContainer) return;
        const tabs = dayTabsContainer.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            if (tab.dataset.day === selectedDay) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    function updateSliderArrows() {
        if (!dayPrevBtn || !dayNextBtn) return;
        dayPrevBtn.disabled = currentDayIndex === 0;
        dayNextBtn.disabled = currentDayIndex === menuData.length - 1;
    }

    function scrollTabIntoView(index) {
        const tabButtons = dayTabsContainer.querySelectorAll('.tab-button');
        if (tabButtons[index]) {
            tabButtons[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    if (dayPrevBtn) {
        dayPrevBtn.addEventListener('click', () => {
            if (currentDayIndex > 0) showDay(currentDayIndex - 1);
        });
    }
    if (dayNextBtn) {
        dayNextBtn.addEventListener('click', () => {
            if (currentDayIndex < menuData.length - 1) showDay(currentDayIndex + 1);
        });
    }

    function displayMenuForDay(dayName) {
        if (!menuContainer) return;
        menuContainer.innerHTML = '';
        const dayMenuData = menuData.find(day => day.gun === dayName);
        if (!dayMenuData) {
            menuContainer.innerHTML = '<p>Bu gün için menü bulunamadı.</p>';
            return;
        }
        const dayMenuDiv = document.createElement('div');
        dayMenuDiv.classList.add('day-menu', 'active');
        const mealTypes = ['Sabah', 'Öğlen', 'Akşam'];
        mealTypes.forEach(mealType => {
            const mealCard = document.createElement('div');
            mealCard.classList.add('meal-card');
            const mealTitle = document.createElement('h3');
            mealTitle.textContent = mealType;
            mealCard.appendChild(mealTitle);
            const meals = (dayMenuData.ogunler && dayMenuData.ogunler[mealType]) ? dayMenuData.ogunler[mealType] : [];
            const foodList = document.createElement('div');
            foodList.classList.add('food-list');
            if (meals.length > 0) {
                meals.forEach(food => {
                    const foodItemDiv = document.createElement('div');
                    foodItemDiv.classList.add('food-item');
                    const foodImage = document.createElement('img');
                    foodImage.src = food.gorsel;
                    foodImage.alt = food.ad;
                    foodImage.onerror = () => {
                        // SVG fallback ekle
                        if (!foodItemDiv.querySelector('.fallback-svg')) {
                            foodImage.style.display = 'none';
                            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            svg.setAttribute('viewBox', '0 0 64 64');
                            svg.setAttribute('class', 'fallback-svg');
                            svg.innerHTML = `<circle cx="32" cy="32" r="30" fill="#232946" stroke="#d4af37" stroke-width="4"/><g><rect x="18" y="36" width="28" height="8" rx="4" fill="#ffe082"/><ellipse cx="32" cy="28" rx="12" ry="8" fill="#ffe082"/><ellipse cx="32" cy="28" rx="8" ry="5" fill="#232946" opacity=".5"/></g>`;
                            foodItemDiv.insertBefore(svg, foodName);
                        }
                    };
                    const foodName = document.createElement('p');
                    foodName.textContent = food.ad;
                    foodItemDiv.appendChild(foodImage);
                    foodItemDiv.appendChild(foodName);
                    foodList.appendChild(foodItemDiv);
                });
            } else {
                const noFoodMessage = document.createElement('p');
                noFoodMessage.textContent = 'Bu öğün için henüz yemek eklenmemiş.';
                noFoodMessage.style.textAlign = 'center';
                foodList.appendChild(noFoodMessage);
            }
            mealCard.appendChild(foodList);
            dayMenuDiv.appendChild(mealCard);
        });
        menuContainer.appendChild(dayMenuDiv);
    }

    loadMenuData();

    // Modal ve JSON gösterim/indirme fonksiyonları
    function getCurrentMenuJson() {
        // localStorage'da varsa onu, yoksa menuData'yı döndür
        const storedMenu = localStorage.getItem('weeklyMenu');
        if (storedMenu) return JSON.parse(storedMenu);
        return menuData;
    }

    function showJsonModal() {
        const modal = document.getElementById('json-modal');
        const viewer = document.getElementById('json-viewer');
        if (modal && viewer) {
            const json = getCurrentMenuJson();
            viewer.textContent = JSON.stringify(json, null, 2);
            modal.style.display = 'flex';
        }
    }
    function closeJsonModal() {
        const modal = document.getElementById('json-modal');
        if (modal) modal.style.display = 'none';
    }
    function downloadJson() {
        const json = getCurrentMenuJson();
        const blob = new Blob([JSON.stringify(json, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'haftalik-menu.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    // Event binding
    window.addEventListener('DOMContentLoaded', () => {
        const showBtn = document.getElementById('show-json-btn');
        const downloadBtn = document.getElementById('download-json-btn');
        const closeModalBtn = document.querySelector('.close-modal');
        if (showBtn) showBtn.addEventListener('click', showJsonModal);
        if (downloadBtn) downloadBtn.addEventListener('click', downloadJson);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeJsonModal);
        // Modal dışına tıklayınca kapansın
        const modal = document.getElementById('json-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeJsonModal();
            });
        }
    });
}); 