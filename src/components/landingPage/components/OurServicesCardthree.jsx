import React from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import Vector from "../assets/Vector.svg";
import Vector2 from "../assets/Vector2.svg";
import healthinsurance from "../assets/HealthInsurence.svg";
import FitnessClasses from "../assets/FitnessClasses.svg";

const OurServicesCardthree = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const handleExploreInsurance = () => {
    navigate('/sign-in');
  };

  const handleJoinFitness = () => {
    navigate('/sign-in');
  };

  return (
     <section className=" flex justify-center flex-col items-center  mx-auto py-12 px-4 w-[97%]  ">
              <div className="ourServicesCardParent flex flex-col lg:flex-row justify-between items-center mt-12 mb-[120px]  w-full  ">
               
                <div className=" lg:w-1/2 text-left bookAppointmenttwo">
                  <h3 className="text-[42px] font-semibold leading-1 text-[#011632]">
                  {translate('healthInsurance')}
                  </h3>
                  <img src={Vector} alt=""className='xl:ml-[14px] w-[40%] mt-[10px]'/>
                  <p className="text-[#3C4959] font-normal text-[18px] 2xl:w-[687px]  mt-4">
                  {translate('healthInsuranceDesc')}
                  </p>
                 
                  <button 
                    className="mt-4 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]"
                    onClick={handleExploreInsurance}
                  >
                    {translate('exploreInsuranceBtn')}
                  </button>
                </div>
        
              
                <div className="ourServicesCard flex justify-center relative lg:mt-0    mt-6  w-full lg:w-[40%] h-[320px] ">
                  <div className="ourServicesGreenCard bg-blue-200  absolute right-0    w-full  lg:w-[350px] h-[280px]  rounded-[10px] bg-[linear-gradient(52.56deg,_rgba(37,_180,_248,_0)_0%,_rgba(37,_180,_248,_0.473958)_64.42%,_#25B4F8_126.21%)] "></div>
                  <div className=' ourServicesImageCardThree absolute bottom-1 right-[30px] top-[30px] lg:w-[350px]       '>
                  <img
                    src={healthinsurance}
                    alt="Doctor Writing"
                    className="rounded-lg shadow-md   object-cover relative xl:h-[280px] "
                  />
                  </div>
                </div>
              </div>
        
              {/* Section: Online Doctor Consultation */}
              <div className=" bg-blue-100 p-8 rounded-lg flex flex-col lg:flex-row items-center w-full xl:h-[554px]" >
             
                <div className="lg:w-1/2 flex justify-center">
                  <img
                    src={FitnessClasses}
                    alt="Online Consultation"
                    className="rounded-lg shadow-md xl:w-[414px] xl:h-[444px] object-cover"
                  />
                </div>
        
            
                <div className="lg:w-1/2   lg:pl-8 mt-6 lg:mt-0">
                  <h3 className="text-[32px] font-semibold text-[#011632]">
                  {translate('onlineFitnessClasses')}
                  </h3>
                  <img src={Vector2} alt="" className="xl:ml-[140px] xl:mt-[-15px] mt-[-5px]" />  
                  <p className="text-[#3C4959] text-[18px] font-normal xl:w-[444px] mt-4">
                  {translate('fitnessClassesDesc')}
                  </p>
        
                  <button 
                    className="mt-8 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]"
                    onClick={handleJoinFitness}
                  >
                    {translate('joinFitnessBtn')}
                  </button>
                </div>
              </div>
            </section>
  );
};

export default OurServicesCardthree;
