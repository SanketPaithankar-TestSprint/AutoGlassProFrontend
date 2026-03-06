import React, { useState } from 'react';
import { Switch, Select, Slider, Radio, Divider } from 'antd';
import { BellOutlined, MessageOutlined, SoundOutlined, ClockCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';

const SOUND_OPTIONS = [
    { value: 'chime', label: '🔔 Chime' },
    { value: 'bell', label: '🛎 Bell' },
    { value: 'ping', label: '📳 Ping' },
    { value: 'ding', label: '✨ Ding' },
    { value: 'none', label: '🔇 None' },
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
    <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-gray-400 text-base mt-0.5">{icon}</span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 m-0">{label}</p>
                {description && <p className="text-xs text-gray-400 m-0 mt-0.5">{description}</p>}
            </div>
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const NotificationSection = ({ icon, title, color }) => {
    const [enabled, setEnabled] = useState(true);
    const [sound, setSound] = useState('chime');
    const [volume, setVolume] = useState(70);
    const [frequency, setFrequency] = useState('every');
    const [delay, setDelay] = useState(0);
    const [showModal, setShowModal] = useState(true);

    return (
        <SectionCard icon={icon} title={title} color={color}>
            {/* Master toggle */}
            <SettingRow
                icon={<BellOutlined />}
                label="Enable Notifications"
                description="Show modal alert and play sound when a new notification arrives"
            >
                <Switch
                    checked={enabled}
                    onChange={setEnabled}
                    style={enabled ? { background: color } : {}}
                />
            </SettingRow>

            <Divider className="my-0" />

            {/* Show modal toggle */}
            <SettingRow
                icon={<BellOutlined />}
                label="Show Alert Modal"
                description="Pop-up modal in the centre of the screen"
            >
                <Switch
                    checked={showModal}
                    onChange={setShowModal}
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
                    onChange={setSound}
                    options={SOUND_OPTIONS}
                    disabled={!enabled}
                    style={{ width: 160 }}
                    size="small"
                />
            </SettingRow>

            {/* Volume slider */}
            <SettingRow
                icon={<SoundOutlined />}
                label="Volume"
                description={`${volume}%`}
            >
                <Slider
                    value={volume}
                    onChange={setVolume}
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
                    onChange={setFrequency}
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
                <Radio.Group
                    value={delay}
                    onChange={e => setDelay(e.target.value)}
                    disabled={!enabled}
                    size="small"
                >
                    {DELAY_OPTIONS.map(o => (
                        <Radio.Button key={o.value} value={o.value}>{o.label}</Radio.Button>
                    ))}
                </Radio.Group>
            </SettingRow>
        </SectionCard>
    );
};

const NotificationSettings = () => (
    <div className="space-y-6">
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 m-0 mb-2">Notification Settings</h2>

        {/* Inquiries */}
        <NotificationSection
            icon={<BellOutlined />}
            title="Inquiries"
            color="#1677ff"
        />

        {/* Live Chat */}
        <NotificationSection
            icon={<MessageOutlined />}
            title="Live Chat"
            color="#1677ff"
        />
    </div>
);

export default NotificationSettings;
