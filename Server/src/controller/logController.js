import { db, getConnection, getPromiseConnection } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import * as response from '../utils/response.js';
import 'dotenv/config';

export const getAllActivityLogs = (req, res) => {
    const q = 'SELECT * FROM tbl_activity_logs ORDER BY createdAt DESC';

    db.query(q, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)
            ? response.ok(res, 'All activity logs successfully retrieved.', data)
            : response.ok(res, 'No activity logs as of now.',[]);
    });
}

export const getActivityLogs = async (req, res) => {
    const { entityType, entityId, userId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];

    if (entityType) { where.push('entity_type = ?'); params.push(entityType); }
    if (entityId)   { where.push('entity_id = ?'); params.push(entityId); }
    if (userId)     { where.push('user_id = ?'); params.push(userId); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    db.query(
        `SELECT * FROM tbl_activity_logs ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)],
        (err, rows) => err ? response.serverError(res, err) : response.ok(res, rows)
    );
};

export const logActivity = ({userId = null, userRole = null, action, entityType, entityId = null, description = null, metadata = null, ipAddress = null }) => {
    const now = getCurrentTimestamp();
    const sql = `
        INSERT INTO tbl_activity_logs
        (accountID, userType, action, entity_type, entity_id, description, metadata, ip_address, updatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, userRole, action, entityType, entityId, description, metadata ? JSON.stringify(metadata) : null, ipAddress, now, now]
    
    db.query(sql, values, (err) => {
        if (err) console.error('Activity log failed:', err);
    });
}