import * as Quest from "./quest.js";
import * as UI from "./ui.js";

// --- Глобальные переменные модуля ---
let config, html5QrCode, sound, debugUrlInput, debugSubmitBtn;
let riddleAudio; // Переменная для хранения объекта аудио-загадки

// --- Функции-обработчики ---

/**
 * Обрабатывает результат сканирования (реального или эмулированного)
 */
function processScannedUrl(decodedText) {
  try {
    const url = new URL(decodedText);
    const partId = url.searchParams.get("part");
    if (!partId || !config.hints[partId]) {
      UI.showFeedbackToast(config.feedback.invalidQR);
      return;
    }

    if (Quest.unlockPart(partId)) {
      sound.play();
      Quest.saveProgress();
      UI.updatePuzzleView(Quest.loadProgress());
      UI.updateProgressIndicator(Quest.getUnlockedCount(), config.totalParts);

      const hintData = config.hints[partId];
      UI.showHint(hintData); // Сначала показываем окно

      // Если в подсказке есть аудио, запускаем его
      if (typeof hintData === "object" && hintData.audioRiddle) {
        playRiddleAudio(hintData.audioRiddle);
      }
    } else {
      UI.showFeedbackToast(config.feedback.alreadyScanned);
    }
  } catch (error) {
    console.error("Ошибка обработки QR-кода:", error);
    UI.showFeedbackToast(config.feedback.invalidQR);
  }
}

/**
 * Вызывается при успешном сканировании реальным сканером
 */
function onScanSuccess(decodedText) {
  UI.hideScanner();
  html5QrCode
    .stop()
    .catch((err) => console.warn("Сканер уже был остановлен:", err));
  processScannedUrl(decodedText);
}

/**
 * Запускает воспроизведение аудио-загадки
 */
function playRiddleAudio(audioSrc) {
  // Если уже играет другая мелодия, останавливаем ее
  if (riddleAudio) {
    riddleAudio.pause();
  }
  riddleAudio = new Audio(audioSrc);
  riddleAudio.loop = true; // Зацикливаем воспроизведение
  riddleAudio.play();
}

/**
 * Останавливает воспроизведение аудио-загадки
 */
function stopRiddleAudio() {
  if (riddleAudio) {
    riddleAudio.pause();
    riddleAudio.currentTime = 0; // Сбрасываем на начало
    riddleAudio = null; // Очищаем переменную
  }
}

// --- Инициализация и настройка ---

/**
 * Настраивает все обработчики событий для кнопок
 */
function setupEventListeners() {
  UI.elements.enableSoundBtn.addEventListener("click", () => {
    sound.play();
    sound.pause();
    sound.currentTime = 0;
    UI.hideWelcomeScreen();
    UI.showQuestUI();
    UI.showGlobalResetBtn();
  });

  UI.elements.scanBtn.addEventListener("click", () => {
    UI.showScanner();
    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      )
      .catch((err) => {
        console.error("Не удалось запустить сканер:", err);
        UI.hideScanner();
        UI.showFeedbackToast("Не удалось получить доступ к камере.");
      });
  });

  UI.elements.cancelScanBtn.addEventListener("click", () => {
    html5QrCode
      .stop()
      .catch((err) => console.warn("Сканер уже был остановлен:", err));
    UI.hideScanner();
  });

  UI.elements.closeModalBtn.addEventListener("click", () => {
    UI.hideHint(stopRiddleAudio); // Передаем функцию остановки музыки
    if (Quest.isComplete(config.totalParts)) {
      UI.showFinalScreen(config.congratsMessage);
    }
  });

  //   UI.elements.resetBtn.addEventListener("click", () => {
  //     Quest.resetProgress();
  //     window.location.reload();
  //   });

  UI.elements.resetViewBtn.addEventListener("click", () => {
    UI.toggleActivePanzoomView();
  });

  UI.elements.globalResetBtn.addEventListener("click", () => {
    if (
      confirm(
        "Вы уверены, что хотите начать квест заново? Весь прогресс будет утерян."
      )
    ) {
      Quest.resetProgress();
      window.location.reload();
    }
  });

  // Обработчики для плеера аудио-загадки
  UI.elements.playRiddleBtn.addEventListener("click", () => {
    if (riddleAudio) {
      riddleAudio.play();
    }
  });

  UI.elements.stopRiddleBtn.addEventListener("click", stopRiddleAudio);

  // Эмулятор сканера для теста
  if (debugSubmitBtn && debugUrlInput) {
    debugSubmitBtn.addEventListener("click", () => {
      const url = debugUrlInput.value;
      if (url) {
        processScannedUrl(url);
        debugUrlInput.value = "";
      }
    });
  }
}

/**
 * Главная функция, инициализирующая приложение
 */
async function initializeApp() {
  // Получаем элементы для эмулятора
  debugUrlInput = document.getElementById("debug-url-input");
  debugSubmitBtn = document.getElementById("debug-submit-btn");

  try {
    const response = await fetch("./config.json");
    config = await response.json();
  } catch (error) {
    console.error("Не удалось загрузить файл конфигурации!", error);
    alert("Ошибка загрузки квеста. Пожалуйста, обновите страницу.");
    return;
  }

  UI.setMapDimensions(config.mapWidthPx, config.mapHeightPx);

  sound = new Audio(config.audioFile);
  sound.volume = 0.7;
  html5QrCode = new Html5Qrcode("qr-reader");

  setupEventListeners();

  const unlockedParts = Quest.loadProgress();
  UI.updatePuzzleView(unlockedParts);
  UI.updateProgressIndicator(Quest.getUnlockedCount(), config.totalParts);

  if (unlockedParts.length > 0) {
    UI.showQuestUI();
    UI.showGlobalResetBtn();
  } else {
    UI.showWelcomeScreen(config.welcomeTitle, config.welcomeText);
    UI.hideGlobalResetBtn();
  }

  if (Quest.isComplete(config.totalParts)) {
    UI.showFinalScreen(config.congratsMessage);
  }
}

// Запускаем приложение после полной загрузки HTML
document.addEventListener("DOMContentLoaded", initializeApp);
