import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getNotificationSettings } from '../api/getNotificationSettings';
import { patchNotificationSettings } from '../api/patchNotificationSettings';
import { updateNotificationSettings } from '../api/updateNotificationSettings';
import { useAuth } from './auth/useAuth';
import { getValidToken } from '../api/getValidToken';

const DEFAULT_SECTION = {
    enabled: true,
    showModal: true,
    sound: 'chime',
    volume: 100,
    frequency: '1m',
    delay: 0,
};

const DEFAULT_NOTIFICATION_SETTINGS = {
    inquiries: { ...DEFAULT_SECTION },
    liveChat: { ...DEFAULT_SECTION, frequency: '10s' },
};

const NotificationSettingsContext = createContext(null);

const normalizeSection = (section, fallback) => ({
    enabled: typeof section?.enabled === 'boolean' ? section.enabled : fallback.enabled,
    showModal: typeof section?.showModal === 'boolean' ? section.showModal : fallback.showModal,
    sound: typeof section?.sound === 'string' ? section.sound : fallback.sound,
    volume: typeof section?.volume === 'number' ? section.volume : fallback.volume,
    frequency: typeof section?.frequency === 'string' ? section.frequency : fallback.frequency,
    delay: typeof section?.delay === 'number' ? section.delay : fallback.delay,
});

const normalizeSettings = (settings) => ({
    inquiries: normalizeSection(settings?.inquiries, DEFAULT_NOTIFICATION_SETTINGS.inquiries),
    liveChat: normalizeSection(settings?.liveChat, DEFAULT_NOTIFICATION_SETTINGS.liveChat),
});

export const useNotificationSettings = () => {
    const context = useContext(NotificationSettingsContext);

    if (!context) {
        throw new Error('useNotificationSettings must be used within NotificationSettingsProvider');
    }

    return context;
};

export const NotificationSettingsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        const token = getValidToken();
        if (!token) {
            setSettings(DEFAULT_NOTIFICATION_SETTINGS);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getNotificationSettings();
            const payload = normalizeSettings(response?.data);
            setSettings(payload);
        } catch (err) {
            console.error('Failed to fetch notification settings:', err);
            setError(err?.message || 'Failed to fetch notification settings.');
            setSettings(DEFAULT_NOTIFICATION_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setSettings(DEFAULT_NOTIFICATION_SETTINGS);
            setLoading(false);
            setError(null);
            return;
        }

        fetchSettings();
    }, [fetchSettings, isAuthenticated]);

    const replaceSettings = useCallback(async (nextSettings) => {
        const payload = normalizeSettings(nextSettings);
        setSettings(payload);
        setSaving(true);

        try {
            const response = await updateNotificationSettings(payload);
            if (response?.data) {
                setSettings(normalizeSettings(response.data));
            }
            setError(null);
            return response;
        } catch (err) {
            console.error('Failed to update notification settings:', err);
            setError(err?.message || 'Failed to update notification settings.');
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    const patchSettings = useCallback(async (patchPayload) => {
        setSaving(true);

        try {
            const response = await patchNotificationSettings(patchPayload);
            if (response?.data) {
                setSettings(normalizeSettings(response.data));
            }
            setError(null);
            return response;
        } catch (err) {
            console.error('Failed to patch notification settings:', err);
            setError(err?.message || 'Failed to patch notification settings.');
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    const updateSection = useCallback(async (sectionKey, sectionPatch, options = { persist: true }) => {
        const persist = options?.persist !== false;

        setSettings((prev) => {
            const merged = {
                ...prev,
                [sectionKey]: {
                    ...prev[sectionKey],
                    ...sectionPatch,
                },
            };
            return normalizeSettings(merged);
        });

        if (!persist) {
            return null;
        }

        return patchSettings({ [sectionKey]: sectionPatch });
    }, [patchSettings]);

    const updateField = useCallback((sectionKey, field, value, options = { persist: true }) => {
        return updateSection(sectionKey, { [field]: value }, options);
    }, [updateSection]);

    const value = useMemo(() => ({
        settings,
        loading,
        saving,
        error,
        fetchSettings,
        replaceSettings,
        patchSettings,
        updateSection,
        updateField,
        defaultSettings: DEFAULT_NOTIFICATION_SETTINGS,
    }), [settings, loading, saving, error, fetchSettings, replaceSettings, patchSettings, updateSection, updateField]);

    return (
        <NotificationSettingsContext.Provider value={value}>
            {children}
        </NotificationSettingsContext.Provider>
    );
};
