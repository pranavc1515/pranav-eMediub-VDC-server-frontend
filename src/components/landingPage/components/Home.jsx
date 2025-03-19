import React from 'react'
import SearchBar from './SearchBar'
import UserDoctorCards from './UserDoctorCards'
import OurServices from './OurServices'
import DoctorConsultation from './DoctorConsultation'
import NewsArticles from './NewsArticles'
import TestimonialsSlider from './Testimonials'
import TeamSection from './TeamSection'
import '../../landingPage/index.css'
const Home = () => {
    return (
        <div className=" w-full ">
            <SearchBar />
            <UserDoctorCards />
            <OurServices />
            <DoctorConsultation />
            <NewsArticles />
            <TestimonialsSlider />
            <TeamSection />
        </div>
    )
}

export default Home
