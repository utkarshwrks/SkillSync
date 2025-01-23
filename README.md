Content.js:
import React from 'react';
import './components.css';

export default function Content({ isMenuVisible }) {
    return (
        <>
            <div className='content-div flex justify-center items-center h-[37rem]'>
                <a href="/">
                    <button className="btn-53 w-48">
                        <div className="original">Drop Your PDF</div>
                        <div className="letters">
                            <span>D</span>
                            <span>r</span>
                            <span>o</span>
                            <span>p</span>
                        </div>
                    </button>
                </a>
            </div>
            <div 
                className={`bg-black h-full w-60 absolute top-14 right-0 text-white pt-10 ${isMenuVisible ? '' : 'hidden'} hamburger-menu text-center`}
            >
                <ul>
                    <a href="\"><li className='text-xl py-5 px-2'>Home</li></a>
                    <a href="\"><li className='text-xl py-5 px-2'>Something</li></a>
                    <a href="\"><li className='text-xl py-5 px-2'>About</li></a>
                </ul>
            </div>
        </>
    );
}


