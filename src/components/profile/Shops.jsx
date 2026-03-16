import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getShopsByOwner } from "../../api/getShopsByOwner";
import { getAllShops } from "../../api/getAllShops";
import { createShop } from "../../api/createShop";
import { updateShop } from "../../api/updateShop";
import { deleteShop } from "../../api/deleteShop";
import { getValidToken } from "../../api/getValidToken";
import { ShopOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, ReloadOutlined, ClockCircleOutlined, InfoCircleOutlined, PushpinOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, notification, Popconfirm, Switch, TimePicker, Tooltip, Divider } from "antd";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';

const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const Shops = ({ userProfile }) => {
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingShop, setEditingShop] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const userId = userProfile?.userId || userProfile?.id;

    const { data: shopsData, isLoading: loading, refetch } = useQuery({
        queryKey: ['shops', userId],
        queryFn: async () => {
            const token = getValidToken();
            if (!token) throw new Error("No token found. Please login.");

            if (userProfile?.role === 'ADMIN') {
                return await getAllShops(token);
            }

            if (userId) {
                return await getShopsByOwner(token, userId);
            }
            return [];
        },
        enabled: !!userId,
        onError: (err) => {
            console.error(err);
            notification.error({
                message: "Failed to fetch shops",
                description: err.message
            });
        }
    });

    const shops = Array.isArray(shopsData) ? shopsData : (shopsData?.data || []);

    const handleAdd = () => {
        setEditingShop(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (shop) => {
        setEditingShop(shop);

        let openHours = {};
        try {
            if (shop.openHoursJson) {
                openHours = typeof shop.openHoursJson === 'string'
                    ? JSON.parse(shop.openHoursJson)
                    : shop.openHoursJson;
            }
        } catch (e) {
            console.error("Error parsing openHoursJson:", e);
        }

        const formattedOpenHours = {};
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
            const dayData = openHours[day] || {};
            if (dayData.closed || !dayData.intervals || dayData.intervals.length === 0) {
                formattedOpenHours[`${day}_status`] = 'closed';
            } else {
                formattedOpenHours[`${day}_status`] = 'open';
                const interval = dayData.intervals[0];
                formattedOpenHours[`${day}_time`] = [
                    dayjs(interval.from, "HH:mm"),
                    dayjs(interval.to, "HH:mm")
                ];
            }
        });

        form.setFieldsValue({
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            alternatePhone: shop.alternatePhone,
            email: shop.email,
            website: shop.website,
            maps: shop.maps,
            isActive: shop.isActive !== false,
            ...formattedOpenHours
        });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const token = getValidToken();
            if (!token) throw new Error("No token found");

            const openHoursObj = {};
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                const status = values[`${day}_status`];
                const timeRange = values[`${day}_time`];

                if (status === 'closed') {
                    openHoursObj[day] = { closed: true };
                } else {
                    if (timeRange && timeRange.length === 2) {
                        openHoursObj[day] = {
                            intervals: [{
                                from: timeRange[0].format("HH:mm"),
                                to: timeRange[1].format("HH:mm")
                            }]
                        };
                    } else {
                        openHoursObj[day] = {
                            intervals: [{ from: "09:00", to: "17:00" }]
                        };
                    }
                }
            });

            const payload = {
                name: values.name,
                address: values.address,
                phone: values.phone,
                alternatePhone: values.alternatePhone,
                email: values.email,
                website: values.website,
                maps: values.maps,
                isActive: values.isActive,
                openHoursJson: JSON.stringify(openHoursObj)
            };

            if (editingShop) {
                // Backend requires shopId in the body for updates
                await updateShop(editingShop.shopId, payload);
                notification.success({ message: "Shop updated successfully" });
            } else {
                await createShop(token, payload);
                notification.success({ message: "Shop created successfully" });
            }

            setIsModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['shops'] });
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Failed to save shop",
                description: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = getValidToken();
            if (!token) throw new Error("No token found");
            await deleteShop(token, id);
            notification.success({ message: t('shops.title'), description: "Shop deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Failed to delete shop",
                description: err.message
            });
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-lg text-gray-500 animate-pulse">
                Loading shops...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{t('shops.title')}</h2>
                <div className="flex gap-2">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={loading}
                        title="Refresh list"
                    >
                        {t('shops.refresh')}
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        style={{ background: '#2563eb', borderColor: '#2563eb' }}
                    >
                        {t('shops.addShop')}
                    </Button>
                </div>
            </div>

            {(!shops || shops.length === 0) ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <ShopOutlined className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">{t('shops.noShopsFound')}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('shops.createShopToStart')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.isArray(shops) && shops.map((shop) => (
                        <div
                            key={shop.id}
                            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <ShopOutlined className="text-blue-500 flex-shrink-0" />
                                    <span className="font-semibold text-gray-800 text-sm truncate">{shop.name}</span>
                                </div>
                                <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shop.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {shop.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="px-4 py-3 space-y-1.5 flex-1 text-sm text-gray-600">
                                {shop.address && (
                                    <div className="flex items-start gap-2">
                                        <EnvironmentOutlined className="mt-0.5 flex-shrink-0 text-gray-400" />
                                        <span className="text-xs leading-snug">{shop.address}</span>
                                    </div>
                                )}
                                {shop.phone && (
                                    <div className="flex items-center gap-2">
                                        <PhoneOutlined className="flex-shrink-0 text-gray-400" />
                                        <span className="text-xs">{shop.phone}</span>
                                    </div>
                                )}
                                {shop.email && (
                                    <div className="flex items-center gap-2">
                                        <MailOutlined className="flex-shrink-0 text-gray-400" />
                                        <span className="text-xs truncate">{shop.email}</span>
                                    </div>
                                )}
                                {(shop.website || shop.maps) && (
                                    <div className="flex items-center gap-3 pt-0.5">
                                        {shop.website && (
                                            <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                <GlobalOutlined /> Website
                                            </a>
                                        )}
                                        {shop.maps && (
                                            <a href={shop.maps} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                <PushpinOutlined /> Maps
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-end gap-1">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(shop)}
                                    className="text-gray-500 hover:text-blue-600 text-xs"
                                >
                                    Edit
                                </Button>
                                <Popconfirm
                                    title={t('shops.deleteShop')}
                                    description={t('shops.deleteConfirm')}
                                    onConfirm={() => handleDelete(shop.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} className="text-xs">
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </div>
                        </div>
                    ))}
                </div>

            )}

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ShopOutlined />
                        {editingShop ? t('shops.editShop') : t('shops.addShop')}
                    </div>
                }
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={saving}
                okText={editingShop ? t('shops.update') : t('shops.create')}
                width={isMobile ? '95%' : 600}
                style={isMobile ? { maxWidth: 'calc(100vw - 20px)' } : {}}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label={t('shops.shopName')}
                        rules={[{ required: true, message: "Please enter shop name" }]}
                    >
                        <Input placeholder="e.g. Auto Glass Pro - Downtown" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label={t('profile.address')}
                        rules={[{ required: true, message: "Please enter address" }]}
                    >
                        <Input.TextArea placeholder="Full address" rows={3} />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="phone"
                            label={t('contact.phone')}
                            rules={[
                                { required: true, message: "Please enter phone number" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const digitsOnly = value.replace(/\D/g, '');
                                        if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('shops.phoneMustContain')));
                                    }
                                }
                            ]}
                        >
                            <Input
                                placeholder="(555) 123-4567"
                                size="large"
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    form.setFieldValue('phone', formatted);
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="alternatePhone"
                            label="Alternate Phone"
                        >
                            <Input
                                placeholder="(555) 987-6543"
                                size="large"
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    form.setFieldValue('alternatePhone', formatted);
                                }}
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="email"
                            label={t('auth.email')}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                        if (emailRegex.test(value)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(t('shops.invalidEmail')));
                                    }
                                }
                            ]}
                        >
                            <Input placeholder="contact@shop.com" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            label="Shop Status"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="website"
                            label={t('shops.website')}
                            rules={[{ type: 'url', message: t('shops.invalidUrl') }]}
                        >
                            <Input placeholder="https://autoglasspro.com" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="maps"
                            label="Google Maps URL"
                        >
                            <Input placeholder="https://maps.google.com/..." size="large" />
                        </Form.Item>
                    </div>

                    <Divider orientation="left">Operating Hours</Divider>
                    <div className="space-y-1">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <div key={day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="w-16 font-semibold text-gray-500 uppercase text-xs">{day.substring(0, 3)}</span>
                                <div className="flex items-center gap-4">
                                    <Form.Item
                                        name={`${day}_status`}
                                        initialValue="open"
                                        className="mb-0"
                                        valuePropName="checked"
                                        getValueProps={(value) => ({ checked: value === 'open' })}
                                        normalize={(value) => (value ? 'open' : 'closed')}
                                    >
                                        <Switch
                                            size="small"
                                            checkedChildren="OPEN"
                                            unCheckedChildren="CLOSED"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, curr) => prev[`${day}_status`] !== curr[`${day}_status`]}
                                    >
                                        {({ getFieldValue }) => {
                                            const isOpen = getFieldValue(`${day}_status`) === 'open';
                                            return isOpen ? (
                                                <Form.Item
                                                    name={`${day}_time`}
                                                    className="mb-0"
                                                    initialValue={[dayjs("09:00", "HH:mm"), dayjs("17:00", "HH:mm")]}
                                                >
                                                    <TimePicker.RangePicker
                                                        size="small"
                                                        format="h:mm a"
                                                        minuteStep={15}
                                                        use12Hours
                                                        allowClear={false}
                                                    />
                                                </Form.Item>
                                            ) : (
                                                <div className="h-[24px] flex items-center text-gray-400 text-xs italic">Closed for the day</div>
                                            );
                                        }}
                                    </Form.Item>
                                </div>
                            </div>
                        ))}
                    </div>
                </Form>
            </Modal>
        </div >
    );
};

export default Shops;
