import { db } from '../connect.js';
import { getCurrentTimestamp } from '../utils/calculateValues.js';
import { generateBookingID } from '../utils/codeGenerator.js';
import * as response from '../utils/response.js';
import 'dotenv/config';
import { validateFields } from '../utils/validateFields.js';

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

    const slotValues = defaultSlots.map(slotTime => [courtID, slotTime, 1]);

    db.query(`INSERT INTO tbl_time_slots (courtID, slotTime, isActive) VALUES ?`, [slotValues], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
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

export const createNewCourt = (req, res) => {
    if (!validateFields(req, res, [
        'courtLabel', 'courtSport', 'courtType', 'courtDesc', 'isActive', 'rate1', 'rate2', 'rate3', 'rate4'
    ])) return;
    
    const { courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4 } = req.body;

    const query = `
        INSERT INTO tbl_courts (courtSport, courtLabel, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, updatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [courtSport, courtLabel, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, getCurrentTimestamp(), getCurrentTimestamp()];

    db.query(query, values, (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Insertion of court failed');
        
        insertDefaultTimeSlots(result.insertId, (err) => {
            if (err) return response.serverError(res, 'Court created but failed to add time slots', err);

            return response.ok(res, "Court created successfully.", {
                courtID: result.insertId,
                ...req.body
            });
        });
    });
};

export const updateCourt = (req, res) => {
    if (!validateFields(req, res, [
        'courtLabel', 'courtSport', 'courtType', 'courtDesc', 'isActive', 'rate1', 'rate2', 'rate3', 'rate4'
    ])) return;

    if (!req.params.courtID) return response.badRequest(res, "Court ID is required.");

    const { courtID } = req.params;
    const { courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4 } = req.body;

    const query = `
        UPDATE tbl_courts 
        SET courtLabel = ?, courtSport = ?, courtType = ?, courtDesc = ?, 
            isActive = ?, rate1 = ?, rate2 = ?, rate3 = ?, rate4 = ?, updatedAt = ?
        WHERE courtID = ?
    `;

    const values = [courtLabel, courtSport, courtType, courtDesc, isActive, rate1, rate2, rate3, rate4, getCurrentTimestamp(), courtID];

    db.query(query, values, (err, result) => {
        if (err) return response.serverError(res, "Database error.", err);

        if (result.affectedRows === 0) return response.notFound(res, "Court not found.");

        return response.ok(res, "Court updated successfully.", result);
    });
};

export const deleteCourt = (req, res) => {
    const { courtID } = req.params;

    if(!courtID) return response.badRequest(res, "CourtID not being passed.");

    const query = `UPDATE tbl_courts SET isActive = 0, updatedAt = ? WHERE courtID = ?`;

    db.query(query, [getCurrentTimestamp(), courtID], (err, result) => {
        if (err) return response.serverError(res, 'Database error', err);
        if (result.length > 0) return response.conflict(res, 'Deletion of court failed');

        return response.ok(res, "Court deleted successfully.", result);
    })

}  

