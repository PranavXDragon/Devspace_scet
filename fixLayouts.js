const fs = require('fs');

function fixLayout(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace end={...}
  content = content.replace(/end=\{item\.end\}\s*/g, '');

  // Next.js usePathname is 'location' in student/layout.jsx?
  // Actually, we replaced useLocation with usePathname. So the variable is likely 'location'.
  content = content.replace(
    /className=\{.*?\)\s*=>([\s\S]*?)\}/,
    `className={
                \`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all \${
                  location === item.path
                    ? "bg-accent/10 text-accent relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-accent before:rounded-r-md"
                    : "text-text-muted hover:bg-card-hover hover:text-text"
                }\`
              }`
  );
  fs.writeFileSync(filePath, content);
}

fixLayout('p:/Devspace/Frontend/src/app/student/layout.jsx');
fixLayout('p:/Devspace/Frontend/src/app/admin/layout.jsx');