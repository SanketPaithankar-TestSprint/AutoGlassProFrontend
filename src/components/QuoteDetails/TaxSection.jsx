import React from "react";
import { Select, Dropdown, Button } from "antd";
import { DownOutlined, HomeOutlined, EnvironmentOutlined } from "@ant-design/icons";
const { Option } = Select;

const SERVICE_LOCATION_OPTIONS = [
    { value: 'IN_SHOP', label: 'In Shop', icon: <HomeOutlined /> },
    { value: 'MOBILE', label: 'Mobile', icon: <EnvironmentOutlined /> }
];

/**
 * TaxSection renders the service location dropdown and add-item controls.
 * (Named TaxSection per the plan, but functionally it's the left-side control column
 * next to the totals table — containing service location + add item dropdown.)
 */
export default function TaxSection({
    schedulingData,
    handleServiceLocationChange,
    handleAddRow,
}) {
    return (
        <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-48 sm:min-w-[180px]">
            {/* Service Location Dropdown */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-none w-full">
                <label className="block text-xs font-medium text-slate-700 mb-0">
                    Service Location <span className="text-red-500">*</span>
                </label>
                <Select
                    value={schedulingData?.serviceLocation || 'IN_SHOP'}
                    style={{ width: '100%' }}
                    onChange={handleServiceLocationChange}
                    size="small"
                >
                    {SERVICE_LOCATION_OPTIONS.map(option => (
                        <Option key={option.value} value={option.value}>
                            <span className="flex items-center gap-2 text-xs">
                                {option.icon}
                                {option.label}
                            </span>
                        </Option>
                    ))}
                </Select>
            </div>

            {/* Add Item Section */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-none w-full">
                <label className="block text-xs font-medium text-slate-700 mb-0">Add Item</label>
                <Dropdown
                    menu={{
                        items: [
                            { key: 'Labor', label: <span className="text-xs">Labor</span>, onClick: () => handleAddRow("Labor") },
                            { key: 'Service', label: <span className="text-xs">Service</span>, onClick: () => handleAddRow("Service") },
                            { key: 'ADAS', label: <span className="text-xs">ADAS Recalibration</span>, onClick: () => handleAddRow("ADAS") },
                        ],
                        className: "min-w-auto [&_.ant-dropdown-menu-item]:!py-1.5 [&_.ant-dropdown-menu-item]:font-semibold"
                    }}
                    placement="bottomLeft"
                >
                    <Button
                        type="primary"
                        icon={<DownOutlined style={{ fontSize: '10px' }} />}
                        className="w-full flex items-center justify-center !bg-violet-600 hover:!bg-violet-700"
                        size="small"
                    >
                        Add
                    </Button>
                </Dropdown>
            </div>
        </div>
    );
}
