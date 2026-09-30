import { Mail, Linkedin, Instagram, Github } from "lucide-react";

export default function SocialRow() {
  const socialLinks = [
    {
      icon: <Mail strokeWidth={2.5} className="w-[18px] h-[18px]" />,
      url: "mailto:tewari765@gmail.com",
      label: "Email",
    },
    {
      icon: <Linkedin strokeWidth={2.5} className="w-[18px] h-[18px]" />,
      url: "https://www.linkedin.com/in/raj-tewari-9a93212a3/",
      label: "LinkedIn",
    },
    {
      icon: <Instagram strokeWidth={2.5} className="w-[18px] h-[18px]" />,
      url: "https://instagram.com/light_up_my_world01",
      label: "Instagram",
    },
    {
      icon: <Github strokeWidth={2.5} className="w-[18px] h-[18px]" />,
      url: "https://github.com/RajTewari01",
      label: "GitHub",
    },
  ]

  return (
    <div className="flex items-center justify-start gap-2.5 w-full mt-3">
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="w-[36px] h-[36px] flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-emerald-50 rounded-full hover:text-emerald-600 transition-all hover:scale-110 shrink-0 ring-1 ring-slate-200/60 shadow-sm"
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
