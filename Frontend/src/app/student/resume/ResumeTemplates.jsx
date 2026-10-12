"use client";
import React from 'react';
import { 
  Mail, Phone, MapPin, Globe, Github, Linkedin, 
  Code, Trophy, Briefcase, GraduationCap, Award, ExternalLink, 
  Terminal, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function ResumeTemplates({ data, settings }) {
  const { personal, experience, projects, skills, education, achievements, devspaceStats } = data;
  const { layout, fontFamily, accentColor, fontSize, spacing } = settings;

  // Font family mapping
  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'serif':
        return { fontFamily: 'var(--font-serif), "Playfair Display", Georgia, serif' };
      case 'mono':
        return { fontFamily: 'var(--font-mono), "JetBrains Mono", Consolas, monospace' };
      case 'tech':
        return { fontFamily: 'var(--font-sans), Oswald, -apple-system, sans-serif' };
      case 'sans':
      default:
        return { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' };
    }
  };

  // Font size mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-[11px] leading-[1.4]';
      case 'lg': return 'text-[13.5px] leading-[1.6]';
      case 'base':
      default: return 'text-[12px] leading-[1.5]';
    }
  };

  // Spacing mapping
  const getSpacingClass = () => {
    switch (spacing) {
      case 'compact': return 'space-y-3';
      case 'relaxed': return 'space-y-6';
      case 'normal':
      default: return 'space-y-4';
    }
  };

  const baseFont = getFontFamilyStyle();
  const fontClass = getFontSizeClass();
  const spacingClass = getSpacingClass();

  // Helper to split skill strings into tags
  const renderSkillTags = (skillStr, badgeStyle = {}) => {
    if (!skillStr) return null;
    const items = skillStr.split(',').map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="px-2 py-0.5 rounded text-[10.5px] font-medium"
            style={badgeStyle}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // =========================================================================
  // 1. MODERN TECH TEMPLATE (Two-Column Asymmetric Developer Layout)
  // =========================================================================
  if (layout === 'modern') {
    return (
      <div 
        id="resume-print-area" 
        style={baseFont}
        className={`w-full bg-white text-slate-800 ${fontClass} shadow-xl rounded-sm print:shadow-none min-h-[297mm] flex flex-col md:flex-row`}
      >
        {/* Left Column (Sidebar) */}
        <div 
          className="w-full md:w-[32%] p-6 border-r border-slate-200 flex flex-col justify-between"
          style={{ backgroundColor: `${accentColor}08` }}
        >
          <div className="space-y-5">
            {/* Avatar & Contact Header */}
            {personal?.showAvatar && personal?.avatarUrl && (
              <div className="flex justify-center mb-3">
                <img 
                  src={personal.avatarUrl} 
                  alt={personal.fullName} 
                  className="w-24 h-24 rounded-full object-cover border-3 shadow-sm"
                  style={{ borderColor: accentColor }}
                />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900" style={{ color: accentColor }}>
                {personal?.fullName || 'Your Name'}
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 uppercase tracking-wider">
                {personal?.title || 'Software Developer'}
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
              {personal?.email && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal?.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal?.location && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>{personal.location}</span>
                </div>
              )}
              {personal?.github && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <a href={personal.github} target="_blank" rel="noreferrer" className="hover:underline">
                    {personal.github.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {personal?.linkedin && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <a href={personal.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                    {personal.linkedin.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {personal?.website && (
                <div className="flex items-center gap-2 text-slate-700 break-all">
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <a href={personal.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {personal.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Technical Skills */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" style={{ color: accentColor }} /> Skills
              </h3>
              
              {skills?.languages && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Languages:</span>
                  {renderSkillTags(skills.languages, { backgroundColor: `${accentColor}18`, color: accentColor })}
                </div>
              )}
              {skills?.frameworks && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Frameworks:</span>
                  {renderSkillTags(skills.frameworks, { backgroundColor: '#f1f5f9', color: '#334155' })}
                </div>
              )}
              {skills?.tools && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Developer Tools:</span>
                  {renderSkillTags(skills.tools, { backgroundColor: '#f1f5f9', color: '#334155' })}
                </div>
              )}
              {skills?.databases && (
                <div>
                  <span className="text-[11px] font-bold text-slate-700">Databases:</span>
                  {renderSkillTags(skills.databases, { backgroundColor: '#f1f5f9', color: '#334155' })}
                </div>
              )}
            </div>

            {/* Education */}
            {education && education.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: accentColor }} /> Education
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs space-y-0.5 print-page-break-avoid">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>{edu.startYear} - {edu.endYear || 'Present'}</span>
                      {edu.gpa && <span className="font-semibold text-slate-700">CGPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DevSpace Verified Stats Badge */}
          {devspaceStats?.showStats && (
            <div 
              className="mt-6 p-3 rounded-lg border text-xs print-page-break-avoid"
              style={{ borderColor: `${accentColor}40`, backgroundColor: '#ffffff' }}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11.5px] mb-1.5" style={{ color: accentColor }}>
                <Terminal className="w-3.5 h-3.5" /> DevSpace Verified
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500 block text-[9.5px]">XP Earned</span>
                  <span className="font-bold text-slate-800">{devspaceStats.xp || 0} XP</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500 block text-[9.5px]">Problems</span>
                  <span className="font-bold text-slate-800">{devspaceStats.problemsSolved || 0} Solved</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Main Experience & Projects) */}
        <div className="w-full md:w-[68%] p-8 space-y-5">
          {/* Summary */}
          {personal?.summary && (
            <div className="print-page-break-avoid">
              <h3 
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b flex items-center gap-1.5"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Professional Summary
              </h3>
              <p className="text-slate-700 leading-relaxed text-justify">
                {personal.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <div className={spacingClass}>
              <h3 
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                <Briefcase className="w-3.5 h-3.5" /> Experience & Internships
              </h3>
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1.5 print-page-break-avoid">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs mt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Projects */}
          {projects && projects.length > 0 && (
            <div className={spacingClass}>
              <h3 
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                <Code className="w-3.5 h-3.5" /> Technical Projects
              </h3>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1.5 print-page-break-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                      {proj.techStack && (
                        <span className="text-[11px] font-mono text-slate-500">
                          | {proj.techStack}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2.5 text-xs">
                      {proj.githubUrl && (
                        <a 
                          href={proj.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-medium hover:underline flex items-center gap-0.5"
                          style={{ color: accentColor }}
                        >
                          GitHub <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {proj.demoUrl && (
                        <a 
                          href={proj.demoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-medium hover:underline flex items-center gap-0.5"
                          style={{ color: accentColor }}
                        >
                          Live <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Achievements & Certifications */}
          {achievements && achievements.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 print-page-break-avoid">
              <h3 
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ borderColor: `${accentColor}40`, color: accentColor }}
              >
                <Award className="w-3.5 h-3.5" /> Certifications & Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                    <div>
                      <div className="font-bold text-slate-800">{ach.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {ach.issuer} {ach.date && `• ${ach.date}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CLASSIC ATS TEMPLATE (Single-Column Traditional, High ATS Passing Rate)
  // =========================================================================
  if (layout === 'classic') {
    return (
      <div 
        id="resume-print-area" 
        style={baseFont}
        className={`w-full bg-white text-slate-900 ${fontClass} p-8 sm:p-10 shadow-xl rounded-sm print:shadow-none min-h-[297mm] space-y-4`}
      >
        {/* Header */}
        <div className="text-center border-b pb-3" style={{ borderColor: `${accentColor}60` }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase text-slate-900">
            {personal?.fullName || 'Your Name'}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest mt-1 text-slate-600">
            {personal?.title || 'Software Engineer'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-xs text-slate-600">
            {personal?.email && <span>{personal.email}</span>}
            {personal?.phone && <span>• {personal.phone}</span>}
            {personal?.location && <span>• {personal.location}</span>}
            {personal?.linkedin && (
              <span>• <a href={personal.linkedin} className="hover:underline">{personal.linkedin.replace(/^https?:\/\//, '')}</a></span>
            )}
            {personal?.github && (
              <span>• <a href={personal.github} className="hover:underline">{personal.github.replace(/^https?:\/\//, '')}</a></span>
            )}
            {personal?.website && (
              <span>• <a href={personal.website} className="hover:underline">{personal.website.replace(/^https?:\/\//, '')}</a></span>
            )}
          </div>
        </div>

        {/* Summary */}
        {personal?.summary && (
          <div className="print-page-break-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5" style={{ borderColor: accentColor, color: accentColor }}>
              Professional Summary
            </h2>
            <p className="text-slate-800 text-justify leading-relaxed">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        {(skills?.languages || skills?.frameworks || skills?.tools || skills?.databases) && (
          <div className="print-page-break-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5" style={{ borderColor: accentColor, color: accentColor }}>
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs">
              {skills?.languages && (
                <div><span className="font-bold text-slate-900">Languages:</span> <span className="text-slate-700">{skills.languages}</span></div>
              )}
              {skills?.frameworks && (
                <div><span className="font-bold text-slate-900">Frameworks & Libraries:</span> <span className="text-slate-700">{skills.frameworks}</span></div>
              )}
              {skills?.tools && (
                <div><span className="font-bold text-slate-900">Developer Tools & Platforms:</span> <span className="text-slate-700">{skills.tools}</span></div>
              )}
              {skills?.databases && (
                <div><span className="font-bold text-slate-900">Databases:</span> <span className="text-slate-700">{skills.databases}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
              Professional Experience
            </h2>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1 print-page-break-avoid">
                <div className="flex justify-between items-baseline font-bold text-sm text-slate-900">
                  <span>{exp.role} – <span className="font-semibold text-slate-700">{exp.company}</span></span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="text-xs text-slate-500 italic">{exp.location}</div>}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
              Projects
            </h2>
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1 print-page-break-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-bold text-slate-900">
                    {proj.title} {proj.techStack && <span className="text-xs font-normal text-slate-600 font-mono">| {proj.techStack}</span>}
                  </div>
                  <div className="text-xs space-x-2 text-slate-600">
                    {proj.githubUrl && <a href={proj.githubUrl} className="hover:underline font-semibold" style={{ color: accentColor }}>Code</a>}
                    {proj.demoUrl && <a href={proj.demoUrl} className="hover:underline font-semibold" style={{ color: accentColor }}>Demo</a>}
                  </div>
                </div>
                {proj.description && <p className="text-xs text-slate-700">{proj.description}</p>}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="space-y-2 print-page-break-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
              Education
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> – {edu.degree} {edu.field && `in ${edu.field}`}
                </div>
                <div className="text-slate-500 font-mono">
                  {edu.startYear} – {edu.endYear || 'Present'} {edu.gpa && `(CGPA: ${edu.gpa})`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Honors, Certifications & DevSpace Stats */}
        {(achievements?.length > 0 || devspaceStats?.showStats) && (
          <div className="space-y-2 pt-1 print-page-break-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
              Achievements & Certifications
            </h2>
            <div className="space-y-1 text-xs text-slate-700">
              {devspaceStats?.showStats && (
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span>DevSpace Platform: Earned {devspaceStats.xp || 0} XP and solved {devspaceStats.problemsSolved || 0}+ algorithmic challenges.</span>
                </div>
              )}
              {achievements?.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  <span><strong>{ach.title}</strong> – {ach.issuer} {ach.date && `(${ach.date})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. MINIMALIST DEVELOPER TEMPLATE (Code / Terminal Monospace Aesthetics)
  // =========================================================================
  if (layout === 'developer') {
    return (
      <div 
        id="resume-print-area" 
        style={baseFont}
        className={`w-full bg-white text-slate-900 ${fontClass} p-8 sm:p-10 shadow-xl rounded-sm print:shadow-none min-h-[297mm] space-y-5 font-mono`}
      >
        {/* Terminal Header */}
        <div className="border-b-2 pb-4" style={{ borderColor: accentColor }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400">$ whoami</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
                {personal?.fullName || 'Developer'}
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-1">
                &gt; {personal?.title || 'Full Stack Engineer'}
              </p>
            </div>
            {devspaceStats?.showStats && (
              <div 
                className="text-right p-2 rounded border text-xs" 
                style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}0a` }}
              >
                <div className="font-bold text-[11px]" style={{ color: accentColor }}>[DEVSPACE VERIFIED]</div>
                <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                  {devspaceStats.xp || 0} XP • {devspaceStats.problemsSolved || 0} Solved
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11.5px] text-slate-600">
            {personal?.email && <span>email: {personal.email}</span>}
            {personal?.phone && <span>tel: {personal.phone}</span>}
            {personal?.location && <span>loc: {personal.location}</span>}
            {personal?.github && <span>github: {personal.github.replace(/^https?:\/\//, '')}</span>}
            {personal?.linkedin && <span>linkedin: {personal.linkedin.replace(/^https?:\/\//, '')}</span>}
          </div>
        </div>

        {/* Bio */}
        {personal?.summary && (
          <div className="print-page-break-avoid">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">// ABOUT</span>
            <p className="text-xs text-slate-800 leading-relaxed mt-1 font-sans">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Skills with bracket tags */}
        {(skills?.languages || skills?.frameworks || skills?.tools || skills?.databases) && (
          <div className="print-page-break-avoid space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">// STACK</span>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {skills?.languages && (
                <div>
                  <span className="text-slate-500">languages = </span>
                  <span className="font-bold" style={{ color: accentColor }}>
                    [{skills.languages.split(',').map(s => `"${s.trim()}"`).join(', ')}]
                  </span>
                </div>
              )}
              {skills?.frameworks && (
                <div>
                  <span className="text-slate-500">frameworks = </span>
                  <span className="font-bold text-slate-800">
                    [{skills.frameworks.split(',').map(s => `"${s.trim()}"`).join(', ')}]
                  </span>
                </div>
              )}
              {skills?.tools && (
                <div>
                  <span className="text-slate-500">tools = </span>
                  <span className="font-bold text-slate-800">
                    [{skills.tools.split(',').map(s => `"${s.trim()}"`).join(', ')}]
                  </span>
                </div>
              )}
              {skills?.databases && (
                <div>
                  <span className="text-slate-500">databases = </span>
                  <span className="font-bold text-slate-800">
                    [{skills.databases.split(',').map(s => `"${s.trim()}"`).join(', ')}]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">// EXPERIENCE</span>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1 pl-3 border-l-2 print-page-break-avoid" style={{ borderColor: `${accentColor}60` }}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span className="text-slate-900">{exp.role} @ {exp.company}</span>
                  <span className="text-[11px] text-slate-500">
                    {exp.startDate} -&gt; {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700 font-sans">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">// PROJECTS</span>
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1 pl-3 border-l-2 print-page-break-avoid" style={{ borderColor: `${accentColor}60` }}>
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span className="text-slate-900">{proj.title}</span>
                  <div className="space-x-3 text-[11px]">
                    {proj.githubUrl && <a href={proj.githubUrl} className="hover:underline" style={{ color: accentColor }}>[code]</a>}
                    {proj.demoUrl && <a href={proj.demoUrl} className="hover:underline" style={{ color: accentColor }}>[live]</a>}
                  </div>
                </div>
                {proj.techStack && <div className="text-[10.5px] text-slate-500">stack: {proj.techStack}</div>}
                {proj.description && <p className="text-xs text-slate-700 font-sans">{proj.description}</p>}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700 font-sans">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="space-y-2 print-page-break-avoid">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">// EDUCATION</span>
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-xs pl-3 border-l-2 border-slate-200">
                <span className="font-bold text-slate-900">{edu.degree} @ {edu.institution}</span>
                <span className="text-slate-500">{edu.startYear} - {edu.endYear || 'Present'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. EXECUTIVE ACCENT TEMPLATE (Header Banner + Modern Structured Body)
  // =========================================================================
  return (
    <div 
      id="resume-print-area" 
      style={baseFont}
      className={`w-full bg-white text-slate-800 ${fontClass} shadow-xl rounded-sm print:shadow-none min-h-[297mm] flex flex-col`}
    >
      {/* Top Banner */}
      <div 
        className="p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ backgroundColor: accentColor }}
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{personal?.fullName || 'Your Name'}</h1>
          <p className="text-sm font-semibold opacity-90 mt-1 uppercase tracking-wider">
            {personal?.title || 'Software Engineering Professional'}
          </p>
        </div>
        <div className="text-xs space-y-1 opacity-95 text-right sm:text-right">
          {personal?.email && <div>{personal.email}</div>}
          {personal?.phone && <div>{personal.phone}</div>}
          {personal?.location && <div>{personal.location}</div>}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-8 space-y-5 flex-1">
        {/* Summary */}
        {personal?.summary && (
          <div className="print-page-break-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 mb-2" style={{ borderColor: accentColor }}>
              Executive Profile
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: accentColor }}>
              Professional Experience
            </h3>
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1 print-page-break-avoid">
                <div className="flex justify-between items-baseline font-bold text-sm text-slate-900">
                  <span>{exp.role} <span className="text-slate-500 font-normal">| {exp.company}</span></span>
                  <span className="text-xs text-slate-500 font-mono">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Technical Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: accentColor }}>
              Selected Projects
            </h3>
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-1 print-page-break-avoid">
                <div className="flex justify-between items-baseline">
                  <div className="font-bold text-slate-900 text-sm">
                    {proj.title} {proj.techStack && <span className="text-xs text-slate-500 font-mono">({proj.techStack})</span>}
                  </div>
                  <div className="text-xs space-x-2">
                    {proj.githubUrl && <a href={proj.githubUrl} className="hover:underline font-semibold" style={{ color: accentColor }}>Source</a>}
                    {proj.demoUrl && <a href={proj.demoUrl} className="hover:underline font-semibold" style={{ color: accentColor }}>Demo</a>}
                  </div>
                </div>
                {proj.description && <p className="text-xs text-slate-700">{proj.description}</p>}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills & Education Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t print-page-break-avoid">
          {/* Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: accentColor }}>
              Core Competencies
            </h3>
            <div className="space-y-1 text-xs text-slate-700">
              {skills?.languages && <div><strong>Languages:</strong> {skills.languages}</div>}
              {skills?.frameworks && <div><strong>Frameworks:</strong> {skills.frameworks}</div>}
              {skills?.tools && <div><strong>Tools:</strong> {skills.tools}</div>}
              {skills?.databases && <div><strong>Databases:</strong> {skills.databases}</div>}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1" style={{ borderColor: accentColor }}>
              Education & Honors
            </h3>
            {education && education.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-600">{edu.institution} ({edu.startYear} - {edu.endYear || 'Present'})</div>
              </div>
            ))}
            {devspaceStats?.showStats && (
              <div className="text-xs pt-1 text-slate-600">
                <strong>DevSpace Achievement:</strong> {devspaceStats.xp || 0} XP • {devspaceStats.problemsSolved || 0} Solved
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
