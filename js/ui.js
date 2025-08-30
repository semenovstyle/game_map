export const elements = {
  welcomeScreen: document.getElementById("welcome-screen"),
  welcomeTitle: document.getElementById("welcome-title"),
  welcomeText: document.getElementById("welcome-text"),
  enableSoundBtn: document.getElementById("enable-sound-btn"),
  questUi: document.getElementById("quest-ui"),
  puzzleViewport: document.getElementById("puzzle-viewport"),
  puzzleWrapper: document.getElementById("puzzle-wrapper"),
  finalMapViewport: document.getElementById("final-map-viewport"),
  finalMap: document.getElementById("final-map"),
  masks: document.querySelectorAll(".puzzle-mask"),
  progressIndicator: document.getElementById("progress-indicator"),
  scanBtn: document.getElementById("scan-btn"),
  resetViewBtn: document.getElementById("reset-view-btn"),
  scannerOverlay: document.getElementById("scanner-overlay"),
  qrReader: document.getElementById("qr-reader"),
  cancelScanBtn: document.getElementById("cancel-scan-btn"),
  hintModal: document.getElementById("hint-modal"),
  hintText: document.getElementById("hint-text"),
  closeModalBtn: document.getElementById("close-modal-btn"),
  feedbackToast: document.getElementById("feedback-toast"),
  congratsModal: document.getElementById("congrats-modal"),
  congratsText: document.getElementById("congrats-text"),
  resetBtn: document.getElementById("reset-btn"),
  globalResetBtn: document.getElementById("global-reset-btn"),
  // Элементы для аудиоплеера
  audioRiddleControls: document.getElementById("audio-riddle-controls"),
  playRiddleBtn: document.getElementById("play-riddle-btn"),
  stopRiddleBtn: document.getElementById("stop-riddle-btn"),
};

let puzzlePanzoom;
let finalMapPanzoom;

export function setMapDimensions(width, height) {
  if (width && height) {
    elements.puzzleWrapper.style.width = `${width}px`;
    elements.puzzleWrapper.style.height = `${height}px`;
    elements.finalMap.style.width = `${width}px`;
    elements.finalMap.style.height = `${height}px`;
  }
}

function animateView(panzoom, element, viewport, mode) {
  const viewportRect = viewport.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  if (viewportRect.width === 0 || elementRect.width === 0) return;
  const targetScale =
    mode === "width"
      ? viewportRect.width / elementRect.width
      : Math.min(
          viewportRect.width / elementRect.width,
          viewportRect.height / elementRect.height
        );
  panzoom.zoom(targetScale, { animate: true, duration: 300 });
}

export function initPanzoom(element, viewport) {
  const panzoom = Panzoom(element, {
    maxScale: 4,
    minScale: 0.2,
    canvas: true,
  });
  setTimeout(() => {
    const viewportRect = viewport.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (viewportRect.width > 0 && elementRect.width > 0) {
      const initialScale = Math.min(
        viewportRect.width / elementRect.width,
        viewportRect.height / elementRect.height
      );
      panzoom.zoom(initialScale, { animate: false });
    }
  }, 50);
  viewport.parentElement.addEventListener("wheel", panzoom.zoomWithWheel);
  return panzoom;
}

export function toggleActivePanzoomView() {
  let activePanzoom, activeElement, activeViewport;
  if (!elements.puzzleViewport.classList.contains("hidden")) {
    activePanzoom = puzzlePanzoom;
    activeElement = elements.puzzleWrapper;
    activeViewport = elements.puzzleViewport;
  } else {
    activePanzoom = finalMapPanzoom;
    activeElement = elements.finalMap;
    activeViewport = elements.finalMapViewport;
  }
  if (!activePanzoom) return;
  const currentScale = activePanzoom.getScale();
  const scaleToWidth =
    activeViewport.getBoundingClientRect().width /
    activeElement.getBoundingClientRect().width;
  const mode =
    Math.abs(currentScale - scaleToWidth) < 0.01 ? "screen" : "width";
  animateView(activePanzoom, activeElement, activeViewport, mode);
}

// ===== ОБНОВЛЕННЫЕ ФУНКЦИИ ОТОБРАЖЕНИЯ ТЕКСТА (ВОЗВРАТ К ПРОСТОТЕ) =====

export function showWelcomeScreen(title, text) {
  elements.welcomeTitle.textContent = title;
  elements.welcomeText.textContent = text; // Используем .textContent
  elements.welcomeScreen.classList.remove("hidden");
}

export function showHint(hintData) {
  elements.audioRiddleControls.classList.add("hidden");
  if (typeof hintData === "object" && hintData.audioRiddle) {
    elements.hintText.textContent = hintData.text; // Используем .textContent
    elements.audioRiddleControls.classList.remove("hidden");
  } else {
    elements.hintText.textContent = hintData; // Используем .textContent
  }
  elements.hintModal.classList.remove("hidden");
}

function showCongratsModal(message) {
  elements.congratsText.textContent = message; // Используем .textContent
  elements.congratsModal.classList.remove("hidden");
  setTimeout(() => {
    elements.congratsModal.classList.add("hidden");
  }, 4000);
}

// ===== ОСТАЛЬНЫЕ ФУНКЦИИ UI (без изменений) =====

export function hideWelcomeScreen() {
  elements.welcomeScreen.classList.add("hidden");
}
export function showQuestUI() {
  elements.questUi.classList.remove("hidden");
  if (!puzzlePanzoom)
    puzzlePanzoom = initPanzoom(
      elements.puzzleWrapper,
      elements.puzzleViewport
    );
}
export function updatePuzzleView(unlockedParts) {
  elements.masks.forEach((mask) => {
    const id = mask.dataset.partId;
    mask.style.opacity = unlockedParts.includes(id) ? "0" : "1";
  });
}
export function updateProgressIndicator(current, total) {
  elements.progressIndicator.textContent = `Найдено: ${current} из ${total}`;
}
export function showScanner() {
  elements.scannerOverlay.classList.remove("hidden");
}
export function hideScanner() {
  elements.scannerOverlay.classList.add("hidden");
}
export function hideHint(stopAudioCallback) {
  elements.hintModal.classList.add("hidden");
  if (typeof stopAudioCallback === "function") {
    stopAudioCallback();
  }
}
export function showFeedbackToast(message) {
  elements.feedbackToast.textContent = message;
  elements.feedbackToast.classList.remove("hidden");
  setTimeout(() => {
    elements.feedbackToast.classList.add("hidden");
  }, 2000);
}
export function showFinalScreen(message) {
  elements.puzzleViewport.classList.add("hidden");
  elements.finalMapViewport.classList.remove("hidden");
  if (!finalMapPanzoom)
    finalMapPanzoom = initPanzoom(elements.finalMap, elements.finalMapViewport);
  showCongratsModal(message);
}
export function showGlobalResetBtn() {
  elements.globalResetBtn.classList.remove("hidden");
}
export function hideGlobalResetBtn() {
  elements.globalResetBtn.classList.add("hidden");
}
