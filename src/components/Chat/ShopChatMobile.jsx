import React from 'react';

const ShopChatMobile = ({ mobileView, ConversationList, ChatArea, mobileHeaderHeight = '4rem' }) => {
    return (
        <div
            className="flex flex-col bg-white overflow-hidden"
            style={{ height: `calc(100dvh - ${mobileHeaderHeight})` }}
        >
            {mobileView === 'list' ? (
                <div className="flex flex-col overflow-hidden" style={{ height: '100%', minHeight: 0 }}>
                    {ConversationList}
                </div>
            ) : (
                <div className="flex flex-col overflow-hidden" style={{ height: '100%', minHeight: 0 }}>
                    {ChatArea}
                </div>
            )}
        </div>
    );
};

export default ShopChatMobile;
