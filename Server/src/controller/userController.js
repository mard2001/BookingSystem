import { db } from '../connect.js';
import { calculateAgeFromBirthDate, getCurrentTimestamp } from '../utils/calculateValues.js';
import { encrypt } from '../utils/Crypto.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import { validateFields } from '../utils/validateFields.js';

export const getAllUsers = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All users successfully retrieved.', data):
            response.ok(res, 'No users found',[]);
    })
}

export const getAllActiveUsers = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id
                    WHERE a.isActive = 1`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All active users successfully retrieved.', data):
            response.ok(res, 'No active users found',[]);
    })
}

export const getAllCustomers = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id
                    WHERE a.userType = 'CUSTOMER'`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All customers successfully retrieved.', data):
            response.ok(res, 'No customers found',[]);
    })
}

export const getAllActiveCustomers = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id
                    WHERE a.userType = 'CUSTOMER'
                    AND a.isActive = 1`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All active customers successfully retrieved.', data):
            response.ok(res, 'No active customers found', []);
    })
}

export const getAllAdmin = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id
                    WHERE a.userType = 'ADMIN'`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All active customers successfully retrieved.', data):
            response.ok(res, 'No active customers found',[]);
    })
}

export const getAllActiveAdmin = (req, res) => {
    
    const query = `SELECT a.id, a.userID, a.username, a.email, a.password, a.userType, b.firstName, b.middleName, b.lastName, b.suffix, b.birthDate, b.age, b.gender, b.contactNumber, b.isActive, a.createdAt 
                    FROM tbl_user_details b
                    INNER JOIN tbl_accounts a 
                    ON b.accountID = a.id
                    WHERE a.userType = 'ADMIN' AND a.isActive = 1`;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All active customers successfully retrieved.', data):
            response.ok(res, 'No active customers found', []);
    })
}

export const getLoggedUserAccountDetails = (req, res) => {
    if (!req.params.userID) return response.badRequest(res, "User ID is required.");
    
    const { userID } = req.params;

    const query =  "SELECT a.*, d.* FROM tbl_accounts a LEFT JOIN tbl_user_details d ON d.accountID = a.id WHERE a.id = ?";

    db.query(query, [userID], (err, data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (data.length == 0) return response.notFound(res, 'Username does not exists');

        return response.ok(res, "User account details successfully retrieved", data);
    })
}

export const updateUser = (req, res) => {
    if (!validateFields(req, res, [
            'username', 'password', 'email', 'firstName', 'middleName', 'lastName', 'birthDate', 'gender', 'contactNumber'
        ])) return;
    

    if (!req.params.userID) return response.badRequest(res, "User ID is required.");

    const { userID } = req.params;
    const { username, password, email, firstName, middleName, lastName, suffix, birthDate, gender, contactNumber } = req.body;

    // CHECK USER EXIST
    const query =  "SELECT * FROM tbl_accounts WHERE id = ?";

    db.query(query, [userID], async(err, data) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (!data.length) return response.notFound(res, "User not found.");

        const hashedPassword = await encrypt(password);

        const query2 = `
            UPDATE tbl_accounts 
            SET username = ?, password = ?, email = ?, updatedAt = ?
            WHERE id = ?
        `;

        db.query(query2, [username, hashedPassword, email, getCurrentTimestamp(), userID], async(errAccount, dataAccount) => {
            if (errAccount) return response.serverError(res, 'Database error', errAccount);
            
            const age = calculateAgeFromBirthDate(birthDate);

            if(dataAccount.affectedRows){
                const updateDetailsSql = `
                    UPDATE tbl_user_details
                    SET firstName=?, middleName=?, lastName=?, suffix=?, birthDate=?, age=?, gender=?, contactNumber=?, updatedAt = ?
                    WHERE accountID = ?
                `;
                const updateDetailsValues = [
                    firstName, middleName, lastName, suffix, birthDate, age, gender, contactNumber, getCurrentTimestamp(), userID
                ];

                db.query(updateDetailsSql, updateDetailsValues, (errRes, dataRes) => {
                    if (errRes) return response.serverError(res, 'Database error', errRes);
        
                    return response.ok(res, "Updating user details successful", dataRes);
                })
            }
        });
    });
};

 
export const deleteUser = (req, res) => {
    const { userID } = req.params;

    if(!userID) return response.badRequest(res, "userID not being passed.");

    const query = `UPDATE tbl_accounts SET isActive = 0, updatedAt = ? WHERE id = ?`;

    db.query(query, [getCurrentTimestamp(), userID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Deletion of user failed');

        return response.ok(res, "User deleted successfully.", result);
    })

}  