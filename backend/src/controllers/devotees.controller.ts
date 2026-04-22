

import { Request, Response } from "express";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


/**
 * GET ALL DEVOTEES
 */
export const getDevotees = async (
  req: Request,
  res: Response
) => {

  try {

    const organization_id =
      req.user!.organization_id;

    const temple_id =
      req.user!.temple_id;


    const [rows] =
      await db.query<RowDataPacket[]>(

        `SELECT
          id,
          organization_id,
          temple_id,
          name,
          email,
          phone,
          gender,
          dob,
          gotra,
          rashi,
          nakshatra,
          remark,
          address_line1,
          address_line2,
          city,
          state,
          country,
          pincode,
          status,
          created_at,
          updated_at
        FROM devotees
        WHERE deleted_at IS NULL
        AND organization_id = ?
        AND temple_id = ?
        ORDER BY id DESC`,

        [organization_id, temple_id]

      );


    res.json({

      success: true,
      data: rows,

    });

  }
  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};



/**
 * GET DEVOTEE BY ID
 */
export const getDevoteeById =
async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const organization_id =
      req.user!.organization_id;

    const temple_id =
      req.user!.temple_id;


    const [rows] =
      await db.query<RowDataPacket[]>(

        `SELECT *
         FROM devotees
         WHERE id = ?
         AND deleted_at IS NULL
         AND organization_id = ?
         AND temple_id = ?`,

        [id, organization_id, temple_id]

      );


    if (!rows.length) {

      return res.status(404).json({

        success: false,
        message: "Devotee not found",

      });

    }


    res.json({

      success: true,
      data: rows[0],

    });

  }
  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};




/**
 * CREATE DEVOTEE
 */


export const createDevotee = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const {
      name,
      email = null,
      phone = null,
      gender = null,
      dob = null,
      gotra = null,
      rashi = null,
      nakshatra = null,
      remark = null,
      address_line1 = null,
      address_line2 = null,
      city = null,
      state = null,
      country = null,
      pincode = null,
      status = "active",
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check if email or phone already exists
    if (email || phone) {
      const conditions: string[] = [];
      const params: any[] = [organization_id, temple_id];

      if (email) {
        conditions.push("email = ?");
        params.push(email);
      }
      if (phone) {
        conditions.push("phone = ?");
        params.push(phone);
      }

      const [existing]: any = await db.query(
        `SELECT * FROM devotees
         WHERE organization_id = ? AND temple_id = ? AND (${conditions.join(
           " OR "
         )})`,
        params
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Devotee with this email or phone already exists",
        });
      }
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO devotees
        (
          organization_id,
          temple_id,
          name,
          email,
          phone,
          gender,
          dob,
          gotra,
          rashi,
          nakshatra,
          remark,
          address_line1,
          address_line2,
          city,
          state,
          country,
          pincode,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organization_id,
        temple_id,
        name,
        email,
        phone,
        gender,
        dob,
        gotra,
        rashi,
        nakshatra,
        remark,
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode,
        status,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Devotee created successfully",
      id: result.insertId,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE DEVOTEE
 */

export const updateDevotee = async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const updated_by_user_id = req.user!.id;

    const {
      name,
      email,
      phone,
      gender,
      dob,
      gotra,
      rashi,
      nakshatra,
      remark,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      status,
    } = req.body;

    // =====================================
    // 1 Fetch old record snapshot
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM devotees WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!oldRows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Devotee not found"
      });
    }

    const oldData = oldRows[0];

    // =====================================
    // 2 Update devotee record
    // =====================================
    const [result] = await connection.query(
      `UPDATE devotees SET
        name=?,
        email=?,
        phone=?,
        gender=?,
        dob=?,
        gotra=?,
        rashi=?,
        nakshatra=?,
        remark=?,
        address_line1=?,
        address_line2=?,
        city=?,
        state=?,
        country=?,
        pincode=?,
        status=?,
        updated_at=NOW()
      WHERE id=? AND organization_id=? AND temple_id=?`,
      [
        name,
        email,
        phone,
        gender,
        dob,
        gotra,
        rashi,
        nakshatra,
        remark,
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode,
        status,
        id,
        organization_id,
        temple_id,
      ]
    );

    // =====================================
    // 3 Insert audit log
    // =====================================
    const newData = {
      name,
      email,
      phone,
      gender,
      dob,
      gotra,
      rashi,
      nakshatra,
      remark,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      status,
    };

    await connection.query(
      `INSERT INTO audit_logs
        (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
       VALUES (?, ?, ?, 'devotees', ?, 'update', ?, ?, NOW())`,
      [
        updated_by_user_id,
        organization_id,
        temple_id,
        id,
        JSON.stringify(oldData),
        JSON.stringify(newData)
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Devotee updated successfully"
    });

  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    connection.release();
  }
};


/**
 * DELETE DEVOTEE (SOFT DELETE)
 */
export const deleteDevotee =
async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const organization_id =
      req.user!.organization_id;

    const temple_id =
      req.user!.temple_id;



    await db.query(

      `UPDATE devotees
       SET deleted_at = NOW()
       WHERE id=?
       AND organization_id=?
       AND temple_id=?`,

      [id, organization_id, temple_id]

    );



    res.json({

      success: true,
      message: "Deleted successfully",

    });

  }
  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message,

    });

  }

};


export const searchDevotees = async (
  req: Request,
  res: Response
) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        id,
        name,
        email,
        phone,
        gender,
        dob,
        gotra,
        rashi,
        nakshatra
      FROM devotees
      WHERE deleted_at IS NULL
      AND organization_id = ?
      AND temple_id = ?
      AND (
        name LIKE ?
        OR phone LIKE ?
      )
      ORDER BY name ASC
      LIMIT 10
      `,
      [
        organization_id,
        temple_id,
        `%${q}%`,
        `%${q}%`,
      ]
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};