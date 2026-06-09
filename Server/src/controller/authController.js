import { db } from '../connect.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUserID } from '../utils/codeGenerator.js';
import { calculateAgeFromBirthDate, getCurrentTimestamp } from '../utils/calculateValues.js';
import { compareEncryption, encrypt } from '../utils/Crypto.js';
import { validateFields } from '../utils/validateFields.js';
import { cookieOptions, generateTokens } from '../utils/tokens.js';

export const register = (req, res) => {
    if (!validateFields(req, res, [
        'username', 'password', 'email', 'firstName', 'middleName', 'lastName', 'birthDate', 'gender', 'contactNumber'
    ])) return;

    const { username, password, email, firstName, middleName, lastName, suffix, birthDate, gender, contactNumber } = req.body;
    
    // CHECK USER EXIST
    const query =  "SELECT * FROM tbl_accounts WHERE username = ? OR email = ?";

    db.query(query, [username, email], async (err,data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (data.length > 0) return response.conflict(res, 'Username or email already exists');

        const userID = generateUserID();
        // const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_KEY_TIMES));
        const hashedPassword = await encrypt(password);
        const role = 'superadmin';
        const age = calculateAgeFromBirthDate(birthDate);

        const insertSql = "INSERT INTO tbl_accounts (`userID`, `username`, `email`, `password`, `userType`, `isActive`, `updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?)";
        const insertValues = [
            userID, username, email, hashedPassword, role, 1, getCurrentTimestamp(), getCurrentTimestamp()
        ];
        db.query(insertSql, insertValues, (err, data) => {
            if (err) return response.serverError(res, 'Database error', err);

            if(data.affectedRows){
                const insertDetailsSql = "INSERT INTO tbl_user_details (`accountID`,`firstName`, `middleName`, `lastName`, `suffix`, `birthDate`, `age`, `gender`, `contactNumber`,`updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                const insertDetailsValues = [
                    data.insertId, firstName, middleName, lastName, suffix, birthDate, age, gender, contactNumber, getCurrentTimestamp(), getCurrentTimestamp()
                ];

                db.query(insertDetailsSql, insertDetailsValues, (err, data) => {
                    if (err) return response.serverError(res, 'Database error', err);

                    return response.ok(res, "User creation successful", data);
                });
            }
        })
    })
}

export const registerCustomer = (req, res) => {
    if (!validateFields(req, res, [
        'username', 'password', 'email', 'firstName', 'middleName', 'lastName', 'birthDate', 'gender', 'contactNumber'
    ])) return;

    const { username, password, email, firstName, middleName, lastName, suffix, birthDate, gender, contactNumber } = req.body;
    
    // CHECK USER EXIST
    const query =  "SELECT * FROM tbl_accounts WHERE username = ? OR email = ?";

    db.query(query, [username, email], async (err,data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (data.length > 0) return response.conflict(res, 'Username or email already exists');

        try {
            const userID = generateUserID();
            // const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_KEY_TIMES));
            const hashedPassword = await encrypt(password);
            const role = 'customer';
            const age = calculateAgeFromBirthDate(birthDate);

            const insertSql = "INSERT INTO tbl_accounts (`userID`, `username`, `email`, `password`, `userType`, `isActive`, `updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?)";
            const insertValues = [
                userID, username, email, hashedPassword, role, 1, getCurrentTimestamp(), getCurrentTimestamp()
            ];
            db.query(insertSql, insertValues, (err, result) => {
                if (err) return response.serverError(res, 'Database error', err);

                if(result.affectedRows){
                    const insertDetailsSql = "INSERT INTO tbl_user_details (`accountID`,`firstName`, `middleName`, `lastName`, `suffix`, `birthDate`, `age`, `gender`, `contactNumber`,`updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                    const insertDetailsValues = [
                        result.insertId, firstName, middleName, lastName, suffix, birthDate, age, gender, contactNumber, getCurrentTimestamp(), getCurrentTimestamp()
                    ];

                    db.query(insertDetailsSql, insertDetailsValues, (err, data) => {
                        if (err) return response.serverError(res, 'Database error', err);

                        const fetchUserSql = `
                            SELECT 
                                a.id, a.userID, a.username, a.email, a.userType, a.isActive, a.createdAt,
                                d.firstName, d.middleName, d.lastName, d.suffix, 
                                d.birthDate, d.age, d.gender, d.contactNumber
                            FROM tbl_accounts a
                            JOIN tbl_user_details d ON d.accountID = a.id
                            WHERE a.id = ?
                        `;

                        db.query(fetchUserSql, [result.insertId], (err, rows) => {
                            if (err) return response.serverError(res, 'Database error', err);

                            return response.ok(res, "User creation successful", rows[0]);
                        });
                    });
                }
            })
        } catch (err) {
            return response.serverError(res, 'Encryption error', err);
        }
    })
}

