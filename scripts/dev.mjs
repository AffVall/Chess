import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error('Este projeto precisa de Node.js 22 ou superior. Consulte a seção Executar do README.');
  process.exit(1);
}
const production = process.argv.includes('--production');
process.env.NODE_ENV = production ? 'production' : 'development';
for (const file of [`.env.${process.env.NODE_ENV}.local`, '.env.local', `.env.${process.env.NODE_ENV}`, '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 500).unref();
}
function start(label, args) {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env });
  children.push(child);
  child.on('error', error => { console.error(`${label}: ${error.message}`); stop(1); });
  child.on('exit', code => {
    if (!stopping) console.error(`${label} encerrou. Interface e servidor precisam estar ativos juntos.`);
    stop(code ?? 1);
  });
}
start('Servidor de partidas', ['--import', 'tsx', 'server/index.ts']);
start('Interface', ['node_modules/next/dist/bin/next', production ? 'start' : 'dev', '--hostname', '0.0.0.0', '--port', process.env.PORT || '3000']);
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
