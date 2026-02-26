import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "../../api/getProfile";
import { getCustomers } from "../../api/getCustomers";
import { updateProfile } from "../../api/updateProfile";
import { saveUserLogo } from "../../api/saveUserLogo";
import { getValidToken } from "../../api/getValidToken";
import { UserOutlined, TeamOutlined, IdcardOutlined, ShopOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, PlusOutlined, DollarOutlined, ThunderboltOutlined, PercentageOutlined, KeyOutlined, ScanOutlined, FileTextOutlined, UploadOutlined, CalculatorOutlined, MailOutlined, GiftOutlined, CameraOutlined, LinkOutlined } from "@ant-design/icons";
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
import Shops from "./Shops";
import EmployeeManagement from "./EmployeeManagement";
import SlugConfig from "../SlugConfig/SlugConfig";
import { COUNTRIES, getStatesOrProvinces, getCities } from "../../const/locations";
import { useSidebarStore } from '../../store/useSidebarStore';
import { getPageBackground } from '../../const/pageBackgrounds';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const queryClient = useQueryClient();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const setActiveTabBg = useSidebarStore(state => state.setActiveTabBg);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync active tab background: White if desktop (shows sub-menu), standard page bg if mobile
    useEffect(() => {
        if (!isMobile) {
            setActiveTabBg('#ffffff');
        } else {
            setActiveTabBg(getPageBackground('/profile'));
        }
    }, [isMobile, setActiveTabBg]);

    // Modals state
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [form] = Form.useForm();
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
                            <ShopOutlined className="text-violet-500" /> {t('profile.businessInformation')}
                        </h2>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditProfile}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {t('profile.editProfile')}
                        </Button>
                    </div>

                    {/* Logo Section */}
                    <div className="flex flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8 p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="relative w-fit">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 p-1 flex items-center justify-center">
                                <Avatar
                                    size={isMobile ? 60 : 80}
                                    src={logoUrl}
                                    icon={<ShopOutlined />}
                                    className="bg-white text-violet-600 border-0"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900 mb-1">{t('profile.shopLogo')}</h3>
                            <p className="text-xs text-gray-500 mb-2 md:mb-3 leading-tight">
                                {t('profile.uploadLogoDesc')}
                            </p>
                            <ImgCrop rotationSlider showReset aspect={1} modalWidth={isMobile ? 300 : 600}>
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
                                        {uploadingLogo ? t('profile.uploading') : t('profile.changeLogo')}
                                    </Button>
                                </Upload>
                            </ImgCrop>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.businessName')}</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.businessName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.ownerName')}</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.ownerName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.userType')}</span>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {profile.userType || "-"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.businessLicense')}</span>
                            <p className="text-gray-900 font-mono">{profile.businessLicenseNumber || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.ein')}</span>
                            <p className="text-gray-900 font-mono">{profile.ein || "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PhoneOutlined className="text-violet-500" /> {t('profile.contactInformation')}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('auth.email')}</span>
                            <p className="text-gray-900 font-medium">{profile.email || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('contact.phone')}</span>
                            <p className="text-gray-900 font-medium">{profile.phone || "-"}</p>
                        </div>
                        {profile.alternatePhone && (
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.alternatePhone')}</span>
                                <p className="text-gray-900 font-medium">{profile.alternatePhone}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <EnvironmentOutlined className="text-violet-500" /> {t('profile.address')}
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('profile.fullAddress')}</span>
                            <p className="text-gray-900 font-medium">{formatAddress(profile)}</p>
                        </div>
                    </div>
                </div>
                <Modal
                    title={t('profile.editProfile')}
                    open={isEditProfileModalVisible}
                    onOk={handleUpdateProfile}
                    onCancel={() => setIsEditProfileModalVisible(false)}
                    confirmLoading={saving}
                    width={isMobile ? '95%' : 800}
                    style={isMobile ? { maxWidth: 'calc(100vw - 20px)' } : {}}
                >
                    <Form form={profileForm} layout="vertical">
                        {/* ... Business Info Fields ... */}
                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <Form.Item name="businessName" label={t('profile.businessName')} rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="ownerName" label={t('profile.ownerName')}>
                                <Input />
                            </Form.Item>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <Form.Item name="businessNumber" label={t('profile.businessLicense')}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="ein" label={t('profile.ein')}>
                                <Input />
                            </Form.Item>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <Form.Item name="email" label={t('auth.email')} rules={[{ type: 'email', required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label={t('contact.phone')} rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </div>

                        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <Form.Item name="alternatePhone" label={t('profile.alternatePhone')}>
                                <Input />
                            </Form.Item>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">{t('profile.address')}</h4>
                            <Form.Item name="addressLine1" label={t('customers.addressLine1')}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="addressLine2" label={t('profile.addressLine2')}>
                                <Input />
                            </Form.Item>

                            {/* Country First to drive State */}
                            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                <Form.Item name="country" label={t('customers.country')}>
                                    <Select
                                        showSearch
                                        options={COUNTRIES}
                                        onChange={() => {
                                            profileForm.setFieldsValue({ state: null, city: null });
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item name="postalCode" label={t('profile.zipCode')}>
                                    <Input />
                                </Form.Item>
                            </div>

                            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                <Form.Item name="state" label={t('profile.stateProvince')}>
                                    <Select
                                        showSearch
                                        options={states}
                                        disabled={!selectedCountry || states.length === 0}
                                        onChange={() => profileForm.setFieldsValue({ city: null })}
                                    />
                                </Form.Item>
                                <Form.Item name="city" label={t('customers.city')}>
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





    return (
        <div className={`flex flex-col md:flex-row ${isMobile ? 'h-auto' : 'h-screen'} bg-gray-50/50`}>
            {/* Mobile Menu Grid */}
            {isMobile && (
                <div className="w-full bg-white border-b border-gray-200 p-4">
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'profile', label: t('auth.profile'), icon: <UserOutlined /> },
                            { id: 'shops', label: t('profile.shops'), icon: <ShopOutlined /> },
                            { id: 'manageEmployees', label: t('profile.manageEmployees'), icon: <TeamOutlined /> },
                            { id: 'distributorCredentials', label: t('profile.distributorCredentials'), icon: <KeyOutlined /> },
                            { id: 'laborRate', label: t('profile.laborRate'), icon: <CalculatorOutlined /> },
                            { id: 'taxRates', label: t('profile.taxSettings'), icon: <PercentageOutlined /> },
                            { id: 'smtp', label: t('profile.emailSettings'), icon: <MailOutlined /> },
                            { id: 'userKitPrice', label: t('profile.standardKits'), icon: <GiftOutlined /> },
                            { id: 'userAdasPrice', label: t('profile.adasPricing'), icon: <CameraOutlined /> },
                            { id: 'slugConfig', label: t('profile.contactFormConfig'), icon: <LinkOutlined /> }
                        ].map(item => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 text-center ${isActive ? 'bg-violet-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-600'}`}
                                >
                                    <span className="text-lg mb-1">{item.icon}</span>
                                    <span className="text-xs font-semibold leading-tight">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 md:h-[calc(100vh-64px)] overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('profile.menu')}</h2>
                        <div className="space-y-2">
                            {renderMenuItem('profile', t('auth.profile'), <UserOutlined />)}
                            {renderMenuItem('shops', t('profile.shops'), <ShopOutlined />)}
                            {renderMenuItem('manageEmployees', t('profile.manageEmployees'), <TeamOutlined />)}
                            {renderMenuItem('distributorCredentials', t('profile.distributorCredentials'), <KeyOutlined />)}
                            {renderMenuItem('laborRate', t('profile.laborRate'), <CalculatorOutlined />)}
                            {renderMenuItem('taxRates', t('profile.taxSettings'), <PercentageOutlined />)}
                            {renderMenuItem('smtp', t('profile.emailSettings'), <MailOutlined />)}
                            {renderMenuItem('userKitPrice', t('profile.standardKits'), <GiftOutlined />)}
                            {renderMenuItem('userAdasPrice', t('profile.adasPricing'), <CameraOutlined />)}
                            {renderMenuItem('specialInstructions', t('profile.specialInstructions'), <FileTextOutlined />)}
                            {renderMenuItem('slugConfig', t('profile.contactFormConfig'), <LinkOutlined />)}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`${isMobile ? 'w-full h-auto' : 'flex-1 md:h-[calc(100vh-64px)]'} overflow-y-auto overflow-x-hidden p-3 md:p-8`}>
                <div className={`${isMobile ? 'w-full' : 'max-w-4xl'} mx-auto`}>
                    {activeTab === 'profile' && renderProfileContent()}
                    {activeTab === 'shops' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><Shops userProfile={profile} /></div>}
                    {activeTab === 'manageEmployees' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><EmployeeManagement token={token} isMobile={isMobile} /></div>}
                    {activeTab === 'distributorCredentials' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><DistributorCredentials /></div>}
                    {activeTab === 'laborRate' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><LaborRateConfiguration /></div>}
                    {activeTab === 'taxRates' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><TaxRateConfiguration /></div>}
                    {activeTab === 'smtp' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><SmtpConfiguration /></div>}
                    {activeTab === 'userKitPrice' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><UserKitPricePage /></div>}
                    {activeTab === 'userAdasPrice' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><UserAdasPricePage /></div>}
                    {activeTab === 'specialInstructions' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><SpecialInstructions /></div>}
                    {activeTab === 'slugConfig' && <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-8 overflow-x-hidden"><SlugConfig /></div>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
