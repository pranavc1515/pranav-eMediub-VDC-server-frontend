import React from 'react'
import playStore from '../assets/PlayStoreIcon.svg'
import AppleStore from '../assets/AppleStore.svg'
import eMediHubLogo from '../assets/eMediHubLogo.svg'
import FaceBook from '../assets/FaceBook.svg'
import Instagram from '../assets/Instagram.svg'
import Twitter from '../assets/Twitter.svg'
import X from '../assets/X.svg'
import TresImages from '../assets/TreeImages.svg'
const FooterSection = () => {
    return (
        <footer className="bg-[#031026] text-white pb-8 ">
            <div className="container mx-auto flex justify-center items-center h-full flex-col md:flex-row  md:items-start">
                {/* Left Section - Tree Image (Replace 'tree-image.png' with correct path) */}
                <div className="hidden md:block w-1/4 pt-8">
                    <img
                        src={TresImages}
                        alt="Tree Illustration"
                        className="w-full xl:h-[407px]"
                    />
                </div>

                {/* Middle Section - Links */}
                <div className="flex flex-col  pt-8 flex-wrap  h-full ">
                    <div className="flex gap-10 md:gap-16 text-sm h-full mt-10">
                        <div className="flex flex-col space-y-6  text-[20px] text-[#E1E1E1] font-semibold pt-[20px]">
                            <a href="#" className="hover:text-gray-400">
                                Abouts
                            </a>
                            <a href="#" className="hover:text-gray-400">
                                Articles
                            </a>
                            <a href="#" className="hover:text-gray-400">
                                Careers
                            </a>
                            <a href="#" className="hover:text-gray-400">
                                Press
                            </a>
                            <a href="#" className="hover:text-gray-400">
                                Contacts
                            </a>
                        </div>
                        <div className="flex flex-col space-y-6 text-[20px] text-[#E1E1E1] font-semibold pt-[20px]">
                            <a href="#" className="hover:text-gray-400">
                                Help
                            </a>
                            <a href="#" className="hover:text-gray-400">
                                Developers
                            </a>
                        </div>
                    </div>
                    <div className="flex  space-x-6 mt-[50px] ">
                        <a href="#" className="">
                            <img
                                src={FaceBook}
                                alt="Facebook"
                                className="w-[40px] h-[40px]"
                            />
                        </a>
                        <a href="#" className="">
                            <img
                                src={Instagram}
                                alt="Instagram"
                                className="w-[40px] h-[40px]"
                            />
                        </a>
                        <a href="#" className="">
                            <img
                                src={Twitter}
                                alt="Twitter"
                                className="w-[40px] h-[40px]"
                            />
                        </a>
                        <a href="#" className="">
                            <img
                                src={X}
                                alt="Close"
                                className="w-[40px] h-[40px]"
                            />
                        </a>
                    </div>
                </div>

                {/* Right Section - Download Apps & Branding */}
                <div className="flex flex-col items-center md:w-1/4 mt-6 md:mt-0 pt-[80px] ">
                    <h3 className="text-[20px] font-semibold text-[#E1E1E1] mb-3">
                        Download Application
                    </h3>
                    <div className="flex space-x-9">
                        <img
                            src={playStore}
                            alt="Play Store"
                            className="w-[60px] h-[60px]"
                        />
                        <img
                            src={AppleStore}
                            alt="App Store"
                            className="w-[60px] h-[60px]"
                        />
                    </div>

                    {/* Company Logo */}
                    <img
                        src={eMediHubLogo}
                        alt="eMediHub Logo"
                        className="w-[133px] h-[93px] mt-4"
                    />
                </div>
            </div>

            {/* Social Media Icons */}
        </footer>
    )
}

export default FooterSection
