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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SearchBar />
                <div className="mt-4 mb-8">
                    <UserDoctorCards />
                </div>
                <div className="mb-12">
                    <OurServices />
                </div>
                <div className="mb-12">
                    <DoctorConsultation />
                </div>
                <div className="mb-12">
                    <NewsArticles />
                </div>
            </div>
            <TestimonialsSlider />
            <TeamSection />
        </div>
    );
};

export default Home;
