document.addEventListener('DOMContentLoaded', () => {
    const dayTabsContainer = document.getElementById('day-tabs');
    const menuContainer = document.getElementById('menu-container');
    let menuData = [];

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
            displayMenuForDay(menuData[0].gun); // Başlangıçta ilk günü göster
            activateTab(menuData[0].gun);
        }
    }

    function createDayTabs() {
        if (!dayTabsContainer) return;
        dayTabsContainer.innerHTML = ''; // Önceki sekmeleri temizle
        menuData.forEach(dayData => {
            const tabButton = document.createElement('button');
            tabButton.classList.add('tab-button');
            tabButton.textContent = dayData.gun;
            tabButton.dataset.day = dayData.gun; // Hangi güne ait olduğunu belirtmek için
            tabButton.addEventListener('click', () => {
                displayMenuForDay(dayData.gun);
                activateTab(dayData.gun);
            });
            dayTabsContainer.appendChild(tabButton);
        });
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

    function displayMenuForDay(dayName) {
        if (!menuContainer) return;
        menuContainer.innerHTML = ''; // Önceki menüyü temizle

        const dayMenuData = menuData.find(day => day.gun === dayName);

        if (!dayMenuData) {
            if (menuContainer) {
                menuContainer.innerHTML = '<p>Bu gün için menü bulunamadı.</p>';
            }
            return;
        }

        // Mobil için: Her öğün ayrı bir kartta dikey olarak
        // Masaüstü için: Öğünler yan yana (CSS grid ile)
        // CSS zaten menu-container için grid ayarını yapıyor, bu yüzden burada özel bir şey yapmaya gerek yok
        // Sadece öğün kartlarını oluşturacağız.

        const dayMenuDiv = document.createElement('div');
        dayMenuDiv.classList.add('day-menu', 'active'); // active class'ı varsayılan olarak eklenebilir veya tab ile yönetilebilir

        for (const mealType in dayMenuData.ogunler) { // Sabah, Öğlen, Akşam
            const mealCard = document.createElement('div');
            mealCard.classList.add('meal-card');

            const mealTitle = document.createElement('h3');
            mealTitle.textContent = mealType;
            mealCard.appendChild(mealTitle);

            const meals = dayMenuData.ogunler[mealType];
            if (meals.length > 0) {
                meals.forEach(food => {
                    const foodItemDiv = document.createElement('div');
                    foodItemDiv.classList.add('food-item');

                    const foodImage = document.createElement('img');
                    foodImage.src = food.gorsel;
                    foodImage.alt = food.ad;
                    // Hata durumunda varsayılan görsel veya metin
                    foodImage.onerror = () => {
                        foodImage.alt = "Görsel yüklenemedi";
                        // Alternatif olarak: foodImage.style.display = 'none';
                        // Veya bir yer tutucu görsel: foodImage.src = 'images/placeholder.jpg';
                    };

                    const foodName = document.createElement('p');
                    foodName.textContent = food.ad;

                    foodItemDiv.appendChild(foodImage);
                    foodItemDiv.appendChild(foodName);
                    mealCard.appendChild(foodItemDiv);
                });
            } else {
                const noFoodMessage = document.createElement('p');
                noFoodMessage.textContent = 'Bu öğün için henüz yemek eklenmemiş.';
                mealCard.appendChild(noFoodMessage);
            }
            dayMenuDiv.appendChild(mealCard);
        }
        menuContainer.appendChild(dayMenuDiv);
    }

    loadMenuData();
}); 