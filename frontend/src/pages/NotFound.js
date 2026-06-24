import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="gradient-text font-display text-7xl font-extrabold"
      >
        404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-4 font-display text-2xl font-bold text-white"
      >
        This page took a different career path
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mt-3 text-[#a1a1aa]"
      >
        The page you're looking for doesn't exist or has moved.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Back home</Link>
        <Link to="/dashboard" className="btn-ghost">Go to dashboard</Link>
      </motion.div>
    </div>
  );
}
