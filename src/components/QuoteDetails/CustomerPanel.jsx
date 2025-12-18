import React, { useState, useEffect } from "react";
import { notification, Select, Spin, Modal, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import urls from "../../config";
import { getValidToken } from "../../api/getValidToken";
import { getCustomers } from "../../api/getCustomers";
import { getCustomerWithVehicles } from "../../api/getCustomerWithVehicles";
import { getMyOrganizations, getOrganizationWithDetails, createOrganization } from "../../api/organizationApi";

const { Option } = Select;

// Reusable Input Component
const FormInput = ({ label, name, value, onChange, required = false, type = "text", ...props }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <input
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            type={type}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all"
            placeholder={label}
            {...props}
        />
    </div>
);

export default function CustomerPanel({ formData, setFormData, setCanShowQuotePanel, setPanel }) {
    const [loading, setLoading] = useState(false);

    // Organizations
    const [organizations, setOrganizations] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

    // Customers  
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    // Vehicles (from organization or customer)
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    // Organization Modal
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [creatingOrg, setCreatingOrg] = useState(false);
    const [orgFormData, setOrgFormData] = useState({
        companyName: "", taxId: "", email: "", phone: "", alternatePhone: "",
        addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "USA", notes: ""
    });

    // Load data on mount
    useEffect(() => {
        fetchOrganizations();
        fetchCustomers();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoadingOrganizations(true);
            const orgList = await getMyOrganizations();
            setOrganizations(Array.isArray(orgList) ? orgList : []);
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setLoadingOrganizations(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const token = await getValidToken();
            const customerList = await getCustomers(token);
            setCustomers(Array.isArray(customerList) ? customerList : []);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    // Handle Organization Selection
    const handleOrganizationSelect = async (orgId) => {
        setSelectedOrganizationId(orgId);
        setSelectedCustomerId(null);
        setSelectedVehicleId(null);
        setVehicles([]);

        if (!orgId) {
            clearFormData();
            return;
        }

        try {
            const orgDetails = await getOrganizationWithDetails(orgId);
            // Set org address as default
            setFormData(prev => ({
                ...prev,
                organizationId: orgId,
                addressLine1: orgDetails.addressLine1 || "",
                addressLine2: orgDetails.addressLine2 || "",
                city: orgDetails.city || "",
                state: orgDetails.state || "",
                postalCode: orgDetails.postalCode || "",
                country: orgDetails.country || "USA"
            }));
            // Set vehicles from organization
            setVehicles(orgDetails.vehicles || []);
        } catch (error) {
            console.error("Error loading organization:", error);
        }
    };

    // Handle Customer Selection
    const handleCustomerSelect = async (customerId) => {
        setSelectedCustomerId(customerId);
        setSelectedVehicleId(null);

        if (!customerId) {
            if (!selectedOrganizationId) {
                clearFormData();
                setVehicles([]);
            }
            return;
        }

        try {
            const response = await getCustomerWithVehicles(customerId);
            const customer = response.customer || {};
            const customerVehicles = response.vehicles || [];

            // If customer belongs to an organization, update org selection
            if (customer.organizationId && !selectedOrganizationId) {
                setSelectedOrganizationId(customer.organizationId);
            }

            setFormData(prev => ({
                ...prev,
                customerId: customer.customerId,
                customerType: customer.customerType || "INDIVIDUAL",
                organizationId: customer.organizationId || null,
                organizationName: customer.organizationName || "",
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                alternatePhone: customer.alternatePhone || "",
                preferredContactMethod: customer.preferredContactMethod || "phone",
                addressLine1: customer.addressLine1 || prev.addressLine1 || "",
                addressLine2: customer.addressLine2 || prev.addressLine2 || "",
                city: customer.city || prev.city || "",
                state: customer.state || prev.state || "",
                postalCode: customer.postalCode || prev.postalCode || "",
                country: customer.country || prev.country || "USA"
            }));

            // If org selected, keep org vehicles, else use customer vehicles
            if (!selectedOrganizationId) {
                setVehicles(customerVehicles);
            }
        } catch (error) {
            console.error("Error loading customer:", error);
        }
    };

    // Handle Vehicle Selection
    const handleVehicleSelect = (vehicleId) => {
        setSelectedVehicleId(vehicleId);
        const vehicle = vehicles.find(v => v.vehicleId === vehicleId);

        if (vehicle) {
            setFormData(prev => ({
                ...prev,
                vehicleId: vehicle.vehicleId,
                vehicleYear: vehicle.vehicleYear || "",
                vehicleMake: vehicle.vehicleMake || "",
                vehicleModel: vehicle.vehicleModel || "",
                vehicleStyle: vehicle.vehicleStyle || "",
                licensePlateNumber: vehicle.licensePlateNumber || "",
                vin: vehicle.vin || "",
                vehicleNotes: vehicle.notes || ""
            }));
        }
    };

    const clearFormData = () => {
        setFormData({
            customerType: "INDIVIDUAL", organizationId: null, organizationName: "",
            firstName: "", lastName: "", email: "", phone: "",
            alternatePhone: "", preferredContactMethod: "phone",
            addressLine1: "", addressLine2: "", city: "", state: "",
            postalCode: "", country: "USA",
            vehicleYear: "", vehicleMake: "", vehicleModel: "",
            vehicleStyle: "", licensePlateNumber: "", vin: "", vehicleNotes: ""
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOrgChange = (e) => {
        const { name, value } = e.target;
        setOrgFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateOrganization = async () => {
        if (!orgFormData.companyName || !orgFormData.phone || !orgFormData.addressLine1) {
            notification.warning({ message: 'Required Fields', description: 'Company name, phone, and address are required.' });
            return;
        }

        try {
            setCreatingOrg(true);
            const newOrg = await createOrganization(orgFormData);
            notification.success({ message: 'Organization Created', description: `${newOrg.companyName} created successfully!` });

            // Refresh organizations list and select the new one
            await fetchOrganizations();
            setSelectedOrganizationId(newOrg.organizationId);
            handleOrganizationSelect(newOrg.organizationId);

            // Reset and close modal
            setOrgFormData({
                companyName: "", taxId: "", email: "", phone: "", alternatePhone: "",
                addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "USA", notes: ""
            });
            setShowOrgModal(false);
        } catch (error) {
            notification.error({ message: 'Failed', description: error.message });
        } finally {
            setCreatingOrg(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If existing customer + vehicle selected, proceed
        if (formData.customerId && formData.vehicleId) {
            localStorage.setItem("agp_customer_data", JSON.stringify(formData));
            if (setCanShowQuotePanel) setCanShowQuotePanel(true);
            if (setPanel) setPanel("quote");
            return;
        }

        // Create new customer + vehicle
        setLoading(true);
        try {
            const token = await getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/customers/create-with-vehicle`, {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...formData,
                    vehicleYear: Number(formData.vehicleYear) || 0,
                    customerType: selectedOrganizationId ? "ORGANIZATION_CONTACT" : "INDIVIDUAL",
                    organizationId: selectedOrganizationId || null
                }),
            });

            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();

            if (data.customerId && data.vehicleId) {
                notification.success({ message: 'Customer Created', description: 'Saved successfully!' });
                setFormData(prev => {
                    const newData = { ...prev, customerId: data.customerId, vehicleId: data.vehicleId };
                    localStorage.setItem("agp_customer_data", JSON.stringify(newData));
                    return newData;
                });
                if (setCanShowQuotePanel) setCanShowQuotePanel(true);
                if (setPanel) setPanel("quote");
            }
        } catch (err) {
            notification.error({ message: 'Failed', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* COLUMN 1: Organization */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-gray-900">Organization</h4>
                        <button
                            type="button"
                            onClick={() => setShowOrgModal(true)}
                            className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                        >
                            <PlusOutlined /> New
                        </button>
                    </div>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select Organization"
                        className="w-full mb-3"
                        loading={loadingOrganizations}
                        notFoundContent={loadingOrganizations ? <Spin size="small" /> : "No organizations"}
                        filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                        onChange={handleOrganizationSelect}
                        value={selectedOrganizationId}
                    >
                        {organizations.map(org => (
                            <Option key={org.organizationId} value={org.organizationId}>
                                {org.companyName}
                            </Option>
                        ))}
                    </Select>

                    <p className="text-xs text-gray-500 mb-2">Organization information</p>

                    {selectedOrganizationId ? (
                        <div className="space-y-1 text-xs text-gray-600 bg-gray-50 rounded p-2">
                            <p className="font-medium text-gray-900">{organizations.find(o => o.organizationId === selectedOrganizationId)?.companyName}</p>
                            <p>{formData.addressLine1}</p>
                            <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic">No organization selected</div>
                    )}
                </div>

                {/* COLUMN 2: Customer */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Customer</h4>

                    {/* Customer Type Dropdown */}
                    <div className="flex flex-col gap-1 mb-3">
                        <label className="text-xs font-medium text-gray-500">Customer Type</label>
                        <select
                            name="customerType"
                            value={formData.customerType || "INDIVIDUAL"}
                            onChange={(e) => {
                                const newType = e.target.value;
                                setFormData(prev => ({ ...prev, customerType: newType }));
                                if (newType === "INDIVIDUAL") {
                                    setSelectedOrganizationId(null);
                                    setFormData(prev => ({ ...prev, organizationId: null, organizationName: "" }));
                                }
                            }}
                            className="border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none"
                        >
                            <option value="INDIVIDUAL">Individual Customer</option>
                            <option value="ORGANIZATION_CONTACT">Organization Contact</option>
                        </select>
                    </div>

                    {/* Organization link indicator */}
                    {formData.customerType === "ORGANIZATION_CONTACT" && (
                        <div className={`text-xs mb-3 p-2 rounded ${selectedOrganizationId ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {selectedOrganizationId
                                ? `✓ Linked to: ${organizations.find(o => o.organizationId === selectedOrganizationId)?.companyName || 'Organization'}`
                                : '⚠ Please select an organization in the first column'}
                        </div>
                    )}

                    <Select
                        showSearch
                        allowClear
                        placeholder="Select Existing Customer"
                        className="w-full mb-3"
                        loading={loadingCustomers}
                        notFoundContent={loadingCustomers ? <Spin size="small" /> : "No customers"}
                        filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                        onChange={handleCustomerSelect}
                        value={selectedCustomerId}
                    >
                        {customers.map(customer => (
                            <Option key={customer.customerId} value={customer.customerId}>
                                {customer.firstName} {customer.lastName} - {customer.phone}
                            </Option>
                        ))}
                    </Select>

                    <p className="text-xs text-gray-500 mb-3">Customer information</p>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                        <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                        <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} required type="tel" />
                        <FormInput label="Address" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />
                            <FormInput label="State" name="state" value={formData.state} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Vehicle */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Vehicle</h4>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select Vehicle"
                        className="w-full mb-3"
                        disabled={vehicles.length === 0 && !selectedCustomerId && !selectedOrganizationId}
                        notFoundContent="No vehicles"
                        filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                        onChange={handleVehicleSelect}
                        value={selectedVehicleId}
                    >
                        {vehicles.map(vehicle => (
                            <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                {vehicle.vehicleYear} {vehicle.vehicleMake} {vehicle.vehicleModel}
                            </Option>
                        ))}
                    </Select>

                    <p className="text-xs text-gray-500 mb-3">Vehicle information</p>

                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <FormInput label="Year" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} type="number" />
                            <FormInput label="Make" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} />
                            <FormInput label="Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
                        </div>
                        <FormInput label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
                        <FormInput label="License Plate" name="licensePlateNumber" value={formData.licensePlateNumber} onChange={handleChange} />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-3 px-4 py-2 rounded bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-medium text-sm transition-all"
                        >
                            {loading ? "Processing..." : "Continue to Quote →"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Organization Creation Modal */}
            <Modal
                title="Create New Organization"
                open={showOrgModal}
                onCancel={() => setShowOrgModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowOrgModal(false)}>Cancel</Button>,
                    <Button key="create" type="primary" loading={creatingOrg} onClick={handleCreateOrganization} className="bg-violet-600">
                        Create Organization
                    </Button>
                ]}
                width={600}
            >
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput label="Company Name *" name="companyName" value={orgFormData.companyName} onChange={handleOrgChange} required />
                        <FormInput label="Tax ID / EIN" name="taxId" value={orgFormData.taxId} onChange={handleOrgChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormInput label="Email" name="email" value={orgFormData.email} onChange={handleOrgChange} type="email" />
                        <FormInput label="Phone *" name="phone" value={orgFormData.phone} onChange={handleOrgChange} required />
                    </div>
                    <FormInput label="Alternate Phone" name="alternatePhone" value={orgFormData.alternatePhone} onChange={handleOrgChange} />

                    <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Address</p>
                        <div className="space-y-3">
                            <FormInput label="Address Line 1 *" name="addressLine1" value={orgFormData.addressLine1} onChange={handleOrgChange} required />
                            <FormInput label="Address Line 2" name="addressLine2" value={orgFormData.addressLine2} onChange={handleOrgChange} />
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput label="City *" name="city" value={orgFormData.city} onChange={handleOrgChange} required />
                                <FormInput label="State *" name="state" value={orgFormData.state} onChange={handleOrgChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput label="Postal Code *" name="postalCode" value={orgFormData.postalCode} onChange={handleOrgChange} required />
                                <FormInput label="Country" name="country" value={orgFormData.country} onChange={handleOrgChange} />
                            </div>
                        </div>
                    </div>

                    <FormInput label="Notes" name="notes" value={orgFormData.notes} onChange={handleOrgChange} />
                </div>
            </Modal>
        </form>
    );
}