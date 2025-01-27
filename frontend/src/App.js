import './App.css';
import './index.css';
import Navbar from './components/Navbar';
import Content from './components/Content';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';

function App() {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = () => {
        setIsMenuVisible((prev) => !prev);
    };

    return (
        <> 
        <Router>
            <Navbar toggleMenu={toggleMenu} />
                <div>
                    <Routes>
                        {/* Route for SignIn */}
                        <Route path="/login" element={<SignIn />} />

                        {/* Default Route for Content */}
                        <Route path="/" element={<Content isMenuVisible={isMenuVisible} />} />
                    </Routes>
                </div>
            </Router>
        </>
    );
}

export default App;