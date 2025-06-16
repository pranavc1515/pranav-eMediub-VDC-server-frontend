import React from 'react';
import SearchBar from './SearchBar';
import UserDoctorCards from './UserDoctorCards';
import OurServices from './OurServices';
import DoctorConsultation from './DoctorConsultation';
import NewsArticles from './NewsArticles';
import TestimonialsSlider from './Testimonials';
import TeamSection from './TeamSection';
import '../../landingPage/index.css';

const Home = () => {
    return (
        <div className="w-full">
            {/* Home Section */}
            <section id="home" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SearchBar />
                <div className="mt-4 mb-8">
                    <UserDoctorCards />
                </div>
            </section>
            
            {/* Services Section */}
            <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <OurServices />
                </div>
                <div className="mb-12">
                    <DoctorConsultation />
                </div>
            </section>
            
            {/* Blogs/News Section */}
            <section id="blogs" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <NewsArticles />
                </div>
            </section>
            
            {/* About Section */}
            <section id="about">
                <TestimonialsSlider />
                <TeamSection />
            </section>
            
            {/* Contact Section */}
            <section id="contact" className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#011632] mb-4">
                            Contact Us
                        </h2>
                        <p className="text-[#3C4959] text-lg max-w-2xl mx-auto">
                            Get in touch with us for any inquiries about our healthcare services.
                            We're here to help you with your health and wellness needs.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-[#1376F8] text-3xl mb-4">📧</div>
                            <h3 className="text-xl font-semibold text-[#011632] mb-2">Email</h3>
                            <p className="text-[#3C4959]">contact@emediub.com</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-[#1376F8] text-3xl mb-4">📞</div>
                            <h3 className="text-xl font-semibold text-[#011632] mb-2">Phone</h3>
                            <p className="text-[#3C4959]">+91 8805047968</p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-[#1376F8] text-3xl mb-4">📍</div>
                            <h3 className="text-xl font-semibold text-[#011632] mb-2">Address</h3>
                            <p className="text-[#3C4959]">
                                1372/C, 2nd Floor, 32nd E Cross Rd<br />
                                4th T Block East, Jayanagar<br />
                                Bengaluru, Karnataka 560041
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
