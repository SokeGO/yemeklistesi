document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const editSection = document.getElementById('edit-section');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');

    const selectDay = document.getElementById('select-day');
    const selectMealType = document.getElementById('select-meal-type');
    const currentMealsList = document.getElementById('current-meals-list');
    const foodNameInput = document.getElementById('food-name');
    const foodImageUrlInput = document.getElementById('food-image-url');
    const addUpdateFoodButton = document.getElementById('add-update-food-button');
    const saveChangesButton = document.getElementById('save-changes-button');
    const clearFormButton = document.getElementById('clear-form-button');
    const editMealIndexInput = document.getElementById('edit-meal-index');

    const ADMIN_PASSWORD = "4353"; // Şifre güncellendi
    let weeklyMenuData = [];

    // Giriş İşlemi
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
                if (loginSection) loginSection.style.display = 'none';
                if (editSection) editSection.style.display = 'block';
                loadInitialData();
            } else {
                alert('Yanlış şifre!');
            }
        });
    }

    async function loadInitialData() {
        const storedMenu = localStorage.getItem('weeklyMenu');
        if (storedMenu) {
            try {
                weeklyMenuData = JSON.parse(storedMenu);
                console.log('Admin paneli için menü localStorage\'dan yüklendi.');
            } catch (e) {
                console.error('localStorage\'daki menü verisi bozuk:', e);
                localStorage.removeItem('weeklyMenu'); // Bozuk veriyi temizle
                // JSON'dan yüklemeye devam et
            }
        }
        
        // Eğer localStorage boşsa veya bozuksa JSON'dan yükle
        if (!weeklyMenuData || weeklyMenuData.length === 0) { 
            try {
                const response = await fetch('menu.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                weeklyMenuData = await response.json();
                console.log('Admin paneli için menü menu.json\'dan yüklendi.');
                localStorage.setItem('weeklyMenu', JSON.stringify(weeklyMenuData));
            } catch (error) {
                console.error("Menü yüklenirken hata oluştu:", error);
                alert('Menü verileri yüklenemedi. Lütfen sayfayı yenileyin veya menu.json dosyasını kontrol edin.');
                return;
            }
        }
        populateDaySelector();
        if (weeklyMenuData && weeklyMenuData.length > 0 && selectDay) {
            selectDay.value = weeklyMenuData[0].gun;
            populateMealsForSelectedDayAndMealType();
        }
    }

    function populateDaySelector() {
        if (!selectDay || !weeklyMenuData) return;
        selectDay.innerHTML = '';
        weeklyMenuData.forEach(dayData => {
            const option = document.createElement('option');
            option.value = dayData.gun;
            option.textContent = dayData.gun;
            selectDay.appendChild(option);
        });
        if (selectMealType) {
            selectDay.addEventListener('change', populateMealsForSelectedDayAndMealType);
            selectMealType.addEventListener('change', populateMealsForSelectedDayAndMealType);
        }
    }

    function populateMealsForSelectedDayAndMealType() {
        if (!selectDay || !selectMealType || !currentMealsList || !weeklyMenuData) return;
        const selectedDayValue = selectDay.value;
        const selectedMealTypeValue = selectMealType.value;
        currentMealsList.innerHTML = '';

        const dayData = weeklyMenuData.find(d => d.gun === selectedDayValue);
        if (!dayData || !dayData.ogunler || !dayData.ogunler[selectedMealTypeValue]) {
            currentMealsList.innerHTML = '<li>Bu öğün için yemek bulunmuyor.</li>';
            return;
        }

        const meals = dayData.ogunler[selectedMealTypeValue];
        if (meals.length === 0) {
            currentMealsList.innerHTML = '<li>Bu öğün için yemek bulunmuyor.</li>';
            return;
        }

        meals.forEach((meal, index) => {
            const listItem = document.createElement('li');
            const mealInfo = document.createElement('span');
            const mealImage = document.createElement('img');
            mealImage.src = meal.gorsel;
            mealImage.alt = meal.ad;
            mealImage.onerror = () => mealImage.style.display = 'none';
            
            mealInfo.appendChild(mealImage);
            mealInfo.append(` ${meal.ad}`);

            const buttonsDiv = document.createElement('div');
            const editButton = document.createElement('button');
            editButton.textContent = 'Düzenle';
            editButton.classList.add('edit'); // CSS için sınıf
            editButton.style.marginRight = '5px';
            editButton.addEventListener('click', () => loadMealForEditing(selectedDayValue, selectedMealTypeValue, index));
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Sil';
            deleteButton.classList.add('delete'); // CSS için sınıf
            deleteButton.addEventListener('click', () => deleteMeal(selectedDayValue, selectedMealTypeValue, index));

            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            listItem.appendChild(mealInfo);
            listItem.appendChild(buttonsDiv);
            currentMealsList.appendChild(listItem);
        });
        clearForm();
    }

    function loadMealForEditing(day, mealType, mealIndex) {
        if (!weeklyMenuData || !foodNameInput || !foodImageUrlInput || !editMealIndexInput || !addUpdateFoodButton) return;
        const dayData = weeklyMenuData.find(d => d.gun === day);
        if (!dayData || !dayData.ogunler || !dayData.ogunler[mealType] || !dayData.ogunler[mealType][mealIndex]) return;

        const meal = dayData.ogunler[mealType][mealIndex];
        foodNameInput.value = meal.ad;
        foodImageUrlInput.value = meal.gorsel;
        editMealIndexInput.value = mealIndex.toString();
        addUpdateFoodButton.textContent = 'Yemeği Güncelle';
    }

    function deleteMeal(day, mealType, mealIndex) {
        if (!confirm('Bu yemeği silmek istediğinizden emin misiniz?')) {
            return;
        }
        if (!weeklyMenuData) return;
        const dayIndex = weeklyMenuData.findIndex(d => d.gun === day);
        if (dayIndex !== -1 && weeklyMenuData[dayIndex].ogunler && weeklyMenuData[dayIndex].ogunler[mealType]) {
            weeklyMenuData[dayIndex].ogunler[mealType].splice(mealIndex, 1);
            populateMealsForSelectedDayAndMealType();
        }
    }
    
    if (clearFormButton) {
        clearFormButton.addEventListener('click', clearForm);
    }

    function clearForm() {
        if (!foodNameInput || !foodImageUrlInput || !editMealIndexInput || !addUpdateFoodButton) return;
        foodNameInput.value = '';
        foodImageUrlInput.value = '';
        editMealIndexInput.value = '-1';
        addUpdateFoodButton.textContent = 'Yeni Yemek Ekle';
        foodNameInput.focus();
    }

    if (addUpdateFoodButton) {
        addUpdateFoodButton.addEventListener('click', () => {
            if (!selectDay || !selectMealType || !foodNameInput || !foodImageUrlInput || !editMealIndexInput || !weeklyMenuData) return;

            const day = selectDay.value;
            const mealType = selectMealType.value;
            const foodName = foodNameInput.value.trim();
            const foodImageUrl = foodImageUrlInput.value.trim();
            const editingIndex = parseInt(editMealIndexInput.value, 10);

            if (!foodName || !foodImageUrl) {
                alert('Yemek adı ve görsel URL\'si boş bırakılamaz.');
                return;
            }

            const newFood = { ad: foodName, gorsel: foodImageUrl };
            const dayIndex = weeklyMenuData.findIndex(d => d.gun === day);

            if (dayIndex === -1) {
                alert('Geçerli bir gün seçilmedi.');
                return;
            }
            
            if (!weeklyMenuData[dayIndex].ogunler) {
                weeklyMenuData[dayIndex].ogunler = {}; // Eğer öğünler objesi yoksa oluştur
            }
            if (!weeklyMenuData[dayIndex].ogunler[mealType]) {
                weeklyMenuData[dayIndex].ogunler[mealType] = [];
            }

            if (editingIndex > -1) {
                if (weeklyMenuData[dayIndex].ogunler[mealType][editingIndex]) {
                    weeklyMenuData[dayIndex].ogunler[mealType][editingIndex] = newFood;
                } else {
                    // Bu durum normalde olmamalı ama güvenlik için eklenebilir
                    weeklyMenuData[dayIndex].ogunler[mealType].push(newFood); 
                }
            } else {
                weeklyMenuData[dayIndex].ogunler[mealType].push(newFood);
            }
            
            populateMealsForSelectedDayAndMealType();
            clearForm();
        });
    }

    if (saveChangesButton) {
        saveChangesButton.addEventListener('click', () => {
            saveMenuToLocalStorage();
            alert('Tüm değişiklikler başarıyla kaydedildi!');
        });
    }

    function saveMenuToLocalStorage() {
        if (!weeklyMenuData) return;
        localStorage.setItem('weeklyMenu', JSON.stringify(weeklyMenuData));
        console.log('Menü localStorage\'a kaydedildi.');
    }
}); 