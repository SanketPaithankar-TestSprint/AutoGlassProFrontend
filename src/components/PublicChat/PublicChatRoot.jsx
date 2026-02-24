// src/components/PublicChat/PublicChatRoot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import { useChat } from '../../context/ChatContext';
import { validateSlug } from '../../api/publicContactForm';
import { Input, Button, Avatar } from 'antd';
import { SendOutlined, ShopOutlined, UserOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import NotFoundPage from '../PublicContact/NotFoundPage';

// ─── Inner chat UI (needs ChatContext) ────────────────────────────────────────
function ChatUI({ businessInfo, isEmbed }) {
    const {
        connectionStatus,
        conversations,
        sendMessage,
        sendCustomerMessage,
        activeConversationId,
        setActiveConversationId,
    } = useChat();

    const themeColor = businessInfo?.themeColor || '#7E5CFE';
    const messagesEndRef = useRef(null);

    const [visitorInfo, setVisitorInfo] = useState({
        name: localStorage.getItem('visitorName') || '',
        email: localStorage.getItem('visitorEmail') || '',
    });
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [inputText, setInputText] = useState('');

    // Reuse stored visitor info
    useEffect(() => {
        const n = localStorage.getItem('visitorName');
        const e = localStorage.getItem('visitorEmail');
        if (n && e) {
            setVisitorInfo({ name: n, email: e });
            setIsFormSubmitted(true);
        }
    }, []);

    const conversation = activeConversationId
        ? conversations[activeConversationId]
        : Object.values(conversations)[0];

    const messages = conversation?.messages || [];

    useEffect(() => {
        if (isFormSubmitted) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isFormSubmitted]);

    useEffect(() => {
        if (!activeConversationId && conversation) {
            setActiveConversationId(conversation.id);
        }
    }, [conversation, activeConversationId, setActiveConversationId]);

    const handleFormSubmit = (e) => {
        e?.preventDefault();
        if (!visitorInfo.name || !visitorInfo.email) return;
        localStorage.setItem('visitorName', visitorInfo.name);
        localStorage.setItem('visitorEmail', visitorInfo.email);
        setIsFormSubmitted(true);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (messages.length === 0) {
            sendCustomerMessage(inputText, visitorInfo.name || 'Visitor', visitorInfo.email || '');
        } else if (conversation?.id) {
            sendMessage(conversation.id, inputText);
        } else {
            sendMessage(null, inputText);
        }
        setInputText('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Branded Header ── */}
            <div className="flex items-center gap-3 p-4 flex-shrink-0 text-white shadow-sm"
                style={{ background: themeColor }}>
                {businessInfo?.logoUrl ? (
                    <img src={businessInfo.logoUrl} alt="logo"
                        className="w-9 h-9 rounded-full object-cover bg-white/20" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <ShopOutlined className="text-xl" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-base leading-tight truncate">
                        {businessInfo?.businessName || 'Support'}
                    </h1>
                    <p className="text-xs text-white/80">
                        {connectionStatus === 'connected' ? '● Online' : '⟳ Connecting…'}
                    </p>
                </div>
                {/* Show "Powered by" only in embed mode */}
                {isEmbed && (
                    <span className="text-[10px] text-white/60 flex-shrink-0">AutoPane</span>
                )}
            </div>

            {!isFormSubmitted ? (
                /* ── Onboarding Form ── */
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ background: `${themeColor}18` }}>
                                <MessageOutlined className="text-3xl" style={{ color: themeColor }} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome!</h2>
                            <p className="text-sm text-slate-500">
                                Enter your details to start chatting with{' '}
                                <span className="font-semibold">{businessInfo?.businessName || 'us'}</span>.
                            </p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Name *</label>
                                <Input
                                    placeholder="Your full name"
                                    value={visitorInfo.name}
                                    onChange={e => setVisitorInfo(p => ({ ...p, name: e.target.value }))}
                                    prefix={<UserOutlined className="text-slate-400" />}
                                    className="rounded-xl py-2.5"
                                    size="large"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
                                <Input
                                    placeholder="your@email.com"
                                    type="email"
                                    value={visitorInfo.email}
                                    onChange={e => setVisitorInfo(p => ({ ...p, email: e.target.value }))}
                                    prefix={<MessageOutlined className="text-slate-400" />}
                                    className="rounded-xl py-2.5"
                                    size="large"
                                />
                            </div>
                            <Button
                                htmlType="submit"
                                type="primary"
                                block
                                size="large"
                                className="rounded-xl h-12 font-bold mt-2 border-0"
                                style={{ background: themeColor }}
                                disabled={!visitorInfo.name.trim() || !visitorInfo.email.trim()}
                            >
                                Start Chat →
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                /* ── Chat Interface ── */
                <>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3"
                        style={{ scrollbarWidth: 'thin' }}>
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6 py-12">
                                <MessageOutlined className="text-5xl mb-4 opacity-20" />
                                <p className="text-sm font-medium text-slate-500">
                                    Hi {visitorInfo.name}! 👋
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    How can we help with your auto glass needs today?
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isShop = msg.senderType?.toUpperCase() === 'SHOP';
                                return (
                                    <div key={idx} className={`flex w-full ${isShop ? 'justify-start' : 'justify-end'}`}>
                                        {isShop && (
                                            <Avatar size="small" icon={<ShopOutlined />}
                                                className="mr-2 mt-1 shrink-0"
                                                style={{ backgroundColor: themeColor }} />
                                        )}
                                        <div className={`
                                            max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words
                                            ${isShop
                                                ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                                                : 'text-white rounded-tr-none'
                                            }
                                        `} style={!isShop ? { backgroundColor: themeColor } : {}}>
                                            <p className="m-0 leading-snug">{msg.message}</p>
                                            <div className={`text-[10px] mt-1 text-right opacity-60
                                                ${isShop ? 'text-slate-500' : 'text-white'}`}>
                                                {moment(msg.timestamp).format('HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Input ── */}
                    <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Type a message…"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onPressEnter={handleSend}
                                disabled={connectionStatus !== 'connected'}
                                className="rounded-full bg-slate-50 border-slate-200"
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<SendOutlined />}
                                onClick={handleSend}
                                disabled={connectionStatus !== 'connected' || !inputText.trim()}
                                style={{ backgroundColor: themeColor, borderColor: themeColor }}
                            />
                        </div>
                        <p className="text-center text-[10px] text-slate-400 mt-2">
                            Powered by <span className="font-semibold">AutoPane</span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Embed Snippet Component ──────────────────────────────────────────────────
function EmbedSnippet({ slug, themeColor }) {
    const [copied, setCopied] = useState(false);
    const origin = window.location.origin;
    const snippet = `<!-- AutoPane Live Chat Widget -->
<script>
(function() {
  var slug = '${slug}';
  var color = '${themeColor || '#7E5CFE'}';
  var chatUrl = '${origin}/contact/' + slug + '/chat?embed=1';

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '.ap-chat-bubble{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;',
    'background:' + color + ';border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.25);',
    'display:flex;align-items:center;justify-content:center;z-index:99999;transition:transform .2s}',
    '.ap-chat-bubble:hover{transform:scale(1.08)}',
    '.ap-chat-iframe{position:fixed;bottom:96px;right:24px;width:380px;height:580px;',
    'border:none;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);z-index:99998;',
    'display:none;overflow:hidden}',
    '@media(max-width:480px){.ap-chat-iframe{width:calc(100vw - 32px);height:70vh;right:16px;bottom:88px}}'
  ].join('');
  document.head.appendChild(style);

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.className = 'ap-chat-iframe';
  iframe.src = chatUrl;
  iframe.title = 'Live Chat';
  document.body.appendChild(iframe);

  // Create bubble
  var btn = document.createElement('button');
  btn.className = 'ap-chat-bubble';
  btn.title = 'Chat with us';
  btn.innerHTML = '<svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  btn.onclick = function() {
    var vis = iframe.style.display === 'block';
    iframe.style.display = vis ? 'none' : 'block';
  };
  document.body.appendChild(btn);

  // Close from iframe message
  window.addEventListener('message', function(e) {
    if (e.data === 'ap-chat-close') iframe.style.display = 'none';
  });
})();
<\/script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Embed on your website</h2>
            <p className="text-sm text-slate-500 mb-4">
                Copy the snippet below and paste it before the <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code> tag on your website. A chat bubble will appear for your visitors.
            </p>
            <div className="relative">
                <pre className="bg-slate-900 text-emerald-300 text-xs p-4 rounded-2xl overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {snippet}
                </pre>
                <button onClick={handleCopy}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: copied ? '#22c55e' : '#7E5CFE', color: '#fff' }}>
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">
                💡 Tip: Change the <code className="bg-slate-100 px-1 rounded">color</code> variable to match your website's brand colour.
            </p>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PublicChatRoot() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const isEmbed = searchParams.get('embed') === '1';

    const [loading, setLoading] = useState(true);
    const [businessInfo, setBusinessInfo] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (!slug) { setLoading(false); return; }
        validateSlug(slug)
            .then(res => {
                if (res.valid && res.data) {
                    setIsValid(true);
                    setUserId(res.data.user_id);
                    setBusinessInfo({
                        businessName: res.data.business_name,
                        themeColor: res.data.theme_color,
                        logoUrl: res.data.logo_url,
                        slug,
                    });
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent" />
            </div>
        );
    }

    if (!isValid) return <NotFoundPage />;

    const themeColor = businessInfo?.themeColor || '#7E5CFE';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#f5f3ff' }}>
            {/* ── Embed mode: just the chat box filling the iframe ── */}
            {isEmbed ? (
                <div className="flex-1 flex flex-col h-screen bg-white overflow-hidden">
                    <ChatProvider isPublic={true} publicUserId={userId}>
                        <ChatUI businessInfo={businessInfo} isEmbed />
                    </ChatProvider>
                </div>
            ) : (
                /* ── Standalone page ── */
                <div className="flex-1 flex flex-col items-center py-8 px-4">
                    {/* Chat card */}
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ minHeight: '560px', maxHeight: '80vh' }}>
                        <ChatProvider isPublic={true} publicUserId={userId}>
                            <ChatUI businessInfo={businessInfo} isEmbed={false} />
                        </ChatProvider>
                    </div>

                    <p className="text-xs text-slate-400 mt-6 mb-4">
                        Powered by <span className="font-semibold">AutoPane</span>
                    </p>
                </div>
            )}
        </div>
    );
}
