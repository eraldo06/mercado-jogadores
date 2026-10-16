const BANCO_DE_TESTE =
  'postgresql://mercado:mercado@localhost:5432/mercado_teste?schema=public';

const url = process.env.DATABASE_URL_TEST ?? BANCO_DE_TESTE;
if (!url.includes('mercado_teste')) {
  throw new Error('Os testes e2e só rodam no banco mercado_teste');
}
process.env.DATABASE_URL = url;
process.env.CORS_ORIGIN = 'http://localhost:5173';
