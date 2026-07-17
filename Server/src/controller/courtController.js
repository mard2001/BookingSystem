import { db, getPromiseConnection } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import { generateBookingID } from '../utils/codeGenerator.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import { validateFields } from '../utils/validateFields.js';
import { logActivity } from './logController.js';

export const getAllCourts = (req, res) => {
    
    const query = 'SELECT * FROM tbl_courts WHERE isActive != 0';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All courts successfully retrieved.', data):
            response.ok(res, 'No courts found',[]);
    })
}

export const getAvailableCourts = (req, res) => {
    const query = 'SELECT * FROM tbl_courts WHERE isActive = 1';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'All available courts successfully retrieved.', data):
            response.ok(res, 'No available courts found',[]);
    })
}

export const getCountAvailableCourts = (req, res) => {
    const query = 'SELECT COUNT(*) AS totalCount FROM tbl_courts WHERE isActive = 1';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'Count of courts successfully retrieved.', data):
            response.ok(res, 'Count not available',[]);
    })
}

export const getCountUnavailableCourts = (req, res) => {
    const query = 'SELECT COUNT(*) AS totalCount FROM tbl_courts WHERE isActive = 0';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'Count of courts successfully retrieved.', data):
            response.ok(res, 'Count not available',[]);
    })
}

export const getCountMaintenanceCourts = (req, res) => {
    const query = 'SELECT COUNT(*) AS totalCount FROM tbl_courts WHERE isActive = 2';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'Count of courts successfully retrieved.', data):
            response.ok(res, 'Count not available',[]);
    })
}

export const getCountTotalCourts = (req, res) => {
    const query = 'SELECT COUNT(*) AS totalCount FROM tbl_courts';

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        return (data.length > 0)?
            response.ok(res, 'Count of all courts successfully retrieved.', data):
            response.ok(res, 'Count not available',[]);
    })
}

const insertDefaultTimeSlots = (courtID, callback) => {
    const defaultSlots = [
        '08:00:00', '09:00:00', '10:00:00', '11:00:00',
        '12:00:00', '13:00:00', '14:00:00', '15:00:00',
        '16:00:00', '17:00:00', '18:00:00', '19:00:00',
        '20:00:00', '21:00:00', '22:00:00', '23:00:00',
    ];

    const slotValues = defaultSlots.map(slotTime => [courtID, slotTime, 1, getCurrentTimestamp(), getCurrentTimestamp()]);

    db.query(`INSERT INTO tbl_time_slots (courtID, slotTime, isActive, updatedAt,createdAt) VALUES ?`, [slotValues], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

const insertTimeSlots = (conn, courtID, startTime, endTime) => {
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);

    if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) {
        return Promise.reject(new Error('Invalid operating hours: startTime must be before endTime.'));
    }

    const slotValues = [];
    for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = `${String(hour).padStart(2, '0')}:00:00`;
        slotValues.push([courtID, slotTime, 1, getCurrentTimestamp(), getCurrentTimestamp()]);
    }

    return conn.query(`INSERT INTO tbl_time_slots (courtID, slotTime, isActive, updatedAt, createdAt) VALUES ?`, [slotValues]);
};

export const externalInsertDefaultTimeSlots = (req, res) => {
    if (!req.params.courtID) return response.badRequest(res, "Court ID is required.");
    const { courtID } = req.params;

    const defaultSlots = [
        '08:00:00', '09:00:00', '10:00:00', '11:00:00',
        '12:00:00', '13:00:00', '14:00:00', '15:00:00',
        '16:00:00', '17:00:00', '18:00:00', '19:00:00',
        '20:00:00', '21:00:00', '22:00:00', '23:00:00',
    ];

    const slotValues = defaultSlots.map(slotTime => [courtID, slotTime, 1]);
    const query = `INSERT INTO tbl_time_slots (courtID, slotTime, isActive) VALUES ?`

    db.query(query, [slotValues], (err, result) => {
        if (err) return response.serverError(res, "Database error.", err);
        if (result.length > 0) return response.conflict(res, 'Insertion of court time slots failed');

        return response.ok(res, "Court time slots added successfully.", result);
    });
};

