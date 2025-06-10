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
        <div className="w-full bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                            Healthcare Made Simple
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
                            Your trusted healthcare companion providing quality medical services
                        </p>
                        <div className="mt-8">
                            <SearchBar />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <section className="mb-16">
                    <UserDoctorCards />
                </section>
                
                <section className="mb-16">
                    <OurServices />
                </section>
                
                <section className="mb-16">
                    <DoctorConsultation />
                </section>
                
                <section className="mb-16">
                    <NewsArticles />
                </section>
            </div>
            
            {/* Full Width Sections */}
            <section className="py-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <TestimonialsSlider />
                </div>
            </section>
            
            <section className="py-12 bg-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <TeamSection />
                </div>
            </section>
        </div>
    );
};

export default Home;
