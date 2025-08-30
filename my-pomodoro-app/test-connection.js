import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function testConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW()`;
    console.log('Conexión exitosa:', result[0]);
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
}

testConnection();