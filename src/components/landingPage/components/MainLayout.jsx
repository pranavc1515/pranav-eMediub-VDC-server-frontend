import React, { useEffect, useState } from 'react';
import images1 from '../assets/image1.svg';
import images2 from '../assets/image2.svg';
import images3 from '../assets/image3.svg';
import images4 from '../assets/image4.svg';
import vector from '../assets/Vector.svg';
import GooglePlay from '../assets/googlePlay.svg';
import AppStore from '../assets/AppStore.svg';
import Navbar from './Navbar';
import FooterSection from './FooterSection';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const MainLayout = ({ children }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const images = [images1, images2, images3, images4];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Use Language Context
    const { translate } = useLanguage();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                const newIndex = (prevIndex + 1) % images.length;
                return newIndex;
            });
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    
    return (
        <div className="w-full relative">
            <header
                className="headerSection bg-cover bg-center h-[600px] transition-all duration-[2500ms]"
                style={{
                    backgroundImage: `url(${images[currentImageIndex]})`,
                }}
            >
                <Navbar />
                <div className="YourHealthSection pl-[40px]">
                    <h1 className="text-[64px] font-semibold leading-none w-[735px] text-[#011632]">
                        {translate('headerTitle')}
                    </h1>
                    <img src={vector} className="w-[25%]" alt="Decorative line" />
                    <p className="text-[18px] w-[531px] font-[400] text-[#3C4959] pt-[30px]">
                        {translate('headerDescription')}
                    </p>
                    <div className="flex gap-3 pt-3">
                        {[0, 1, 2, 3].map((index) => (
                            <span
                                key={index}
                                className={`bg-[#CFCFCF] h-4 w-4 rounded-full transition-colors duration-[3000ms] ${
                                    currentImageIndex === index
                                        ? 'bg-blue-500'
                                        : ''
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </header>
            <main className="px-0 py-0">{children}</main>

            {/* Sticky App Store Buttons */}
            <div className="fixed bottom-0 right-0 z-50 flex items-center gap-4 bg-white/80 backdrop-blur-sm p-3 rounded-tl-lg shadow-lg">
                <span className="text-sm font-semibold text-gray-700">{translate('downloadApp')}</span>
                <a href="#" className="transition-transform hover:scale-105">
                    <img src={GooglePlay} alt="Google Play" className="h-10" />
                </a>
                <a href="#" className="transition-transform hover:scale-105">
                    <img src={AppStore} alt="App Store" className="h-10" />
                </a>
            </div>

            <footer>
                <FooterSection />
            </footer>
        </div>
    );
};

export default MainLayout;
