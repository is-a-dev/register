import Image from "next/image"
import LinkCard from "@/components/LinkCard"
import SocialRow from "@/components/SocialRow"
import ProfileHeader from "@/components/ProfileHeader"
import TopActionBar from "@/components/TopActionBar"
import { getLinks } from "@/lib/firebase"
import { USER_LINKS } from "@/lib/links"

export const dynamic = "force-dynamic"

export default async function Home() {
  const firebaseLinks = await getLinks()
  const links = firebaseLinks && firebaseLinks.length > 0 ? firebaseLinks : USER_LINKS

  // Randomize the featured video on every load
  const videoIds = [
    "oafxkMv4xnc", // Original
    "ebZj_nrmH-c",
    "L3wKzyIN1yk",
    "VPbOaMovTg0",
  ]
  const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)]

  return (
    <main 
      className="w-full min-h-screen flex flex-col items-center pb-24 relative overflow-x-hidden"
      style={{
        background: "radial-gradient(circle at 15% 50%, #dcfce7, transparent 50%), radial-gradient(circle at 85% 30%, #f0fdf4, transparent 50%), radial-gradient(circle at 50% 80%, #ecfdf5, transparent 50%), #ffffff",
        backgroundAttachment: "fixed"
      }}
    >
      
      {/* Cool SVG Background Patterns */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <svg className="absolute top-[-10%] left-[-15%] w-[80%] md:w-[50%] h-auto opacity-[0.04] text-green-900 animate-breathe" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.1,-2.4C97.4,13.2,91.9,28.9,81.8,41.5C71.7,54.1,56.9,63.6,41.4,70.1C25.9,76.6,9.6,80.1,-6.1,79.5C-21.8,78.9,-37.2,74.1,-50.8,65.8C-64.4,57.5,-76.1,45.7,-82.9,31.7C-89.7,17.7,-91.6,1.4,-88.2,-13.4C-84.8,-28.2,-76.1,-41.4,-64.4,-51.7C-52.7,-62,-38.1,-69.3,-24.1,-74.6C-10.1,-79.9,3.3,-83.1,16.4,-81.4C29.5,-79.7,42.6,-73,50.7,-64.7Z" transform="translate(100 100) scale(1.1)" />
        </svg>
        <svg className="absolute bottom-[-5%] right-[-20%] w-[90%] md:w-[60%] h-auto opacity-[0.05] text-green-800 animate-breathe" style={{ animationDelay: '-7.5s' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M47.7,-73.2C61,-64.5,70.5,-50.2,78.2,-34.5C85.9,-18.8,91.8,-1.7,87.6,12.7C83.4,27.1,69,38.8,55.4,49.2C41.8,59.6,29.1,68.7,14,75.1C-1.1,81.5,-18.6,85.2,-33.3,79.9C-48,74.6,-59.8,60.3,-69.7,44.9C-79.6,29.5,-87.6,13,-85.4,-1.8C-83.2,-16.6,-70.8,-29.7,-58.5,-40.5C-46.2,-51.3,-34,-59.8,-21.1,-67.6C-8.2,-75.4,5.4,-82.5,20.1,-81.7C34.8,-80.9,50.6,-72.2,47.7,-73.2Z" transform="translate(100 100) scale(1.2)" />
        </svg>
      </div>
      <div className="w-full max-w-[480px] px-4 py-8 flex flex-col pt-8 md:pt-12">
        
        {/* Top Action Bar (Client Component for sharing) */}
        <TopActionBar />

        {/* Profile Header Block */}
        <ProfileHeader />

        {/* Social Icons row (centered) */}
        <div className="flex justify-center items-center w-full mb-10 md:mb-12 animate-fade-in-up delay-100">
          <SocialRow />
        </div>

        {/* Recent YouTube Upload Block */}
        <div className="w-full flex flex-col mb-10 animate-fade-in-up delay-200">
          <h3 className="text-slate-500 font-medium text-[0.95rem] mb-4 text-left px-2 uppercase tracking-wider">Recent Video</h3>
          <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-white/40 ring-1 ring-white/60 shadow-xl shadow-green-900/5 relative">
             <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${randomVideoId}?controls=1&modestbranding=1&rel=0`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="encrypted-media;picture-in-picture" 
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
             >
             </iframe>
          </div>
        </div>

        {/* Notes Block (Exactly below video, matching Beacons layout) */}
        <div className="glass-panel w-full p-6 mb-10 flex flex-col items-center text-center animate-fade-in-up delay-300">
          <h4 className="text-slate-800 text-[1.2rem] leading-[1.3] font-medium w-full mb-3 tracking-tight">
             Code is poetry in motion.
          </h4>
          <p className="text-slate-500 text-[0.95rem] leading-relaxed font-normal">
            Architecting elegant solutions, building systems that scale, and pushing the boundaries of what is possible on the web.
          </p>
        </div>

        {/* Links Column */}
        <div className="w-full flex flex-col gap-1">
          {links.map((link, index) => (
            <LinkCard
              key={link.id}
              title={link.title}
              subtitle={link.subtitle}
              url={link.url}
              iconUrl={link.iconUrl}
              delay={index + 1}
            />
          ))}
        </div>
      </div>

      {/* Fixed Footer Sticky Pill - Clickable link to actual portfolio */}
      <a 
        href="https://rajs.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[400px] glass-panel !rounded-[24px] py-4 px-5 flex justify-between items-center z-50 cursor-pointer transition-all hover:scale-[1.02] animate-fade-in-up delay-500"
        title="Visit my main portfolio"
      >
        <div className="flex items-center gap-3 text-slate-800 font-medium text-[0.95rem]">
          <div className="bg-green-100 p-1.5 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-700">
               <circle cx="12" cy="7" r="3.2" />
               <circle cx="7" cy="16" r="3.2" />
               <circle cx="17" cy="16" r="3.2" />
            </svg>
          </div>
          Biswadeep Tewari
        </div>
        <div className="text-slate-500 font-medium text-[0.9rem] flex items-center gap-1">
          Portfolio
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </a>
    </main>
  )
}