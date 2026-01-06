import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input, Card, notification, Table, Tag } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { createUserAdasPrice, getUserAdasPrices } from "../../api/userAdasPrices";

const ADAS_TYPES = [
    { code: 'Static', label: 'Static Calibration' },
    { code: 'Dynamic', label: 'Dynamic Calibration' },
    { code: 'Static and Dynamic', label: 'Static and Dynamic Calibration' }
];

const UserAdasPricePage = () => {
    const [prices, setPrices] = useState({}); // Map of code -> price
    const [updating, setUpdating] = useState({}); // Map of code -> boolean
    const queryClient = useQueryClient();

    const { data: adasPrices, isLoading: loading } = useQuery({
        queryKey: ['userAdasPrices'],
        queryFn: getUserAdasPrices,
        onError: (error) => {
            console.error("Error fetching ADAS prices:", error);
            notification.error({
                message: "Failed to fetch ADAS prices",
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

            notification.success({ message: `${code} Price updated` });
            queryClient.invalidateQueries({ queryKey: ['userAdasPrices'] });
        } catch (error) {
            console.error("Error saving ADAS price:", error);
            notification.error({
                message: "Failed to update price",
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
            title: 'Calibration Type',
            dataIndex: 'code',
            key: 'code',
            render: text => <span className="font-medium text-slate-700">{text}</span>
        },
        {
            title: 'Price',
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
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, record) => {
                const isSet = prices[record.code] !== undefined && prices[record.code] !== null;
                return isSet ? (
                    <Tag color="green">Active</Tag>
                ) : (
                    <Tag>Not Set</Tag>
                );
            }
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">ADAS Calibration Pricing</h2>
            </div>

            <Card className="shadow-sm border border-slate-200">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarOutlined className="text-2xl text-violet-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Manage ADAS Prices</h3>
                            <p className="text-sm text-gray-500">
                                Set your standard pricing for ADAS calibration types.
                            </p>
                        </div>
                    </div>

                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        loading={loading}
                        rowClassName="hover:bg-slate-50"
                    />
                </div>
            </Card>
        </div>
    );
};

export default UserAdasPricePage;
