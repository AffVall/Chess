import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600'] });
const interfaceFont = Manrope({ subsets: ['latin'], variable: '--font-interface', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Gambito — A partida começa antes do primeiro lance',
  description: 'Monte seu exército, escolha melhorias e dispute uma partida de xadrez com novas possibilidades.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${display.variable} ${interfaceFont.variable}`}><body>{children}</body></html>;
}
