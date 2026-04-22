import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db';
import { generatePassword } from '../utils/password';
import { sendMail } from '../utils/mail';
import { RegisterRequest } from '../types/register';
import { ResultSetHeader } from 'mysql2';
import fs from "fs";
import path from "path";

export const registerOrganization = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
) => {
  const { organization_name, temple_name, user_name, user_email, user_phone } = req.body;

  if (!organization_name || !temple_name || !user_name || !user_email || !user_phone) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'All fields are required: organization_name, temple_name, user_name, user_email, user_phone'
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check if email already exists
    const [existingUsers] = await conn.execute<any[]>(
      `SELECT id FROM users WHERE email = ? AND deleted_at IS NULL`,
      [user_email]
    );
    if (existingUsers.length > 0) throw new Error('EMAIL_ALREADY_EXISTS');
// Check if phone already exists
    const [existingphoneUsers] = await conn.execute<any[]>(
      `SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL`,
      [user_phone]
    );
    if (existingphoneUsers.length > 0) throw new Error('PHONE_ALREADY_EXISTS');

    // Insert organization
    const [orgRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO organizations (name, status) VALUES (?, 'active')`,
      [organization_name]
    );
    const organizationId = orgRes.insertId;

    // Insert primary temple
    const [templeRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO temples (organization_id, name, is_primary, status)
       VALUES (?, ?, TRUE, 'active')`,
      [organizationId, temple_name]
    );
    const templeId = templeRes.insertId;

    // Get system defaults
    const [defaultsRows] = await conn.execute<any[]>(
      `SELECT
         MAX(CASE WHEN key_name='default_max_users' THEN value_int END) AS max_users,
         MAX(CASE WHEN key_name='default_max_temples' THEN value_int END) AS max_temples
       FROM system_defaults`
    );
    const defaults = defaultsRows[0];
    if (!defaults?.max_users || !defaults?.max_temples) throw new Error('SYSTEM_DEFAULTS_MISSING');

    await conn.execute(
      `INSERT INTO organization_limits (organization_id, max_users, max_temples, source)
       VALUES (?, ?, ?, 'default')`,
      [organizationId, defaults.max_users, defaults.max_temples]
    );

    // Create admin user
    const rawPassword = generatePassword();
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const [userRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO users (
        organization_id, temple_id, name, email, phone, password_hash,
        user_type, status, force_password_reset
      ) VALUES (?, ?, ?, ?, ?, ?, 'org_admin', 'active', TRUE)`,
      [organizationId, templeId, user_name, user_email, user_phone, passwordHash]
    );
    const userId = userRes.insertId;

    // Create roles
    await conn.execute(
      `INSERT INTO roles (organization_id, temple_id, name, is_system)
       VALUES
         (?, NULL, 'org_admin', 1),
         (?, ?, 'temple_admin', 1),
         (?, ?, 'user', 1)
       ON DUPLICATE KEY UPDATE id=id`,
      [organizationId, organizationId, templeId, organizationId, templeId]
    );

    // Map user to role
    const [mapRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT ?, id FROM roles
       WHERE organization_id = ? AND name = 'org_admin' AND deleted_at IS NULL
       LIMIT 1`,
      [userId, organizationId]
    );
    if (mapRes.affectedRows !== 1) throw new Error('ROLE_ASSIGNMENT_FAILED');

    await conn.commit();

    // Send password to admin email
    await sendMail({
      to: user_email,
      subject: 'Your Admin Account Created',
      text: `Hello ${user_name},

Your organization account has been created successfully.

Login details:
Email: ${user_email}
Password: ${rawPassword}

This is a System Ganreated Password
Please log in and change your password immediately.

Thanks,
Team`
    });

    return res.status(201).json({
      success: true,
      organization_id: organizationId,
      admin_user_id: userId,
      message: 'Admin account created. Password sent via email.'
    });

  } catch (error: any) {
    await conn.rollback();

    // let errorMessage = 'REGISTRATION_FAILED';
    let errorCode = 'REGISTRATION_FAILED';
    let message = 'Registration failed. Please try again.';
    // if (error.message === 'PHONE_ALREADY_EXISTS') errorMessage = 'PHONE_ALREADY_EXISTS';
    // if (error.message === 'EMAIL_ALREADY_EXISTS') errorMessage = 'EMAIL_ALREADY_EXISTS';
    // if (error.message === 'SYSTEM_DEFAULTS_MISSING') errorMessage = 'SYSTEM_DEFAULTS_MISSING';
    // if (error.message === 'ROLE_ASSIGNMENT_FAILED') errorMessage = 'ROLE_ASSIGNMENT_FAILED';

      if (error.message === 'PHONE_ALREADY_EXISTS') {
    errorCode = 'PHONE_ALREADY_EXISTS';
    message = 'Phone number already registered';
  }

  if (error.message === 'EMAIL_ALREADY_EXISTS') {
    errorCode = 'EMAIL_ALREADY_EXISTS';
    message = 'Email already registered';
  }

  if (error.message === 'SYSTEM_DEFAULTS_MISSING') {
    errorCode = 'SYSTEM_DEFAULTS_MISSING';
    message = 'System configuration missing. Contact admin.';
  }

  if (error.message === 'ROLE_ASSIGNMENT_FAILED') {
    errorCode = 'ROLE_ASSIGNMENT_FAILED';
    message = 'Failed to assign admin role';
  }

    return res.status(400).json({
      // success: false,
      // error: errorMessage,
      // details: error.message
       success: false,
        error: errorCode,
        message,
    });
  } finally {
    conn.release();
  }
};




