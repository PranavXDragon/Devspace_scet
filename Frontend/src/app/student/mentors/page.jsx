'use client';
import { UserCheck, Calendar, Briefcase, Mail, Linkedin } from 'lucide-react';

export default function MentorsPage() {
  const mentors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "Senior Staff Engineer at Google",
      expertise: ["System Architecture", "Go", "Cloud Computing"],
      bio: "Passionate about distributed systems and helping the next generation of engineers scale their architectures.",
      calendar_url: "https://calendly.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Frontend Architect at Vercel",
      expertise: ["React", "Next.js", "Performance"],
      bio: "I love teaching advanced React patterns, optimizing web vitals, and discussing frontend state management.",
      calendar_url: "https://calendly.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    },
    {
      id: 3,
      name: "Aisha Patel",
      role: "AI Researcher at OpenAI",
      expertise: ["Machine Learning", "Python", "Data Science"],
      bio: "Specializing in NLP and generative AI. Happy to review projects and discuss career paths in AI.",
      calendar_url: "https://calendly.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha"
    }
  ];

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <div>
        <h1 className='text-3xl font-bold font-headline text-text flex items-center gap-3'>
          <UserCheck className="w-8 h-8 text-teal-500" /> Mentors
        </h1>
        <p className='text-text-muted mt-2'>Connect with industry experts, get career advice, and book 1:1 sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map(mentor => (
          <div key={mentor.id} className="bg-card border border-border-soft rounded-xl p-6 shadow-sm hover:border-teal-500/50 transition-colors flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <img src={mentor.image} alt={mentor.name} className="w-16 h-16 rounded-full bg-card-hover border border-border-soft" />
              <div>
                <h3 className="text-lg font-bold text-text">{mentor.name}</h3>
                <p className="text-xs font-medium text-teal-500 flex items-center gap-1 mt-1">
                  <Briefcase className="w-3 h-3" /> {mentor.role}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-text-muted mb-4 flex-1">{mentor.bio}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {mentor.expertise.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-bg border border-border-soft text-[10px] uppercase font-bold text-text-muted rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <a 
                href={mentor.calendar_url} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-2 bg-teal-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
              >
                <Calendar className="w-4 h-4" /> Book Session
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
