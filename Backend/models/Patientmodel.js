const pool = require('../server');

class Patient {
    static async createPatient(patientData) {
        const query = `
            INSERT INTO Patients (
                user_id, blood_type, preferred_language,
                emr_access_token, emr_access_expiry
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;

        const values = [
            patientData.userId,
            patientData.bloodType,
            patientData.preferredLanguage,
            patientData.emrAccessToken,
            patientData.emrAccessExpiry
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error creating patient: ${err.message}`);
        }
    }

    static async getPatientById(patientId) {
        const query = 'SELECT * FROM Patients WHERE patient_id = $1';
        try {
            const result = await pool.query(query, [patientId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error fetching patient: ${err.message}`);
        }
    }

    static async getPatientByUserId(userId) {
        const query = 'SELECT * FROM Patients WHERE user_id = $1';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error fetching patient: ${err.message}`);
        }
    }

    static async updatePatient(patientId, updateData) {
        const query = `
            UPDATE Patients 
            SET 
                blood_type = COALESCE($1, blood_type),
                preferred_language = COALESCE($2, preferred_language),
                emr_access_token = COALESCE($3, emr_access_token),
                emr_access_expiry = COALESCE($4, emr_access_expiry)
            WHERE patient_id = $5
            RETURNING *`;

        const values = [
            updateData.bloodType,
            updateData.preferredLanguage,
            updateData.emrAccessToken,
            updateData.emrAccessExpiry,
            patientId
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error updating patient: ${err.message}`);
        }
    }

    static async deletePatient(patientId) {
        const query = 'DELETE FROM Patients WHERE patient_id = $1 RETURNING *';
        try {
            const result = await pool.query(query, [patientId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error deleting patient: ${err.message}`);
        }
    }

    static async updateEmrAccess(patientId, token, expiry) {
        const query = `
            UPDATE Patients 
            SET 
                emr_access_token = $1,
                emr_access_expiry = $2
            WHERE patient_id = $3
            RETURNING *`;

        try {
            const result = await pool.query(query, [token, expiry, patientId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error updating EMR access: ${err.message}`);
        }
    }
}

module.exports = Patient;