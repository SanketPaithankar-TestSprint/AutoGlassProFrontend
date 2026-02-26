import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Card, notification, Table, Tag } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { createUserAdasPrice, getUserAdasPrices } from "../../api/userAdasPrices";
import { ADAS_TYPES } from "../../const/adasTypes";
import { useTranslation } from 'react-i18next';

const UserAdasPricePage = () => {
    const [prices, setPrices] = useState({}); // Map of code -> price
    const [updating, setUpdating] = useState({}); // Map of code -> boolean
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: adasPrices, isLoading: loading } = useQuery({
        queryKey: ['userAdasPrices'],
        queryFn: getUserAdasPrices,
        onError: (error) => {
            console.error("Error fetching ADAS prices:", error);
            notification.error({
                message: t('pricing.fetchAdasPricesFailed', { defaultValue: 'Failed to fetch ADAS prices' }),
                description: error.message
            });
        }
    });

    useEffect(() => {
        if (adasPrices) {
            const priceMap = {};
            // Assuming the API returns objects with { calibrationCode, calibrationPrice }
            // We map them to our local state
            if (Array.isArray(adasPrices)) {
                adasPrices.forEach(item => {
                    priceMap[item.calibrationCode] = item.calibrationPrice;
                });
            }
            setPrices(priceMap);
        }
    }, [adasPrices]);

    const handlePriceChange = (code, value) => {
        setPrices(prev => ({
            ...prev,
            [code]: value
        }));
    };

    const handleSavePrice = async (code) => {
        const price = parseFloat(prices[code]);
        if (isNaN(price)) return; // Don't save invalid numbers

        setUpdating(prev => ({ ...prev, [code]: true }));
        try {
            await createUserAdasPrice({
                calibrationCode: code,
                calibrationPrice: price
            });

            notification.success({ message: t('pricing.priceUpdated', { defaultValue: 'Price for {{code}} updated', code }) });
            queryClient.invalidateQueries({ queryKey: ['userAdasPrices'] });
        } catch (error) {
            console.error("Error saving ADAS price:", error);
            notification.error({
                message: t('pricing.updatePriceFailed', { defaultValue: 'Failed to update price' }),
                description: error.message
            });
        } finally {
            setUpdating(prev => ({ ...prev, [code]: false }));
        }
    };

    const tableData = ADAS_TYPES.map(type => ({
        key: type.code,
        ...type,
        price: prices[type.code]
    }));

    const columns = [
        {
            title: t('pricing.calibrationType', { defaultValue: 'Calibration Type' }),
            dataIndex: 'code',
            key: 'code',
            render: text => <span className="font-medium text-slate-700">{text}</span>
        },
        {
            title: t('pricing.price', { defaultValue: 'Price' }),
            dataIndex: 'price',
            key: 'price',
            width: 200,
            render: (_, record) => (
                <Input
                    prefix="$"
                    type="number"
                    step="0.01"
                    value={prices[record.code] !== undefined ? prices[record.code] : ''}
                    onChange={(e) => handlePriceChange(record.code, e.target.value)}
                    onBlur={() => handleSavePrice(record.code)}
                    disabled={updating[record.code]}
                    className={updating[record.code] ? "bg-slate-50" : ""}
                    status={updating[record.code] ? "warning" : ""}
                    placeholder="0.00"
                />
            )
        },
        {
            title: t('employees.status', { defaultValue: 'Status' }),
            key: 'status',
            width: 100,
            render: (_, record) => {
                const isSet = prices[record.code] !== undefined && prices[record.code] !== null;
                return isSet ? (
                    <Tag color="green">{t('employees.active', { defaultValue: 'Active' })}</Tag>
                ) : (
                    <Tag>{t('pricing.notSet', { defaultValue: 'Not Set' })}</Tag>
                );
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{t('pricing.adasCalibrationPricing', { defaultValue: 'ADAS Calibration Pricing' })}</h2>
            </div>

            <Card className="shadow-sm border border-slate-200">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarOutlined className="text-2xl text-violet-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('pricing.manageAdasPrices', { defaultValue: 'Manage ADAS Prices' })}</h3>
                            <p className="text-sm text-gray-500">
                                {t('pricing.manageAdasPricesDesc', { defaultValue: 'Set your standard pricing for ADAS calibration types.' })}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    {!isMobile && (
                        <Table
                            dataSource={tableData}
                            columns={columns}
                            pagination={false}
                            loading={loading}
                            rowClassName="hover:bg-slate-50"
                        />
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">{t('pricing.loadingLaborRate', { defaultValue: 'Loading...' })}</div>
                            ) : tableData.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">{t('pricing.noAdasFound', { defaultValue: 'No ADAS types found' })}</div>
                            ) : (
                                tableData.map((adas) => (
                                    <div key={adas.code} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                                        <div className="mb-3">
                                            <p className="text-sm font-bold text-gray-900">{adas.label}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium">{t('pricing.price', { defaultValue: 'Price' })}:</span>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        size="small"
                                                        prefix="$"
                                                        value={prices[adas.code] || ""}
                                                        onChange={(e) => handlePriceChange(adas.code, e.target.value)}
                                                        onBlur={() => handleSavePrice(adas.code)}
                                                        disabled={updating[adas.code]}
                                                        style={{ width: '100px' }}
                                                        min={0}
                                                        step={0.01}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                {prices[adas.code] ? (
                                                    <Tag color="green">✓ {t('pricing.set', { defaultValue: 'Set' })} - ${prices[adas.code]}</Tag>
                                                ) : (
                                                    <Tag color="red">{t('pricing.notSet', { defaultValue: 'Not Set' })}</Tag>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserAdasPricePage;
