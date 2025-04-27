const pool = require("../db"); // Assuming you have a db.js file for database connection

class User {
    static async createUser({
        firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    alternatePhone,
    email,
    street,
    city,
    state,
    zipCode,
    country,
    username,
    password,  // This is now actually the hashed password
    role,
}) {
    // Debug the received parameters
    console.log("In createUser, received:", {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        username,
        password: password ? "PASSWORD_PROVIDED" : "NO_PASSWORD",
        role
    });

    // Check for required fields
    if (!firstName || !lastName || !dateOfBirth || !gender || !phone || !email || !username || !password || !role) {
        throw new Error(`Missing required fields: ${!firstName ? 'firstName' : ''} ${!lastName ? 'lastName' : ''} ${!dateOfBirth ? 'dateOfBirth' : ''} ${!gender ? 'gender' : ''} ${!phone ? 'phone' : ''} ${!email ? 'email' : ''} ${!username ? 'username' : ''} ${!password ? 'password' : ''} ${!role ? 'role' : ''}`);
    }

        const query = `
            INSERT INTO Users (
                first_name, last_name, date_of_birth, gender, phone, 
                alternate_phone, email, street, city, state, zip_code, 
                country, username, password_hash, role
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`;

        const values = [
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            alternatePhone,
            email,
            street,
            city,
            state,
            zipCode,
            country,
            username,
            password,  // This is the hashed password from the route
            role
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            console.error("Database error:", err);
            throw new Error(`Error creating user: ${err.message}`);
        }
    }

    // Rest of the User class methods remain unchanged
    static async getUserById(userId) {
        const query = 'SELECT * FROM Users WHERE user_id = $1';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error fetching user: ${err.message}`);
        }
    }

    static async getUserByEmail(email) {
        const query = 'SELECT * FROM Users WHERE email = $1';
        try {
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error fetching user: ${err.message}`);
        }
    }

    static async updateUser(userId, updateData) {
        const query = `
            UPDATE Users 
            SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                alternate_phone = COALESCE($4, alternate_phone),
                street = COALESCE($5, street),
                city = COALESCE($6, city),
                state = COALESCE($7, state),
                zip_code = COALESCE($8, zip_code),
                country = COALESCE($9, country),
                profile_picture_url = COALESCE($10, profile_picture_url),
                updated_by = $11,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $12
            RETURNING *`;

        const values = [
            updateData.firstName,
            updateData.lastName,
            updateData.phone,
            updateData.alternatePhone,
            updateData.street,
            updateData.city,
            updateData.state,
            updateData.zipCode,
            updateData.country,
            updateData.profilePictureUrl,
            updateData.updatedBy,
            userId
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error updating user: ${err.message}`);
        }
    }

    static async verifyEmail(userId) {
        const query = 'UPDATE Users SET email_verified = true WHERE user_id = $1 RETURNING *';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error verifying email: ${err.message}`);
        }
    }

    static async verifyPhone(userId) {
        const query = 'UPDATE Users SET phone_verified = true WHERE user_id = $1 RETURNING *';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error verifying phone: ${err.message}`);
        }
    }

    static async updateLastLogin(userId) {
        const query = 'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error updating last login: ${err.message}`);
        }
    }

    static async deleteUser(userId) {
        const query = 'UPDATE Users SET is_active = false WHERE user_id = $1 RETURNING *';
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            throw new Error(`Error deactivating user: ${err.message}`);
        }
    }
    // ... other methods
}


module.exports = User;