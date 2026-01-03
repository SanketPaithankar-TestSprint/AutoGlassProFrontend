import React from 'react';
import { Modal, Radio, Space, Tag } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

/**
 * Kit Selection Modal
 * Shows available kits for a glass part and lets user select one
 */
const KitSelectionModal = ({
    visible,
    onClose,
    onSelect,
    kits = [],
    partNumber = ''
}) => {
    const [selectedKit, setSelectedKit] = React.useState(null);

    // Reset selection when modal opens with new kits
    React.useEffect(() => {
        if (visible && kits.length > 0) {
            setSelectedKit(kits[0]); // Default to first kit
        }
    }, [visible, kits]);

    const handleConfirm = () => {
        if (selectedKit) {
            onSelect(selectedKit);
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
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
            onCancel={handleCancel}
            okText="Add Selected Kit"
            cancelText="Skip (No Kit)"
            okButtonProps={{
                disabled: !selectedKit,
                className: 'bg-violet-600 hover:bg-violet-700'
            }}
            width={600}
        >
            <div className="py-4">
                <p className="text-sm text-slate-600 mb-4">
                    Select an installation kit for <strong>{partNumber}</strong>:
                </p>

                {kits.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        No kits available for this part
                    </div>
                ) : (
                    <Radio.Group
                        value={selectedKit?.NAGS_HW_ID}
                        onChange={(e) => {
                            const kit = kits.find(k => k.NAGS_HW_ID === e.target.value);
                            setSelectedKit(kit);
                        }}
                        className="w-full"
                    >
                        <Space direction="vertical" className="w-full">
                            {kits.map((kit, index) => (
                                <Radio
                                    key={kit.NAGS_HW_ID || index}
                                    value={kit.NAGS_HW_ID}
                                    className="w-full"
                                >
                                    <div className="flex items-start justify-between w-full p-3 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all cursor-pointer ml-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-800">
                                                    {kit.NAGS_HW_ID}
                                                </span>
                                                <Tag color="blue" className="text-xs">
                                                    Qty: {kit.QTY}
                                                </Tag>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {kit.DSC || 'Installation Kit'}
                                            </p>
                                        </div>
                                    </div>
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                )}
            </div>
        </Modal>
    );
};

export default KitSelectionModal;
