import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Vector from '../assets/Vector.svg';
import Vector2 from '../assets/Vector2.svg';
import maskGroup from '../assets/Maskgroup.svg';
import OnlineConsultation from "../assets/DoctorConsultation.svg"
import ShieldDone from "../assets/ShieldDone.svg"

function OurServicesCardOne() {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const handleBookAppointment = () => {
    navigate('/sign-in');
  };

  const handleConsultDoctor = () => {
    navigate('/sign-in');
  };

  return (
     <section className=" flex justify-center flex-col items-center  mx-auto py-12 px-4 w-[97%]  ">
          <div className='ourServices w-[263px] flex flex-col items-center'>
             <p className="text-[42px]  font-semibold text-[#011632]">
              {translate('ourServices')}
            </p>
      
            {/* Underline Effect */}
            <img src={Vector} alt="w-[23px]"/>
            </div>
         
      
            {/* Description */}
             <div className='flex flex-col w-full items-center'>
             <p className="text-gray-600 text-lg mt-4">
               {translate('comprehensiveCare')}
             </p>
             <p className="text-gray-500 text-md">
              {translate('comprehensiveCareDesc')}
             </p>
            </div>
         
    
          {/* Section: Book Your Appointment */}
          <div className="ourServicesCardParent flex flex-col lg:flex-row justify-between items-center mt-12 mb-[120px]  w-full ">
           
            <div className=" lg:w-1/2 text-left bookAppointmentOne">
              <h3 className="text-[42px] font-semibold leading-1 text-[#011632]">
                {translate('bookAppointment')}
              </h3>
              <img src={Vector} alt=""className='xl:ml-[245px] mt-[10px]'/>
              <p className="text-[#3C4959] font-normal text-[18px] 2xl:w-[687px]  mt-4">
              {translate('bookAppointmentDesc')}
              </p>
             
              <button 
                className="mt-4 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]"
                onClick={handleBookAppointment}
              >
                {translate('bookAppointmentBtn')}
              </button>
            </div>
    
          
            <div className="ourServicesCard flex justify-center relative lg:mt-0    mt-6  w-full lg:w-[40%] h-[320px]">
              <div className="ourServicesGreenCard bg-blue-200  absolute right-0    w-full  lg:w-[350px] h-[280px]  rounded-[10px] bg-[linear-gradient(52.56deg,_rgba(37,_180,_248,_0)_0%,_rgba(37,_180,_248,_0.473958)_64.42%,_#25B4F8_126.21%)] "></div>
              <div className=' ourServicesImageCard absolute bottom-1 right-[30px] top-[30px] lg:w-[350px]      '>
              <img
                src={maskGroup}
                alt="Doctor Writing"
                className="rounded-lg shadow-md   object-cover relative  "
              />
              </div>
            </div>
          </div>
    
          {/* Section: Virtual Doctor Consultation */}
          <div className=" bg-blue-100 p-8 rounded-lg flex flex-col lg:flex-row items-center w-full xl:h-[554px]" >
         
            <div className="lg:w-1/2 flex justify-center">
              <img
                src={OnlineConsultation}
                alt="Online Consultation"
                className="rounded-lg shadow-md xl:w-[414px] xl:h-[444px] object-cover"
              />
            </div>
    
        
            <div className="lg:w-1/2   lg:pl-8 mt-6 lg:mt-0">
              <h3 className="text-[32px] font-semibold text-[#011632]">
                {translate('onlineConsultation')}
              </h3>
              <img src={Vector2} alt="" className="xl:ml-[140px] xl:mt-[-15px] mt-[-5px]" />  
              <p className="text-[#3C4959] text-[18px] font-normal xl:w-[444px] mt-4">
                {translate('onlineConsultationDesc')}
              </p>
    
              
              <ul className="mt-[30px] space-y-4">
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                  <img src={ShieldDone} alt='' className=" mr-2" /> {translate('feature24x7')}
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> {translate('featureSpecialist')}
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> {translate('featurePrescription')}
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> {translate('featureFollowup')}
                </li>
              </ul>
    
              <button 
                className="mt-8 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]"
                onClick={handleConsultDoctor}
              >
                {translate('consultDoctorBtn')}
              </button>
            </div>
          </div>
        </section>
  )
}

export default OurServicesCardOne
