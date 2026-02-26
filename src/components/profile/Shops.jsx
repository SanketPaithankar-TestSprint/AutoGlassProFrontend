import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getShopsByOwner } from "../../api/getShopsByOwner";
import { getAllShops } from "../../api/getAllShops";
import { createShop } from "../../api/createShop";
import { updateShop } from "../../api/updateShop";
import { deleteShop } from "../../api/deleteShop";
import { getValidToken } from "../../api/getValidToken";
import { ShopOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, ReloadOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, notification, Popconfirm, Card, Empty, Tag } from "antd";
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
        form.setFieldsValue({
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            email: shop.email,
            website: shop.website
        });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const token = getValidToken();
            if (!token) throw new Error("No token found");

            if (editingShop) {
                await updateShop(token, editingShop.id, values);
                notification.success({ message: "Shop updated successfully" });
            } else {
                // userId is handled by backend from token
                await createShop(token, values);
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
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShopOutlined className="text-violet-500" />
                    {t('shops.title')}
                </h2>
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
                        className="bg-violet-600 hover:bg-violet-700"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(shops) && shops.map((shop) => (
                        <Card
                            key={shop.id}
                            actions={[
                                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(shop)} key="edit">{t('shops.editShop')}</Button>,
                                <Popconfirm
                                    title={t('shops.deleteShop')}
                                    description={t('shops.deleteConfirm')}
                                    onConfirm={() => handleDelete(shop.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                    key="delete"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />}>{t('shops.deleteShop')}</Button>
                                </Popconfirm>
                            ]}
                        >
                            <Card.Meta
                                avatar={<div className="bg-violet-100 p-2 rounded-lg"><ShopOutlined className="text-violet-600 text-xl" /></div>}
                                title={<span className="text-lg font-semibold">{shop.name}</span>}
                                description={
                                    <div className="space-y-2 mt-2">
                                        {shop.address && (
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <EnvironmentOutlined className="mt-1 flex-shrink-0" />
                                                <span className="text-sm">{shop.address}</span>
                                            </div>
                                        )}
                                        {shop.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <PhoneOutlined className="flex-shrink-0" />
                                                <span className="text-sm">{shop.phone}</span>
                                            </div>
                                        )}
                                        {shop.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MailOutlined className="flex-shrink-0" />
                                                <span className="text-sm">{shop.email}</span>
                                            </div>
                                        )}
                                        {shop.website && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <GlobalOutlined className="flex-shrink-0" />
                                                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline truncate block">
                                                    {shop.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </Card>
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
                    </div>

                    <Form.Item
                        name="website"
                        label={t('shops.website')}
                        rules={[{ type: 'url', message: t('shops.invalidUrl') }]}
                    >
                        <Input placeholder="https://autoglasspro.com" size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default Shops;
