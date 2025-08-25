import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CardSpotlight from "../components/CardSpotlight";
import BackgroundBeams from "../components/BackgroundBeams";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <div className="video-background">
        <video autoPlay muted loop playsInline id="bgVideo">
          <source src="https://cdn.pixabay.com/video/2022/03/07/110294-652186264_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMEw2MCA2ME02MCAwTDAgNjAiIHN0cm9rZT0iI2U4ZDljNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+')] opacity-20"></div>
      </div>
      <div className="video-overlay"></div>

      <section className="relative py-20 md:py-32 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <BackgroundBeams />
        <div className="gallery-background absolute inset-0 z-0">
          <div className="gallery-images">
            <img src="/gallery1.jpg" alt="Western Scene 1" className="gallery-image" onError={(e) => console.log("Image load error for gallery1.jpg:", e)} />
            <img src="/gallery2.jpg" alt="Western Scene 2" className="gallery-image" onError={(e) => console.log("Image load error for gallery2.jpg:", e)} />
            <img src="/gallery3.jpg" alt="Western Scene 3" className="gallery-image" onError={(e) => console.log("Image load error for gallery3.jpg:", e)} />
            <img src="/gallery4.jpg" alt="Western Scene 4" className="gallery-image" onError={(e) => console.log("Image load error for gallery4.jpg:", e)} />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center, rgba(10,6,2,0) 0%, rgba(10,6,2,0.5) 70%, rgba(10,6,2,0.9) 100%)]"></div>
        </div>
        <div className="cactus">
          <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,10 C60,10 65,30 60,40 C70,45 75,60 65,70 C75,75 70,90 60,100 C65,110 55,130 50,140 L40,140 C35,130 45,110 50,100 C40,90 35,75 45,70 C35,60 40,45 50,40 C45,30 50,10 50,10 Z" fill="#2E8B57"/>
            <path d="M50,70 L50,140" stroke="#3CB371" strokeWidth="5"/>
            <path d="M30,50 L40,60" stroke="#3CB371" strokeWidth="3"/>
            <path d="M70,80 L60,90" stroke="#3CB371" strokeWidth="3"/>
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <h2 className="title-font text-4xl md:text-6xl text-amber-200 mb-4 drop-shadow-lg">THE LOST TRAIL ROLEPLAY</h2>
          <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto drop-shadow-md">Saddle up for the most authentic Wild West experience in RedM with over 9,000 fellow outlaws, lawmen, and pioneers</p>
          <CardSpotlight>
            <a href="https://discord.gg/gildedrp" className="join-btn inline-block px-8 py-4 rounded text-trail-brown font-bold text-lg uppercase tracking-wider">
              Join the Trail
            </a>
          </CardSpotlight>
        </motion.div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="parchment rounded-lg p-8 md:p-12">
            <h2 className="title-font text-3xl md:text-4xl text-center mb-8 text-amber-200">About The Lost Trail</h2>
            <p className="text-lg mb-6">Welcome to The Lost Trail, a premier RedM roleplay community where the spirit of the Wild West comes alive. With over 9,000 dedicated members, we've created an immersive world where every decision shapes your destiny on the frontier.</p>
            <p className="text-lg mb-8">Our server features an authentic Western experience with:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <CardSpotlight>
                <div className="feature-card parchment rounded-lg p-6">
                  <h3 className="title-font text-xl mb-3 text-amber-200">Robust Criminal System</h3>
                  <p>From petty theft to organized crime syndicates, our criminal system offers depth and consequences for every unlawful action.</p>
                </div>
              </CardSpotlight>
              <CardSpotlight>
                <div className="feature-card parchment rounded-lg p-6">
                  <h3 className="title-font text-xl mb-3 text-amber-200">Dynamic Economy</h3>
                  <p>Engage in legitimate businesses or illicit trades in our player-driven economy where supply and demand rule.</p>
                </div>
              </CardSpotlight>
              <CardSpotlight>
                <div className="feature-card parchment rounded-lg p-6">
                  <h3 className="title-font text-xl mb-3 text-amber-200">Law Enforcement RP</h3>
                  <p>Join the sheriff's department and uphold the law in a town where justice is often meted out at the end of a barrel.</p>
                </div>
              </CardSpotlight>
              <CardSpotlight>
                <div className="feature-card parchment rounded-lg p-6">
                  <h3 className="title-font text-xl mb-3 text-amber-200">Authentic Frontier Experience</h3>
                  <p>From cattle ranching to bounty hunting, experience life as it was on the American frontier in the late 1800s.</p>
                </div>
              </CardSpotlight>
            </div>
            <p className="text-lg">Whether you're a seasoned roleplayer or new to the world of RedM, The Lost Trail offers a welcoming community, dedicated staff, and countless opportunities for storytelling in the most dangerous yet exciting period of American history.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-70 z-0"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 container mx-auto max-w-3xl"
        >
          <h2 className="title-font text-3xl md:text-4xl mb-6 text-amber-200">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-10 text-amber-100">Join over 9,000 pioneers in the most authentic Wild West RedM experience</p>
          <a href="https://discord.gg/gildedrp" className="join-btn inline-block px-8 py-4 rounded text-trail-brown font-bold text-lg uppercase tracking-wider">
            Join Our Discord
          </a>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}