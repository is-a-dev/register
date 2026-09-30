"use client"

import { motion } from "framer-motion"

interface LinkCardProps {
  title: string
  subtitle?: string
  url: string
  iconUrl?: React.ReactNode | string
  delay?: number
}

export default function LinkCard({ title, subtitle, url, iconUrl, delay = 0 }: LinkCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: 0.4 + delay * 0.05, 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-panel w-full flex items-center p-3 mb-3 cursor-pointer group transition-all"
    >
      {/* Icon Squircle */}
      <div className="w-[46px] h-[46px] rounded-xl bg-green-50 overflow-hidden flex items-center justify-center shrink-0">
        {typeof iconUrl === 'string' && iconUrl.includes('<svg') ? (
          <div dangerouslySetInnerHTML={{ __html: iconUrl }} className="flex items-center justify-center w-full h-full [&_svg]:!w-5 [&_svg]:!h-5 [&_svg]:text-green-700" />
        ) : (
          iconUrl
        )}
      </div>
      
      {/* Text Container */}
      <div className="flex-1 flex flex-col justify-center ml-4">
        <h2 className="text-slate-800 font-medium text-[1.05rem] tracking-tight m-0 leading-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 text-[0.85rem] mt-0.5 m-0 font-normal">{subtitle}</p>}
      </div>

      {/* Right Chevron */}
      <div className="opacity-40 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
    </motion.a>
  )
}
