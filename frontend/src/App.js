import './App.css';
import './index.css';
import Navbar from './components/Navbar';
import Content from './components/Content';
import About from './components/About';
import Profile from './components/Profile';
import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import EditProfile from './components/Editprofile';

function App() {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const aboutRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuVisible((prev) => !prev);
    };

    // Function to scroll smoothly to the About section
    const scrollToAbout = () => {
        if (aboutRef.current) {
            aboutRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Router>
            <div className='fixed z-20 top-0 w-full'>
                <Navbar toggleMenu={toggleMenu} />
            </div>
            <Routes>
                <Route path="/login" element={<SignIn pageType="login"/>} />
                <Route
                    path="/"
                    element={
                        <div className='flex flex-col'>
                            {/* Content Section */}
                            <div className='mt-14 sticky top-14 min-h-[100vh] pb-12'>
                                <Content isMenuVisible={isMenuVisible} scrollToAbout={scrollToAbout} />
                            </div>

                            {/* About Section */}
                            <div ref={aboutRef} className='bg-[#cce7fe] z-10 min-h-[100vh] pt-12'>
                                <About />
                            </div>
                        </div>
                    }
                />
                        <Route path="/profile" element={<Profile/>} />
                        <Route path="/editprofile" element={<EditProfile/>} />
            </Routes>
        </Router>
    );
}

export default App;