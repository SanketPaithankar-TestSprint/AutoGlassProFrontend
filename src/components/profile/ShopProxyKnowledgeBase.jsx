import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Collapse, Typography, Space, List, Tag, Select, Popconfirm, message, Skeleton, Badge, Switch } from 'antd';
import { SaveOutlined, DeleteOutlined, PlusOutlined, DeleteTwoTone, RobotOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getShopProxyKb, upsertShopProxyKb, updateShopProxyKb, deleteShopProxyKb } from '../../api/shopProxyKbApi';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// The 16 fixed dictionary intents matching the Python backend proxy configuration
const INTENT_DICTIONARY = [
    { key: "greeting", label: "Greeting", desc: "How the AI says hello to customers." },
    { key: "general_info", label: "General Info", desc: "Overview of the shop and services." },
    { key: "services", label: "Services", desc: "Detailing the specific types of glass repair provided." },
    { key: "pricing", label: "Pricing", desc: "How to handle questions about cost." },
    { key: "appointment", label: "Appointments", desc: "How to schedule or manage walk-ins." },
    { key: "service_time", label: "Service Time", desc: "How long a typical repair or replacement takes." },
    { key: "insurance", label: "Insurance", desc: "Information on handling insurance claims." },
    { key: "location", label: "Location", desc: "Where the shop is located or mobile radius." },
    { key: "business_hours", label: "Business Hours", desc: "When the shop is open." },
    { key: "vehicle_support", label: "Vehicle Support", desc: "Types of vehicles the shop works on." },
    { key: "urgent_damage", label: "Urgent Damage", desc: "Guidance for severe damage scenarios." },
    { key: "status_followup", label: "Status Follow-up", desc: "How to check on an existing job." },
    { key: "contact", label: "Contact Us", desc: "How to reach the shop manually." },
    { key: "complaint", label: "Complaints", desc: "Escalation procedures for unhappy customers." },
    { key: "safety", label: "Safety Warnings", desc: "Post-installation drive-away safety rules." },
    { key: "closing", label: "Closing", desc: "How the AI ends conversations." },
];