export const registerAdmin = (req, res) => {
    if (!validateFields(req, res, [
        'username', 'password', 'email', 'firstName', 'middleName', 'lastName', 'birthDate', 'gender', 'contactNumber'
    ])) return;

    const { username, password, email, firstName, middleName, lastName, suffix, birthDate, gender, contactNumber } = req.body;
    
    // CHECK USER EXIST
    const query =  "SELECT * FROM tbl_accounts WHERE username = ? OR email = ?";

    db.query(query, [username, email], async (err,data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (data.length > 0) return response.conflict(res, 'Username or email already exists');

        try {
            const userID = generateUserID();
            // const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_KEY_TIMES));
            const hashedPassword = await encrypt(password);
            const role = 'admin';
            const age = calculateAgeFromBirthDate(birthDate);

            const insertSql = "INSERT INTO tbl_accounts (`userID`, `username`, `email`, `password`, `userType`, `isActive`, `updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?)";
            const insertValues = [
                userID, username, email, hashedPassword, role, 1, getCurrentTimestamp(), getCurrentTimestamp()
            ];
            db.query(insertSql, insertValues, (err, result) => {
                if (err) return response.serverError(res, 'Database error', err);

                if(result.affectedRows){
                    const insertDetailsSql = "INSERT INTO tbl_user_details (`accountID`,`firstName`, `middleName`, `lastName`, `suffix`, `birthDate`, `age`, `gender`, `contactNumber`,`updatedAt`,`createdAt`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                    const insertDetailsValues = [
                        result.insertId, firstName, middleName, lastName, suffix, birthDate, age, gender, contactNumber, getCurrentTimestamp(), getCurrentTimestamp()
                    ];

                    db.query(insertDetailsSql, insertDetailsValues, (err, data) => {
                        if (err) return response.serverError(res, 'Database error', err);

                        const fetchUserSql = `
                            SELECT 
                                a.id, a.userID, a.username, a.email, a.userType, a.isActive, a.createdAt,
                                d.firstName, d.middleName, d.lastName, d.suffix, 
                                d.birthDate, d.age, d.gender, d.contactNumber
                            FROM tbl_accounts a
                            JOIN tbl_user_details d ON d.accountID = a.id
                            WHERE a.id = ?
                        `;

                        db.query(fetchUserSql, [result.insertId], (err, rows) => {
                            if (err) return response.serverError(res, 'Database error', err);

                            return response.ok(res, "User creation successful", rows[0]);
                        });
                    });
                }
            })
        } catch (err) {
            return response.serverError(res, 'Encryption error', err);
        }
    })
}

export const login = (req, res) => {
    res.clearCookie('accessToken', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions());

    if (!validateFields(req, res, [
        'username', 'password'
    ])) return;

    const { username, password} = req.body;

    const query =  "SELECT a.*, d.* FROM tbl_accounts a LEFT JOIN tbl_user_details d ON d.accountID = a.id WHERE a.username = ?";

    db.query(query, [username], (err, data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (data.length == 0) return response.notFound(res, 'Username does not exists');

        // const isPasswordValid = bcrypt.compareSync(password, data[0].password);
        const isPasswordValid = compareEncryption(password, data[0].password);

        if(!isPasswordValid) return response.conflict(res, 'Password does not match.');

        const { accessToken, refreshToken } = generateTokens(data[0]);
    
        // db.query('DELETE FROM tbl_refresh_tokens WHERE user_id = ?', [data[0].id], (errDel) => {
        //     if (errDel) return response.serverError(res, 'Database error', errDel);

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const insertToken = 'INSERT INTO tbl_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';

            db.query(insertToken, [data[0].id, refreshToken, expiresAt],(errToken, dataToken) => {
                if (errToken) return response.serverError(res, 'Database error', errToken);
                res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
                res.cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

                return response.ok(res, "Welcome back, Champ!", data);
            });
        // });
    });
}

export const refresh = (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return response.unauthorized(res, 'Your session has expired. Please log in again.');

    // 1. Verify signature & expiry
    let payload;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
        return response.unauthorized(res, 'Invalid or expired refresh token');
    }

    // 2. Check token exists in DB and is not expired
    const sqlFind = 'SELECT * FROM tbl_refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()';

    db.query(sqlFind, [token, payload.id], (err, rows) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (!rows.length) return response.unauthorized(res, 'Refresh token revoked or expired');

        // 3. Delete old token (rotation — prevents reuse)
        db.query('DELETE FROM tbl_refresh_tokens WHERE token = ?', [token], (errDelete) => {
            if (errDelete) return response.serverError(res, 'Database error', errDelete);

            // 4. Issue new token pair
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            db.query(
                'INSERT INTO tbl_refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [payload.id, newRefreshToken, expiresAt],
                (errInsert) => {
                    if (errInsert) return response.serverError(res, 'Database error', errInsert);

                    res.cookie('accessToken', accessToken, cookieOptions(15 * 60 * 1000));
                    res.cookie('refreshToken', newRefreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));

                    return response.ok(res, 'Token refreshed');
                }
            );
        });
    });
};

export const logout = (req, res) => {
    const token = req.cookies.refreshToken;

    const clearAndRespond = () => {
        res.clearCookie('accessToken', cookieOptions());
        res.clearCookie('refreshToken', cookieOptions());
        return response.ok(res, 'Logged out successfully');
    };

    if (!token) return clearAndRespond();
    

    db.query('DELETE FROM tbl_refresh_tokens WHERE token = ?', [token], (err) => {
        if (err) return response.serverError(res, 'Database error', err);
        return clearAndRespond();
    });
}