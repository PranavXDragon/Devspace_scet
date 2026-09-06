const fs = require('fs');
let f = 'p:/Devspace/Frontend/src/app/layout.jsx';
let content = fs.readFileSync(f, 'utf8');

if (!content.includes('next/font/google')) {
  content = content.replace(
    "import './globals.css'",
    "import { JetBrains_Mono, Oswald, Playfair_Display } from 'next/font/google';\nimport './globals.css'"
  );

  const fontsDef = `
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
`;
  content = content.replace("export const metadata", fontsDef + "\nexport const metadata");

  content = content.replace(
    "<body>",
    "<body className={`${jetbrains.variable} ${oswald.variable} ${playfair.variable}`}>"
  );

  fs.writeFileSync(f, content);
}