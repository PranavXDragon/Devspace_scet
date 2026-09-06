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
      if (file.endsWith('-replace.cjs') || file.startsWith('replace_') || file.endsWith('-lock.json')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;

      newContent = newContent.replace(/Engineering Club/g, 'Devspace');
      newContent = newContent.replace(/ENGINEERING CLUB/g, 'DEVSPACE');
      newContent = newContent.replace(/scet_engineering/g, 'scet_devspace');
      newContent = newContent.replace(/SCET-Engineering-Club/g, 'SCET-Devspace');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

function processPublic(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
        if(file !== 'tinymce') processPublic(fullPath);
    } else if (file.endsWith('.json') || file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/Engineering Club/g, 'Devspace').replace(/ENGINEERING CLUB/g, 'DEVSPACE');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
processPublic(path.join(dir, 'public'));
console.log('Devspace replacement complete!');
