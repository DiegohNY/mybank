import mysql from "mysql2/promise";

let connection: any = null;

export async function connectToDatabase() {
  // se la connessione esiste già, la riusa
  if (connection) {
    return connection;
  }

  try {
    console.log("connessione al database in corso...");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // alcune opzioni base
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("database collegato con successo");
    return connection;
  } catch (error) {
    console.error("errore connessione database:", error);
    throw new Error("Impossibile connettersi al database");
  }
}

// funzione helper per chiudere connessione
export async function closeDatabase() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log("connessione database chiusa");
  }
}
