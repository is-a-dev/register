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
    <main className="w-full min-h-screen flex flex-col items-center pb-24 relative overflow-x-hidden bg-transparent">
      
      {/* Cool SVG Background Patterns (Topographic / Abstract Layers) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-[0.05] text-green-800">
        <svg className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] animate-breathe" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" stroke="currentColor" strokeWidth="0.5" d="M0,50 Q25,30 50,50 T100,50 M0,60 Q25,40 50,60 T100,60 M0,70 Q25,50 50,70 T100,70 M0,80 Q25,60 50,80 T100,80 M0,40 Q25,20 50,40 T100,40 M0,30 Q25,10 50,30 T100,30 M0,20 Q25,0 50,20 T100,20 M0,90 Q25,70 50,90 T100,90 M0,10 Q25,-10 50,10 T100,10" />
          <path fill="none" stroke="currentColor" strokeWidth="0.3" d="M-20,50 Q25,10 50,50 T120,50 M-20,60 Q25,20 50,60 T120,60 M-20,70 Q25,30 50,70 T120,70 M-20,80 Q25,40 50,80 T120,80 M-20,40 Q25,0 50,40 T120,40" transform="rotate(45 50 50)" />
        </svg>
      </div>

      <div className="w-full max-w-[480px] px-4 py-8 flex flex-col pt-8 md:pt-12 relative z-[10]">
        
        {/* Top Action Bar (Client Component for sharing) */}
        <TopActionBar />

        {/* Profile Card Block (Image, Name, Socials combined floating) */}
        <div className="w-full flex flex-col items-center mb-10 animate-fade-in-up">
          <ProfileHeader />
        </div>

        {/* Recent YouTube Upload Block */}
        <div className="w-full flex flex-col mb-10 animate-fade-in-up delay-200">
          <div className="w-full glass-panel p-2">
            <div className="w-full aspect-[16/9] rounded-[20px] overflow-hidden relative">
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px] glass-panel !rounded-[24px] py-4 px-5 flex justify-start items-center z-50 cursor-pointer transition-all hover:scale-[1.02] animate-fade-in-up delay-500 shadow-lg"
        title="Visit my main portfolio"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100/70 p-1.5 rounded-full ring-1 ring-emerald-200/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700">
              <path d="M22 13h-4l-2.5-8a2 2 0 0 0-3.8 0L9.2 13H2"/>
              <circle cx="7.5" cy="17" r="3.5"/>
              <circle cx="16.5" cy="17" r="3.5"/>
              <path d="M11 17h2"/>
            </svg>
          </div>
          <span className="font-[family-name:var(--font-pacifico)] lowercase text-black text-[1.25rem] leading-none mb-0.5">biswadeep tewari</span>
        </div>
      </a>
    </main>
  )
}