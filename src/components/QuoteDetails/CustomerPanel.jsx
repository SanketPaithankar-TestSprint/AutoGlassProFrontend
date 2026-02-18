import React, { useState, useEffect } from "react";
import { notification, Select, Spin, Radio, Switch, Segmented, Button, Popconfirm, AutoComplete } from "antd";
import { UserOutlined, ShopOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { getValidToken } from "../../api/getValidToken";
import { getCustomers } from "../../api/getCustomers";
import { getCustomerWithVehicles } from "../../api/getCustomerWithVehicles";
import { updateCustomer } from "../../api/updateCustomer";
import { getOrganizations, getOrganizationById, createOrganization, updateOrganization, updateOrganizationTaxExempt, getOrganizationVehicles, getOrganizationWithDetails } from "../../api/organizationApi";
import { COUNTRIES, US_STATES } from "../../const/locations";

const { Option } = Select;

// Reusable Input Component
const FormInput = ({ label, name, value, onChange, onBlur, required = false, type = "text", className = "", ...props }) => (
    <div className={`${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            type={type}
            className="border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all w-full"
            {...props}
        />
    </div>
);

const FormSelect = ({ label, name, value, onChange, onBlur, options, required = false, className = "", ...props }) => (
    <div className={`${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <Select
            value={value || undefined}
            onChange={(val) => onChange({ target: { name, value: val } })}
            onBlur={onBlur} // Pass onBlur directly
            placeholder={`Select ${label}`}
            className="w-full"
            allowClear
            showSearch
            optionFilterProp="label"
            options={options}
            {...props}
        />
    </div>
);

export default function CustomerPanel({ formData, setFormData, setCanShowQuotePanel, setPanel, isDocumentLoaded = false }) {
    // Organizations
    const [organizations, setOrganizations] = useState([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);

    // Customers  
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Vehicles
    const [vehicles, setVehicles] = useState([]);

    const initialOrgForm = {
        companyName: "", taxId: "", email: "", phone: "", alternatePhone: "",
        contactName: "",
        addressLine1: "", city: "", state: "", postalCode: "", country: "USA", notes: "",
        contacts: []
    };
    const [orgFormData, setOrgFormData] = useState(initialOrgForm);

    // Master Mode: INDIVIDUAL vs BUSINESS
    const [clientType, setClientType] = useState("INDIVIDUAL");

    // Internal Modes
    const [customerMode, setCustomerMode] = useState("NEW"); // "NEW" | "EXISTING"
    const [orgMode, setOrgMode] = useState("NEW"); // "NEW" | "EXISTING" (No "NONE" anymore in Business mode)

    // Edit Mode States

    const [savingCustomer, setSavingCustomer] = useState(false);
    const [savingOrg, setSavingOrg] = useState(false);

    // Auto-Save / Dirty Tracking State
    const [lastSavedCustomerData, setLastSavedCustomerData] = useState(null);
    const [lastSavedOrgData, setLastSavedOrgData] = useState(null);

    const isCustomerDirty = React.useMemo(() => {
        if (!lastSavedCustomerData) return false;
        const fields = ["firstName", "lastName", "email", "phone", "alternatePhone", "addressLine1", "addressLine2", "city", "state", "postalCode", "country", "preferredContactMethod", "notes"];
        return fields.some(key => (formData[key] || "") !== (lastSavedCustomerData[key] || ""));
    }, [formData, lastSavedCustomerData]);

    const isOrgDirty = React.useMemo(() => {
        if (!lastSavedOrgData) return false;
        const fields = [
            "companyName", "taxId", "email", "phone", "alternatePhone",
            "addressLine1", "city", "state", "postalCode", "country", "notes",
            "contactName"
        ];
        return fields.some(key => (orgFormData[key] || "") !== (lastSavedOrgData[key] || ""));
    }, [orgFormData, lastSavedOrgData]);

    const handleInputBlur = () => {
        if (clientType === "INDIVIDUAL" && customerMode === "EXISTING" && isCustomerDirty) {
            handleSaveCustomer(true);
        } else if (clientType === "BUSINESS" && orgMode === "EXISTING" && isOrgDirty) {
            handleSaveOrganization(true);
        }
    };



    // Initial Load & Sync
    useEffect(() => {
        fetchOrganizations();
        fetchCustomers();

        // Detect current mode based on existing data
        if (formData.organizationId || (formData.companyName && !formData.firstName)) {
            setClientType("BUSINESS");
            setOrgMode(formData.organizationId ? "EXISTING" : "NEW");

            // Populate Org Form from passed data
            const initialOrgData = {
                companyName: formData.companyName || formData.organizationName || "",
                taxId: formData.taxId || "",
                email: formData.email || "",
                phone: formData.phone || "",
                alternatePhone: formData.alternatePhone || "",
                contactName: formData.organizationContactName || "", // Prefill contact name from saved document
                addressLine1: formData.addressLine1 || "",
                addressLine2: formData.addressLine2 || "",
                city: formData.city || "",
                state: formData.state || "",
                postalCode: formData.postalCode || "",
                country: formData.country || "USA",
                notes: formData.notes || ""
            };
            setOrgFormData(initialOrgData);
            setLastSavedOrgData(initialOrgData);
        } else {
            setClientType("INDIVIDUAL");
            setCustomerMode(formData.customerId ? "EXISTING" : "NEW");

            // Initialize last saved customer data for dirty checking
            if (formData.customerId) {
                setLastSavedCustomerData({
                    firstName: formData.firstName || "",
                    lastName: formData.lastName || "",
                    email: formData.email || "",
                    phone: formData.phone || "",
                    addressLine1: formData.addressLine1 || "",
                    addressLine2: formData.addressLine2 || "",
                    city: formData.city || "",
                    state: formData.state || "",
                    postalCode: formData.postalCode || "",
                    country: formData.country || "USA",
                    preferredContactMethod: formData.preferredContactMethod || "phone",
                    notes: formData.notes || ""
                });
            }
        }
    }, [formData.customerId]); // Added formData.customerId dependency to re-run if it changes (e.g. after save)

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
            const orgDetails = await getOrganizationWithDetails(val);
            setFormData(prev => ({
                ...prev,
                organizationId: val,
                organizationName: orgDetails.companyName || "",
                isTaxExempt: orgDetails.taxExempt === true,
                // Sync organization phone and email to formData for validation
                phone: orgDetails.phone || "",
                email: orgDetails.email || ""
            }));

            const newOrgData = {
                companyName: orgDetails.companyName || "",
                taxId: orgDetails.taxId || "",
                email: orgDetails.email || "",
                phone: orgDetails.phone || "",
                alternatePhone: orgDetails.alternatePhone || "",
                contactName: orgDetails.contactName || "",
                addressLine1: orgDetails.addressLine1 || "",
                postalCode: orgDetails.postalCode || "",
                country: orgDetails.country || "USA",
                notes: orgDetails.notes || "",
                contacts: orgDetails.contacts || []
            };
            setOrgFormData(newOrgData);
            setLastSavedOrgData(newOrgData);

            // Fetch Organization Vehicles
            try {
                const orgVehicles = await getOrganizationVehicles(val);
                setVehicles(Array.isArray(orgVehicles) ? orgVehicles : []);
            } catch (err) {
                console.warn("Failed to load organization vehicles", err);
                setVehicles([]);
            }

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

            setLastSavedCustomerData({
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                addressLine1: customer.addressLine1 || "",
                addressLine2: customer.addressLine2 || "",
                city: customer.city || "",
                state: customer.state || "",
                postalCode: customer.postalCode || "",
                country: customer.country || "USA",
                preferredContactMethod: customer.preferredContactMethod || "phone",
                notes: customer.notes || ""
            });

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



    const handleOrgFormChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        // Format organization phone numbers
        if (name === 'phone' || name === 'alternatePhone') {
            finalValue = formatPhoneNumber(value);
        }
        setOrgFormData(prev => ({ ...prev, [name]: finalValue }));

        // Sync organization email and phone to formData for validation
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

        // Sync contact name to newContactDetails if we have a new contact ID
        if (formData.organizationContactId && formData.newContactDetails && name === 'contactName') {
            setFormData(prev => ({
                ...prev,
                newContactDetails: {
                    ...prev.newContactDetails,
                    name: finalValue
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



    const handleSaveCustomer = async (silent = false) => {
        if (!formData.customerId) return;


        if (!formData.firstName || formData.firstName.trim() === "") {
            notification.error({
                message: "Validation Error",
                description: "Name is required.",
                placement: "topRight"
            });
            return;
        }

        if (!formData.phone || formData.phone.trim() === "") {
            notification.error({
                message: "Validation Error",
                description: "Phone is required.",
                placement: "topRight"
            });
            return;
        }

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

            setLastSavedCustomerData({
                firstName: formData.firstName || "",
                lastName: formData.lastName || "",
                email: formData.email || "",
                phone: formData.phone || "",
                addressLine1: formData.addressLine1 || "",
                addressLine2: formData.addressLine2 || "",
                city: formData.city || "",
                state: formData.state || "",
                postalCode: formData.postalCode || "",
                country: formData.country || "USA",
                preferredContactMethod: formData.preferredContactMethod || "phone",
                notes: formData.notes || ""
            });

            if (!silent) {
                notification.success({
                    message: "Customer Updated",
                    description: "Customer information has been updated successfully.",
                    placement: "topRight"
                });
            }

            // Refresh customer list
            await fetchCustomers();
        } catch (error) {
            console.error("Error updating customer:", error);
            if (!silent) {
                notification.error({
                    message: "Update Failed",
                    description: "Failed to update customer. Please try again.",
                    placement: "topRight"
                });
            }
        } finally {
            setSavingCustomer(false);
        }
    };

    // ...existing code...

    // --- Contact Selection Handler ---
    const handleContactSelect = (value) => {
        const selectedContact = orgFormData.contacts?.find(c => c.contactName === value);
        if (selectedContact) {
            setOrgFormData(prev => ({
                ...prev,
                contactName: selectedContact.contactName || "",
                email: selectedContact.email || prev.email,
                phone: selectedContact.phone || prev.phone,
                alternatePhone: selectedContact.alternatePhone || prev.alternatePhone
            }));

            // Sync to parent formData to persist across tab switches
            setFormData(prev => ({
                ...prev,
                organizationContactId: selectedContact.id,
                organizationContactName: selectedContact.contactName || ""
            }));
        }
    };

    // --- Organization Edit/Delete Handlers ---



    const handleSaveOrganization = async (silent = false) => {
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

            const currentContact = {
                id: formData.organizationContactId || null, // Include the UUID
                name: orgFormData.contactName,
                contactName: orgFormData.contactName
            };

            let updatedContacts = [...(orgFormData.contacts || [])];

            // For new contacts (with UUID but not in contacts array)
            if (formData.organizationContactId && !updatedContacts.find(c => c.id === formData.organizationContactId)) {
                if (currentContact.contactName) {
                    updatedContacts.push(currentContact);
                }
            } else if (formData.organizationContactId) {
                // Update existing contact by UUID
                const existingContactIndex = updatedContacts.findIndex(c => c.id === formData.organizationContactId);
                if (existingContactIndex >= 0) {
                    updatedContacts[existingContactIndex] = { ...updatedContacts[existingContactIndex], ...currentContact };
                }
            } else if (currentContact.contactName) {
                // Fallback: find by name (legacy behavior)
                const existingContactIndex = updatedContacts.findIndex(c => (c.name || c.contactName) === currentContact.contactName);
                if (existingContactIndex >= 0) {
                    updatedContacts[existingContactIndex] = { ...updatedContacts[existingContactIndex], ...currentContact };
                } else {
                    updatedContacts.push(currentContact);
                }
            }

            const orgPayload = {
                organizationId: formData.organizationId,
                companyName: orgFormData.companyName,
                taxId: orgFormData.taxId || "",
                email: orgFormData.email || "",
                phone: orgFormData.phone,
                alternatePhone: orgFormData.alternatePhone || "",
                addressLine1: orgFormData.addressLine1 || "",
                city: orgFormData.city || "",
                state: orgFormData.state || "",
                postalCode: orgFormData.postalCode || "",
                country: orgFormData.country || "USA",
                contactName: orgFormData.contactName || "",
                taxExempt: formData.isTaxExempt || false,
                notes: orgFormData.notes || "",
                contacts: updatedContacts
            };

            await updateOrganization(formData.organizationId, orgPayload);

            // Update formData
            setFormData(prev => ({
                ...prev,
                organizationName: orgFormData.companyName,
                companyName: orgFormData.companyName
            }));

            setLastSavedOrgData({
                ...orgFormData,
                contactName: orgFormData.contactName
            });

            if (!silent) {
                notification.success({
                    message: "Organization Updated",
                    description: "Organization information has been updated successfully.",
                    placement: "topRight"
                });
            }

            // Refresh organization list
            await fetchOrganizations();
        } catch (error) {
            console.error("Error updating organization:", error);
            if (!silent) {
                notification.error({
                    message: "Update Failed",
                    description: "Failed to update organization. Please try again.",
                    placement: "topRight"
                });
            }
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
            // Check Organization contact - Phone is Mandatory
            const phone = orgFormData.phone || "";
            const hasPhone = phone.trim().length > 0;

            if (!hasPhone) {
                notification.error({
                    message: "Missing Contact Information",
                    description: "Phone number is mandatory for the organization.",
                    placement: "topRight",
                    duration: 4
                });
                return false;
            }
        } else {
            // Check Customer contact

            const hasPhone = phone.trim().length > 0;

            if (!hasPhone) {
                notification.error({
                    message: "Missing Contact Information",
                    description: "Phone number is required.",
                    placement: "topRight",
                    duration: 4
                });
                return false;
            }
            // Check Customer name
            const firstName = formData.firstName || "";
            if (!firstName.trim().length > 0) {
                notification.error({
                    message: "Missing Customer Information",
                    description: "First Name is required.",
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
                <div className="flex flex-col h-full">

                    {/* Unified Sidebar Card: Client, Selection & Vehicles */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 flex flex-col h-full overflow-y-auto">

                        {/* 1. Client Type Toggle */}
                        <div className="mb-4 shrink-0">
                            <label className="text-xs !font-semibold text-slate-800 uppercase tracking-wide mb-2 block">Client Type:</label>
                            <Segmented
                                block
                                options={[
                                    { label: 'Individual', value: 'INDIVIDUAL', icon: <UserOutlined /> },
                                    { label: 'Business', value: 'BUSINESS', icon: <ShopOutlined /> },
                                ]}
                                value={clientType}
                                onChange={handleClientTypeChange}
                                disabled={isDocumentLoaded} // Disable when editing existing document
                            />
                        </div>

                        {/* 2. Customer Selection (INDIVIDUAL ONLY) */}
                        {clientType === "INDIVIDUAL" && (
                            <div className="animate-fade-in mt-4 pt-4 border-t border-gray-300 shrink-0">
                                <h4 className="text-xs !font-semibold text-slate-800 uppercase tracking-wide mb-3">Customer Selection</h4>

                                <div className="flex flex-col gap-3">
                                    <Radio.Group
                                        onChange={handleCustomerModeChange}
                                        value={customerMode}
                                        className="flex flex-col gap-2"
                                        disabled={isDocumentLoaded} // Disable mode switch
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
                                                placeholder="Search by name/phone/email"
                                                className="w-full"
                                                loading={loadingCustomers}
                                                filterOption={(input, option) => {
                                                    const customer = customers.find(c => c.customerId === option.value);
                                                    if (!customer) return false;
                                                    const searchText = input.toLowerCase();
                                                    return (
                                                        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchText) ||
                                                        (customer.phone && customer.phone.toLowerCase().includes(searchText)) ||
                                                        (customer.email && customer.email.toLowerCase().includes(searchText))
                                                    );
                                                }}
                                                onChange={handleCustomerSelect}
                                                value={formData.customerId}
                                                disabled={isDocumentLoaded} // Disable search
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

                        {/* 2. Organization Selection (BUSINESS ONLY) */}
                        {clientType === "BUSINESS" && (
                            <div className="animate-fade-in mt-4 pt-4 border-t border-gray-300 shrink-0">
                                <h4 className="text-xs !font-semibold text-slate-800 uppercase tracking-wide mb-3">Organization Selection</h4>

                                <div className="flex flex-col gap-3">
                                    <Radio.Group
                                        onChange={handleOrgModeChange}
                                        value={orgMode}
                                        className="flex flex-col gap-2"
                                        disabled={isDocumentLoaded} // Disable mode switch
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
                                                placeholder="Search by name/phone/email"
                                                className="w-full"
                                                loading={loadingOrganizations}
                                                filterOption={(input, option) => {
                                                    const org = organizations.find(o => o.organizationId === option.value);
                                                    if (!org) return false;
                                                    const searchText = input.toLowerCase();
                                                    return (
                                                        (org.companyName && org.companyName.toLowerCase().includes(searchText)) ||
                                                        (org.phone && org.phone.toLowerCase().includes(searchText)) ||
                                                        (org.email && org.email.toLowerCase().includes(searchText))
                                                    );
                                                }}
                                                onChange={handleOrganizationSelect}
                                                value={formData.organizationId}
                                                disabled={isDocumentLoaded} // Disable search
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


                    </div>

                </div>

                {/* RIGHT PANEL: Single Form Area */}
                <div className="flex flex-col h-full overflow-y-auto pr-1 gap-4">

                    {/* Organization Form (BUSINESS Mode) */}
                    {clientType === "BUSINESS" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col shrink-0 animate-slide-up">
                            <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-gray-800">
                                    {orgMode === "NEW" ? "Organization Details" : "Organization Details"}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Save button for EXISTING mode */}
                                    {orgMode === "EXISTING" && (
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<SaveOutlined />}
                                            loading={savingOrg}
                                            onClick={() => handleSaveOrganization(false)}
                                            disabled={!isOrgDirty}
                                        >
                                            Save Changes
                                        </Button>
                                    )}
                                    {/* Tax Exempt Switch */}
                                    {/* Tax Exempt Switch moved to form body */}
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Organization Details - First Rows */}
                                <FormInput label="Company Name" name="companyName" value={orgFormData.companyName} onChange={handleOrgFormChange} required />
                                <FormInput label="Tax ID" name="taxId" value={orgFormData.taxId} onChange={handleOrgFormChange} />
                                <FormInput label="Email" name="email" value={orgFormData.email} onChange={handleOrgFormChange} />
                                <FormInput label="Phone" name="phone" value={orgFormData.phone} onChange={handleOrgFormChange} required />

                                <FormInput label="Address Line 1" name="addressLine1" value={orgFormData.addressLine1} onChange={handleOrgFormChange} />
                                <FormInput label="City" name="city" value={orgFormData.city} onChange={handleOrgFormChange} />
                                <FormSelect label="State" name="state" value={orgFormData.state} onChange={handleOrgFormChange} options={US_STATES} />
                                <FormInput label="Zip Code" name="postalCode" value={orgFormData.postalCode} onChange={handleOrgFormChange} />

                                {/* Contact Person Details - Last Rows */}
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                                    <AutoComplete
                                        className="w-full"
                                        value={orgFormData.contactName}
                                        onChange={(val) => handleOrgFormChange({ target: { name: 'contactName', value: val } })}
                                        onSelect={(val) => {
                                            if (val === "NEW_CONTACT_TRIGGER") {
                                                // Generate new UUID for new contact
                                                const newContactId = crypto.randomUUID();
                                                console.log('[CustomerPanel] Generating new contact UUID:', newContactId);

                                                setOrgFormData(prev => ({
                                                    ...prev,
                                                    contactName: ""
                                                }));

                                                // Set the new contact ID
                                                setFormData(prev => ({
                                                    ...prev,
                                                    organizationContactId: newContactId,
                                                    // Prepare new contact details for saving
                                                    newContactDetails: {
                                                        id: newContactId,
                                                        name: ""
                                                    }
                                                }));
                                            } else {
                                                // Find by 'name' or 'contactName'
                                                const selected = orgFormData.contacts.find(c => (c.name === val || c.contactName === val));
                                                if (selected) {
                                                    console.log('[CustomerPanel] Selected existing contact:', selected);
                                                    setOrgFormData(prev => ({
                                                        ...prev,
                                                        contactName: selected.name || selected.contactName
                                                    }));

                                                    // Set existing contact ID
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        organizationContactId: selected.id || selected.contactId
                                                    }));
                                                }
                                            }
                                        }}
                                        options={[
                                            ...(orgFormData.contacts || []).map(c => ({ value: c.name || c.contactName, label: c.name || c.contactName })),
                                            { value: "NEW_CONTACT_TRIGGER", label: <span className="text-violet-600 font-medium">+ Add New Contact</span> }
                                        ]}
                                        placeholder=""
                                        filterOption={(inputValue, option) => {
                                            if (option.value === "NEW_CONTACT_TRIGGER") {
                                                return true;
                                            }
                                            return option.label &&
                                                typeof option.label === 'string' &&
                                                option.label.toUpperCase().includes(inputValue.toUpperCase());
                                        }}
                                    />
                                </div>



                                {/* Tax Exempt Switch in Form Body */}
                                <div className="flex flex-col justify-end pb-1 col-span-full sm:col-span-1">
                                    <div className="flex items-center gap-2 h-[38px]">
                                        <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">Tax Status:</span>
                                        <Switch
                                            size="small"
                                            checked={formData.isTaxExempt}
                                            onChange={(checked) => {
                                                setFormData(prev => ({ ...prev, isTaxExempt: checked }));
                                                // Auto-save tax status change if existing org
                                                if (formData.organizationId && orgMode === "EXISTING") {
                                                    updateOrganizationTaxExempt(formData.organizationId, checked)
                                                        .then(() => {
                                                            notification.success({ message: "Tax Status Updated", description: checked ? "Organization is now Tax Exempt" : "Organization is now Taxable" });
                                                        })
                                                        .catch((err) => {
                                                            console.error(err);
                                                            notification.error({ message: "Update Failed", description: "Could not update tax status." });
                                                        });
                                                }
                                            }}
                                        />
                                        <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${formData.isTaxExempt ? "text-violet-600" : "text-slate-500"}`}>
                                            {formData.isTaxExempt ? "Tax Exempt" : "Taxable"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Form (INDIVIDUAL Mode) */}
                    {clientType === "INDIVIDUAL" && (
                        <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col shrink-0 animate-slide-up">
                            <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-gray-800">
                                    {customerMode === "NEW" ? "New Customer Details" : "Customer Details"}
                                </h3>
                                {/* Save button when EXISTING */}
                                {customerMode === "EXISTING" && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<SaveOutlined />}
                                            loading={savingCustomer}
                                            onClick={() => handleSaveCustomer(false)}
                                            disabled={!isCustomerDirty}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                    <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleInputBlur} required />
                                    <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleInputBlur} />
                                    <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} onBlur={handleInputBlur} type="email" />
                                    <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleInputBlur} required />
                                </div>
                                <div className="mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <FormInput label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} onBlur={handleInputBlur} />
                                        <FormInput label="City" name="city" value={formData.city} onChange={handleChange} onBlur={handleInputBlur} />
                                        <FormSelect label="State" name="state" value={formData.state} onChange={handleChange} onBlur={handleInputBlur} options={US_STATES} />
                                        <FormInput label="Zip Code" name="postalCode" value={formData.postalCode} onChange={handleChange} onBlur={handleInputBlur} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Details Section - Moved to Main Panel */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm flex flex-col shrink-0 animate-slide-up">
                        <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-gray-800">
                                Vehicle Details
                            </h3>

                            {/* Vehicle Selection Dropdown */}
                            {(vehicles.length > 0) && (
                                <div className="w-full sm:w-64">
                                    <Select
                                        placeholder="Select Saved Vehicle"
                                        className="w-full"
                                        onChange={handleVehicleSelect}
                                        allowClear
                                        optionLabelProp="label"
                                    >
                                        {vehicles.map(v => (
                                            <Option key={v.vehicleId} value={v.vehicleId} label={`${v.vehicleYear} ${v.vehicleMake} ${v.vehicleModel}`}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{v.vehicleYear} {v.vehicleMake} {v.vehicleModel}</span>
                                                    <span className="text-xs text-gray-400">VIN: {v.vin}</span>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <FormInput label="Year" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} onBlur={handleInputBlur} type="number" />
                            <FormInput label="Make" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} onBlur={handleInputBlur} />
                            <FormInput label="Model" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} onBlur={handleInputBlur} />
                            <FormInput label="VIN" name="vin" value={formData.vin} onChange={handleChange} onBlur={handleInputBlur} />
                        </div>
                    </div>

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
