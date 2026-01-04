import React, { useState, useEffect } from "react";
import { Input, Card, notification, Table, Tag } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { createUserKitPrice, getUserKitPrices } from "../../api/userKitPrices";

const STANDARD_KITS = [
    { code: '1246', desc: 'Urethane,Dam,Primer' },
    { code: '1469', desc: 'Fast-Cure Urethane/Dam/Primer' },
    { code: '1550', desc: 'Non-Conductive' },
    { code: '1552', desc: 'High Modulus' },
    { code: '2022', desc: 'Foam Core Butyl Tape' },
];

const UserKitPricePage = () => {
    const [prices, setPrices] = useState({}); // Map of code -> price
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState({}); // Map of code -> boolean

    const fetchKitPrices = async () => {
        setLoading(true);
        try {
            const data = await getUserKitPrices();
            const priceMap = {};
            data.forEach(item => {
                priceMap[item.kitCode] = item.kitPrice;
            });
            setPrices(priceMap);
            localStorage.setItem("user_kit_prices", JSON.stringify(data));
        } catch (error) {
            console.error("Error fetching kit prices:", error);
            notification.error({
                message: "Failed to fetch kit prices",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitPrices();
    }, []);

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
            await createUserKitPrice({
                kitCode: code,
                kitPrice: price
            });

            // Update local storage to keep it in sync for other components
            const currentData = JSON.parse(localStorage.getItem("user_kit_prices") || "[]");
            const existingIndex = currentData.findIndex(k => k.kitCode === code);
            if (existingIndex >= 0) {
                currentData[existingIndex].kitPrice = price;
            } else {
                currentData.push({ kitCode: code, kitPrice: price });
            }
            localStorage.setItem("user_kit_prices", JSON.stringify(currentData));

            notification.success({ message: `Price for ${code} updated` });
        } catch (error) {
            console.error("Error saving kit price:", error);
            notification.error({
                message: "Failed to update price",
                description: error.message
            });
        } finally {
            setUpdating(prev => ({ ...prev, [code]: false }));
        }
    };

    const tableData = STANDARD_KITS.map(kit => ({
        key: kit.code,
        ...kit,
        price: prices[kit.code]
    }));

    const columns = [
        {
            title: 'Description',
            dataIndex: 'desc',
            key: 'desc',
            render: text => <span className="text-slate-600">{text}</span>
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
                <h2 className="text-2xl font-bold text-gray-800">Standard Kit Pricing</h2>
            </div>

            <Card className="shadow-sm border border-slate-200">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarOutlined className="text-2xl text-violet-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Manage Kit Prices</h3>
                            <p className="text-sm text-gray-500">
                                Set your standard pricing for common installation kits.
                                These prices will be automatically applied when adding kits to a quote.
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

export default UserKitPricePage;
