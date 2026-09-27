import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Gambito — Xadrez do seu jeito',
  description: 'Monte seu exército, escolha melhorias e dispute uma partida de xadrez com novas possibilidades.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
