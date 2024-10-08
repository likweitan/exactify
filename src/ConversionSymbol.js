import React from "react";
import { motion } from "framer-motion";

function ConversionSymbol() {
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "25px" }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="80"
        height="80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {/* Left arrow */}
        <motion.path
          d="M40,50 L25,40 L25,60 Z" // Left arrow shape
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          stroke="currentColor"
        />
        {/* Right arrow */}
        <motion.path
          d="M60,50 L75,40 L75,60 Z" // Right arrow shape
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          stroke="currentColor"
        />
        {/* Circular path around arrows */}
        <motion.path
          d="M50,30 A20,20 0 0,1 50,70 A20,20 0 0,1 50,30" // Circular path
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          stroke="currentColor"
        />
      </motion.svg>
    </div>
  );
}

export default ConversionSymbol;
