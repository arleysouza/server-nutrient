import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Configura o pool de conexão, passando um objeto de configuração
// para se conectar ao BD do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || ""),
});


async function query(sql: string, params?: any[]) {
  try {
    const response = await pool.query(sql, params);
    if (response.command == "INSERT") {
      return response.rows[0];
    } else if (response.command == "SELECT") {
      return response.rows;
    } else if (response.command == "DELETE" || response.command == "UPDATE") {
      return { rowcount: response.rowCount, rows: response.rows[0] };
    } else {
      return { sql };
    }
  } catch (e: any) {
    throw new Error(e.message); // Propaga a exceção para a camada de aplicação
  }
}


/*
O COMMIT e ROLLBACK não são permitidos em um bloco PL/pgSQL.
Desta forma, as transações serão gerenciadas pela camada de aplicação.
*/
async function queryCommitRollback(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(sql, params);
    await client.query("COMMIT");
    return res;
  } catch (e: any) {
    await client.query("ROLLBACK");
    throw new Error(e.message); // Propaga a exceção para a camada de aplicação
  } finally {
    client.release();
  }
}

export { pool, query, queryCommitRollback };
