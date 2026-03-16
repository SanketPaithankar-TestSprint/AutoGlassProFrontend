import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Select, Slider, Divider, Button, App } from 'antd';
import { BellOutlined, MessageOutlined, SoundOutlined, SoundFilled, ClockCircleOutlined, FieldTimeOutlined, AlertOutlined, NotificationOutlined } from '@ant-design/icons';
import { useNotificationSettings } from '../../context/NotificationSettingsContext';
import { playNotificationSound } from '../../utils/playNotificationSound';

const SHARED_SOUND_OPTIONS = [
    { value: 'chime', label: 'Chime' },
    { value: 'ping', label: 'Ping' },
    { value: 'none', label: 'None' },
];

const INQUIRY_SOUND_OPTIONS = [
    { value: 'ding', label: 'Service specific' },
    ...SHARED_SOUND_OPTIONS,
];

const LIVE_CHAT_SOUND_OPTIONS = [
    { value: 'ding', label: 'Chat specific' },
    ...SHARED_SOUND_OPTIONS,
];

const FREQUENCY_OPTIONS = [
    { value: 'every', label: 'Every new notification' },
    { value: '10s', label: 'Every 10 seconds' },
    { value: '30s', label: 'Every 30 seconds' },
    { value: '1m', label: 'Every 1 minute' },
    { value: '5m', label: 'Every 5 minutes' },
];

