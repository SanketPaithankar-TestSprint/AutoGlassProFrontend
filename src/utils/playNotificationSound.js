import inquirySound from '../assets/NotificationForServiceEnquiery.NotificationForServiceEnquiery.m4a';

// Single reusable Audio instance — must be primed during a user gesture
// so the browser whitelists it for future programmatic playback
const audio = new Audio(inquirySound);
audio.preload = 'auto';

let primed = false;

const primeAudio = () => {
    if (primed) return;
    audio.volume = 0;
    audio.play()
        .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0.7;
            primed = true;
        })
        .catch(() => {});
};

['click', 'keydown', 'touchstart'].forEach(evt =>
    document.addEventListener(evt, primeAudio)
);

export const playNotificationSound = () => {
    if (!primed) return;
    try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch (_) {
        // Audio not supported in this environment
    }
};
