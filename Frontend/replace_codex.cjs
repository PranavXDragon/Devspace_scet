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
      if (file.endsWith('replace_codex.cjs') || file.endsWith('-lock.json')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;

      newContent = newContent.replace(/CodeX/g, 'Engineering Club');
      newContent = newContent.replace(/CODEX/g, 'ENGINEERING CLUB');
      newContent = newContent.replace(/Quantum University/g, 'SCET College');
      newContent = newContent.replace(/Quantum/g, 'SCET College'); // In case "Quantum" is used alone
      newContent = newContent.replace(/quantumeducation\.in/g, 'example.com');
      newContent = newContent.replace(/qu_codex/g, 'scet_engineering');
      newContent = newContent.replace(/QuCodeXClub/g, 'SCET-Engineering-Club');
      newContent = newContent.replace(/codex\.club/g, 'contact');
      newContent = newContent.replace(/qucodex/g, 'scetengineering');
      
      // Specifically fix codex-logo links if we accidentally broke them (although they are lowercase 'codex')
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Ensure public directory is also scanned for json/html but NOT images
function processPublic(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
        if(file !== 'tinymce') processPublic(fullPath);
    } else if (file.endsWith('.json') || file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/CodeX/g, 'Engineering Club').replace(/Quantum University/g, 'SCET College');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
processPublic(path.join(dir, 'public'));
console.log('Anonymization complete!');
