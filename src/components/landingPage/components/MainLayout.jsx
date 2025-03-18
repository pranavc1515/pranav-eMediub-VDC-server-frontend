import React, { useEffect, useState } from 'react'
// import Medihub from '../assets/Medihub.svg';
// import hambuger_Menu from '../assets/Hamburger_menu.svg';
import images1 from '../assets/image1.svg'
import images2 from '../assets/image2.svg'
import images3 from '../assets/image3.svg'
import images4 from '../assets/image4.svg'
import vector from '../assets/Vector.svg'
import Navbar from './Navbar'
import FooterSection from './FooterSection'

const MainLayout = ({ children }) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const images = [images1, images2, images3, images4]
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                const newIndex = (prevIndex + 1) % images.length
                return newIndex
            })
        }, 5000) // Change image every 5 seconds

        return () => clearInterval(interval)
    }, [])

    const toggleMenu = () => setMenuOpen(!menuOpen)
    return (
        <div className=" w-full ">
            <header
                className="headerSection 
      bg-cover bg-center h-[600px]  transition-all duration-[2500ms] 
       "
                style={{
                    backgroundImage: `url(${images[currentImageIndex]})`,
                }}
            >
                <Navbar />
                <div className="YourHealthSection  pl-[40px] ">
                    <h1 className="text-[64px] font-semibold w-[735px] text-[#011632]">
                        Your Health File, Simplified!!!
                    </h1>
                    <img src={vector} className="w-[25%]" alt="" />
                    <p className="text-[18px] w-[531px] font-[400] text-[#3C4959] pt-[30px]">
                        eMediHub transforms healthcare with digital
                        precision—integrating insights, connectivity, and
                        collaboration for smarter, patient-centric care.
                    </p>
                    <div className="flex  gap-3 pt-3">
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
            <footer>
                <FooterSection />
            </footer>
        </div>
    )
}

export default MainLayout
