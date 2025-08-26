const STORAGE_KEY = 'questProgress';
let state = {
    unlockedParts: []
};

export function loadProgress() {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
        state.unlockedParts = JSON.parse(savedProgress);
    }
    return state.unlockedParts;
}

export function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.unlockedParts));
}

export function unlockPart(partId) {
    if (!state.unlockedParts.includes(partId)) {
        state.unlockedParts.push(partId);
        return true; // Успешно открыта новая часть
    }
    return false; // Часть уже была открыта
}

export function getUnlockedCount() {
    return state.unlockedParts.length;
}

export function isComplete(totalParts) {
    return state.unlockedParts.length === totalParts;
}

export function resetProgress() {
    state.unlockedParts = [];
    localStorage.removeItem(STORAGE_KEY);
}