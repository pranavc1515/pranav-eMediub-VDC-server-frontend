import React from 'react'
import Vector from '../assets/Vector.svg';
import Vector2 from '../assets/Vector2.svg';
import maskGroup from '../assets/Maskgroup.svg';
import OnlineConsultation from "../assets/DoctorConsultation.svg"
import ShieldDone from "../assets/ShieldDone.svg"
function OurServicesCardOne() {
  return (
     <section className=" flex justify-center flex-col items-center  mx-auto py-12 px-4 w-[97%]  ">
          <div className='ourServices w-[263px] flex flex-col items-center'>
             <p className="text-[42px]  font-semibold text-[#011632]">
              Our Services
            </p>
      
            {/* Underline Effect */}
            <img src={Vector} alt="w-[23px]"/>
            </div>
         
      
            {/* Description */}
             <div className='flex flex-col w-full items-center'>
             <p className="text-gray-600 text-lg mt-4">
               Comprehensive Care at Your Fingertips!
             </p>
             <p className="text-gray-500 text-md">
              From healthcare to fitness, we've got you covered.
             </p>
            </div>
         
    
          {/* Section: Book Your Appointment */}
          <div className="ourServicesCardParent flex flex-col lg:flex-row justify-between items-center mt-12 mb-[120px]  w-full ">
           
            <div className=" lg:w-1/2 text-left bookAppointmentOne">
              <h3 className="text-[42px] font-semibold leading-1 text-[#011632]">
                Book Your Appointment
              </h3>
              <img src={Vector} alt=""className='xl:ml-[245px] mt-[10px]'/>
              <p className="text-[#3C4959] font-normal text-[18px] 2xl:w-[687px]  mt-4">
              Scheduling a consultation with a doctor has never been easier! With our seamless online booking system, you can connect with certified healthcare professionals from the comfort of your home. Choose from a wide range of specialists, select a convenient time, and get expert medical advice through secure video calls or chat. Whether you need a quick consultation, a second opinion, or a follow-up, our platform ensures hassle-free and instant access to quality healthcare.
              </p>
             
              <button className="mt-4 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]">
                Book your appointment
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
    
          {/* Section: Online Doctor Consultation */}
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
                Online Doctor Consultation
              </h3>
              <img src={Vector2} alt="" className="xl:ml-[140px] xl:mt-[-15px] mt-[-5px]" />  
              <p className="text-[#3C4959] text-[18px] font-normal xl:w-[444px] mt-4">
                Connect with experienced doctors anytime, anywhere. Get expert 
                medical advice, prescriptions, and follow-ups from the comfort of your home.
              </p>
    
              
              <ul className="mt-[30px] space-y-4">
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                  <img src={ShieldDone} alt='' className=" mr-2" /> 24/7 Online Consultation
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> Specialist Appointments
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> E-Prescriptions
                </li>
                <li className="flex items-center font-[500] text-[18px] text-[#3C4959]">
                <img src={ShieldDone} alt='' className=" mr-2" /> Follow-up Consultations
                </li>
              </ul>
    
              <button className="mt-8 bg-[#1376F8] text-[#FFFFFF] font-semibold text-[16px] w-[227px] h-[55px] rounded-[10px]">
                Consult a doctor online
              </button>
            </div>
          </div>
        </section>
  )
}

export default OurServicesCardOne
