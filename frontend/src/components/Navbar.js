import React, { useState } from 'react';
import './components.css';
import {Link} from 'react-router-dom';

export default function Navbar({ toggleMenu }) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Toggle the hamburger menu visibility based on state
  const handleHamburgerClick = () => {
    // Use the existing toggleMenu function from props
    toggleMenu();
    // Toggle the menu visibility
    setIsMenuVisible((prev) => !prev);
  };

  return (
    <div className="relative navbar-container">
      <div className="h-14 text-black bg-[rgba(255,255,255,0.4)] flex justify-between before-navbar border-b-2 border-white">
        <div className="zIndexEffect flex justify-between w-full group z-10 h-14">
        <Link to="/">
          <div className="italic text-2xl p-2 font-bold w-[50%] z-10 skillsync group-hover:text-white">
            SkillSync
          </div>
          </Link>
          <div className="w-[50%] flex justify-end">
            <Link to="/login">
              <button className="relative z-10 text-black bg-blue-500 h-9 w-16 mx-3 my-[6px] rounded-xl font-bold hover:bg-transparent hover:text-blue-500">
                Log In
              </button>
            </Link>
          </div>
        </div>

      </div>
      <nav className="absolute top-0 left-0 bg-black h-14 w-full navbar flex justify-between after-navbar">
        <div className="relative text-white italic text-2xl p-3 font-bold invisible skillsync-2">SkillSync</div>
        <div className="flex justify-between w-[65%] nav-before-tab">
          <div className="py-3 nav-items">
            <ul className="list-none flex justify-center list-items">
              <li>
                <a className="text-white text-lg px-3" href="#home">Home</a>
              </li>
              <li>
                <a className="text-white text-lg px-3" href="#about">About</a>
              </li>
              <li>
                <a className="text-white text-lg px-3" href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="btn-div">
            <a href="/">
              <button className="text-white font-bold hover:text-blue-500">Sign Up</button>
            </a>
            <a href="/login">
              <button className="text-black bg-blue-500 h-9 w-16 mx-3 my-[6px] rounded-xl font-bold hover:bg-black hover:text-blue-500 invisible">
                Log In
              </button>
            </a>
          </div>
        </div>

        {/* Conditionally show the hamburger-tab-menu based on isMenuVisible */}
        <div className={`flex justify-between w-[60%] hamburger-tab-menu ${isMenuVisible ? '' : 'hidden'}`}>
          <div className="py-3 nav-items">
            <ul className="list-none flex justify-center list-items">
              <li>
                <a className="text-white text-lg px-3" href="#home">Home</a>
              </li>
              <li>
                <a className="text-white text-lg px-3" href="#about">About</a>
              </li>
              <li>
                <a className="text-white text-lg px-3" href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="btn-div">
            <a href="/">
              <button className="text-white font-bold hover:text-blue-500">Sign Up</button>
            </a>
            <a href="/">
              <button href= "/login" className="text-black bg-blue-500 h-9 w-16 mx-3 my-[6px] rounded-xl font-bold hover:bg-black hover:text-blue-500">
                Log In
              </button>
            </a>
          </div>
        </div>

        {/* Hamburger icon */}
        <div className="hamburger pt-1.5 pr-2 h-8 hidden">
          <input type="checkbox" className="hidden" id="checkbox" />
          <label
            htmlFor="checkbox"
            className="relative w-10 h-10 cursor-pointer flex flex-col justify-center items-center gap-2 duration-500 toggle"
            onClick={handleHamburgerClick} // Use the updated function here
          >
            <div className="bars w-full h-1 bg-white rounded" id="bar1"></div>
            <div className="bars w-full h-1 bg-white rounded" id="bar2"></div>
            <div className="bars w-full h-1 bg-white rounded" id="bar3"></div>
          </label>
        </div>
      </nav>
    </div>
  );
}
