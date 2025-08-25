import '../styles/globals.css';
import { motion } from 'framer-motion';

function MyApp({ Component, pageProps }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col relative"
      onMouseMove={(e) => {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        document.querySelectorAll('.dust-particle').forEach((particle, index) => {
          const delay = index * 0.1;
          particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
          particle.style.transition = `transform 0.5s ease-out ${delay}s`;
        });
      }}
    >
      <style jsx global>{`
        body, a, button {
          cursor: url('/cowboy-hat.png') 16 16, url('/cowboy-hat.png'), auto; /* Apply to body, links, and buttons */
          -webkit-cursor: url('/cowboy-hat.png') 16 16, auto; /* Webkit fallback */
        }
        .dust-particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }
        .dust-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(232, 217, 197, 0.5);
          border-radius: 50%;
          opacity: 0.7;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
        }
      `}</style>
      <div className="dust-particles">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="dust-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <Component {...pageProps} />
    </motion.div>
  );
}

export default MyApp;