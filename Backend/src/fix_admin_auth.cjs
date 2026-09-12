const fs = require('fs');
const path = require('path');

const routesToFix = [
  'contact.routes.js',
  'event.routes.js',
  'qr.routes.js',
  'question.routes.js',
  'registration.routes.js',
  'resource.routes.js',
  'team.routes.js'
];

routesToFix.forEach(file => {
  const filePath = path.join('p:/Devspace/Backend/src/routes', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /import { verifyJWT } from '..\/middlewares\/auth\.middleware\.js';/g,
      "import { verifyAdmin } from '../middlewares/adminAuth.middleware.js';"
    );
    content = content.replace(
      /import { verifyJWT } from "\.\.\/middlewares\/auth\.middleware\.js";/g,
      'import { verifyAdmin } from "../middlewares/adminAuth.middleware.js";'
    );
    content = content.replace(/verifyJWT/g, 'verifyAdmin');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