export const createNewCourt = async (req, res) => {
    if (!validateFields(req, res, [
        'courtLabel', 'courtSport', 'courtType', 'courtDesc', 'isActive', 'rate1', 'rate2', 'rate3', 'rate4', 'startTime', 'endTime'
    ])) return;
    
    const { courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, startTime, endTime } = req.body;

    let conn;
    try {
        conn = await getPromiseConnection();
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO tbl_courts (courtSport, courtLabel, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, updatedAt, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [courtSport, courtLabel, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, getCurrentTimestamp(), getCurrentTimestamp()]
        );

        await insertTimeSlots(conn, result.insertId, startTime, endTime);

        await conn.commit();

        logActivity({
            userId: req.user?.id ?? null, userRole: req.user?.role ?? null, ipAddress: req.ip,
            metadata: { courtSport, courtLabel, courtType, courtDesc },
            action: 'COURT_ADDED', entityType: 'COURT_MODULE',
            description: `${req.user?.fullname ?? 'Someone'} addded new court with a courtID of ${result.insertId}`
        });

        return response.ok(res, "Court created successfully.", {
            courtID: result.insertId,
            ...req.body
        });
    } catch (err) {
        if (conn) await conn.rollback();
        return response.serverError(res, 'Failed to create court', err);
    } finally {
        if (conn) conn.release();
    }
};

export const updateCourt = async (req, res) => {
    if (!validateFields(req, res, [
        'courtLabel', 'courtSport', 'courtType', 'courtDesc', 'isActive', 'rate1', 'rate2', 'rate3', 'rate4'
    ])) return;

    if (!req.params.courtID) return response.badRequest(res, "Court ID is required.");

    const { courtID } = req.params;
    const { courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, startTime, endTime } = req.body;

    let conn;
    try {
        conn = await getPromiseConnection();
        await conn.beginTransaction();

        const [result] = await conn.query(
            `UPDATE tbl_courts 
             SET courtLabel = ?, courtSport = ?, courtType = ?, courtDesc = ?, 
                 isActive = ?, rate1 = ?, rate2 = ?, rate3 = ?, rate4 = ?, updatedAt = ?
             WHERE courtID = ?`,
            [courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, getCurrentTimestamp(), courtID]
        );

        if (result.affectedRows === 0) {
            await conn.rollback();
            return response.notFound(res, "Court not found.");
        }

        if (startTime && endTime) {
            await syncTimeSlots(conn, courtID, startTime, endTime);
        }

        await conn.commit();
        logActivity({
            userId: req.user?.id ?? null, userRole: req.user?.role ?? null, ipAddress: req.ip,
            metadata: { courtSport, courtLabel, courtType, courtDesc },
            action: 'COURT_UPDATED', entityType: 'COURT_MODULE',
            description: `${req.user?.fullname ?? 'Someone'} updated court with a courtID of ${courtID}`
        });
        return response.ok(res, "Court updated successfully.", result);

    } catch (err) {
        if (conn) await conn.rollback();
        return response.serverError(res, "Failed to update court.", err);
    } finally {
        if (conn) conn.release();

    }
};

const syncTimeSlots = async (conn, courtID, startTime, endTime) => {
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = parseInt(endTime.split(':')[0], 10);

    if (isNaN(startHour) || isNaN(endHour) || startHour >= endHour) {
        throw new Error('Invalid operating hours: startTime must be before endTime.');
    }

    const newHours = [];
    for (let hour = startHour; hour < endHour; hour++) {
        newHours.push(`${String(hour).padStart(2, '0')}:00:00`);
    }

    // Deactivate slots now outside the range (keeps booking history intact)
    await conn.query(
        `UPDATE tbl_time_slots SET isActive = 0, updatedAt = ? 
         WHERE courtID = ? AND slotTime NOT IN (?)`,
        [getCurrentTimestamp(), courtID, newHours]
    );

    // Find which hours already exist so we don't duplicate
    const [existing] = await conn.query(
        `SELECT slotTime FROM tbl_time_slots WHERE courtID = ? AND slotTime IN (?)`,
        [courtID, newHours]
    );
    const existingSet = new Set(existing.map(row => row.slotTime));

    // Reactivate ones already in DB
    if (existing.length > 0) {
        await conn.query(
            `UPDATE tbl_time_slots SET isActive = 1, updatedAt = ? 
             WHERE courtID = ? AND slotTime IN (?)`,
            [getCurrentTimestamp(), courtID, [...existingSet]]
        );
    }

    // Insert brand-new hours not seen before
    const toInsert = newHours.filter(h => !existingSet.has(h));
    if (toInsert.length > 0) {
        const slotValues = toInsert.map(slotTime => [courtID, slotTime, 1, getCurrentTimestamp(), getCurrentTimestamp()]);
        await conn.query(
            `INSERT INTO tbl_time_slots (courtID, slotTime, isActive, updatedAt, createdAt) VALUES ?`,
            [slotValues]
        );
    }
};

