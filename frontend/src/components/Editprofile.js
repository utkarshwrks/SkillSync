import { useState } from "react";
import { motion } from "framer-motion";
import praveen from './praveen.jpg'

export default function EditProfile() {
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        mobile: "",
        bio: "",
        github: "",
        linkedin: "",
        profilePic: "",
    });

    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setProfile({ ...profile, profilePic: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <div className="flex justify-center items-center min-h-screen pt-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/60 backdrop-blur-xl p-8 rounded-lg shadow-lg w-[80%] border-2 border-blue-900"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800">Edit Profile</h2>

                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center mt-4">
                        <label htmlFor="profilePic" className="cursor-pointer">
                            <motion.img
                                src={praveen}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-2 border-gray-300"
                                whileHover={{ scale: 1.1 }}
                            />
                        </label>
                        <input
                            type="file"
                            id="profilePic"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    {/* Form Inputs */}
                    <form className="mt-6 flex flex-col justify-center items-center">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="firstName" placeholder="First Name" className="input-field w-96" value={profile.firstName} onChange={handleChange} />
                            <input type="text" name="lastName" placeholder="Last Name" className="input-field w-96" value={profile.lastName} onChange={handleChange} />
                        </div>
                        <input type="text" name="username" placeholder="Username" className="input-field mt-4 w-[49rem]" value={profile.username} onChange={handleChange} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="email" name="email" placeholder="Email" className="input-field mt-4 w-96" value={profile.email} onChange={handleChange} />
                            <input type="text" name="mobile" placeholder="Mobile Number" className="input-field mt-4 w-96" value={profile.mobile} onChange={handleChange} />
                        </div>
                        <textarea name="bio" placeholder="Bio" className="mt-4 h-20 bio-field rounded-xl w-[49rem] pl-2" value={profile.bio} onChange={handleChange}></textarea>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="github" placeholder="GitHub Profile URL" className="input-field mt-4 w-96" value={profile.github} onChange={handleChange} />
                            <input type="text" name="linkedin" placeholder="LinkedIn Profile URL" className="input-field mt-4 w-96" value={profile.linkedin} onChange={handleChange} />
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-[49rem] mt-6 bg-blue-500 text-white p-2 rounded-lg font-semibold"
                        >
                            Save Changes
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </>
    );
}