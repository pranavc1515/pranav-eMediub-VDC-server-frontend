import React, { useState } from 'react'
import MediHub from '../assets/eMidiHub.svg'
import Button3 from '../assets/Button3.svg'
import CloseButton from '../assets/icons8-close.svg'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <nav className="navbar flex justify-between gap-[50px] items-center  h-[120px] bg-transparent z-50 w-full">
            <div className="navbarImage text-blue-600 text-2xl ml-[40px] font-bold">
                <img src={MediHub} alt="MediHub Logo" />
            </div>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex justify-between gap-[40px] text-[#011632] font-semibold text-[16px]">
                <li>
                    <a href="#home">Home</a>
                </li>
                <li>
                    <a href="#services">Services</a>
                </li>
                <li>
                    <a href="#blogs">Blogs</a>
                </li>
                <li>
                    <a href="#about">About</a>
                </li>
                <li>
                    <a href="#contact">Contact</a>
                </li>
                <li>
                    <a
                        href="sign-in"
                        className=" border-[2px]  border-[#0190CA] text-[#0190CA] py-2 px-4 rounded-md"
                    >
                        Login / Signup
                    </a>
                </li>
                <li>
                    <a href="#language" className="text-xl mr-[40px]">
                        🌐
                    </a>
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
                            <a href="#home">Home</a>
                        </li>
                        <li>
                            <a href="#services">Services</a>
                        </li>
                        <li>
                            <a href="#blogs">Blogs</a>
                        </li>
                        <li>
                            <a href="#about">About</a>
                        </li>
                        <li>
                            <a href="#contact">Contact</a>
                        </li>
                        <li>
                            <a href="#login" className=" py-2 px-4 rounded-md">
                                Login / Signup
                            </a>
                        </li>
                        <li>
                            <a href="#language" className="text-xl">
                                🌐
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    )
}

export default Navbar