export const deleteCourt = (req, res) => {
    const { courtID } = req.params;

    if(!courtID) return response.badRequest(res, "CourtID not being passed.");

    const query = `UPDATE tbl_courts SET isActive = 0, updatedAt = ? WHERE courtID = ?`;

    db.query(query, [getCurrentTimestamp(), courtID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Deletion of court failed');

        logActivity({
            userId: req.user?.id ?? null, userRole: req.user?.role ?? null, ipAddress: req.ip,
            action: 'COURT_DELETED', entityType: 'COURT_MODULE',
            description: `${req.user?.fullname ?? 'Someone'} deleted court with a courtID of ${courtID}`
        });

        return response.ok(res, "Court deleted successfully.", result);
    })

}  

// COURT CLOSURE

export const getAllClosure = (req, res) => {
    
    const query = `
        SELECT 
            bd.id,
            bd.type,
            bd.reason,
            bd.scope,
            bd.courtID,
            bd.remarks,
            bd.isActive,
            bd.createdBy,
            bd.blackoutDateStart,
            bd.blackoutDateEnd,
            bd.createdAt,
            bd.updatedAt,
            GROUP_CONCAT(c.courtID ORDER BY c.courtID SEPARATOR '||') AS courtIDs,
            GROUP_CONCAT(c.courtLabel ORDER BY c.courtID SEPARATOR '||') AS courtLabels,
            GROUP_CONCAT(c.courtSport ORDER BY c.courtID SEPARATOR '||') AS courtSports
        FROM tbl_blackout_dates bd
        LEFT JOIN tbl_courts c 
            ON FIND_IN_SET(c.courtID, bd.courtID)
        WHERE bd.isActive != 0
        GROUP BY 
            bd.id,
            bd.type,
            bd.reason,
            bd.scope,
            bd.courtID,
            bd.remarks,
            bd.isActive,
            bd.createdBy,
            bd.blackoutDateStart,
            bd.blackoutDateEnd,
            bd.createdAt,
            bd.updatedAt
    `;

    db.query(query, (err, data) => {
        if(err) return response.serverError(res, "Database error", err);

        const parsed = data.map(({ courtIDs, courtLabels, courtSports, ...row }) => ({
            ...row,
            courts: courtIDs
                ? courtIDs.split('||').map((id, i) => ({
                    courtID: id,
                    courtLabel: courtLabels.split('||')[i],
                    courtSport: courtSports.split('||')[i],
                }))
                : [],
        }));

        return (parsed.length > 0) ?
            response.ok(res, 'All courts closure successfully retrieved.', parsed) :
            response.ok(res, 'No courts closure found', []);
    });
};

export const createNewClosure = (req, res) => {
    if (!validateFields(req, res, [
        'reason', 'type', 'blackoutDateStart', 'blackoutDateEnd', 'scope', 'courtID', 'createdBy'
    ])) return;
    
    const { reason, type, blackoutDateStart, blackoutDateEnd, scope, courtID, remarks, createdBy } = req.body;

    const query = `
        INSERT INTO tbl_blackout_dates (reason, type, blackoutDateStart, blackoutDateEnd, scope, courtID, remarks, isActive, createdBy, updatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [reason, type, blackoutDateStart, blackoutDateEnd, scope, courtID, remarks?? "", 1, createdBy, getCurrentTimestamp(), getCurrentTimestamp()];

    db.query(query, values, (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Insertion of court closure failed');

        logActivity({
            userId: req.user?.id ?? null, userRole: req.user?.role ?? null, ipAddress: req.ip,
            metadata: { reason, type, blackoutDateStart, blackoutDateEnd, scope },
            action: 'COURT_CLOSURE_ADDED', entityType: 'COURT_MODULE',
            description: `${req.user?.fullname ?? 'Someone'} addded new court closure due to ${reason}`
        });
        
        return response.ok(res, "Court closure added successfully.", {
            ...req.body
        });
    });
};

export const deleteClosure = (req, res) => {
    const { closureID } = req.params;

    if(!closureID) return response.badRequest(res, "Closure ID not being passed.");

    const query = `UPDATE tbl_blackout_dates SET isActive = 0, updatedAt = ? WHERE id = ?`;

    db.query(query, [getCurrentTimestamp(), closureID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Deletion of court closure failed');

        logActivity({
            userId: req.user?.id ?? null, userRole: req.user?.role ?? null, ipAddress: req.ip,
            metadata: { closureID },
            action: 'COURT_CLOSURE_ADDED', entityType: 'COURT_MODULE',
            description: `${req.user?.fullname ?? 'Someone'} deleted court closure.`
        });

        return response.ok(res, "Court closure deleted successfully.", result);
    })

}  