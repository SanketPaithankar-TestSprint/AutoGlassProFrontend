import React, { useState, useEffect } from "react";
import { notification, Select, Spin, Radio, Switch, Segmented, Button, Popconfirm } from "antd";
import { UserOutlined, ShopOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { getValidToken } from "../../api/getValidToken";
import { getCustomers } from "../../api/getCustomers";
import { getCustomerWithVehicles } from "../../api/getCustomerWithVehicles";
import { updateCustomer } from "../../api/updateCustomer";
import { getOrganizations, getOrganizationById, createOrganization, updateOrganization, updateOrganizationTaxExempt } from "../../api/organizationApi";
import { COUNTRIES, US_STATES } from "../../const/locations";

const { Option } = Select;

// Reusable Input Component
const FormInput = ({ label, name, value, onChange, onBlur, required = false, type = "text", className = "", ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <input
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            type={type}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all"
            placeholder={label}
            {...props}
        />
    </div>
);

const FormSelect = ({ label, name, value, onChange, options, required = false, className = "", ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <select
            name={name}
            value={value || ""}
            onChange={onChange}
            required={required}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all bg-white"
            {...props}
        >
            <option value="">Select State</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export default function CustomerPanel({ formData, setFormData, setCanShowQuotePanel, setPanel }) {
    // Organizations
    const [organizations, setOrganizations] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);

    // Customers  
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Vehicles
    const [vehicles, setVehicles] = useState([]);

    // Master Mode: INDIVIDUAL vs BUSINESS
    const [clientType, setClientType] = useState("INDIVIDUAL");

    // Internal Modes
    const [customerMode, setCustomerMode] = useState("NEW"); // "NEW" | "EXISTING"
    const [orgMode, setOrgMode] = useState("NEW"); // "NEW" | "EXISTING" (No "NONE" anymore in Business mode)

    // Edit Mode States
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [isEditingOrg, setIsEditingOrg] = useState(false);
    const [savingCustomer, setSavingCustomer] = useState(false);
    const [savingOrg, setSavingOrg] = useState(false);
    // ...existing code...

    // Initial Load & Sync
    useEffect(() => {
        fetchOrganizations();
        fetchCustomers();

        // Detect current mode based on existing data
        if (formData.organizationId || (formData.companyName && !formData.firstName)) {
            setClientType("BUSINESS");
            setOrgMode(formData.organizationId ? "EXISTING" : "NEW");

            // Populate Org Form from passed data
            setOrgFormData({
                companyName: formData.companyName || formData.organizationName || "",
                taxId: formData.taxId || "",
                email: formData.email || "",
                phone: formData.phone || "",
                alternatePhone: formData.alternatePhone || "",
                addressLine1: formData.addressLine1 || "",
                addressLine2: formData.addressLine2 || "",
                city: formData.city || "",
                state: formData.state || "",
                postalCode: formData.postalCode || "",
                country: formData.country || "USA",
                notes: formData.notes || ""
            });
        } else {
            setClientType("INDIVIDUAL");
            setCustomerMode(formData.customerId ? "EXISTING" : "NEW");
        }
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoadingOrganizations(true);
            const orgList = await getOrganizations();
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

    // --- Mode Switching Logic ---

    const handleClientTypeChange = (value) => {
        setClientType(value);
        if (value === "INDIVIDUAL") {
            // Reset Org Data
            setFormData(prev => ({
                ...prev,
                organizationId: null,
                organizationName: "",
                companyName: "",
                isTaxExempt: false,
                newOrganizationDetails: null,
                // Ensure Customer Mode is valid
                customerId: null
            }));
            setCustomerMode("NEW");
            setOrgFormData(initialOrgForm);
        } else {
            // Reset Customer Data
            setFormData(prev => ({
                ...prev,
                customerId: null,
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                alternatePhone: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                postalCode: "",
                // Ensure Org Mode is valid
                organizationId: null
            }));
            setOrgMode("NEW");
        }
    };

    // --- Organization Handlers ---

    const handleOrgModeChange = (e) => {
        const mode = e.target.value;
        setOrgMode(mode);

        if (mode === "NEW") {
            setFormData(prev => ({
                ...prev,
                organizationId: null,
                isTaxExempt: false
            }));
            setOrgFormData(initialOrgForm);
        } else if (mode === "EXISTING") {
            // Keep existing ID if we already had one, else clear
            setFormData(prev => ({ ...prev, newOrganizationDetails: null }));
            if (!formData.organizationId) {
                setOrgFormData(initialOrgForm);
            }
        }
    };

    const handleOrganizationSelect = async (val) => {
        if (!val) {
            setFormData(prev => ({ ...prev, organizationId: null, organizationName: "", isTaxExempt: false }));
            setOrgFormData(initialOrgForm);
            return;
        }

        try {
            const orgDetails = await getOrganizationById(val);
            setFormData(prev => ({
                ...prev,
                organizationId: val,
                organizationName: orgDetails.companyName || "",
                isTaxExempt: orgDetails.taxExempt === true
            }));

            setOrgFormData({
                companyName: orgDetails.companyName || "",
                taxId: orgDetails.taxId || "",
                email: orgDetails.email || "",
                phone: orgDetails.phone || "",
                alternatePhone: orgDetails.alternatePhone || "",
                addressLine1: orgDetails.addressLine1 || "",
                addressLine2: orgDetails.addressLine2 || "",
                city: orgDetails.city || "",
                state: orgDetails.state || "",
                postalCode: orgDetails.postalCode || "",
                country: orgDetails.country || "USA",
                notes: orgDetails.notes || ""
            });
        } catch (error) {
            console.error("Error loading organization:", error);
        }
    };

    // --- Customer Handlers ---

    const handleCustomerModeChange = (e) => {
        const mode = e.target.value;
        setCustomerMode(mode);

        if (mode === "NEW") {
            setFormData(prev => ({
                ...prev,
                customerId: null,
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                alternatePhone: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                postalCode: ""
            }));
        }
    };

    const handleCustomerSelect = async (customerId) => {
        if (!customerId) return;

        try {
            const response = await getCustomerWithVehicles(customerId);
            const customer = response.customer || {};
            const customerVehicles = response.vehicles || [];

            setFormData(prev => ({
                ...prev,
                customerId: customer.customerId,
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                alternatePhone: customer.alternatePhone || "",
                preferredContactMethod: customer.preferredContactMethod || "phone",
                addressLine1: customer.addressLine1 || "",
                addressLine2: customer.addressLine2 || "",
                city: customer.city || "",
                state: customer.state || "",
                postalCode: customer.postalCode || "",
                country: customer.country || "USA",
            }));

            setVehicles(customerVehicles);

        } catch (error) {
            console.error("Error loading customer:", error);
        }
    };

    // --- Form Data Handling ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone' || name === 'alternatePhone') finalValue = formatPhoneNumber(value);
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const initialOrgForm = {
        companyName: "", taxId: "", email: "", phone: "", alternatePhone: "",
        individualName: "",
        addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "USA", notes: ""
    };
    const [orgFormData, setOrgFormData] = useState(initialOrgForm);

    const handleOrgFormChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone' || name === 'alternatePhone') finalValue = formatPhoneNumber(value);
        setOrgFormData(prev => ({ ...prev, [name]: finalValue }));

        // Always sync email and phone to formData for validation
        if (name === 'email' || name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: finalValue }));
        }

        // Sync specific fields to main formData if in NEW mode
        if (orgMode === "NEW") {
            setFormData(prev => ({
                ...prev,
                organizationName: name === 'companyName' ? finalValue : prev.organizationName,
                companyName: name === 'companyName' ? finalValue : prev.companyName,
                newOrganizationDetails: {
                    ...(prev.newOrganizationDetails || {}),
                    ...orgFormData,
                    [name]: finalValue
                }
            }));
        }
    };

    const formatPhoneNumber = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const handleVehicleSelect = (vehicleId) => {
        const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
        if (vehicle) {
            setFormData(prev => ({
                ...prev,
                vehicleId: vehicle.vehicleId,
                vehicleYear: vehicle.vehicleYear || "",
                vehicleMake: vehicle.vehicleMake || "",
                vehicleModel: vehicle.vehicleModel || "",
                vehicleStyle: vehicle.vehicleStyle || "",
                bodyType: vehicle.bodyType || "",
                licensePlateNumber: vehicle.licensePlateNumber || "",
                vin: vehicle.vin || "",
                vehicleNotes: vehicle.notes || ""
            }));
        }
    };

    // --- Customer Edit/Delete Handlers ---
    const handleEditCustomer = () => {
        setIsEditingCustomer(true);
    };

    const handleCancelEditCustomer = async () => {
        setIsEditingCustomer(false);
        // Reload original customer data
        if (formData.customerId) {
            await handleCustomerSelect(formData.customerId);
        }
    };

    const handleSaveCustomer = async () => {
        if (!formData.customerId) return;

        try {
            setSavingCustomer(true);
            const token = getValidToken();

            const customerPayload = {
                customerId: formData.customerId,
                customerType: "INDIVIDUAL",
                firstName: formData.firstName || "",
                lastName: formData.lastName || "",
                email: formData.email || "",
                phone: formData.phone || "",
                alternatePhone: formData.alternatePhone || "",
                addressLine1: formData.addressLine1 || "",
                addressLine2: formData.addressLine2 || "",
                city: formData.city || "",
                state: formData.state || "",
                postalCode: formData.postalCode || "",
                country: formData.country || "USA",
                preferredContactMethod: formData.preferredContactMethod || "phone",
                notes: formData.notes || ""
            };

            await updateCustomer(token, formData.customerId, customerPayload);

            notification.success({
                message: "Customer Updated",
                description: "Customer information has been updated successfully.",
                placement: "topRight"
            });

            setIsEditingCustomer(false);
            // Refresh customer list
            await fetchCustomers();
        } catch (error) {
            console.error("Error updating customer:", error);
            notification.error({
                message: "Update Failed",
                description: "Failed to update customer. Please try again.",
                placement: "topRight"
            });
        } finally {
            setSavingCustomer(false);
        }
    };

    // ...existing code...

    // --- Organization Edit/Delete Handlers ---
    const handleEditOrganization = () => {
        setIsEditingOrg(true);
    };

    const handleCancelEditOrganization = async () => {
        setIsEditingOrg(false);
        // Reload original organization data
        if (formData.organizationId) {
            await handleOrganizationSelect(formData.organizationId);
        }
    };

    const handleSaveOrganization = async () => {
        if (!formData.organizationId) return;

        // Validate required fields
        if (!orgFormData.phone || orgFormData.phone.trim() === "") {
            notification.error({
                message: "Validation Error",
                description: "Phone number is required.",
                placement: "topRight"
            });
            return;
        }

        if (!orgFormData.companyName || orgFormData.companyName.trim() === "") {
            notification.error({
                message: "Validation Error",
                description: "Company name is required.",
                placement: "topRight"
            });
            return;
        }

        try {
            setSavingOrg(true);

            const orgPayload = {
                organizationId: formData.organizationId,
                companyName: orgFormData.companyName,
                taxId: orgFormData.taxId || "",
                email: orgFormData.email || "",
                phone: orgFormData.phone,
                alternatePhone: orgFormData.alternatePhone || "",
                addressLine1: orgFormData.addressLine1 || "",
                addressLine2: orgFormData.addressLine2 || "",
                city: orgFormData.city || "",
                state: orgFormData.state || "",
                postalCode: orgFormData.postalCode || "",
                country: orgFormData.country || "USA",
                taxExempt: formData.isTaxExempt || false,
                notes: orgFormData.notes || ""
            };

            await updateOrganization(formData.organizationId, orgPayload);

            // Update formData
            setFormData(prev => ({
                ...prev,
                organizationName: orgFormData.companyName,
                companyName: orgFormData.companyName
            }));

            notification.success({
                message: "Organization Updated",
                description: "Organization information has been updated successfully.",
                placement: "topRight"
            });

            setIsEditingOrg(false);
            // Refresh organization list
            await fetchOrganizations();
        } catch (error) {
            console.error("Error updating organization:", error);
            notification.error({
                message: "Update Failed",
                description: "Failed to update organization. Please try again.",
                placement: "topRight"
            });
        } finally {
            setSavingOrg(false);
        }
    };

    // ...existing code...

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Validation: Check at least one contact field is filled
        if (clientType === "BUSINESS") {
            // Check Organization contact
            const email = orgFormData.email || "";
            const phone = orgFormData.phone || "";
            const hasOrgContact = email.trim().length > 0 || phone.trim().length > 0;

            if (!hasOrgContact) {
                notification.error({
                    message: "Missing Contact Information",
                    description: "Please provide at least one contact method (email or phone number) for the organization.",
                    placement: "topRight",
                    duration: 4
                });
                return false;
            }
        } else {
            // Check Customer contact
            const email = formData.email || "";
            const phone = formData.phone || "";
            const hasCustomerContact = email.trim().length > 0 || phone.trim().length > 0;

            if (!hasCustomerContact) {
                notification.error({
                    message: "Missing Contact Information",
                    description: "Please provide at least one contact method (email or phone number) for the customer.",
                    placement: "topRight",
                    duration: 4
                });
                return false;
            }
        }

        localStorage.setItem("agp_customer_data", JSON.stringify(formData));
        if (setCanShowQuotePanel) setCanShowQuotePanel(true);
        if (setPanel) setPanel("quote");
    };

    return (
        <form onSubmit={handleSubmit} className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-full">

                {/* LEFT SIDEBAR: Selection Modes */}
                <div className="flex flex-col gap-4">

                    {/* Client Type Toggle */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Client Type</label>
                        <Segmented
                            block
                            options={[
                                { label: 'Individual', value: 'INDIVIDUAL', icon: <UserOutlined /> },
                                { label: 'Business', value: 'BUSINESS', icon: <ShopOutlined /> },
                            ]}
                            value={clientType}
                            onChange={handleClientTypeChange}
                        />
                    </div>

                    {/* Customer Selection Card (INDIVIDUAL ONLY) */}
                    {clientType === "INDIVIDUAL" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 text-sm animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-800 uppercase border-b pb-2 mb-3">Customer Selection</h4>

                            <div className="flex flex-col gap-3">
                                <Radio.Group
                                    onChange={handleCustomerModeChange}
                                    value={customerMode}
                                    className="flex flex-col gap-2"
                                >
                                    <Radio value="NEW">New Customer</Radio>
                                    <Radio value="EXISTING">Existing Customer</Radio>
                                </Radio.Group>

                                {customerMode === "EXISTING" && (
                                    <div className="mt-2 animate-fade-in">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Search Customer</label>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Search by name/phone"
                                            className="w-full"
                                            loading={loadingCustomers}
                                            filterOption={(input, option) =>
                                                String(option.children).toLowerCase().includes(input.toLowerCase())
                                            }
                                            onChange={handleCustomerSelect}
                                            value={formData.customerId}
                                        >
                                            {customers.map(c => (
                                                <Option key={c.customerId} value={c.customerId}>
                                                    {c.firstName} {c.lastName}
                                                </Option>
                                            ))}
                                        </Select>


                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Organization Selection Card (BUSINESS ONLY) */}
                    {clientType === "BUSINESS" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 text-sm animate-fade-in">
                            <h4 className="text-xs font-bold text-gray-800 uppercase border-b pb-2 mb-3">Organization Selection</h4>

                            <div className="flex flex-col gap-3">
                                <Radio.Group
                                    onChange={handleOrgModeChange}
                                    value={orgMode}
                                    className="flex flex-col gap-2"
                                >
                                    <Radio value="NEW">New Organization</Radio>
                                    <Radio value="EXISTING">Existing Organization</Radio>
                                </Radio.Group>

                                {orgMode === "EXISTING" && (
                                    <div className="mt-2 animate-fade-in">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Search Organization</label>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Search Company..."
                                            className="w-full"
                                            loading={loadingOrganizations}
                                            filterOption={(input, option) =>
                                                String(option.children).toLowerCase().includes(input.toLowerCase())
                                            }
                                            onChange={handleOrganizationSelect}
                                            value={formData.organizationId}
                                        >
                                            {organizations.map(org => (
                                                <Option key={org.organizationId} value={org.organizationId}>
                                                    {org.companyName}
                                                </Option>
                                            ))}
                                        </Select>


                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vehicle Quick Info (Common) */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 animate-fade-in">
                        <div className="flex justify-between items-center border-b pb-1 mb-3">
                            <h4 className="text-xs font-bold text-gray-800 uppercase">Vehicle Details</h4>
                            {vehicles.length > 0 && (
                                <Select
                                    size="small"
                                    placeholder="Select Saved Vehicle"
                                    className="w-40"
                                    onChange={handleVehicleSelect}
                                    allowClear
                                >
                                    {vehicles.map(v => (
                                        <Option key={v.vehicleId} value={v.vehicleId}>
                                            {v.vehicleYear} {v.vehicleMake}
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label="Year" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} type="number" />
                                <FormInput label="Make" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} />
                            </div>
                            <FormInput label="Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
                            <FormInput label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
                        </div>
                    </div>

                </div>

                {/* RIGHT PANEL: Single Form Area */}
                <div className="flex flex-col h-full overflow-y-auto pr-1 gap-4">

                    {/* Organization Form (BUSINESS Mode) */}
                    {clientType === "BUSINESS" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col shrink-0 animate-slide-up">
                            <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-violet-900">
                                    {orgMode === "NEW" ? "New Organization Details" : (isEditingOrg ? "Edit Organization" : "Organization Details")}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Save/Cancel buttons when editing */}
                                    {isEditingOrg && orgMode === "EXISTING" && (
                                        <>
                                            <Button
                                                size="small"
                                                icon={<CloseOutlined />}
                                                onClick={handleCancelEditOrganization}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<SaveOutlined />}
                                                loading={savingOrg}
                                                onClick={handleSaveOrganization}
                                            >
                                                Save
                                            </Button>
                                        </>
                                    )}
                                    {/* Tax Exempt Switch */}
                                    <div className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded">
                                        <Switch
                                            size="small"
                                            checked={formData.isTaxExempt}
                                            disabled={orgMode === "EXISTING" && !isEditingOrg}
                                            onChange={(checked) => {
                                                setFormData(prev => ({ ...prev, isTaxExempt: checked }));
                                                if (formData.organizationId && orgMode === "EXISTING" && !isEditingOrg) {
                                                    updateOrganizationTaxExempt(formData.organizationId, checked).catch(console.error);
                                                }
                                            }}
                                        />
                                        <span className="text-xs text-violet-700">{formData.isTaxExempt ? "Tax Exempt" : "Taxable"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <FormInput label="Company Name *" name="companyName" value={orgFormData.companyName} onChange={handleOrgFormChange} required disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="Tax ID" name="taxId" value={orgFormData.taxId} onChange={handleOrgFormChange} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="Email" name="email" value={orgFormData.email} onChange={handleOrgFormChange} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="Phone" name="phone" value={orgFormData.phone} onChange={handleOrgFormChange} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="Contact Person" name="individualName" value={orgFormData.individualName} onChange={handleOrgFormChange} className="sm:col-span-2" placeholder="Individual's Name (Optional)" disabled={orgMode === "EXISTING" && !isEditingOrg} />

                                <FormInput label="Address Line 1" name="addressLine1" value={orgFormData.addressLine1} onChange={handleOrgFormChange} required className="sm:col-span-2" disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="City" name="city" value={orgFormData.city} onChange={handleOrgFormChange} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormSelect label="State" name="state" value={orgFormData.state} onChange={handleOrgFormChange} options={US_STATES} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                                <FormInput label="Zip" name="postalCode" value={orgFormData.postalCode} onChange={handleOrgFormChange} disabled={orgMode === "EXISTING" && !isEditingOrg} />
                            </div>
                        </div>
                    )}

                    {/* Customer Form (INDIVIDUAL Mode) */}
                    {clientType === "INDIVIDUAL" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col shrink-0 animate-slide-up">
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-gray-800">
                                    {customerMode === "NEW" ? "New Customer Details" : (isEditingCustomer ? "Edit Customer" : "Customer Details")}
                                </h3>
                                {/* Save/Cancel buttons when editing */}
                                {isEditingCustomer && customerMode === "EXISTING" && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="small"
                                            icon={<CloseOutlined />}
                                            onClick={handleCancelEditCustomer}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<SaveOutlined />}
                                            loading={savingCustomer}
                                            onClick={handleSaveCustomer}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                    <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                    <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                    <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                    <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} required disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                </div>
                                <div className="border-t pt-3 mt-2">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <FormInput label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="sm:col-span-2" disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                        <FormInput label="City" name="city" value={formData.city} onChange={handleChange} disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                        <FormSelect label="State" name="state" value={formData.state} onChange={handleChange} options={US_STATES} disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                        <FormInput label="Zip" name="postalCode" value={formData.postalCode} onChange={handleChange} disabled={customerMode === "EXISTING" && !isEditingCustomer} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-auto flex justify-end">
                        {/* <button
                            type="submit"
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-md font-semibold text-sm transition-colors shadow-sm"
                        >
                            Continue to Quote
                        </button> */}
                    </div>

                </div>
            </div>
        </form>
    );
}
