import 'dotenv/config';
import app from './app.js';
import { conectar, desconectar } from './config/banco.js';

const PORTA = process.env.PORT || 3333;

try {
  await conectar();
  console.log('Conectado ao MongoDB');
} catch (erro) {
  console.error('Não foi possível conectar ao MongoDB. Verifique MONGODB_URI, MONGODB_DB_NAME e se o servidor está em execução.');
  console.error(erro.message);
  process.exit(1);
}

const servidor = app.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});

async function encerrar() {
  servidor.close();
  await desconectar();
  process.exit(0);
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
