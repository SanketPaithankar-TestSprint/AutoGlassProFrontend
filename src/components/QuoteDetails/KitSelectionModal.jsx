import React from 'react';
import { Modal, Radio, Space, Tag } from 'antd'; // Removed redundant Tabs
import { ToolOutlined } from '@ant-design/icons';

/**
 * Kit Selection Modal
 * Shows available kits for a glass part and lets user select one
 */
const STANDARD_KITS = [
    { code: '1469', desc: 'Fast-Cure Urethane/Dam/Primer' },
    { code: '1552', desc: 'High Modulus' },
    { code: '1246', desc: 'Urethane,Dam,Primer' },
    { code: '1550', desc: 'Non-Conductive' },
    { code: '2022', desc: 'Foam Core Butyl Tape' },
];

const KitSelectionModal = ({
    visible,
    onClose,
    onSelect,
    kits = [],
    partNumber = ''
}) => {
    const [standardPrices, setStandardPrices] = React.useState({});
    const [selectedStandardKit, setSelectedStandardKit] = React.useState(null);

    // Compute available kits based on response, maintaining priority order
    const availableKits = React.useMemo(() => {
        if (!kits || kits.length === 0) return [];

        // Create a set of available QUAL_CDs (converted to string for comparison)
        const availableCodes = new Set(kits.map(k => String(k.QUAL_CD)));

        // Filter STANDARD_KITS to include only those present in the response
        // utilizing the predefined order in STANDARD_KITS for priority
        return STANDARD_KITS.filter(kit => availableCodes.has(kit.code));
    }, [kits]);

    // Reset selection when modal opens or available kits change
    React.useEffect(() => {
        if (visible) {
            // Default to the first priority kit available
            if (availableKits.length > 0) {
                setSelectedStandardKit(availableKits[0].code);
            } else {
                setSelectedStandardKit(null);
            }

            // Load saved prices
            try {
                const saved = JSON.parse(localStorage.getItem("user_kit_prices") || "[]");
                const priceMap = {};
                saved.forEach(k => priceMap[k.kitCode] = k.kitPrice);
                setStandardPrices(priceMap);
            } catch (e) {
                console.error("Error loading kit prices", e);
            }
        }
    }, [visible, availableKits]);

    const handleConfirm = () => {
        if (selectedStandardKit) {
            // Find the original kit data from the API response to get the correct NAGS_HW_ID
            const originalKit = kits.find(k => String(k.QUAL_CD) === selectedStandardKit);

            const price = standardPrices[selectedStandardKit] || 0;
            const kitDef = STANDARD_KITS.find(k => k.code === selectedStandardKit);

            onSelect({
                NAGS_HW_ID: originalKit?.NAGS_HW_ID || selectedStandardKit, // Use correct Hardware ID (e.g. HAH000004)
                DSC: originalKit?.DSC || kitDef?.desc || 'Standard Kit',
                QTY: originalKit?.QTY || 1, // Use QTY from API response
                unitPrice: parseFloat(price),
                type: 'Kit'
            });
            onClose();
        }
    };

    const handlePriceChange = (code, val) => {
        setStandardPrices(prev => ({
            ...prev,
            [code]: val
        }));
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <ToolOutlined className="text-violet-600" />
                    <span>Select Installation Kit</span>
                </div>
            }
            open={visible}
            onOk={handleConfirm}
            onCancel={onClose}
            okText="OK"
            cancelButtonProps={{ style: { display: 'none' } }}
            okButtonProps={{
                disabled: !selectedStandardKit,
                className: 'bg-violet-600 hover:bg-violet-700'
            }}
            width={700}
            style={{ maxWidth: 'calc(100vw - 16px)', top: 20, padding: 0 }}
            bodyStyle={{ padding: '16px' }}
            maskClosable={false}
        >
            <div className="py-2">
                <p className="text-sm text-slate-600 mb-4">
                    Select an installation kit for <strong>{partNumber}</strong>:
                </p>

                {/* Desktop Table View */}
                <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10"></th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Price</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {availableKits.length > 0 ? (
                                availableKits.map((kit) => {
                                    const isSelected = selectedStandardKit === kit.code;
                                    return (
                                        <tr
                                            key={kit.code}
                                            className={`hover:bg-violet-50 cursor-pointer transition-colors ${isSelected ? 'bg-violet-50' : ''}`}
                                            onClick={() => setSelectedStandardKit(kit.code)}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Radio checked={isSelected} />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                {kit.desc}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end">
                                                    <span className="text-slate-400 mr-1">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={standardPrices[kit.code] || ''}
                                                        onChange={(e) => handlePriceChange(kit.code, e.target.value)}
                                                        className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                                        No authorized kits available for this part.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {availableKits.length > 0 ? (
                        availableKits.map((kit) => {
                            const isSelected = selectedStandardKit === kit.code;
                            return (
                                <div
                                    key={kit.code}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${isSelected ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white'
                                        }`}
                                    onClick={() => setSelectedStandardKit(kit.code)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Radio checked={isSelected} className="mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 mb-2">{kit.desc}</p>
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <span className="text-xs text-slate-500">Price:</span>
                                                <div className="flex items-center">
                                                    <span className="text-slate-400 text-sm mr-1">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={standardPrices[kit.code] || ''}
                                                        onChange={(e) => handlePriceChange(kit.code, e.target.value)}
                                                        className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="border border-slate-200 rounded-lg p-8 text-center text-slate-500">
                            No authorized kits available for this part.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default KitSelectionModal;
