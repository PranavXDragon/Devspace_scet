const fs = require('fs');
const path = require('path');

const dir = __dirname; 

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.github' && file !== 'public') {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.md')) {
      if (file.endsWith('.cjs') || file.endsWith('-lock.json')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;

      newContent = newContent.replace(/Codex/g, 'Devspace');
      newContent = newContent.replace(/@codexclub/g, '@devspaceclub');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Codex capitalization replacement complete!');
