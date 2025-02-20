import React, { useState, useRef } from 'react';
import img1 from './building.png';
import img2 from './bulb.png';
import img3 from './person.png';
import img4 from './book.png';
import img5 from './plane.png';
import img6 from './magnifying.png';
import img7 from './bulb2.png';
import './components.css';

export default function Content() {
    const [resume, setResume] = useState(null);
    const [suggestions, setSuggestions] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setResume(file);
            uploadFile(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResume(file);
            uploadFile(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/upload/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setSuggestions(data.suggestions);
                setError('');
            } else {
                setError(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    return (
        <div>
            <div className='images-content'>
                    <img src={img2} alt="" className='img2 floating h-48 absolute top-32 left-10'/>
                    <img src={img3} alt="" className='img3 floating h-40 absolute top-2 left-[27rem]'/>
                    <img src={img4} alt="" className='img4 floating h-36 absolute top-3 right-[30rem]'/>
                    <img src={img5} alt="" className='img5 floating h-48 absolute right-[5rem] top-20'/>
                    <img src={img6} alt="" className='img6 floating h-48 absolute top-64 left-[20rem]'/>
                    <img src={img7} alt="" className='img7 floating h-48 absolute top-64 right-[25rem]'/>
            </div>
            {/* Content */}
            <div
                className="content-div flex flex-col justify-center items-center min-h-[63.5vh] p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
                <button
                    className={`btn-53 w-48 mt-4 ${resume ? 'no-animation' : ''}`}
                    onClick={handleButtonClick}
                >
                    <div className="original">{resume ? 'Uploaded' : 'Drop Your PDF'}</div>
                    {!resume && (
                        <div className="letters">
                            <span>D</span>
                            <span>r</span>
                            <span>o</span>
                            <span>p</span>
                        </div>
                    )}
                </button>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {suggestions && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md">
                        <h2 className="text-lg font-semibold">Suggestions:</h2>
                        <p>{suggestions}</p>
                    </div>
                )}

            </div>
            <div className='relative bottom-0'>
                <img className='h-[13.5rem] w-full' src={img1} alt="" />
            </div>
        </div>
    );
}
