import mysql from "mysql2";
import 'dotenv/config';

// DEVELOPMENT
// export const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// })


// PRODUCTION
const urlDB = `mysql://root:XhqEgDZGPOORDQuzcEbjCwVYbZPSGCfp@mysql.railway.internal:3306/railway`;
export const db = mysql.createPool(urlDB);

export const getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err);
            else resolve(conn);
        });
    });
};
