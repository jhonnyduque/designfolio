const fs = require('fs');
const path = require('path');
const srcDir = 'C:\\Users\\Beto\\Downloads\\designfolio-legales-actualizados-2026-09-18';
const destDir = 'C:\\Users\\Beto\\Documents\\APP\\designfolio-new\\app\\(marketing)';

const files = [
  {file: 'aviso-legal.md', route: 'aviso-legal', title: 'Aviso legal'},
  {file: 'privacidad.md', route: 'privacidad', title: 'Política de privacidad'},
  {file: 'terminos.md', route: 'terminos', title: 'Términos de uso'},
  {file: 'cookies.md', route: 'cookies', title: 'Política de cookies'}
];

files.forEach(({file, route, title}) => {
  const mdPath = path.join(srcDir, file);
  if (!fs.existsSync(mdPath)) return;
  const content = fs.readFileSync(mdPath, 'utf-8');
  let jsx = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.*$)/gim, '<h1 className="text-3xl font-marcellus mb-8">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 className="text-xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 className="text-lg font-bold mt-8 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code className="bg-black/5 px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>')
    .replace(/^\- (.*$)/gim, '<li className="ml-4 list-disc mb-1.5">$1</li>');

  jsx = jsx.split('\n\n').map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().length === 0) return p;
    return '<p className="mb-4 leading-relaxed text-[#4f4f57]">' + p.replace(/\n/g, '<br/>') + '</p>';
  }).join('\n');

  jsx = jsx.replace(/(<li.*?<\/li>)/gs, '<ul className="mb-6 text-[#4f4f57]">$1</ul>');
  jsx = jsx.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" className="underline hover:text-black">$1</a>');

  const pageContent = `import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import Image from "next/image";
import { PublicMenu } from "@/components/layout/PublicMenu";

export const metadata = { title: "${title} - Designfolio" };

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#f5f7f5] text-[#1e1e1e]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f7f5]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[1500px] px-6 md:px-10">
          <div className="mx-auto flex h-14 w-full max-w-[935px] items-center justify-between">
            <Link href="/" aria-label="Designfolio" className="inline-flex items-center">
              <Image src="/brand/simbolo-logo.webp" alt="Designfolio" width={36} height={36} className="h-9 w-9 object-contain" />
            </Link>
            <PublicMenu sesion={null} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[700px] px-6 py-12 md:py-20">
        ${jsx}
      </div>
      <PublicFooter />
    </main>
  );
}
`;

  const routeDir = path.join(destDir, route);
  if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, {recursive: true});
  fs.writeFileSync(path.join(routeDir, 'page.tsx'), pageContent, 'utf-8');
});
