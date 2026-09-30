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
      
      {/* Beautiful Animated Wave SVG Background */}
      <div className="fixed bottom-0 left-0 w-full h-[60vh] overflow-hidden z-[0] pointer-events-none opacity-[0.25] text-emerald-800 mix-blend-multiply flex items-end">
        {/* Minimalist Solid Tree SVG */}
        <svg className="absolute bottom-0 right-[5%] w-[45vw] max-w-[350px] h-auto opacity-60 animate-wave origin-bottom" style={{ animationDuration: '12s' }} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 10H8L2 16H10V22H14V16H22L16 10H20L12 2Z" />
        </svg>
        {/* Front Wave */}
        <svg className="absolute w-[200%] h-auto bottom-0 left-0 animate-wave" style={{ animationDuration: '18s' }} viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        {/* Back Wave */}
        <svg className="absolute w-[200%] h-auto bottom-0 left-0 animate-wave" style={{ animationDuration: '24s', animationDirection: 'reverse', opacity: 0.6 }} viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <div className="w-full max-w-[480px] px-4 py-8 flex flex-col pt-8 md:pt-12 relative z-[10]">
        
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
          <h3 className="text-slate-500 font-semibold text-[0.85rem] mb-3 text-left px-3 uppercase tracking-widest">Featured Video</h3>
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