import React from "react";
import { motion } from "framer-motion";
import praveen from './praveen.jpg';
import mail from './mail.png';

export default function ProfilePage() {
    return (
        <>
            <div className="mt-14">
                <div className="flex flex-col md:flex-row h-[92vh] p-6">
                    {/* Left Sidebar */}
                    <motion.div className="w-full md:w-1/3 bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    >
                        <motion.img
                            src={praveen}
                            alt="Profile"
                            className="w-44 h-48 mx-auto rounded-3xl border-[3px] border-blue-500"
                            whileHover={{ scale: 1.1 }}
                        />
                        <h2 className="text-center text-2xl font-bold mt-4">Praveen Rajak</h2>
                        <p className="text-center text-gray-600">@praveen.rajak.al24@ggits.net</p>
                        <p className="mt-4 text-gray-700 text-center">Frontend Developer | Tech Enthusiast</p>

                        <div className="mt-6 space-y-2">
                            <p className="flex items-center"><img src={mail} className="h-5 m-1" alt="mail icon" />praveen.rajak.al24@ggits.net</p>
                            <p>🔗 <a href="/" className="text-blue-500">GitHub</a> | <a href="/" className="text-blue-500">LinkedIn</a></p>
                        </div>
                        <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                            Edit Profile
                        </button>
                    </motion.div>

                    {/* Right Content */}
                    <main className="w-full md:w-2/3 p-6 space-y-6">
                        {/* Resumes Uploaded */}
                        <motion.div
                            className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h3 className="text-xl font-bold">📄 Resumes Uploaded</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">5</p>
                            <ul className="mt-4 text-gray-700 space-y-2">
                                <li>Resume_1.pdf (Uploaded on Jan 1)</li>
                                <li>Resume_2.pdf (Uploaded on Feb 5)</li>
                            </ul>
                        </motion.div>

                        {/* Jobs Applied */}
                        <motion.div
                            className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h3 className="text-xl font-bold">💼 Jobs Applied</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">8</p>
                            <ul className="mt-4 text-gray-700 space-y-2">
                                <li className="flex">Google - Software Engineer <p className="text-green-700 ml-2">(Pending)</p></li>
                                <li className="flex">Amazon - Frontend Developer <p className="text-red-700 ml-2">(Rejected)</p></li>
                            </ul>
                        </motion.div>
                    </main>
                </div>
            </div>
        </>
    );
}