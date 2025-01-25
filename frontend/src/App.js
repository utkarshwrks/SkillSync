import './App.css';
import './index.css';
import Navbar from './components/Navbar';
import Content from './components/Content';
import React, { useState } from 'react';

function App() {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = () => {
        setIsMenuVisible((prev) => !prev);
    };

    return (
        <>
            <div>
                <Navbar toggleMenu={toggleMenu} />
                <Content isMenuVisible={isMenuVisible} />
            </div>
        </>
    );
}

export default App;