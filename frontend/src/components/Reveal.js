import React from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "../lib/motion";

/**
 * Scroll-reveal wrapper. Children animate in as the block enters the viewport.
 * - <Reveal> a single block (fadeUp)
 * - <Reveal stagger> a container whose direct <Reveal.Item> children stagger in
 */
export default function Reveal({ children, className = "", stagger: useStagger = false, ...rest }) {
  return (
    <motion.div
      className={className}
      variants={useStagger ? stagger : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

Reveal.Item = function Item({ children, className = "", ...rest }) {
  return (
    <motion.div className={className} variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  );
};
