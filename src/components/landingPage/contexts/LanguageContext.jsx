import React, { createContext, useContext, useState } from 'react';

// Translation data
const translations = {
    en: {
        // Header content
        headerTitle: "Your Health File, Simplified!",
        headerDescription: "eMediHub transforms healthcare with digital precision—integrating insights, connectivity, and collaboration for smarter, patient-centric care.",
        
        // Navigation
        navHome: "Home",
        navServices: "Services",
        navBlogs: "Blogs", 
        navAbout: "About",
        navContact: "Contact",
        navLogin: "Login / Signup",
        
        // Contact section
        contactTitle: "Contact Us",
        contactDescription: "Get in touch with us for any inquiries about our healthcare services. We're here to help you with your health and wellness needs.",
        contactEmail: "Email",
        contactPhone: "Phone", 
        contactAddress: "Address",
        
        // App download
        downloadApp: "Download Our App:",
        
        // User Doctor Cards
        allUsers: "All Users",
        amazingMates: "Amazing Mates",
        allDoctors: "All Doctors",
        professionalCare: "Professional Care",
        
        // Search Bar
        searchPlaceholder: "Search For Nearby Clinic, Hospital Or Specialist",
        location: "Location",
        detecting: "Detecting...",
        
        // Services
        ourServices: "Our Services",
        comprehensiveCare: "Comprehensive Care at Your Fingertips!",
        comprehensiveCareDesc: "From healthcare to fitness, we've got you covered.",
        
        // Book Appointment
        bookAppointment: "Book Your Appointment",
        bookAppointmentDesc: "Scheduling a consultation with a doctor has never been easier! With our seamless online booking system, you can connect with certified healthcare professionals from the comfort of your home.",
        bookAppointmentBtn: "Book your appointment",
        
        // Online Consultation
        onlineConsultation: "Online Doctor Consultation",
        onlineConsultationDesc: "Connect with experienced doctors anytime, anywhere. Get expert medical advice, prescriptions, and follow-ups from the comfort of your home.",
        consultDoctorBtn: "Consult a doctor online",
        consultTopDoctors: "Consult Top Doctors Anytime, Anywhere!",
        consultTopDoctorsDesc: "Get expert medical advice from certified doctors without leaving your home. Fast, secure, and reliable healthcare at your fingertips.",
        phoneNumberPlaceholder: "Phone Number",
        submitBtn: "Submit",
        
        // Consultation Features
        feature24x7: "24/7 Online Consultation",
        featureSpecialist: "Specialist Appointments",
        featurePrescription: "E-Prescriptions",
        featureFollowup: "Follow-up Consultations",
        
        // Pharmacy
        pharmacy: "Pharmacy",
        pharmacyDesc: "Order prescription and OTC medicines online with ease. Upload your prescription, place an order, and get genuine medicines delivered to your doorstep.",
        orderMedicinesBtn: "Order medicines",
        
        // Lab Tests
        bookLabTests: "Book Lab Tests Online",
        labTestsDesc: "Schedule diagnostic tests at trusted labs with home sample collection, real-time updates, and fast, reliable results.",
        bookLabTestBtn: "Book lab test",
        
        // Health Insurance
        healthInsurance: "Health Insurance",
        healthInsuranceDesc: "Explore, compare, and purchase health insurance plans tailored to your needs, ensuring financial security during medical emergencies.",
        exploreInsuranceBtn: "Explore insurance plans",
        
        // Fitness Classes
        onlineFitnessClasses: "Online Fitness Classes",
        fitnessClassesDesc: "Join expert-led virtual fitness sessions, including yoga, strength training, and wellness programs, for a healthier lifestyle.",
        joinFitnessBtn: "Join fitness class",
        
        // Boot Camp
        bootCamp: "Boot Camp",
        bootCampDesc: "Engage in high-intensity boot camps designed to push your limits, enhance endurance, and achieve your fitness goals.",
        joinBootCampBtn: "Join boot camp",
        
        // Fitness Challenges
        fitnessChallenges: "Fitness Challenges",
        fitnessChallengesDesc: "Take on exciting fitness challenges, track your progress, and stay motivated with a supportive community.",
        takeFitnessChallengeBtn: "Take fitness challenge",
        
        // Services descriptions  
        servicesMainDesc: "We provide comprehensive healthcare services designed to meet your needs with precision and care.",
        
        // News & Articles
        newsArticles: "News & Articles",
        newsArticlesDesc: "We share the latest medical insights and health information to keep you informed about advancements in healthcare.",
        readMore: "Read More",
        
        // Team Section
        meetOurTeam: "Meet Our Team",
        teamDesc: "Our healthcare professionals are dedicated to providing exceptional patient care. With expertise across various medical specialties, our team works collaboratively to deliver innovative solutions and personalized treatment plans.",
        
        // Testimonials
        testimonials: "Testimonials",
        testimonialsDesc: "Hear from our satisfied clients! Real experiences that inspire trust and confidence in our healthcare services.",
        viewStory: "View Story"
    },
    hi: {
        // Header content
        headerTitle: "आपकी स्वास्थ्य फाइल, सरल बनाई गई!",
        headerDescription: "eMediHub डिजिटल परिशुद्धता के साथ स्वास्थ्य सेवा को बदलता है—अंतर्दृष्टि, कनेक्टिविटी और सहयोग को एकीकृत करके स्मार्ट, रोगी-केंद्रित देखभाल के लिए।",
        
        // Navigation
        navHome: "होम",
        navServices: "सेवाएं",
        navBlogs: "ब्लॉग",
        navAbout: "के बारे में",
        navContact: "संपर्क",
        navLogin: "लॉगिन / साइनअप",
        
        // Contact section
        contactTitle: "हमसे संपर्क करें",
        contactDescription: "हमारी स्वास्थ्य सेवाओं के बारे में किसी भी पूछताछ के लिए हमसे संपर्क करें। हम आपकी स्वास्थ्य और कल्याण की जरूरतों में आपकी मदद करने के लिए यहां हैं।",
        contactEmail: "ईमेल",
        contactPhone: "फोन",
        contactAddress: "पता",
        
        // App download
        downloadApp: "हमारा ऐप डाउनलोड करें:",
        
        // User Doctor Cards
        allUsers: "सभी उपयोगकर्ता",
        amazingMates: "अद्भुत साथी",
        allDoctors: "सभी डॉक्टर",
        professionalCare: "व्यावसायिक देखभाल",
        
        // Search Bar
        searchPlaceholder: "आस-पास के क्लिनिक, अस्पताल या विशेषज्ञ खोजें",
        location: "स्थान",
        detecting: "पहचान रहे हैं...",
        
        // Services
        ourServices: "हमारी सेवाएं",
        comprehensiveCare: "आपकी उंगलियों पर व्यापक देखभाल!",
        comprehensiveCareDesc: "स्वास्थ्य सेवा से लेकर फिटनेस तक, हमने आपको कवर किया है।",
        
        // Book Appointment
        bookAppointment: "अपनी नियुक्ति बुक करें",
        bookAppointmentDesc: "डॉक्टर के साथ परामर्श शेड्यूल करना कभी इतना आसान नहीं रहा! हमारे सहज ऑनलाइन बुकिंग सिस्टम के साथ, आप अपने घर के आराम से प्रमाणित स्वास्थ्य पेशेवरों से जुड़ सकते हैं।",
        bookAppointmentBtn: "अपनी नियुक्ति बुक करें",
        
        // Online Consultation
        onlineConsultation: "ऑनलाइन डॉक्टर परामर्श",
        onlineConsultationDesc: "अनुभवी डॉक्टरों से कभी भी, कहीं भी जुड़ें। अपने घर के आराम से विशेषज्ञ चिकित्सा सलाह, नुस्खे और फॉलो-अप प्राप्त करें।",
        consultDoctorBtn: "ऑनलाइन डॉक्टर से सलाह लें",
        consultTopDoctors: "कभी भी, कहीं भी शीर्ष डॉक्टरों से सलाह लें!",
        consultTopDoctorsDesc: "अपने घर छोड़े बिना प्रमाणित डॉक्टरों से विशेषज्ञ चिकित्सा सलाह प्राप्त करें। तेज़, सुरक्षित और विश्वसनीय स्वास्थ्य सेवा।",
        phoneNumberPlaceholder: "फोन नंबर",
        submitBtn: "जमा करें",
        
        // Consultation Features
        feature24x7: "24/7 ऑनलाइन परामर्श",
        featureSpecialist: "विशेषज्ञ नियुक्तियां",
        featurePrescription: "ई-प्रिस्क्रिप्शन",
        featureFollowup: "फॉलो-अप परामर्श",
        
        // Pharmacy
        pharmacy: "फार्मेसी",
        pharmacyDesc: "आसानी से प्रिस्क्रिप्शन और ओटीसी दवाएं ऑनलाइन ऑर्डर करें। अपना प्रिस्क्रिप्शन अपलोड करें, ऑर्डर दें, और वास्तविक दवाएं अपने दरवाजे पर प्राप्त करें।",
        orderMedicinesBtn: "दवाएं ऑर्डर करें",
        
        // Lab Tests
        bookLabTests: "ऑनलाइन लैब टेस्ट बुक करें",
        labTestsDesc: "घर पर नमूना संग्रह, रियल-टाइम अपडेट और तेज़, विश्वसनीय परिणामों के साथ विश्वसनीय लैब में डायग्नोस्टिक टेस्ट शेड्यूल करें।",
        bookLabTestBtn: "लैब टेस्ट बुक करें",
        
        // Health Insurance
        healthInsurance: "स्वास्थ्य बीमा",
        healthInsuranceDesc: "अपनी आवश्यकताओं के अनुसार स्वास्थ्य बीमा योजनाओं का अन्वेषण, तुलना और खरीदारी करें, चिकित्सा आपातकाल के दौरान वित्तीय सुरक्षा सुनिश्चित करें।",
        exploreInsuranceBtn: "बीमा योजनाओं का अन्वेषण करें",
        
        // Fitness Classes
        onlineFitnessClasses: "ऑनलाइन फिटनेस क्लासेज",
        fitnessClassesDesc: "स्वस्थ जीवनशैली के लिए योग, शक्ति प्रशिक्षण और कल्याण कार्यक्रमों सहित विशेषज्ञ-नेतृत्व वाले वर्चुअल फिटनेस सत्रों में शामिल हों।",
        joinFitnessBtn: "फिटनेस क्लास में शामिल हों",
        
        // Boot Camp
        bootCamp: "बूट कैंप",
        bootCampDesc: "अपनी सीमाओं को आगे बढ़ाने, सहनशीलता बढ़ाने और अपने फिटनेस लक्ष्यों को प्राप्त करने के लिए डिज़ाइन किए गए उच्च-तीव्रता बूट कैंप में भाग लें।",
        joinBootCampBtn: "बूट कैंप में शामिल हों",
        
        // Fitness Challenges
        fitnessChallenges: "फिटनेस चुनौतियां",
        fitnessChallengesDesc: "रोमांचक फिटनेस चुनौतियों का सामना करें, अपनी प्रगति ट्रैक करें, और सहायक समुदाय के साथ प्रेरित रहें।",
        takeFitnessChallengeBtn: "फिटनेस चुनौती लें",
        
        // Services descriptions
        servicesMainDesc: "हम आपकी आवश्यकताओं को सटीकता और देखभाल के साथ पूरा करने के लिए डिज़ाइन की गई व्यापक स्वास्थ्य सेवाएं प्रदान करते हैं।",
        
        // News & Articles
        newsArticles: "समाचार और लेख",
        newsArticlesDesc: "हम आपको स्वास्थ्य सेवा में प्रगति के बारे में जानकारी देने के लिए नवीनतम चिकित्सा अंतर्दृष्टि और स्वास्थ्य जानकारी साझा करते हैं।",
        readMore: "और पढ़ें",
        
        // Team Section
        meetOurTeam: "हमारी टीम से मिलें",
        teamDesc: "हमारे स्वास्थ्य पेशेवर असाधारण रोगी देखभाल प्रदान करने के लिए समर्पित हैं। विभिन्न चिकित्सा विशेषताओं में विशेषज्ञता के साथ, हमारी टीम नवाचार समाधान और व्यक्तिगत उपचार योजनाएं प्रदान करने के लिए सहयोग से काम करती है।",
        
        // Testimonials
        testimonials: "प्रशंसापत्र",
        testimonialsDesc: "हमारे संतुष्ट ग्राहकों से सुनें! वास्तविक अनुभव जो हमारी स्वास्थ्य सेवाओं में विश्वास और आत्मविश्वास प्रेरित करते हैं।",
        viewStory: "कहानी देखें"
    },
    kn: {
        // Header content
        headerTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಫೈಲ್, ಸರಳಗೊಳಿಸಲಾಗಿದೆ!",
        headerDescription: "eMediHub ಡಿಜಿಟಲ್ ನಿಖರತೆಯೊಂದಿಗೆ ಆರೋಗ್ಯ ಸೇವೆಯನ್ನು ಪರಿವರ್ತಿಸುತ್ತದೆ—ಒಳನೋಟಗಳು, ಸಂಪರ್ಕತೆ ಮತ್ತು ಸಹಯೋಗವನ್ನು ಸಂಯೋಜಿಸಿ ಸ್ಮಾರ್ಟ್, ರೋಗಿ-ಕೇಂದ್ರಿತ ಆರೈಕೆಗಾಗಿ.",
        
        // Navigation
        navHome: "ಮುಖ್ಯಪುಟ",
        navServices: "ಸೇವೆಗಳು",
        navBlogs: "ಬ್ಲಾಗ್‌ಗಳು",
        navAbout: "ಬಗ್ಗೆ",
        navContact: "ಸಂಪರ್ಕ",
        navLogin: "ಲಾಗಿನ್ / ಸೈನ್‌ಅಪ್",
        
        // Contact section
        contactTitle: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
        contactDescription: "ನಮ್ಮ ಆರೋಗ್ಯ ಸೇವೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ವಿಚಾರಣೆಗಳಿಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಿಮ್ಮ ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮದ ಅಗತ್ಯಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾವು ಇಲ್ಲಿದ್ದೇವೆ.",
        contactEmail: "ಇಮೇಲ್",
        contactPhone: "ಫೋನ್",
        contactAddress: "ವಿಳಾಸ",
        
        // App download
        downloadApp: "ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ:",
        
        // User Doctor Cards
        allUsers: "ಎಲ್ಲಾ ಬಳಕೆದಾರರು",
        amazingMates: "ಅದ್ಭುತ ಸಹಚರರು",
        allDoctors: "ಎಲ್ಲಾ ವೈದ್ಯರು",
        professionalCare: "ವೃತ್ತಿಪರ ಆರೈಕೆ",
        
        // Search Bar
        searchPlaceholder: "ಹತ್ತಿರದ ಕ್ಲಿನಿಕ್, ಆಸ್ಪತ್ರೆ ಅಥವಾ ತಜ್ಞರನ್ನು ಹುಡುಕಿ",
        location: "ಸ್ಥಳ",
        detecting: "ಪತ್ತೆ ಮಾಡುತ್ತಿದೆ...",
        
        // Services
        ourServices: "ನಮ್ಮ ಸೇವೆಗಳು",
        comprehensiveCare: "ನಿಮ್ಮ ಬೆರಳ ತುದಿಯಲ್ಲಿ ಸಮಗ್ರ ಆರೈಕೆ!",
        comprehensiveCareDesc: "ಆರೋಗ್ಯ ಸೇವೆಯಿಂದ ಫಿಟ್‌ನೆಸ್‌ವರೆಗೆ, ನಾವು ನಿಮ್ಮನ್ನು ಕವರ್ ಮಾಡಿದ್ದೇವೆ.",
        
        // Book Appointment
        bookAppointment: "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
        bookAppointmentDesc: "ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆಯನ್ನು ನಿಗದಿಪಡಿಸುವುದು ಎಂದಿಗೂ ಇಷ್ಟು ಸುಲಭವಾಗಿರಲಿಲ್ಲ! ನಮ್ಮ ನಿರ್ಬಾಧ ಆನ್‌ಲೈನ್ ಬುಕಿಂಗ್ ಸಿಸ್ಟಂನೊಂದಿಗೆ, ನಿಮ್ಮ ಮನೆಯ ಸೌಕರ್ಯದಿಂದ ಪ್ರಮಾಣೀಕೃತ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಬಹುದು.",
        bookAppointmentBtn: "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
        
        // Online Consultation
        onlineConsultation: "ಆನ್‌ಲೈನ್ ವೈದ್ಯ ಸಮಾಲೋಚನೆ",
        onlineConsultationDesc: "ಅನುಭವಿ ವೈದ್ಯರೊಂದಿಗೆ ಯಾವುದೇ ಸಮಯ, ಎಲ್ಲಿಯಾದರೂ ಸಂಪರ್ಕ ಸಾಧಿಸಿ. ನಿಮ್ಮ ಮನೆಯ ಸೌಕರ್ಯದಿಂದ ತಜ್ಞ ವೈದ್ಯಕೀಯ ಸಲಹೆ, ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು ಮತ್ತು ಫಾಲೋ-ಅಪ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ.",
        consultDoctorBtn: "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ",
        consultTopDoctors: "ಯಾವುದೇ ಸಮಯ, ಎಲ್ಲಿಯಾದರೂ ಉನ್ನತ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ!",
        consultTopDoctorsDesc: "ನಿಮ್ಮ ಮನೆ ಬಿಡದೆಯೇ ಪ್ರಮಾಣೀಕೃತ ವೈದ್ಯರಿಂದ ತಜ್ಞ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ. ವೇಗ, ಸುರಕ್ಷಿತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಆರೋಗ್ಯ ಸೇವೆ.",
        phoneNumberPlaceholder: "ಫೋನ್ ಸಂಖ್ಯೆ",
        submitBtn: "ಸಲ್ಲಿಸಿ",
        
        // Consultation Features
        feature24x7: "24/7 ಆನ್‌ಲೈನ್ ಸಮಾಲೋಚನೆ",
        featureSpecialist: "ತಜ್ಞ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು",
        featurePrescription: "ಇ-ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು",
        featureFollowup: "ಫಾಲೋ-ಅಪ್ ಸಮಾಲೋಚನೆಗಳು",
        
        // Pharmacy
        pharmacy: "ಫಾರ್ಮಸಿ",
        pharmacyDesc: "ಸುಲಭವಾಗಿ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ಒಟಿಸಿ ಔಷಧಿಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ. ನಿಮ್ಮ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಆರ್ಡರ್ ಮಾಡಿ ಮತ್ತು ನಿಜವಾದ ಔಷಧಿಗಳನ್ನು ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸಿ.",
        orderMedicinesBtn: "ಔಷಧಿಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ",
        
        // Lab Tests
        bookLabTests: "ಆನ್‌ಲೈನ್ ಲ್ಯಾಬ್ ಟೆಸ್ಟ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ",
        labTestsDesc: "ಮನೆಯಲ್ಲಿ ಮಾದರಿ ಸಂಗ್ರಹ, ನೈಜ-ಸಮಯದ ಅಪ್‌ಡೇಟ್‌ಗಳು ಮತ್ತು ವೇಗ, ವಿಶ್ವಾಸಾರ್ಹ ಫಲಿತಾಂಶಗಳೊಂದಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಪ್ರಯೋಗಾಲಯಗಳಲ್ಲಿ ರೋಗನಿರ್ಣಯ ಪರೀಕ್ಷೆಗಳನ್ನು ನಿಗದಿಪಡಿಸಿ.",
        bookLabTestBtn: "ಲ್ಯಾಬ್ ಟೆಸ್ಟ್ ಬುಕ್ ಮಾಡಿ",
        
        // Health Insurance
        healthInsurance: "ಆರೋಗ್ಯ ವಿಮೆ",
        healthInsuranceDesc: "ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಆರೋಗ್ಯ ವಿಮಾ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ, ಹೋಲಿಸಿ ಮತ್ತು ಖರೀದಿಸಿ, ವೈದ್ಯಕೀಯ ತುರ್ತುಸ್ಥಿತಿಯಲ್ಲಿ ಆರ್ಥಿಕ ಭದ್ರತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
        exploreInsuranceBtn: "ವಿಮಾ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
        
        // Fitness Classes
        onlineFitnessClasses: "ಆನ್‌ಲೈನ್ ಫಿಟ್‌ನೆಸ್ ತರಗತಿಗಳು",
        fitnessClassesDesc: "ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿಗಾಗಿ ಯೋಗ, ಸಾಮರ್ಥ್ಯ ತರಬೇತಿ ಮತ್ತು ಯೋಗಕ್ಷೇಮ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಒಳಗೊಂಡಂತೆ ತಜ್ಞ-ನೇತೃತ್ವದ ವರ್ಚುವಲ್ ಫಿಟ್‌ನೆಸ್ ಅಧಿವೇಶನಗಳಲ್ಲಿ ಸೇರಿ.",
        joinFitnessBtn: "ಫಿಟ್‌ನೆಸ್ ತರಗತಿಯಲ್ಲಿ ಸೇರಿ",
        
        // Boot Camp
        bootCamp: "ಬೂಟ್ ಕ್ಯಾಂಪ್",
        bootCampDesc: "ನಿಮ್ಮ ಮಿತಿಗಳನ್ನು ತಳ್ಳಲು, ಸಹನೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಫಿಟ್‌ನೆಸ್ ಗುರಿಗಳನ್ನು ಸಾಧಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಹೆಚ್ಚಿನ-ತೀವ್ರತೆಯ ಬೂಟ್ ಕ್ಯಾಂಪ್‌ಗಳಲ್ಲಿ ತೊಡಗಿಸಿಕೊಳ್ಳಿ.",
        joinBootCampBtn: "ಬೂಟ್ ಕ್ಯಾಂಪ್‌ನಲ್ಲಿ ಸೇರಿ",
        
        // Fitness Challenges
        fitnessChallenges: "ಫಿಟ್‌ನೆಸ್ ಸವಾಲುಗಳು",
        fitnessChallengesDesc: "ರೋಮಾಂಚಕ ಫಿಟ್‌ನೆಸ್ ಸವಾಲುಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ, ನಿಮ್ಮ ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಬೆಂಬಲಿಸುವ ಸಮುದಾಯದೊಂದಿಗೆ ಪ್ರೇರಿತರಾಗಿರಿ.",
        takeFitnessChallengeBtn: "ಫಿಟ್‌ನೆಸ್ ಸವಾಲನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ",
        
        // Services descriptions
        servicesMainDesc: "ನಿಖರತೆ ಮತ್ತು ಆರೈಕೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಸಮಗ್ರ ಆರೋಗ್ಯ ಸೇವೆಗಳನ್ನು ನಾವು ಒದಗಿಸುತ್ತೇವೆ.",
        
        // News & Articles
        newsArticles: "ಸುದ್ದಿ ಮತ್ತು ಲೇಖನಗಳು",
        newsArticlesDesc: "ಆರೋಗ್ಯ ಸೇವೆಯಲ್ಲಿನ ಪ್ರಗತಿಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ತಿಳಿಸಲು ನಾವು ಇತ್ತೀಚಿನ ವೈದ್ಯಕೀಯ ಒಳನೋಟಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತೇವೆ.",
        readMore: "ಹೆಚ್ಚು ಓದಿ",
        
        // Team Section
        meetOurTeam: "ನಮ್ಮ ತಂಡವನ್ನು ಭೇಟಿಮಾಡಿ",
        teamDesc: "ನಮ್ಮ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರು ಅಸಾಧಾರಣ ರೋಗಿ ಆರೈಕೆಯನ್ನು ಒದಗಿಸಲು ಸಮರ್ಪಿತರಾಗಿದ್ದಾರೆ. ವಿವಿಧ ವೈದ್ಯಕೀಯ ವಿಶೇಷತೆಗಳಲ್ಲಿ ಪರಿಣತಿಯೊಂದಿಗೆ, ನಮ್ಮ ತಂಡವು ನವೀನ ಪರಿಹಾರಗಳು ಮತ್ತು ವೈಯಕ್ತೀಕರಿಸಿದ ಚಿಕಿತ್ಸಾ ಯೋಜನೆಗಳನ್ನು ತಲುಪಿಸಲು ಸಹಯೋಗದಿಂದ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
        
        // Testimonials
        testimonials: "ಪ್ರಶಂಸಾಪತ್ರಗಳು",
        testimonialsDesc: "ನಮ್ಮ ತೃಪ್ತ ಗ್ರಾಹಕರಿಂದ ಕೇಳಿ! ನಮ್ಮ ಆರೋಗ್ಯ ಸೇವೆಗಳಲ್ಲಿ ನಂಬಿಕೆ ಮತ್ತು ವಿಶ್ವಾಸವನ್ನು ಪ್ರೇರೇಪಿಸುವ ನಿಜವಾದ ಅನುಭವಗಳು.",
        viewStory: "ಕಥೆಯನ್ನು ವೀಕ್ಷಿಸಿ"
    }
};

// Language list with their native names
export const indianLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

// Create Language Context
const LanguageContext = createContext();

// Language Provider Component
export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    
    const selectLanguage = (languageCode) => {
        setSelectedLanguage(languageCode);
        console.log(`Language changed to: ${languageCode}`);
    };
    
    const translate = (key) => {
        return translations[selectedLanguage]?.[key] || translations['en'][key] || key;
    };
    
    const getCurrentLanguage = () => {
        return indianLanguages.find(lang => lang.code === selectedLanguage) || indianLanguages[0];
    };
    
    const value = {
        selectedLanguage,
        selectLanguage,
        translate,
        getCurrentLanguage,
        indianLanguages
    };
    
    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook to use Language Context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext; 