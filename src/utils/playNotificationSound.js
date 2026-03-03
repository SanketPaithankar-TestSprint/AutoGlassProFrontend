export const playNotificationSound = () => {
    try {
        // Use a public Google notification sound for the beep
        const beepPath = '/src/assets/ding.mp3';
        const mainPath = '/src/assets/NotificationForServiceEnquiery.m4a';
        // Play soft ding beep first
        const beep = new Audio(beepPath);
        beep.volume = 0.5;
        beep.play()
            .then(() => {
                beep.onended = () => {
                    const mainSound = new Audio(mainPath);
                    mainSound.volume = 0.7;
                    mainSound.play().catch(e2 => console.error("Error playing main notification sound:", e2));
                };
            })
            .catch(e => console.error("Error playing beep sound:", e));
    } catch (error) {
        console.error("Audio playback failed:", error);
    }
};
