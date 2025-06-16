import React from 'react';
import MainLayout from './components/MainLayout.jsx';
import Home from './components/Home.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';

const LandingPage = () => {
    return (
        <LanguageProvider>
            <MainLayout>
                <Home />
            </MainLayout>
        </LanguageProvider>
    );
};

export default LandingPage;
