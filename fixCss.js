const fs = require('fs');
let f = 'p:/Devspace/Frontend/src/app/globals.css';
let content = fs.readFileSync(f, 'utf8');

content = content.replace(
  '--font-mono: "JetBrains Mono", monospace;',
  '--font-mono: var(--font-mono);'
);
content = content.replace(
  '--font-sans: "Oswald", sans-serif;',
  '--font-sans: var(--font-sans);'
);
content = content.replace(
  '--font-serif: "Playfair Display", serif;',
  '--font-serif: var(--font-serif);'
);

fs.writeFileSync(f, content);