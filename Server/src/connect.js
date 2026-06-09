import mysql from "mysql";
import 'dotenv/config';

// DEVELOPMENT
// export const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// })


// PRODUCTION
const urlDB = `mysql://root:XhqEgDZGPOORDQuzcEbjCwVYbZPSGCfp@mysql.railway.internal:3306/railway`;
export const db = mysql.createConnection(urlDB);
