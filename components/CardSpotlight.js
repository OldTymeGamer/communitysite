import { motion } from "framer-motion";

const CardSpotlight = ({ children }) => (
  <div className="relative group">
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-amber-200/50 to-amber-800/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
    <div className="relative p-6 rounded-lg text-amber-100">
      {children}
    </div>
  </div>
);

export default CardSpotlight;