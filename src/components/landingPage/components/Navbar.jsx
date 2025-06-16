import React, { useState } from 'react'
import MediHub from '../assets/eMidiHub.svg'
import Button3 from '../assets/Button3.svg'
import CloseButton from '../assets/icons8-close.svg'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('English')

    // Indian languages list
    const indianLanguages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
        { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
        { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
        { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
    ]

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    const toggleLanguageDropdown = (e) => {
        e.preventDefault()
        setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
    }

    const selectLanguage = (language) => {
        setSelectedLanguage(language.name)
        setIsLanguageDropdownOpen(false)
        // You can add language change logic here
        console.log(`Language changed to: ${language.name} (${language.code})`)
    }

    // Smooth scroll function
    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault()
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
        // Close mobile menu if open
        if (isMobileMenuOpen) {
            closeMobileMenu()
        }
    }

    return (
        <nav className="navbar flex justify-between gap-[50px] items-center  h-[120px] bg-transparent z-50 w-full">
            <div className="navbarImage text-blue-600 text-2xl ml-[40px] font-bold">
                <img src={MediHub} alt="MediHub Logo" />
            </div>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex justify-between gap-[40px] text-[#011632] font-semibold text-[16px]">
                <li>
                    <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')}>Home</a>
                </li>
                <li>
                    <a href="#services" onClick={(e) => handleSmoothScroll(e, 'services')}>Services</a>
                </li>
                <li>
                    <a href="#blogs" onClick={(e) => handleSmoothScroll(e, 'blogs')}>Blogs</a>
                </li>
                <li>
                    <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')}>About</a>
                </li>
                <li>
                    <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')}>Contact</a>
                </li>
                <li>
                    <a
                        href="sign-in"
                        className=" border-[2px]  border-[#0190CA] text-[#0190CA] py-2 px-4 rounded-md"
                    >
                        Login / Signup
                    </a>
                </li>
                <li className="relative mr-[40px]">
                    <button
                        onClick={toggleLanguageDropdown}
                        className="text-xl flex items-center gap-1 hover:text-[#0190CA] transition-colors"
                    >
                        🌐 <span className="text-sm">▼</span>
                    </button>
                    
                    {/* Language Dropdown */}
                    {isLanguageDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                            <div className="py-1">
                                {indianLanguages.map((language) => (
                                    <button
                                        key={language.code}
                                        onClick={() => selectLanguage(language)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                            selectedLanguage === language.name 
                                                ? 'bg-blue-50 text-[#0190CA] font-semibold' 
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="font-medium">{language.name}</span>
                                        {language.nativeName !== language.name && (
                                            <span className="text-gray-500 ml-2">({language.nativeName})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </li>
            </ul>

            {/* Mobile Menu Button */}
            <button onClick={toggleMobileMenu} className="lg:hidden  pr-4">
                <img src={Button3} alt="Menu" className="w-8 h-8" />
            </button>

            {/* Mobile Menu (Full Width) */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-[#F9F9F9] flex flex-col items-center space-y-4 p-6 h-screen w-full z-50">
                    {/* Close Button */}
                    <button
                        onClick={closeMobileMenu}
                        className="absolute p-[6px] rounded-[10px] top-8 right-4 text-white bg-[#2a7be5] "
                    >
                        <img
                            src={CloseButton}
                            alt="Close Menu"
                            className="w-8 h-8 p-2"
                        />
                    </button>

                    <ul className="space-y-4 text-center text-[#011632] font-semibold text-[16px] mt-12">
                        <li>
                            <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')}>Home</a>
                        </li>
                        <li>
                            <a href="#services" onClick={(e) => handleSmoothScroll(e, 'services')}>Services</a>
                        </li>
                        <li>
                            <a href="#blogs" onClick={(e) => handleSmoothScroll(e, 'blogs')}>Blogs</a>
                        </li>
                        <li>
                            <a href="#about" onClick={(e) => handleSmoothScroll(e, 'about')}>About</a>
                        </li>
                        <li>
                            <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')}>Contact</a>
                        </li>
                        <li>
                            <a href="#login" className=" py-2 px-4 rounded-md">
                                Login / Signup
                            </a>
                        </li>
                        <li className="relative">
                            <button
                                onClick={toggleLanguageDropdown}
                                className="text-xl flex items-center gap-1 justify-center hover:text-[#0190CA] transition-colors"
                            >
                                🌐 <span className="text-sm">▼</span>
                            </button>
                            
                            {/* Mobile Language Dropdown */}
                            {isLanguageDropdownOpen && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                    <div className="py-1">
                                        {indianLanguages.map((language) => (
                                            <button
                                                key={language.code}
                                                onClick={() => selectLanguage(language)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                                    selectedLanguage === language.name 
                                                        ? 'bg-blue-50 text-[#0190CA] font-semibold' 
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                <span className="font-medium">{language.name}</span>
                                                {language.nativeName !== language.name && (
                                                    <span className="text-gray-500 ml-2">({language.nativeName})</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    )
}

export default Navbar
