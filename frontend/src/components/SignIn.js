import React, { useState, useEffect } from 'react';
import './components.css';
import eyebrowImg from './eyebrow.png';


export default function SignIn() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password visibility
    const [pupilPosition, setPupilPosition] = useState({ x: 32, y: 32 });

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!showPassword) return; // Disable pupil movement when password is hidden

            const { clientX, clientY } = e;

            // Eye ellipse details
            const eyeCenterX = 32; // Center X of the ellipse
            const eyeCenterY = 32; // Center Y of the ellipse
            const eyeRadiusX = 22; // Horizontal radius of the ellipse
            const eyeRadiusY = 12; // Vertical radius of the ellipse

            // Calculate mouse displacement relative to window center
            const dx = clientX - window.innerWidth / 2;
            const dy = clientY - window.innerHeight / 2;

            // Normalize the pupil's position to fit within the ellipse
            const maxRx = eyeRadiusX - 6; // Horizontal boundary for the pupil
            const maxRy = eyeRadiusY - 6; // Vertical boundary for the pupil
            let px = (dx / (window.innerWidth / 2)) * maxRx;
            let py = (dy / (window.innerHeight / 2)) * maxRy;

            // Constrain the pupil position within the elliptical boundary
            const distance = Math.sqrt((px ** 2) / (maxRx ** 2) + (py ** 2) / (maxRy ** 2));
            if (distance > 1) {
                px /= distance; // Scale X to boundary
                py /= distance; // Scale Y to boundary
            }

            // Update the pupil position relative to the eye's center
            setPupilPosition({ x: eyeCenterX + px, y: eyeCenterY + py });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [showPassword]);

    const handleEyeClick = () => {
        setShowPassword(!showPassword);

        // Reset pupil to center when hiding password
        if (!showPassword) {
            setPupilPosition({ x: 32, y: 32 });
        }
    };

    const handleEyeClickConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handlePasswordFocus = () => {
        const centerX = 32;
        const centerY = 32;
        const leftMostX = centerX - 16; // Adjusted to match the left side of the eye
        setPupilPosition({ x: leftMostX, y: centerY });
    };

    return (
        <>
            <h1 className="text-4xl font-serif text-center pt-2 text-[#565353]">Welcome to SkillSync!</h1>
            <div className="flex justify-center items-center">
                <div
                    className={`card-container h-[35rem] w-[30rem] mt-5 border-2 border-white rounded-lg ${
                        isFlipped ? 'flipped' : ''
                    }`}
                >
                    {/* Login Page */}
                    <div className="page front h-full w-full bg-[#d8e8eae6]">
                        <h2 className="text-3xl font-serif text-center mt-14 font-bold">Login</h2>
                        <form className="flex flex-col justify-center items-center h-[50%]">
                            <input
                                type="text"
                                className="h-10 w-80 mt-5 rounded-xl pl-3 font-serif outline-none"
                                placeholder="Username"
                            />
                            <div className="relative mt-5">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="h-10 w-80 rounded-xl pl-3 font-serif outline-none"
                                    placeholder="Password"
                                    onFocus={handlePasswordFocus} // Focus event to move the pupil left
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-blue-500 flex items-center justify-center"
                                    onClick={handleEyeClick}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 64 64"
                                            className="w-8 h-8"
                                        >
                                            {/* Ellipse for the eye */}
                                            <ellipse
                                                cx="32"
                                                cy="32"
                                                rx="22"
                                                ry="12"
                                                fill="none"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                            {/* Pupil */}
                                            <circle
                                                cx={pupilPosition.x}
                                                cy={pupilPosition.y}
                                                r="6"
                                                fill="black"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    ) : (
                                        <img
                                            src={eyebrowImg} // Replace with the actual path to your PNG
                                            alt="Hide Password"
                                            className="w-[1.8rem] h-8"
                                        />
                                    )}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="h-10 w-60 mt-8 rounded-md bg-blue-500 text-white font-bold"
                            >
                                Login
                            </button>
                        </form>
                        <p className="text-center">
                            Don't have an account?{' '}
                            <button onClick={handleFlip} className="text-blue-500">
                                Create account
                            </button>
                        </p>
                    </div>

                    {/* Register Page */}
                    <div className="page back h-full w-full bg-[#dbe1e1cc]">
                        <h2 className="text-3xl font-serif text-center mt-10 font-bold">Register</h2>
                        <form className="flex flex-col justify-center items-center h-[70%]">
                            <input
                                type="text"
                                className="h-10 w-80 mt-2 rounded-xl pl-3 font-serif outline-none"
                                placeholder="Username"
                            />
                            <input
                                type="email"
                                className="h-10 w-80 mt-5 rounded-xl pl-3 font-serif outline-none"
                                placeholder="E-mail"
                            />
                            <input
                                type="text"
                                className="h-10 w-80 mt-5 rounded-xl pl-3 font-serif outline-none"
                                placeholder="Mobile No."
                            />
                            <div className="relative mt-5">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="h-10 w-80 rounded-xl pl-3 font-serif outline-none"
                                    placeholder="Password"
                                    onFocus={handlePasswordFocus} // Focus event to move the pupil left
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-blue-500 flex items-center justify-center"
                                    onClick={handleEyeClick}
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 64 64"
                                            className="w-[1.8rem] h-8"
                                        >
                                            <ellipse
                                                cx="32"
                                                cy="32"
                                                rx="22"
                                                ry="12"
                                                fill="none"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                            <circle
                                                cx={pupilPosition.x}
                                                cy={pupilPosition.y}
                                                r="6"
                                                fill="black"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    ) : (
                                        <img
                                            src={eyebrowImg} // Replace with the actual path to your PNG
                                            alt="Hide Password"
                                            className="w-[1.8rem] h-8"
                                        />
                                    )}
                                </button>
                            </div>

                            <div className="relative mt-5">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="h-10 w-80 rounded-xl pl-3 font-serif outline-none"
                                    placeholder="Confirm Password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-blue-500 flex items-center justify-center"
                                    onClick={handleEyeClickConfirmPassword}
                                >
                                    {showConfirmPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 64 64"
                                            className="w-8 h-8"
                                        >
                                            <ellipse
                                                cx="32"
                                                cy="32"
                                                rx="22"
                                                ry="12"
                                                fill="none"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                            <circle
                                                cx={pupilPosition.x}
                                                cy={pupilPosition.y}
                                                r="6"
                                                fill="black"
                                                stroke="#000"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    ) : (
                                        <img
                                            src={eyebrowImg} // Replace with the actual path to your PNG
                                            alt="Hide Confirm Password"
                                            className="w-8 h-8"
                                        />
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="h-10 w-60 mt-8 rounded-md bg-blue-500 text-white font-bold"
                            >
                                Register
                            </button>
                        </form>
                        <p className="text-center">
                            Already have an account?{' '}
                            <button onClick={handleFlip} className="text-blue-500">
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
