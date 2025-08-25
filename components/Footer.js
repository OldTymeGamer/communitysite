import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-trail-brown py-8 text-amber-300 text-center nav-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="https://discord.gg/gildedrp" className="social-icon discord-icon text-xl hover:text-[#5865F2]">
            <i className="fab fa-discord"></i>
          </a>
          <a href="#" className="social-icon youtube-icon text-xl hover:text-[#FF0000]">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="#" className="social-icon tiktok-icon text-xl hover:text-[#000000]">
            <i className="fab fa-tiktok"></i>
          </a>
          <a href="#" className="social-icon twitter-icon text-xl hover:text-[#1DA1F2]">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="social-icon patreon-icon text-xl hover:text-[#FF424D]">
            <i className="fab fa-patreon"></i>
          </a>
        </div>
        <p className="text-sm">© 2025 The Lost Trail Roleplay Community. All rights reserved.</p>
        <p className="text-xs mt-2 text-amber-500">RedM is a registered trademark of Cfx.re. This server is not affiliated with Rockstar Games, Take-Two Interactive or Cfx.re.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;