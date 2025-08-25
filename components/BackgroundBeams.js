import { motion } from "framer-motion";

const BackgroundBeams = () => (
  <div className="absolute inset-0 z-0">
    <motion.div
      className="absolute w-1/2 h-1/2 bg-amber-800/20 rounded-full filter blur-3xl"
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-1/3 h-1/3 bg-amber-600/30 rounded-full filter blur-2xl"
      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    />
  </div>
);

export default BackgroundBeams;