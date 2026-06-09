import mysql from "mysql2";
import 'dotenv/config';

// DEVELOPMENT
export const db = mysql.createPool({
    host: process.env.NODE_STAT == "PRODUCTION"? process.env.PROD_DB_HOST : process.env.DB_HOST,
    port: process.env.NODE_STAT == "PRODUCTION" ? process.env.PROD_DB_PORT : process.env.DB_PORT,
    user: process.env.NODE_STAT == "PRODUCTION"? process.env.PROD_DB_USER : process.env.DB_USER,
    password: process.env.NODE_STAT == "PRODUCTION"? process.env.PROD_DB_PASSWORD : process.env.DB_PASSWORD,
    database: process.env.NODE_STAT == "PRODUCTION"? process.env.PROD_DB_DATABASE : process.env.DB_DATABASE
})


// PRODUCTION
// const urlDB = `mysql://root:XhqEgDZGPOORDQuzcEbjCwVYbZPSGCfp@mysql.railway.internal:3306/railway`;
// export const db = mysql.createPool(urlDB);

export const getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, conn) => {
            if (err) reject(err);
            else resolve(conn);
        });
    });
};
