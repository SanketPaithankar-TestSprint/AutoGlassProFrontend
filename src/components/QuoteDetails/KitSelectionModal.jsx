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
            const price = standardPrices[selectedStandardKit] || 0;
            const kitDef = STANDARD_KITS.find(k => k.code === selectedStandardKit);
            onSelect({
                NAGS_HW_ID: selectedStandardKit,
                DSC: kitDef?.desc || 'Standard Kit',
                QTY: 1,
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
            okText="Add Selected Kit"
            cancelButtonProps={{ style: { display: 'none' } }}
            okButtonProps={{
                disabled: !selectedStandardKit,
                className: 'bg-violet-600 hover:bg-violet-700'
            }}
            width={700}
            maskClosable={false}
        >
            <div className="py-2">
                <p className="text-sm text-slate-600 mb-4">
                    Select an installation kit for <strong>{partNumber}</strong>:
                </p>

                <div className="overflow-hidden border border-slate-200 rounded-lg">
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
            </div>
        </Modal>
    );
};

export default KitSelectionModal;
