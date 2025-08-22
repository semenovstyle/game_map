document.addEventListener("DOMContentLoaded", () => {
  // --- НАСТРОЙКИ КВЕСТА ---
  const TOTAL_PARTS = 7;
  // Здесь хранятся тексты подсказок. Ключ - номер открытой части.
  const HINTS = {
    1: "Отлично! Первая часть на месте. Следующий код ищите там, где начинается история города.",
    2: "Второй фрагмент открыт! Теперь направляйтесь к самому старому дереву в парке.",
    3: "Третий есть! Подсказка: взгляните на часы на главной площади.",
    4: "Половина пути пройдена! Следующая метка ждет вас у фонтана с ангелами.",
    5: "Прекрасная работа! Ищите знак на стене самого длинного дома на набережной.",
    6: "Остался всего один шаг! Последний код спрятан под мостом влюбленных.",
    7: "Карта собрана! Финальная точка - памятник основателю города. Удачи!",
  };

  // --- СОЗДАНИЕ АУДИО ---
  const unlockSound = new Audio("audio/obelisk.mp3");
  unlockSound.volume = 0.7; // Можете настроить громкость (от 0.0 до 1.0)

  // --- ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ СТРАНИЦЫ ---
  const puzzleWrapper = document.querySelector(".puzzle-wrapper");
  const finalMap = document.querySelector(".final-map");
  const masks = document.querySelectorAll(".puzzle-mask");

  const hintModal = document.getElementById("hint-modal");
  const hintText = document.getElementById("hint-text");
  const closeModalBtn = document.getElementById("close-modal-btn");

  const congratsModal = document.getElementById("congrats-modal");
  const resetButton = document.getElementById("reset-btn");

  // --- ПРОВЕРКА НА СБРОС ЧЕРЕЗ URL ---
  // Этот блок должен идти до основной логики
  const urlParamsForReset = new URLSearchParams(window.location.search);
  if (urlParamsForReset.has("reset")) {
    localStorage.removeItem("unlockedParts");
    // Перенаправляем на чистый URL, чтобы параметр ?reset=true не остался в адресе
    window.location.href = window.location.pathname;
    return; // Прерываем выполнение скрипта, так как страница перезагрузится
  }

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

  // Функция для обновления вида пазла на основе сохраненного прогресса
  function updatePuzzleView(unlockedPartsArray) {
    masks.forEach((mask) => {
      const partId = mask.dataset.partId;
      if (unlockedPartsArray.includes(partId)) {
        mask.classList.add("hidden");
      } else {
        mask.classList.remove("hidden");
      }
    });
  }

  // Функция, чтобы показать финальный экран
  function showFinalScreen() {
    puzzleWrapper.classList.add("hidden");
    finalMap.classList.remove("hidden");
    congratsModal.classList.remove("hidden");

    // Прячем поздравительное окно через 2 секунды (2000 миллисекунд)
    setTimeout(() => {
      congratsModal.classList.add("hidden");
    }, 2000);
  }

  // --- ОСНОВНАЯ ЛОГИКА ---

  // 1. Инициализация при загрузке страницы
  // Пытаемся получить прогресс из localStorage. Если его нет, создаем пустой массив.
  let unlockedParts = JSON.parse(localStorage.getItem("unlockedParts")) || [];

  // Сразу обновляем вид, чтобы показать уже открытые части
  updatePuzzleView(unlockedParts);

  // Если все части уже открыты, сразу показываем финальный экран
  if (unlockedParts.length === TOTAL_PARTS) {
    showFinalScreen();
  }

  // 2. Проверка URL на наличие нового кода
  const urlParams = new URLSearchParams(window.location.search);
  const partToUnlock = urlParams.get("part");

  // Если в URL есть ?part=... и этой части еще нет в нашем прогрессе
  if (partToUnlock && !unlockedParts.includes(partToUnlock)) {
    // Проигрываем звук
    unlockSound
      .play()
      .catch((error) =>
        console.log(
          "Не удалось воспроизвести звук до взаимодействия пользователя:",
          error
        )
      );

    // Добавляем новую часть в массив прогресса
    unlockedParts.push(partToUnlock);

    // Сохраняем обновленный прогресс в localStorage
    localStorage.setItem("unlockedParts", JSON.stringify(unlockedParts));

    // Обновляем вид пазла
    updatePuzzleView(unlockedParts);

    // Проверяем, не закончен ли квест
    if (unlockedParts.length === TOTAL_PARTS) {
      // Если да, через небольшую задержку показываем финальный экран
      setTimeout(showFinalScreen, 1000);
    } else {
      // Если нет, показываем подсказку для следующего шага
      const hint = HINTS[partToUnlock];
      if (hint) {
        hintText.textContent = hint;
        hintModal.classList.remove("hidden");
      }
    }
  }

  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

  // Закрытие модального окна с подсказкой
  closeModalBtn.addEventListener("click", () => {
    hintModal.classList.add("hidden");
  });

  // Обработка нажатия на кнопку "Начать заново"
  resetButton.addEventListener("click", () => {
    // 1. Очищаем данные о прогрессе из localStorage
    localStorage.removeItem("unlockedParts");

    // 2. Перезагружаем страницу, чтобы начать с чистого листа
    window.location.href = window.location.pathname;
  });
});
