import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth/useAuth';

const RestrictedAccessModal = ({ visible }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem("ApiToken");
        sessionStorage.removeItem("ApiToken");
        setIsAuthenticated(false);
        navigate('/');
    };

    const handleGoToSearch = () => {
        navigate('/search-by-root');
    };

    return (
        <Modal
            open={visible}
            footer={null}
            closable={false}
            centered
            maskClosable={false}
            className="text-center"
        >
            <div className="flex flex-col items-center justify-center p-6">
                <div className="mb-4 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">{t('restricted.title')}</h2>
                <p className="text-gray-600 mb-6 text-center">
                    {t('restricted.message')}
                </p>
                <div className="flex gap-4">
                    <Button type="primary" onClick={handleGoToSearch}>
                        {t('restricted.goToSearch')}
                    </Button>
                    <Button danger onClick={handleLogout}>
                        {t('auth.logout')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RestrictedAccessModal;
