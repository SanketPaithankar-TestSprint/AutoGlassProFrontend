import React, { useState, useEffect } from "react";
import { Input, Button, notification, Card } from "antd";
import { DollarOutlined, EditOutlined, CheckOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { getValidToken } from "../../api/getValidToken";
import { setLaborRate } from "../../api/setLaborRate";
import { useTranslation } from 'react-i18next';

const LaborRateConfiguration = () => {
    const [laborRate, setLaborRateValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { t } = useTranslation();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Load labor rate from localStorage profile data or localStorage GlobalLaborRate
        const profileData = JSON.parse(localStorage.getItem('agp_profile_data') || '{}');
        const storedRate = localStorage.getItem('GlobalLaborRate') || profileData.laborRate || '0';
        setLaborRateValue(storedRate);
        setLoading(false);
    }, []);

    const handleEdit = () => {
        setEditedValue(laborRate);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedValue('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const numericRate = parseFloat(editedValue);

            if (isNaN(numericRate) || numericRate <= 0) {
                notification.error({ message: t('pricing.invalidLaborRate', { defaultValue: 'Please enter a valid labor rate' }) });
                return;
            }

            const token = getValidToken();
            if (!token) throw new Error("No token found");

            await setLaborRate(numericRate);

            notification.success({ message: t('pricing.laborRateUpdated', { defaultValue: 'Labor rate updated successfully' }) });

            // Update localStorage for GlobalLaborRate and profile data
            setLaborRateValue(String(numericRate));
            localStorage.setItem('GlobalLaborRate', String(numericRate));

            // Update profile data in localStorage
            const profileData = JSON.parse(localStorage.getItem('agp_profile_data') || '{}');
            profileData.laborRate = String(numericRate);
            localStorage.setItem('agp_profile_data', JSON.stringify(profileData));

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating labor rate:', error);
            notification.error({ message: t('pricing.laborRateUpdateFailed', { defaultValue: 'Failed to update labor rate' }), description: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-lg text-gray-500 animate-pulse">
                {t('pricing.loadingLaborRate', { defaultValue: 'Loading labor rate...' })}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{t('pricing.laborRate', { defaultValue: 'Labor Rate' })}</h2>
            </div>

            <Card className="shadow-sm">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <DollarOutlined className="text-3xl text-green-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('pricing.hourlyLaborRate', { defaultValue: 'Hourly Labor Rate' })}</h3>
                            <p className="text-sm text-gray-500">{t('pricing.hourlyLaborRateDesc', { defaultValue: 'Set your default labor rate per hour for service documents' })}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start ${isMobile ? '' : 'items-center'} gap-3`}>
                                    <span className="text-2xl font-bold text-gray-600">$</span>
                                    <Input
                                        type="number"
                                        value={editedValue}
                                        onChange={(e) => setEditedValue(e.target.value)}
                                        onPressEnter={handleSave}
                                        className={`text-2xl font-bold ${isMobile ? 'w-full' : 'w-48'}`}
                                        size="large"
                                        autoFocus
                                        min={0}
                                        step={0.01}
                                    />
                                    <span className="text-lg text-gray-500">{t('pricing.perHour', { defaultValue: 'per hour' })}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        onClick={handleSave}
                                        loading={saving}
                                        size="large"
                                        className={isMobile ? 'flex-1' : ''}
                                    >
                                        {t('shops.save', { defaultValue: 'Save' })}
                                    </Button>
                                    <Button
                                        icon={<CloseOutlined />}
                                        onClick={handleCancel}
                                        size="large"
                                        disabled={saving}
                                        className={isMobile ? 'flex-1' : ''}
                                    >
                                        {t('shops.cancel', { defaultValue: 'Cancel' })}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-start ${isMobile ? 'space-y-4' : 'items-center justify-between'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl font-bold text-green-600">
                                        ${laborRate || "0"}
                                    </span>
                                    <span className="text-lg text-gray-500">{t('pricing.perHour', { defaultValue: 'per hour' })}</span>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={handleEdit}
                                    size="large"
                                    className={isMobile ? 'w-full' : ''}
                                >
                                    {t('pricing.editRate', { defaultValue: 'Edit Rate' })}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-700 mb-1">💡 {t('pricing.tip', { defaultValue: 'Tip' })}</p>
                        <p>{t('pricing.laborRateTip', { defaultValue: 'This labor rate will be used as the default when creating new service documents. You can override it on individual documents if needed.' })}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LaborRateConfiguration;
