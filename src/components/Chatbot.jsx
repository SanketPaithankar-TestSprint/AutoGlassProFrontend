import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, List, Typography, Spin, FloatButton } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getValidToken } from '../api/getValidToken';

const { Text } = Typography;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! How can I help you regarding AutoGlassPro today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const token = getValidToken();
        setIsAuthenticated(!!token);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Using the endpoint from the user request
            // Parameters: query (string)
            const response = await axios.get(`https://api.autopaneai.com/agp/v1/chatbot-answer`, {
                params: { query: userMessage.text }
            });

            // The API returns a string answer directly or in a specific field?
            // Screenshot shows "Response Body" as a string or JSON. 
            // Usually axios response.data holds the body.
            // Screenshot shows "Get an answer string from the chatbot..."
            // I'll assume response.data is the string or an object with the string.
            // Let's inspect the screenshot again if possible or handle both.
            // The swagger description says "Get String Answer", response type "string".

            const botResponseText = typeof response.data === 'string'
                ? response.data
                : response.data?.answer || JSON.stringify(response.data);

            const botMessage = { id: Date.now() + 1, text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chatbot API Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server right now.",
                sender: 'bot',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    if (!isAuthenticated) return null;

    return (
        <>
            <FloatButton
                icon={<MessageOutlined />}
                type="primary"
                style={{ right: 24, bottom: 24, width: 60, height: 60 }}
                onClick={() => setIsOpen(!isOpen)}
                tooltip="Chat with AI"
            />

            {isOpen && (
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RobotOutlined style={{ color: '#1890ff' }} />
                            <span>APAi Assistant</span>
                        </div>
                    }
                    extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
                    style={{
                        position: 'fixed',
                        bottom: 100,
                        right: 24,
                        width: 380,
                        height: 500,
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 0,
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={messages}
                            renderItem={(item) => (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    {item.sender === 'bot' && (
                                        <div style={{ marginRight: '8px', marginTop: '4px' }}>
                                            <div style={{
                                                width: '28px', height: '28px', background: '#e6f7ff',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <RobotOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '80%',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        background: item.sender === 'user' ? '#1890ff' : '#fff',
                                        color: item.sender === 'user' ? '#fff' : 'rgba(0, 0, 0, 0.85)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        wordBreak: 'break-word',
                                        borderTopLeftRadius: item.sender === 'bot' ? '2px' : '12px',
                                        borderTopRightRadius: item.sender === 'user' ? '2px' : '12px',
                                    }}>
                                        <Text style={{ color: 'inherit' }}>{item.text}</Text>
                                    </div>
                                    {item.sender === 'user' && (
                                        <div style={{ marginLeft: '8px', marginTop: '4px' }}>
                                            <div style={{
                                                width: '28px', height: '28px', background: '#f0f0f0',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <UserOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        <div ref={messagesEndRef} />
                    </div>
                    <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                        <Input.Group compact style={{ display: 'flex' }}>
                            <Input
                                style={{ flex: 1, borderRadius: '20px 0 0 20px' }}
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={handleKeyPress}
                                disabled={isLoading}
                            />
                            <Button
                                type="primary"
                                icon={isLoading ? <Spin size="small" /> : <SendOutlined />}
                                onClick={handleSend}
                                style={{ borderRadius: '0 20px 20px 0' }}
                                disabled={isLoading}
                            />
                        </Input.Group>
                    </div>
                </Card>
            )}
        </>
    );
};

export default Chatbot;