const ShopProxyKnowledgeBase = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [configExists, setConfigExists] = useState(false);
    
    // Core state
    const [shopContext, setShopContext] = useState('');
    const [enableAiResponses, setEnableAiResponses] = useState(false);
    const [intentResponses, setIntentResponses] = useState({});
    
    // UI state for adding new responses
    const [newResponseInputs, setNewResponseInputs] = useState({});

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const res = await getShopProxyKb();
                if (res && res.status === "retrieved") {
                    setConfigExists(true);
                    setShopContext(res.shop_context || '');
                    setEnableAiResponses(res.enable_ai_responses === true);
                    // Normalize intent mappings
                    const incomingIntents = res.intent_responses || {};
                    let initIntents = {};
                    INTENT_DICTIONARY.forEach(intent => {
                        initIntents[intent.key] = Array.isArray(incomingIntents[intent.key]) ? incomingIntents[intent.key] : [];
                    });
                    setIntentResponses(initIntents);
                } else {
                    setConfigExists(false);
                    // Initialize empty
                    let emptyIntents = {};
                    INTENT_DICTIONARY.forEach(intent => { emptyIntents[intent.key] = []; });
                    setIntentResponses(emptyIntents);
                }
            } catch (err) {
                setConfigExists(false);
                // If 404, it just means no config exists yet, not an actual error
                if (err.message && !err.message.includes('not found') && !err.message.includes('404')) {
                    message.error(`Failed to load config: ${err.message}`);
                }
                // Initialize empty
                let emptyIntents = {};
                INTENT_DICTIONARY.forEach(intent => { emptyIntents[intent.key] = []; });
                setIntentResponses(emptyIntents);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Handlers
    const handleSave = async () => {
        if (!shopContext.trim()) {
            message.warning("Shop Context cannot be empty.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                shop_context: shopContext.trim(),
                enable_ai_responses: enableAiResponses,
                intent_responses: intentResponses
            };
            
            if (configExists) {
                await updateShopProxyKb(payload);  // PUT
            } else {
                await upsertShopProxyKb(payload); // POST
                setConfigExists(true);
            }
            
            message.success("AI Knowledge Base successfully saved.");
        } catch (err) {
            message.error(`Failed to save config: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteShopProxyKb();
            message.success("AI Knowledge Base successfully deleted.");
            setConfigExists(false);
            
            // Reset to empty
            setShopContext('');
            setEnableAiResponses(false);
            let emptyIntents = {};
            INTENT_DICTIONARY.forEach(intent => { emptyIntents[intent.key] = []; });
            setIntentResponses(emptyIntents);
            setNewResponseInputs({});
            
        } catch (err) {
            message.error(`Failed to delete config: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddResponse = (intentKey) => {
        const txt = newResponseInputs[intentKey]?.trim();
        if (!txt) return;

        setIntentResponses(prev => ({
            ...prev,
            [intentKey]: [...(prev[intentKey] || []), txt]
        }));
        
        setNewResponseInputs(prev => ({ ...prev, [intentKey]: '' }));
    };

    const handleRemoveResponse = (intentKey, indexToRemove) => {
        setIntentResponses(prev => ({
            ...prev,
            [intentKey]: prev[intentKey].filter((_, i) => i !== indexToRemove)
        }));
    };

    const countTotalResponses = () => {
        return Object.values(intentResponses).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
    };

    if (loading) {
        return <Skeleton active paragraph={{ rows: 12 }} className="p-6 bg-white rounded-lg shadow-sm w-full" />;
    }

    return (
        <div className="w-full text-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white rounded-lg border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <RobotOutlined className="text-violet-600" />
                        AI Agent Proxy Configuration
                    </h2>
                    <Text className="text-slate-500">
                        Define exactly how your AI assistant understands your business and talks to customers.
                    </Text>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <Popconfirm
                        title="Delete AI Configuration?"
                        description="This will instantly remove your proxy setup. The AI will revert to standard behavior."
                        onConfirm={handleDelete}
                        okText="Yes, delete it"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deleting }}
                        disabled={!configExists}
                    >
                        <Button
                            danger
                            type="default"
                            icon={<DeleteOutlined />}
                            disabled={saving || !configExists}
                        >
                            Wipe Configuration
                        </Button>
                    </Popconfirm>

                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                        className="bg-violet-600 hover:bg-violet-500"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200 custom-card">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-[15px] m-0">Shop Context Prompt</h3>
                        <Tag color="purple">Core Memory</Tag>
                    </div>
                    <Text className="text-slate-500 text-sm block mb-3">
                        Write a detailed free-text summary about your auto glass shop. The AI will read this to understand your core business, warranties, and primary focus before talking to any customer. Do not write specific intent responses here.
                    </Text>
                    <TextArea
                        rows={5}
                        value={shopContext}
                        onChange={(e) => setShopContext(e.target.value)}
                        placeholder="e.g., 'Apai Auto Glass is a reliable local shop in NY specializing in dynamic windshield replacement. We focus on OEM glass and fast service...'"
                        className="rounded-lg shadow-inner bg-slate-50 border-slate-300"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <Text className="font-semibold text-[15px]">Enable AI Responses</Text>
                        <Text className="text-slate-500 text-xs">
                            When enabled, the AI will automatically reply to customer inquiries using the knowledge base below.
                        </Text>
                    </div>
                    <Space size="middle">
                        {enableAiResponses ? (
                            <Tag color="success" className="m-0">Active</Tag>
                        ) : (
                            <Tag color="default" className="m-0">Disabled</Tag>
                        )}
                        <Switch 
                            checked={enableAiResponses} 
                            onChange={(checked) => setEnableAiResponses(checked)}
                            className={enableAiResponses ? 'bg-green-500' : 'bg-slate-300'}
                        />
                    </Space>
                </div>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg m-0">Intent Responses</h3>
                    <Tag className="rounded-full bg-slate-100 border-slate-200 text-slate-600">
                        {countTotalResponses()} defined responses across {INTENT_DICTIONARY.length} categories
                    </Tag>
                </div>
                
                <Paragraph className="text-slate-500 text-sm mb-6 max-w-2xl">
                    When the AI detects what a customer is asking (their "Intent"), it randomly pulls one of the responses you define below. By providing multiple varied responses for each intent, your AI will sound more natural and less robotic.
                </Paragraph>

                <Collapse 
                    accordion 
                    defaultActiveKey={['greeting']}
                    className="bg-white border-slate-200 custom-intent-collapse rounded-xl overflow-hidden"
                    expandIconPosition="end"
                >
                    {INTENT_DICTIONARY.map(intent => {
                        const responses = intentResponses[intent.key] || [];
                        const count = responses.length;
                        
                        return (
                            <Panel 
                                key={intent.key} 
                                header={
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-slate-800 min-w-32">{intent.label}</span>
                                            <span className="text-slate-400 text-xs hidden md:inline">{intent.desc}</span>
                                        </div>
                                        <Badge count={count}
                                            style={{ 
                                                backgroundColor: count > 0 ? '#10b981' : '#f1f5f9',
                                                color: count > 0 ? '#fff' : '#64748b'
                                            }}
                                            showZero
                                        />
                                    </div>
                                }
                                className="border-b border-slate-100 "
                            >
                                <div className="p-2 bg-slate-50/50 rounded-lg">
                                    <List
                                        size="small"
                                        dataSource={responses}
                                        locale={{ emptyText: <span className="text-slate-400 text-xs italic">No responses defined. The AI will use standard defaults.</span> }}
                                        renderItem={(resp, i) => (
                                            <List.Item
                                                className="bg-white border border-slate-200 rounded-md mb-2 py-2 px-3 shadow-sm hover:border-violet-300 transition-colors group"
                                                actions={[
                                                    <Button 
                                                        type="text" 
                                                        size="small"
                                                        danger 
                                                        icon={<DeleteTwoTone twoToneColor="#f43f5e" />} 
                                                        onClick={() => handleRemoveResponse(intent.key, i)}
                                                        className="opacity-40 group-hover:opacity-100"
                                                    />
                                                ]}
                                            >
                                                <Typography.Text className="text-sm text-slate-700">{resp}</Typography.Text>
                                            </List.Item>
                                        )}
                                    />
                                    
                                    <div className="mt-4 flex gap-2 w-full max-w-3xl">
                                        <TextArea
                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                            placeholder={`Add a new response for ${intent.label}...`}
                                            value={newResponseInputs[intent.key] || ''}
                                            onChange={(e) => setNewResponseInputs(prev => ({...prev, [intent.key]: e.target.value}))}
                                            onPressEnter={(e) => {
                                                if (!e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddResponse(intent.key);
                                                }
                                            }}
                                            className="rounded-md flex-1 text-sm border-slate-300 shadow-inner bg-white"
                                        />
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAddResponse(intent.key)}
                                            disabled={!newResponseInputs[intent.key]?.trim()}
                                            className="bg-violet-600 hover:bg-violet-500 rounded-md shadow-sm h-auto"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </Panel>
                        );
                    })}
                </Collapse>
            </Card>

            <style jsx global>{`
                .custom-intent-collapse .ant-collapse-header {
                    padding: 14px 16px !important;
                    background-color: white;
                    border-radius: 8px;
                }
                .custom-intent-collapse .ant-collapse-content > .ant-collapse-content-box {
                    padding: 16px 20px;
                    border-top: 1px solid #f1f5f9;
                }
            `}</style>
        </div>
    );
};

// Wrapper for Badge since we used it inline without importing Badge explicitly above to save import real estate, let's fix that.
export default ShopProxyKnowledgeBase;
