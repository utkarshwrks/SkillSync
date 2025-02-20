import React from 'react'
import { Link } from 'react-router-dom';
import img1 from './file.png'

export default function About() {
  return (
    <>
      <div className='flex'>
        <div className='w-1/2 bg-blue-300 ml-5 h-[40rem] rounded-xl mt-7'>
          <h1 className='text-5xl text-center font-serif pt-12'>About Us</h1>
          <p className='text-[18px] px-3 text-center pt-16'>
            "SkillSync is a next-generation AI-powered career enhancement platform designed to help job seekers across all industries and experience levels optimize their job search journey. Whether you're a fresh graduate stepping into the professional world, an experienced professional seeking career growth, or someone making a career transition, SkillSync provides powerful tools to enhance your applications and maximize your job opportunities.

            At the core of SkillSync is its AI-driven resume and CV optimization feature, which allows users to upload their documents and receive personalized suggestions for improvement. The AI analyzes content, structure, formatting, and keyword relevance based on industry trends and recruiter expectations. It provides actionable insights to enhance clarity, professionalism, and ATS (Applicant Tracking System) compatibility, ensuring that resumes stand out in competitive job markets.</p>
          <div className='flex justify-center text-xl font-serif pt-20'>
            <p>E-mail: skillsync@gmail.com || </p>
            <p className='text-blue-700'><Link to="https://github.com/Team-Vasiliades/SkillSync"><p> &nbsp;Github</p></Link></p>
          </div>
        </div>
        <div className='flex flex-col justify-center items-center w-1/2'>
          <img className='h-[20rem]' src={img1} alt="" />
        </div>
      </div>
    </>
  )
}


