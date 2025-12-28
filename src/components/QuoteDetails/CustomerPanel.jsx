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
const FormInput = ({ label, name, value, onChange, required = false, type = "text", className = "", ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
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

const US_STATES = [
    { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "DC", label: "District Of Columbia" },
    { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }
];

const FormSelect = ({ label, name, value, onChange, options, required = false, className = "", ...props }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <select
            name={name}
            value={value}
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
    const [creatingOrg, setCreatingOrg] = useState(false);
    const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(false); // New State
    const [orgFormData, setOrgFormData] = useState({
        companyName: "", taxId: "", email: "", phone: "", alternatePhone: "",
        addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "USA", notes: ""
    });

    // Load data on mount
    useEffect(() => {
        fetchOrganizations();
        fetchCustomers();

        // Fix: Ensure customerType defaults to INDIVIDUAL if not set, 
        // preventing the "Waiting for Selection" state on initial load
        if (!formData.customerType) {
            setFormData(prev => ({ ...prev, customerType: "INDIVIDUAL" }));
        }
    }, []);

    // Also re-fetch customers if a new one is created via other means (optional, but good practice)
    useEffect(() => {
        // If we needed to auto-refresh
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

    const handleOrganizationSelect = async (val) => {
        // If selection is cleared (val is null), default back to Create Mode
        if (!val) {
            setIsCreatingNewOrg(true);
            setSelectedOrganizationId(null);
            setSelectedCustomerId(null);
            setSelectedVehicleId(null);
            setVehicles([]);
            clearFormData();
            return;
        }

        setIsCreatingNewOrg(false);
        setSelectedOrganizationId(val);
        setSelectedCustomerId(null);
        setSelectedVehicleId(null);
        setVehicles([]);

        try {
            const orgDetails = await getOrganizationWithDetails(val);

            // Populate Main Form Data
            setFormData(prev => ({
                ...prev,
                organizationId: val,
                organizationName: orgDetails.companyName || "",
                addressLine1: orgDetails.addressLine1 || "",
                addressLine2: orgDetails.addressLine2 || "",
                city: orgDetails.city || "",
                state: orgDetails.state || "",
                postalCode: orgDetails.postalCode || "",
                country: orgDetails.country || "USA",
                email: orgDetails.email || "",
                phone: orgDetails.phone || ""
            }));

            // Populate Org Form Data (for display in Org Panel)
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
            // If cleared, and we are in Org mode, maybe keep Org details? 
            // Better to just clear specific contact fields but keep Type/Org.
            if (!selectedOrganizationId) {
                clearFormData();
                setVehicles([]);
            } else {
                // If in Org mode, just reset contact fields but keep Org info
                // For simplicity, let's just re-trigger Org Select to reset to Org defaults
                handleOrganizationSelect(selectedOrganizationId);
            }
            return;
        }

        try {
            const response = await getCustomerWithVehicles(customerId);
            const customer = response.customer || {};
            const customerVehicles = response.vehicles || [];

            // If customer belongs to an organization, update org selection if not already set or different
            if (customer.organizationId && (!selectedOrganizationId || selectedOrganizationId !== customer.organizationId)) {
                setSelectedOrganizationId(customer.organizationId);
                // Also optionally load org vehicles if needed? existing logic prefers customer vehicles if customer selected.
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

            // If org selected, we usually want Org vehicles available. 
            // But if specific customer selected, maybe they have personal vehicles? 
            // Logic: If Org Customer, use Org Vehicles + maybe Personal?
            // Existing logic: "If org selected, keep org vehicles, else use customer vehicles"
            // Wait, existing logic in Step 127 snippet line 161:
            // if (!selectedOrganizationId) { setVehicles(customerVehicles); }

            // Refined Logic for this view:
            // If Org Contact, we likely want the Org's Fleet.
            // If Individual, we want their vehicles.
            if (customer.organizationId) {
                // It's an org contact, get Org vehicles again just in case (or rely on what we have)
                if (selectedOrganizationId !== customer.organizationId) {
                    // Fetch org details to get fleet
                    const orgDetails = await getOrganizationWithDetails(customer.organizationId);
                    setVehicles(orgDetails.vehicles || []);
                }
                // If we already have vehicles from org selection, keep them.
            } else {
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

    // Helper to format phone number as (XXX) XXX-XXXX
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone' || name === 'alternatePhone') {
            finalValue = formatPhoneNumber(value);
        }
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleOrgChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'phone' || name === 'alternatePhone') {
            finalValue = formatPhoneNumber(value);
        }
        setOrgFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCreateOrganization = async () => {
        if (!orgFormData.companyName || !orgFormData.phone || !orgFormData.addressLine1) {
            notification.warning({ message: 'Required Fields', description: 'Company name, phone, and address are required.' });
            return;
        }

        try {
            setCreatingOrg(true);
            const payload = {
                ...orgFormData,
                phone: orgFormData.phone.replace(/[^\d]/g, ''),
                alternatePhone: orgFormData.alternatePhone ? orgFormData.alternatePhone.replace(/[^\d]/g, '') : ''
            };
            const newOrg = await createOrganization(payload);
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
        // NOTE: If updating existing customer, we might want to allow that? 
        // Current logic simply takes IDs if present. 
        if (formData.customerId && formData.vehicleId) {
            // Maybe we want to update contact info? 
            // For now, preserving existing 'select and go' behavior logic, but saving form data to local storage.
            // If user edited name, it's in formData but API might not update it unless we call update endpoint.
            // Assuming "Create Quote" flow uses ID reference mostly.
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
                    phone: formData.phone.replace(/[^\d]/g, ''), // Strip formatting
                    alternatePhone: formData.alternatePhone ? formData.alternatePhone.replace(/[^\d]/g, '') : '', // Strip formatting
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
        <form onSubmit={handleSubmit} className="h-full">
            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-4 h-full">

                {/* LEFT COLUMN (SIDEBAR) */}
                <div className="flex flex-col gap-4">

                    {/* CONTAINER FOR SELECTIONS */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 text-sm">

                        {/* 1. Customer Type */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer Type</label>
                            <select
                                name="customerType"
                                value={formData.customerType || "INDIVIDUAL"}
                                onChange={(e) => {
                                    const newType = e.target.value;

                                    // Logic for switching types
                                    if (newType === "ORGANIZATION_CONTACT") {
                                        // Default to Creating New Org Mode
                                        setIsCreatingNewOrg(true);
                                    } else {
                                        setIsCreatingNewOrg(false);
                                    }

                                    setFormData(prev => ({
                                        ...prev,
                                        customerType: newType,
                                        organizationId: newType === "INDIVIDUAL" ? null : prev.organizationId,
                                        organizationName: newType === "INDIVIDUAL" ? "" : prev.organizationName
                                    }));
                                    if (newType === "INDIVIDUAL") {
                                        setSelectedOrganizationId(null);
                                        if (selectedCustomerId) {
                                            setSelectedCustomerId(null);
                                            setVehicles([]);
                                        }
                                    }
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-violet-500 outline-none"
                            >
                                <option value="INDIVIDUAL">Individual Customer</option>
                                <option value="ORGANIZATION_CONTACT">Organization Contact</option>
                            </select>
                        </div>

                        {/* 2. Organization (Conditional) */}
                        {formData.customerType === "ORGANIZATION_CONTACT" && (
                            <div className="mb-4 animate-fade-in">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Organization</label>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Select Organization"
                                    className="w-full"
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
                            </div>
                        )}


                        {/* 3. Customer Lookup (Filtered - INDIVIDUAL ONLY) */}
                        {!isCreatingNewOrg && formData.customerType === "INDIVIDUAL" && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                    Select Existing Customer
                                </label>
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder={formData.customerType === "INDIVIDUAL" ? "Search Individual..." : "Search Contact..."}
                                    className="w-full"
                                    loading={loadingCustomers}
                                    notFoundContent={loadingCustomers ? <Spin size="small" /> : "No customers found"}
                                    filterOption={(input, option) => option.children?.toLowerCase().includes(input.toLowerCase())}
                                    onChange={handleCustomerSelect}
                                    value={selectedCustomerId}
                                >
                                    {customers
                                        .filter(c => {
                                            if (formData.customerType === "INDIVIDUAL") {
                                                return !c.organizationId;
                                            } else {
                                                if (selectedOrganizationId) {
                                                    return c.organizationId === selectedOrganizationId;
                                                }
                                                return false;
                                            }
                                        })
                                        .map(customer => (
                                            <Option key={customer.customerId} value={customer.customerId}>
                                                {customer.firstName} {customer.lastName} - {customer.phone}
                                            </Option>
                                        ))}
                                </Select>
                            </div>
                        )}



                    </div>

                    {/* VEHICLE DETAILS CARD */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                        <h4 className="text-xs font-bold text-gray-800 uppercase border-b pb-1 mb-3">Vehicle Information</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <FormInput label="Year" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} type="number" />
                                <FormInput label="Make" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} />
                                <FormInput label="Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
                                <FormInput label="License Plate" name="licensePlateNumber" value={formData.licensePlateNumber} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (MAIN FORM) */}
                <div className="flex flex-col h-full">

                    {/* CASE 1: ORGANIZATION FORM (Create NEW or View EXISTING) */}
                    {(isCreatingNewOrg || (formData.customerType === "ORGANIZATION_CONTACT" && selectedOrganizationId)) && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden animate-slide-up">
                            <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-violet-900">
                                        {isCreatingNewOrg ? "Create New Organization" : "Organization Details"}
                                    </h3>
                                    <span className="text-xs text-violet-500 font-normal">
                                        {isCreatingNewOrg ? "- Enter details below" : "- View or edit organization details"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <FormInput label="Company Name *" name="companyName" value={orgFormData.companyName} onChange={handleOrgChange} required />
                                    <FormInput label="Tax ID / EIN" name="taxId" value={orgFormData.taxId} onChange={handleOrgChange} />
                                    <FormInput label="Email" name="email" value={orgFormData.email} onChange={handleOrgChange} type="email" />
                                    <FormInput label="Phone *" name="phone" value={orgFormData.phone} onChange={handleOrgChange} required />
                                </div>
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <FormInput label="Alternate Phone" name="alternatePhone" value={orgFormData.alternatePhone} onChange={handleOrgChange} />
                                    <FormInput label="Address Line 1 *" name="addressLine1" value={orgFormData.addressLine1} onChange={handleOrgChange} required className="col-span-2" />
                                    <FormInput label="Address Line 2" name="addressLine2" value={orgFormData.addressLine2} onChange={handleOrgChange} />
                                </div>

                                <div className="border-t pt-3 mt-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Location Details</p>
                                    <div className="grid grid-cols-4 gap-3 mb-3">
                                        <FormInput label="City *" name="city" value={orgFormData.city} onChange={handleOrgChange} required />
                                        <FormSelect label="State *" name="state" value={orgFormData.state} onChange={handleOrgChange} options={US_STATES} required />
                                        <FormInput label="Postal Code *" name="postalCode" value={orgFormData.postalCode} onChange={handleOrgChange} required />
                                        <FormInput label="Country" name="country" value={orgFormData.country} onChange={handleOrgChange} />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 items-end">
                                        <div className="col-span-3">
                                            <FormInput label="Notes" name="notes" value={orgFormData.notes} onChange={handleOrgChange} />
                                        </div>
                                        <div className="flex gap-2 justify-end pb-1">
                                            {isCreatingNewOrg ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCreatingNewOrg(false);
                                                            handleOrganizationSelect(null);
                                                        }}
                                                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateOrganization}
                                                        disabled={creatingOrg}
                                                        className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-medium shadow-sm transition-colors text-xs whitespace-nowrap"
                                                    >
                                                        {creatingOrg ? "Creating..." : "Create"}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit} // Use standard submit for existing flow
                                                    className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm transition-colors text-xs whitespace-nowrap"
                                                >
                                                    Continue
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CASE 2: CUSTOMER FORM (Individual ONLY) */}
                    {!isCreatingNewOrg && formData.customerType === "INDIVIDUAL" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden animate-slide-up">

                            {/* Header */}
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-800">Customer Information</h3>
                                <span className="text-xs text-gray-500 font-normal">-
                                    {formData.customerType === "INDIVIDUAL" ? " Contact details" : " Organization contact"}
                                </span>
                            </div>

                            {/* Form Content */}
                            <div className="p-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                    <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                    <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
                                    <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required type="tel" />
                                </div>

                                <div className="border-t pt-3 mt-2">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address & Location</h5>

                                    <div className="grid grid-cols-4 gap-3 mb-3">
                                        <FormInput label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="col-span-2" />
                                        <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />
                                        <FormSelect label="State" name="state" value={formData.state} onChange={handleChange} options={US_STATES} />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <FormInput label="Zip Code" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                                        <FormInput label="Country" name="country" value={formData.country || "USA"} onChange={handleChange} />

                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 rounded-md bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-medium shadow-sm transition-colors"
                                >
                                    {loading ? "Processing..." : "Continue to Quote"}
                                </button>
                            </div>

                        </div>
                    )}

                    {/* CASE 3: PLACEHOLDER */}
                    {!isCreatingNewOrg && !(formData.customerType === "INDIVIDUAL" || selectedOrganizationId) && (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-md h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-2xl text-slate-400">
                                <PlusOutlined />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">Waiting for Selection</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">
                                {formData.customerType === "ORGANIZATION_CONTACT"
                                    ? "Select an Organization to proceed, or create a new one."
                                    : "Select a customer type to begin."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}