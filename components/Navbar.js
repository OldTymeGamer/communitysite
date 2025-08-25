import { motion } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-trail-brown nav-border sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Image src="/logo.png" alt="The Lost Trail Logo" width={60} height={60} />
        <div className="flex items-center space-x-8">
          <a href="/" className="text-amber-200 hover:text-amber-400 transition-colors font-medium">Home</a>
          <a href="/about" className="text-amber-200 hover:text-amber-400 transition-colors font-medium">About</a>
          <a href="/rules" className="text-amber-200 hover:text-amber-400 transition-colors font-medium">Rules</a>
          <a href="/gallery" className="text-amber-200 hover:text-amber-400 transition-colors font-medium">Gallery</a>
          <a href="/apply" className="text-amber-200 hover:text-amber-400 transition-colors font-medium">Apply</a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;