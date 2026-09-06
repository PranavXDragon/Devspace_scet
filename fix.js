const fs = require('fs');
let content = fs.readFileSync('p:\Devspace\Frontend\src\components\layout\Navbar.jsx', 'utf8');

// I will just restore Navbar.jsx from the previous state (or simply fix the missing header tag)
// Wait, the output was:
// -  return (
// -    <header className="sticky top-0 z-50 w-full bg-bg shadow-sm border-b border-border transition-colors duration-300 transform-gpu">
// -      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
// -        
// -        {/* 1. Brand Logo */}
// -        <Link href="/"
// -          className="flex items-center gap-3 shrink-0 group"
// -          aria-label="Devspace Club home"
// -        >
// -          <span className="font-sans font-bold text-lg md:text-xl tracking-[0.22em] text-text group-hover:text-accent transition-colors mt-0.5">
// -            DEVSPACE
// -          </span>

if (!content.includes('<header')) {
  content = content.replace(
    '        </Link>\n\n        {/* 2. Desktop Navigation */}',
      return (
    <header className="sticky top-0 z-50 w-full bg-bg shadow-sm border-b border-border transition-colors duration-300 transform-gpu">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        
        {/* 1. Brand Logo */}
        <Link href="/"
          className="flex items-center gap-3 shrink-0 group"
          aria-label="Devspace Club home"
        >
          <span className="font-sans font-bold text-lg md:text-xl tracking-[0.22em] text-text group-hover:text-accent transition-colors mt-0.5">
            DEVSPACE
          </span>
        </Link>

        {/* 2. Desktop Navigation */}
  );
}
fs.writeFileSync('p:\Devspace\Frontend\src\components\layout\Navbar.jsx', content);