import GameApp from '@/components/GameApp';
import { connection } from 'next/server';

export default async function Page() {
  await connection();
  return <GameApp gamePort={process.env.GAME_PORT || '2567'} />;
}