const DELAY_OPTIONS = [
    { value: 0, label: 'Immediately' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
];

const SectionCard = ({ icon, title, color, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100`} style={{ background: `${color}0d` }}>
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
                style={{ background: color }}
            >
                {icon}
            </div>
            <div className="flex-1">
                <span className="font-bold text-gray-800 text-base">{title}</span>
            </div>
        </div>
        <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
);

const SettingRow = ({ icon, label, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-gray-400 text-base mt-0.5">{icon}</span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 m-0">{label}</p>
                {description && <p className="text-xs text-gray-400 m-0 mt-0.5">{description}</p>}
            </div>
        </div>
        <div className="flex-shrink-0 ml-7 sm:ml-0">{children}</div>
    </div>
);

const NotificationSection = ({ icon, title, color, sectionKey, section, onFieldChange, soundOptions }) => {
    const enabled = section?.enabled ?? true;
    const showModal = section?.showModal ?? true;
    const sound = useMemo(() => {
        const defaultSound = 'none';
        const current = section?.sound ?? defaultSound;
        const isValid = soundOptions.some((option) => option.value === current);
        return isValid ? current : defaultSound;
    }, [section?.sound, soundOptions]);
    const volume = section?.volume ?? 100;
    const frequency = section?.frequency ?? 'every';
    const delay = section?.delay ?? 0;

    return (
        <SectionCard icon={icon} title={title} color={color}>
            {/* Master toggle */}
            <SettingRow
                icon={<NotificationOutlined />}
                label="Enable Notifications"
                description="Show modal alert and play sound when a new notification arrives"
            >
                <Switch
                    checked={enabled}
                    onChange={(checked) => onFieldChange(sectionKey, 'enabled', checked)}
                    style={enabled ? { background: color } : {}}
                />
            </SettingRow>

            <Divider className="my-0" />

            {/* Show modal toggle */}
            <SettingRow
                icon={<AlertOutlined />}
                label="Show Alert Modal"
                description="Pop-up modal in the centre of the screen"
            >
                <Switch
                    checked={showModal}
                    onChange={(checked) => onFieldChange(sectionKey, 'showModal', checked)}
                    disabled={!enabled}
                    style={showModal && enabled ? { background: color } : {}}
                />
            </SettingRow>

            <Divider className="my-0" />

            {/* Sound picker */}
            <SettingRow
                icon={<SoundOutlined />}
                label="Notification Sound"
                description="Sound played when the alert fires"
            >
                <Select
                    value={sound}
                    onChange={(value) => onFieldChange(sectionKey, 'sound', value)}
                    options={soundOptions}
                    disabled={!enabled}
                    style={{ width: 160 }}
                    size="small"
                />
            </SettingRow>

            {/* Volume slider */}
            <SettingRow
                icon={<SoundFilled />}
                label="Volume"
                description={`${volume}%`}
            >
                <Slider
                    value={volume}
                    onChange={(value) => onFieldChange(sectionKey, 'volume', value)}
                    disabled={!enabled || sound === 'none'}
                    style={{ width: 140 }}
                    min={0}
                    max={100}
                    tooltip={{ formatter: v => `${v}%` }}
                    styles={{ track: { background: color }, handle: { borderColor: color } }}
                />
            </SettingRow>

            <Divider className="my-0" />

            {/* Repeat frequency */}
            <SettingRow
                icon={<ClockCircleOutlined />}
                label="Repeat Frequency"
                description="How often to re-alert when unread notifications remain"
            >
                <Select
                    value={frequency}
                    onChange={(value) => onFieldChange(sectionKey, 'frequency', value)}
                    options={FREQUENCY_OPTIONS}
                    disabled={!enabled}
                    style={{ width: 200 }}
                    size="small"
                />
            </SettingRow>

            {/* Delay before first alert */}
            <SettingRow
                icon={<FieldTimeOutlined />}
                label="Delay Before First Alert"
                description="Wait before showing the notification"
            >
                <Select
                    value={delay}
                    onChange={(value) => onFieldChange(sectionKey, 'delay', value)}
                    disabled={!enabled}
                    options={DELAY_OPTIONS}
                    style={{ width: 150 }}
                    size="small"
                />
            </SettingRow>
        </SectionCard>
    );
};

const NotificationSettings = () => {
    const { message } = App.useApp();
    const { settings, loading, error, fetchSettings, replaceSettings, saving } = useNotificationSettings();
    const [draftSettings, setDraftSettings] = useState(settings);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setDraftSettings(settings);
        setIsDirty(false);
    }, [settings]);

    const onFieldChange = (sectionKey, field, value) => {
        const nextSection = {
            ...draftSettings?.[sectionKey],
            [field]: value,
        };

        setDraftSettings((prev) => ({
            ...prev,
            [sectionKey]: {
                ...prev?.[sectionKey],
                [field]: value,
            },
        }));
        setIsDirty(true);

        // Play a local demo when user changes sound or volume.
        if (field === 'sound' || field === 'volume') {
            if (nextSection?.sound === 'none') {
                return;
            }

            playNotificationSound({
                sound: nextSection?.sound,
                volume: nextSection?.volume,
                type: sectionKey === 'liveChat' ? 'liveChat' : 'inquiries',
            });
        }
    };

    const handleSave = async () => {
        try {
            await replaceSettings(draftSettings);
            setIsDirty(false);
            message.success('Notification settings saved.');
        } catch (saveError) {
            message.error('Failed to save notification settings.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800 m-0 mb-2">Notification Settings</h2>
                <Button
                    type="primary"
                    onClick={handleSave}
                    disabled={!isDirty || loading}
                    loading={saving}
                >
                    Save
                </Button>
            </div>

            {loading && (
                <div className="text-sm text-gray-500">Loading notification settings...</div>
            )}

            {error && (
                <div className="text-sm text-red-500">
                    Failed to load the latest settings. Showing defaults.
                    <button
                        type="button"
                        className="ml-2 text-blue-600 hover:text-blue-700 underline"
                        onClick={fetchSettings}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Inquiries */}
            <NotificationSection
                icon={<BellOutlined />}
                title="Inquiries"
                color="#1677ff"
                sectionKey="inquiries"
                section={draftSettings?.inquiries}
                onFieldChange={onFieldChange}
                soundOptions={INQUIRY_SOUND_OPTIONS}
            />

            {/* Live Chat */}
            <NotificationSection
                icon={<MessageOutlined />}
                title="Live Chat"
                color="#1677ff"
                sectionKey="liveChat"
                section={draftSettings?.liveChat}
                onFieldChange={onFieldChange}
                soundOptions={LIVE_CHAT_SOUND_OPTIONS}
            />
        </div>
    );
};

export default NotificationSettings;