export const getRegisterOrganization = async (
  req: Request,
  res: Response
) => {
  let conn;

  try {
    conn = await db.getConnection();

    const [rows] = await conn.execute<any[]>(
      `SELECT 
        id,
        name,
        legal_name,
        email,
        phone,
        city,
        state,
        country,
        status,
        created_at
      FROM organizations
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('GET ORGANIZATIONS ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    if (conn) conn.release();
  }
};


export const getOrganizationById = async (
  req: Request,
  res: Response
) => {
  let conn;

  try {
    const { id } = req.params;

    conn = await db.getConnection();

    const [rows] = await conn.execute<any[]>(
      `SELECT 
        id,
        name,
        img_name,
        legal_name,
        registration_number,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode,
        slug,
        status,
        timezone,
        created_at,
        updated_at
      FROM organizations
      WHERE id = ?
      AND deleted_at IS NULL`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("GET ORGANIZATION BY ID ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};


// export const updateOrganization = async (
//   req: Request,
//   res: Response
// ) => {
//   let conn;

//   try {
//     const { id } = req.params;

//     const {
//       name,
//       legal_name,
//       img_name,
//       registration_number,
//       email,
//       phone,
//       address_line1,
//       address_line2,
//       city,
//       state,
//       country,
//       pincode,
//       status,
//       timezone
//     } = req.body;

//     conn = await db.getConnection();

//     const [result]: any = await conn.execute(
//       `UPDATE organizations SET
//         name = ?,
//         legal_name = ?,
//         img_name =?,
//         registration_number = ?,
//         email = ?,
//         phone = ?,
//         address_line1 = ?,
//         address_line2 = ?,
//         city = ?,
//         state = ?,
//         country = ?,
//         pincode = ?,
//         status = ?,
//         timezone = ?
//       WHERE id = ?
//       AND deleted_at IS NULL`,
//       [
//         name,
//         legal_name,
//         img_name,
//         registration_number,
//         email,
//         phone,
//         address_line1,
//         address_line2,
//         city,
//         state,
//         country,
//         pincode,
//         status,
//         timezone,
//         id
//       ]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Organization not found or already deleted"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Organization updated successfully"
//     });

//   } catch (error) {
//     console.error("UPDATE ORGANIZATION ERROR:", error);
//     return res.status(500).json({ message: "Server error" });
//   } finally {
//     if (conn) conn.release();
//   }
// };

export const updateOrganization = async (
  req: Request,
  res: Response
) => {

  let conn;

  try {

    const { id } = req.params;

    conn = await db.getConnection();

    // =====================
    // GET OLD IMAGE
    // =====================

    const [rows]: any = await conn.execute(

      "SELECT img_name FROM organizations WHERE id=?",

      [id]

    );

    if (!rows.length) {

      return res.status(404).json({

        success: false,
        message: "Organization not found"

      });

    }

    const oldImage = rows[0].img_name;

    // =====================
    // NEW IMAGE
    // =====================

    let newImageName = oldImage;

    if (req.file) {

      newImageName = req.file.filename;

      // delete old image safely

      if (oldImage && oldImage !== newImageName) {

        const oldPath = path.join(

          __dirname,
          "../public/organizations",
          oldImage

        );

        if (fs.existsSync(oldPath)) {

          fs.unlinkSync(oldPath);

        }

      }

    }

    // =====================
    // BODY DATA
    // =====================

    const {

      name,
      legal_name,
      registration_number,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      status,
      timezone

    } = req.body;

    // =====================
    // UPDATE DB
    // =====================

    await conn.execute(

      `UPDATE organizations SET

        name=?,
        legal_name=?,
        img_name=?,
        registration_number=?,
        email=?,
        phone=?,
        address_line1=?,
        address_line2=?,
        city=?,
        state=?,
        country=?,
        pincode=?,
        status=?,
        timezone=?

      WHERE id=?`,

      [

        name,
        legal_name,
        newImageName,
        registration_number,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode,
        status,
        timezone,
        id

      ]

    );

    return res.json({

      success: true,
      message: "Organization updated successfully"

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,
      message: "Server error"

    });

  }

  finally {

    if (conn) conn.release();

  }

};


export const deleteOrganization = async (
  req: Request,
  res: Response
) => {
  let conn;

  try {
    const { id } = req.params;

    conn = await db.getConnection();

    const [result]: any = await conn.execute(
      `UPDATE organizations 
       SET deleted_at = NOW()
       WHERE id = ?
       AND deleted_at IS NULL`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found or already deleted"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ORGANIZATION ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};



