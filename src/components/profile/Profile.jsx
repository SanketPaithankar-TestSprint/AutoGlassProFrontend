import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "../../api/getProfile";
import { getCustomers } from "../../api/getCustomers";
import { getEmployees } from "../../api/getEmployees";
import { createCustomer } from "../../api/createCustomer";
import { updateCustomer } from "../../api/updateCustomer";
import { createEmployee } from "../../api/createEmployee";
import { updateProfile } from "../../api/updateProfile";
import { saveUserLogo } from "../../api/saveUserLogo";
import { getValidToken } from "../../api/getValidToken";
import { UserOutlined, TeamOutlined, IdcardOutlined, ShopOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, PlusOutlined, DollarOutlined, ThunderboltOutlined, PercentageOutlined, KeyOutlined, ScanOutlined, FileTextOutlined, UploadOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Button, notification, Upload, Avatar } from "antd";
import ImgCrop from 'antd-img-crop';
import imageCompression from 'browser-image-compression';
import { getUserLogo } from "../../api/getUserLogo";
import SmtpConfiguration from "./SmtpConfiguration";
import LaborRateConfiguration from "./LaborRateConfiguration";
import TaxRateConfiguration from "./TaxRateConfiguration";
import DistributorCredentials from "./DistributorCredentials";
import UserKitPricePage from "./UserKitPricePage";
import UserAdasPricePage from "./UserAdasPricePage";
import SpecialInstructions from "./SpecialInstructions";
import SlugConfig from "../SlugConfig/SlugConfig";
import { COUNTRIES, getStatesOrProvinces, getCities } from "../../const/locations";

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const queryClient = useQueryClient();

    // Modals state
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
    const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [form] = Form.useForm();
    const [employeeForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const token = getValidToken();

    // Watch for country/state changes in Profile Form to update dropdowns dynamically
    const selectedCountry = Form.useWatch('country', profileForm);
    const selectedState = Form.useWatch('state', profileForm);

    const states = getStatesOrProvinces(selectedCountry);
    const cities = getCities(selectedCountry, selectedState);

    useEffect(() => {
        document.title = "APAI | Profile";
    }, []);

    const { data: profile, isLoading: loadingProfile, error } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getProfile(token);
            localStorage.setItem("agp_profile_data", JSON.stringify(res));
            return res;
        }
    });

    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getCustomers(token);
            return Array.isArray(res) ? res : [];
        },
        enabled: activeTab === 'customers', // Only fetch when tab is active
        staleTime: 1000 * 60 * 5 // Cache for 5 minutes
    });

    const { data: employees = [], isLoading: loadingEmployees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            // Check localStorage cache first
            const cached = localStorage.getItem("agp_employees");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) {
                    console.error("Failed to parse cached employees", e);
                }
            }

            if (!token) throw new Error("No token found. Please login.");
            const res = await getEmployees(token);
            const data = Array.isArray(res) ? res : [];
            localStorage.setItem("agp_employees", JSON.stringify(data));
            return data;
        },
        enabled: activeTab === 'employees', // Only fetch when tab is active
        staleTime: 1000 * 60 * 30 // Cache for 30 minutes
    });

    // Logo State
    const [logoUrl, setLogoUrl] = useState(localStorage.getItem('userLogo'));
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Effect to check logo if not in storage (fallback)
    useEffect(() => {
        if (!logoUrl) {
            getUserLogo().then(url => {
                if (url) {
                    setLogoUrl(url);
                    localStorage.setItem('userLogo', url);
                    // Dispatch event to notify Sidebar
                    window.dispatchEvent(new Event('userLogoUpdated'));
                }
            });
        }
    }, [logoUrl]);

    // Update logo state when profile refreshes (optional, if profile carries logoUrl)
    // But we are prioritizing localStorage as per requirement. 
    // If backend returns a URL in profile, we might want to sync it.
    // For now, relying on explicit getUserLogo and caching.

    const [saving, setSaving] = useState(false);

    // Logo Upload Handler
    const handleLogoUpload = async ({ file, onSuccess, onError }) => {
        setUploadingLogo(true);
        try {
            // Options for compression
            const options = {
                maxSizeMB: 2,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            // Compress image
            const compressedFile = await imageCompression(file, options);

            // Upload
            await saveUserLogo(compressedFile);

            // Wait a bit for the reader in saveUserLogo to finish
            setTimeout(() => {
                const cached = localStorage.getItem('userLogo');
                if (cached) setLogoUrl(cached);
            }, 500);

            // Invalidate profile query to re-fetch profile with new logo
            await queryClient.invalidateQueries({ queryKey: ['profile'] });

            notification.success({ message: "Logo uploaded successfully" });
            onSuccess("ok");
        } catch (error) {
            console.error(error);
            notification.error({ message: "Failed to upload logo", description: error.message });
            onError(error);
        } finally {
            setUploadingLogo(false);
        }
    };

    // Customer Handlers
    const handleAddCustomer = () => {
        setEditingCustomer(null);
        form.resetFields();
        setIsCustomerModalVisible(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            ...customer,
            vehicle: null // Vehicle editing not supported in this simple form yet
        });
        setIsCustomerModalVisible(true);
    };

    const handleSaveCustomer = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (!token) throw new Error("No token found");
            if (!profile?.userId) throw new Error("User ID not found");

            const payload = {
                ...values,
                userId: profile.userId
            };

            if (editingCustomer) {
                await updateCustomer(token, editingCustomer.customerId, payload);
                notification.success({ message: "Customer updated successfully" });
            } else {
                await createCustomer(token, payload);
                notification.success({ message: "Customer created successfully" });
            }

            setIsCustomerModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to save customer", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Employee Handlers
    const handleAddEmployee = () => {
        employeeForm.resetFields();
        setIsEmployeeModalVisible(true);
    };

    const handleSaveEmployee = async () => {
        try {
            const values = await employeeForm.validateFields();
            setSaving(true);

            if (!token) throw new Error("No token found");
            if (!profile?.userId) throw new Error("User ID not found");

            const payload = {
                ...values,
                userId: profile.userId
            };

            await createEmployee(token, payload);
            notification.success({ message: "Employee created successfully" });

            setIsEmployeeModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to create employee", description: err.message });
        } finally {
            setSaving(false);
        }
    };



    // Profile Edit Handlers
    const handleEditProfile = () => {
        if (profile) {
            // Normalize Country for Dropdown
            let normalizedCountry = profile.country;
            if (!normalizedCountry || normalizedCountry === 'United States' || normalizedCountry === 'US') {
                normalizedCountry = 'USA';
            }

            // Map existing profile to form
            profileForm.setFieldsValue({
                ...profile,
                country: normalizedCountry,
                businessNumber: profile.businessLicenseNumber
            });
        }
        setIsEditProfileModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        try {
            const values = await profileForm.validateFields();
            setSaving(true);

            // Merge existing profile data with form values to preserve fields like tax booleans and EIN
            const payload = {
                ...profile,
                ...values
            };

            await updateProfile(payload);
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            notification.success({ message: "Profile updated successfully" });
            setIsEditProfileModalVisible(false);
        } catch (error) {
            console.error(error);
            notification.error({ message: "Failed to update profile", description: error.message });
        } finally {
            setSaving(false);
        }
    };

    // Format address helper
    const formatAddress = (p) => {
        if (!p) return "-";
        const parts = [
            p.addressLine1,
            p.addressLine2,
            p.city,
            p.state,
            p.postalCode,
            p.country
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "-";
    };

    const renderMenuItem = (id, label, icon) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${activeTab === id
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </button>
    );

    const renderProfileContent = () => {
        if (loadingProfile) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading profile...</div>;
        if (error) return <div className="text-center py-12 text-lg text-red-500">{error.message || "Failed to fetch profile."}</div>;
        if (!profile) return null;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShopOutlined className="text-violet-500" /> Business Information
                        </h2>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditProfile}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Edit Profile
                        </Button>
                    </div>

                    {/* Logo Section */}
                    <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="relative">
                            <Avatar
                                size={80}
                                src={logoUrl}
                                icon={<ShopOutlined />}
                                className="bg-violet-100 text-violet-600 border-2 border-white shadow-md"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Shop Logo</h3>
                            <p className="text-xs text-gray-500 mb-3">
                                Upload a logo for your shop.
                                Max size: 2MB.
                            </p>
                            <ImgCrop rotationSlider showReset aspect={1} modalWidth={600}>
                                <Upload
                                    customRequest={handleLogoUpload}
                                    showUploadList={false}
                                    accept="image/png, image/jpeg, image/jpg"
                                >
                                    <Button
                                        icon={uploadingLogo ? <ThunderboltOutlined spin /> : <UploadOutlined />}
                                        disabled={uploadingLogo}
                                        size="small"
                                        className="bg-white"
                                    >
                                        {uploadingLogo ? "Uploading..." : "Change Logo"}
                                    </Button>
                                </Upload>
                            </ImgCrop>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Name</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.businessName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Owner Name</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.ownerName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">User Type</span>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {profile.userType || "-"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business License</span>
                            <p className="text-gray-900 font-mono">{profile.businessLicenseNumber || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">EIN</span>
                            <p className="text-gray-900 font-mono">{profile.ein || "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PhoneOutlined className="text-violet-500" /> Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                            <p className="text-gray-900 font-medium">{profile.email || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                            <p className="text-gray-900 font-medium">{profile.phone || "-"}</p>
                        </div>
                        {profile.alternatePhone && (
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alternate Phone</span>
                                <p className="text-gray-900 font-medium">{profile.alternatePhone}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <EnvironmentOutlined className="text-violet-500" /> Address
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Address</span>
                            <p className="text-gray-900 font-medium">{formatAddress(profile)}</p>
                        </div>
                    </div>
                </div>
                <Modal
                    title="Edit Profile"
                    open={isEditProfileModalVisible}
                    onOk={handleUpdateProfile}
                    onCancel={() => setIsEditProfileModalVisible(false)}
                    confirmLoading={saving}
                    width={800}
                >
                    <Form form={profileForm} layout="vertical">
                        {/* ... Business Info Fields ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="businessName" label="Business Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="ownerName" label="Owner Name">
                                <Input />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="businessNumber" label="Business License Number">
                                <Input />
                            </Form.Item>
                            <Form.Item name="ein" label="EIN">
                                <Input />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="alternatePhone" label="Alternate Phone">
                                <Input />
                            </Form.Item>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Address</h4>
                            <Form.Item name="addressLine1" label="Address Line 1">
                                <Input />
                            </Form.Item>
                            <Form.Item name="addressLine2" label="Address Line 2">
                                <Input />
                            </Form.Item>

                            {/* Country First to drive State */}
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="country" label="Country">
                                    <Select
                                        showSearch
                                        options={COUNTRIES}
                                        onChange={() => {
                                            profileForm.setFieldsValue({ state: null, city: null });
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item name="postalCode" label="Zip Code">
                                    <Input />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="state" label="State/Province">
                                    <Select
                                        showSearch
                                        options={states}
                                        disabled={!selectedCountry || states.length === 0}
                                        onChange={() => profileForm.setFieldsValue({ city: null })}
                                    />
                                </Form.Item>
                                <Form.Item name="city" label="City">
                                    {cities.length > 0 ? (
                                        <Select showSearch options={cities} />
                                    ) : (
                                        <Input />
                                    )}
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    };


    const renderCustomersContent = () => {
        if (loadingCustomers) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading customers...</div>;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
                    <button
                        onClick={handleAddCustomer}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <PlusOutlined /> Add Customer
                    </button>
                </div>
                {customers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <TeamOutlined className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">No customers found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((c, i) => (
                                        <tr key={c.id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.email || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.phone || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.vehicle ? `${c.vehicle.year} ${c.vehicle.make} ${c.vehicle.model}` : "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditCustomer(c)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal
                    title={editingCustomer ? "Edit Customer" : "Add Customer"}
                    open={isCustomerModalVisible}
                    onOk={handleSaveCustomer}
                    onCancel={() => setIsCustomerModalVisible(false)}
                    confirmLoading={saving}
                >
                    <Form form={form} layout="vertical">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </div>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="addressLine1" label="Address Line 1">
                            <Input />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="city" label="City">
                                <Input />
                            </Form.Item>
                            <Form.Item name="state" label="State">
                                <Input />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="postalCode" label="Zip Code">
                                <Input />
                            </Form.Item>
                            <Form.Item name="country" label="Country">
                                <Input />
                            </Form.Item>
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    };

    const renderEmployeesContent = () => {
        if (loadingEmployees) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading employees...</div>;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
                    <button
                        onClick={handleAddEmployee}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <PlusOutlined /> Add Employee
                    </button>
                </div>
                {employees.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <IdcardOutlined className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">No employees found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.map((e, i) => (
                                        <tr key={e.id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900">{e.firstName} {e.lastName}</td>
                                            <td className="p-4 text-sm text-gray-600">{e.role || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{e.email || "-"}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {e.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal
                    title="Add Employee"
                    open={isEmployeeModalVisible}
                    onOk={handleSaveEmployee}
                    onCancel={() => setIsEmployeeModalVisible(false)}
                    confirmLoading={saving}
                >
                    <Form form={employeeForm} layout="vertical">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </div>
                        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="technician">Technician</Select.Option>
                                <Select.Option value="manager">Manager</Select.Option>
                                <Select.Option value="sales">Sales</Select.Option>
                                <Select.Option value="csr">CSR</Select.Option>
                                <Select.Option value="installer">Installer</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50/50">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 md:h-[calc(100vh-64px)] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
                    <div className="space-y-2">
                        {renderMenuItem('profile', 'Profile', <UserOutlined />)}
                        {renderMenuItem('customers', 'Customers', <TeamOutlined />)}
                        {renderMenuItem('employees', 'Employees', <IdcardOutlined />)}
                        {renderMenuItem('distributorCredentials', 'Distributor Credentials', <KeyOutlined />)}
                        {renderMenuItem('laborRate', 'Labor Rate', <DollarOutlined />)}
                        {renderMenuItem('taxRates', 'Tax Rates', <PercentageOutlined />)}
                        {renderMenuItem('smtp', 'Email (SMTP)', <ThunderboltOutlined />)}
                        {renderMenuItem('userKitPrice', 'User Kit Price', <DollarOutlined />)}
                        {renderMenuItem('userAdasPrice', 'ADAS Pricing', <ScanOutlined />)}
                        {renderMenuItem('specialInstructions', 'Special Instructions', <FileTextOutlined />)}
                        {renderMenuItem('slugConfig', 'AI Chat Config', <KeyOutlined />)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 md:h-[calc(100vh-64px)]">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && renderProfileContent()}
                    {activeTab === 'customers' && renderCustomersContent()}
                    {activeTab === 'employees' && renderEmployeesContent()}
                    {activeTab === 'distributorCredentials' && <DistributorCredentials />}
                    {activeTab === 'laborRate' && <LaborRateConfiguration />}
                    {activeTab === 'taxRates' && <TaxRateConfiguration />}
                    {activeTab === 'smtp' && <SmtpConfiguration />}
                    {activeTab === 'userKitPrice' && <UserKitPricePage />}
                    {activeTab === 'userAdasPrice' && <UserAdasPricePage />}
                    {activeTab === 'specialInstructions' && <SpecialInstructions />}
                    {activeTab === 'slugConfig' && <SlugConfig />}
                </div>
            </div>
        </div>
    );
};

export default Profile;
