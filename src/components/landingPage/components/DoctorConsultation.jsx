import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Vector2 from '../assets/Vector2.svg'
import Marketing from '../assets/Marketing.svg'
import call from '../assets/Call.svg'

const DoctorConsultation = () => {
    const navigate = useNavigate();
    const { translate } = useLanguage();

    const handleSubmit = () => {
        navigate('/sign-in');
    };

    return (
        <div className="ConsultationsSection py-16 px-6 md:px-12 lg:px-20">
            {/* Services Title Section */}
            {/* <div className="text-center mb-12">
                <h2 className="text-[42px] font-semibold text-[#011632]">
                    {translate('ourServices')}
                </h2>
                <img src={Vector2} alt="Divider" className="w-[206px] mx-auto my-2" />
                <p className="text-[#3C4959] font-normal text-[18px] max-w-[550px] mx-auto">
                    {translate('servicesMainDesc')}
                </p>
            </div> */}
            
            {/* Consultation Section */}
            <div className="lg:flex justify-between items-center gap-8">
                <div className="lg:w-1/2">
                    <h3 className="text-[42px] font-semibold text-[#011632] leading-tight">
                        {translate('consultTopDoctors')}
                    </h3>
                    <p className="text-[#3C4959] text-[18px] font-normal max-w-[530px] my-6">
                        {translate('consultTopDoctorsDesc')}
                    </p>
                    <div className="flex items-center pl-[30px] h-[55px] border rounded-lg overflow-hidden shadow-sm max-w-md">
                        <img src={call} className="mr-2" alt="Phone Icon" />
                        <input
                            type="text"
                            placeholder={translate('phoneNumberPlaceholder')}
                            className="w-full py-3 px-4 outline-none text-gray-700"
                        />
                        <button 
                            className="bg-[#1376F8] text-[#FFFFFF] text-[16px] px-6 py-3 h-[55px] font-medium hover:bg-[#0d63d8] transition-colors"
                            onClick={handleSubmit}
                        >
                            {translate('submitBtn')}
                        </button>
                    </div>
                </div>
                
                <div className="lg:w-1/2 mt-8 lg:mt-0 relative h-[320px]">
                    <div className="absolute right-0 w-full lg:w-[90%] h-[280px] rounded-[10px] bg-[linear-gradient(52.56deg,_rgba(37,_180,_248,_0)_0%,_rgba(37,_180,_248,_0.473958)_64.42%,_#25B4F8_126.21%)]"></div>
                    <div className="absolute right-0 lg:right-4 top-[30px] w-full lg:w-[90%]">
                        <img
                            src={Marketing}
                            alt="Doctor Writing"
                            className="rounded-lg shadow-md object-cover relative"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorConsultation
