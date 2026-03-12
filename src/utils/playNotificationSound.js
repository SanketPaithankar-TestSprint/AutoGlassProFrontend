import chatSpecificSound from '../assets/NotificationForChat.mp3';
import serviceSpecificSound from '../assets/NotificationForServiceEnquiery.NotificationForServiceEnquiery.m4a';
import pingSound from '../assets/ping.mp3';
import chimeSound from '../assets/chime.mp3';

const SOUND_SOURCES = {
    chatSpecific: chatSpecificSound,
    serviceSpecific: serviceSpecificSound,
    ping: pingSound,
    chime: chimeSound,
};

const audioPool = Object.fromEntries(
    Object.entries(SOUND_SOURCES).map(([key, src]) => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        return [key, audio];
    })
);

let primed = false;

const clampVolume = (volume) => {
    const value = typeof volume === 'number' ? volume : 70;
    return Math.max(0, Math.min(100, value));
};

const resolveSoundKey = ({ sound = 'chime', type = 'inquiries' } = {}) => {
    const normalized = typeof sound === 'string'
        ? sound.toLowerCase().replace(/[\s_-]+/g, '')
        : '';

    if (normalized === 'none') return null;
    if (normalized === 'chatspecific') return 'chatSpecific';
    if (normalized === 'servicespecific') return 'serviceSpecific';
    if (normalized === 'ping' || normalized === 'pingmp2' || normalized === 'pingmp3') return 'ping';
    if (normalized === 'chime' || normalized === 'chimemp3') return 'chime';

    // Backward-compatible values already stored in settings.
    if (normalized === 'ding') {
        return type === 'liveChat' ? 'chatSpecific' : 'serviceSpecific';
    }
    if (normalized === 'messagesent' || normalized === 'messagereceived') {
        return 'chatSpecific';
    }
    if (normalized === 'bell') return 'chime';

    return type === 'liveChat' ? 'chatSpecific' : 'serviceSpecific';
};

const primeAudio = () => {
    if (primed) return;

    Promise.all(
        Object.values(audioPool).map((audio) => {
            audio.volume = 0;
            return audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                })
                .catch(() => {});
        })
    ).finally(() => {
        primed = true;
    });
};

['click', 'keydown', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, primeAudio);
});

export const playNotificationSound = ({ sound = 'chime', volume = 70, type = 'inquiries' } = {}) => {
    if (!primed) return;

    const soundKey = resolveSoundKey({ sound, type });
    if (!soundKey) return;

    const audio = audioPool[soundKey];
    if (!audio) return;

    try {
        audio.volume = clampVolume(volume) / 100;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch (_) {
        // Audio playback may be blocked by browser policies.
    }
};
