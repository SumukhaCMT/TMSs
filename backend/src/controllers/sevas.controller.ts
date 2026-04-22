

import { Request, Response } from "express";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
// import { logAudit } from "../utils/auditLogger";



/**
 * GET ALL SEVAS
 */
export const getSevas = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;


    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT
        id,
        organization_id,
        temple_id,
        seva_name,
        amount,
        is_default,
        display_order,
        is_recurring,
        recurring_interval,
        recurring_count,
        remark,
        created_at,
        updated_at
      FROM sevas
      WHERE organization_id = ?
      AND temple_id = ?
      ORDER BY display_order ASC`,

      [organization_id, temple_id,]

    );


    res.json({

      success: true,
      data: rows

    });

  }

  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};



/**
 * GET SEVA BY ID
 */
export const getSevaById = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const organization_id = req.user!.organization_id;

    const temple_id = req.user!.temple_id;


    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT *
       FROM sevas
       WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?`,

      [id, organization_id, temple_id]

    );


    if (!rows.length) {

      return res.status(404).json({

        success: false,
        message: "Seva not found"

      });

    }


    res.json({

      success: true,
      data: rows[0]

    });

  }

  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};




/**
 * CREATE SEVA
 */
export const createSeva = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;

    const temple_id = req.user!.temple_id;


    const {

      seva_name,
      amount,
      is_default = "no",
      display_order = 1,
      is_recurring = "no",
      recurring_interval = null,
      recurring_count = null,
      remark = null

    } = req.body;


    if (!seva_name || !amount) {

      return res.status(400).json({

        success: false,
        message: "Required fields missing"

      });

    }



    const [result] = await db.query<ResultSetHeader>(

      `INSERT INTO sevas
      (
        organization_id,
        temple_id,
        seva_name,
        amount,
        is_default,
        display_order,
        is_recurring,
        recurring_interval,
        recurring_count,
        remark
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [

        organization_id,
        temple_id,
        seva_name,
        amount,
        is_default,
        display_order,
        is_recurring,
        recurring_interval,
        recurring_count,
        remark

      ]

    );



    res.status(201).json({

      success: true,
      message: "Seva created successfully",
      id: result.insertId

    });

  }

  catch (error: any) {


    if (error.code === "ER_DUP_ENTRY") {

      return res.status(400).json({

        success: false,
        message: "Seva already exists"

      });

    }


    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};




/**
 * UPDATE SEVA
 */

export const updateSeva = async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const updated_by_user_id = req.user!.id;
    const { id } = req.params;

    const {
      seva_name,
      amount,
      is_default,
      display_order,
      is_recurring,
      recurring_interval,
      recurring_count,
      remark
    } = req.body;

    // =====================================
    // 1 Fetch old record snapshot
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM sevas WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!oldRows.length) {
      return res.status(404).json({
        success: false,
        message: "Seva not found or unauthorized"
      });
    }

    const oldData = oldRows[0];

    // =====================================
    // 2 Update Seva
    // =====================================
    const [result] = await connection.query<ResultSetHeader>(
      `UPDATE sevas SET
        seva_name = ?,
        amount = ?,
        is_default = ?,
        display_order = ?,
        is_recurring = ?,
        recurring_interval = ?,
        recurring_count = ?,
        remark = ?,
        updated_at = NOW()
      WHERE id = ? AND organization_id = ? AND temple_id = ?`,
      [
        seva_name,
        amount,
        is_default,
        display_order,
        is_recurring,
        recurring_interval,
        recurring_count,
        remark,
        id,
        organization_id,
        temple_id
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Seva not found or unauthorized"
      });
    }

    // =====================================
    // 3 Insert audit log
    // =====================================
    const newData = {
      seva_name,
      amount,
      is_default,
      display_order,
      is_recurring,
      recurring_interval,
      recurring_count,
      remark
    };

    await connection.query(
      `INSERT INTO audit_logs
        (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
       VALUES (?, ?, ?, 'sevas', ?, 'update', ?, ?, NOW())`,
      [
        updated_by_user_id,
        organization_id,
        temple_id,
        id,
        JSON.stringify(oldData),
        JSON.stringify(newData)
      ]
    );

//     await logAudit({
//   connection,
//   actor_user_id: updated_by_user_id,
//   organization_id,
//   temple_id,
//   table_name: "sevas",
//   record_id: Number(id),
//   action: "update",
//   old_data: oldData,
//   new_data: {
//     seva_name,
//     amount,
//     is_default,
//     display_order,
//     is_recurring,
//     recurring_interval,
//     recurring_count,
//     remark
//   }
// });
    await connection.commit();

    res.json({
      success: true,
      message: "Seva updated successfully"
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
 * DELETE SEVA
 */
export const deleteSeva = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;

    const temple_id = req.user!.temple_id;

    const { id } = req.params;



    const [result] = await db.query<ResultSetHeader>(

      `DELETE FROM sevas
       WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?`,

      [id, organization_id, temple_id]

    );



    if (result.affectedRows === 0) {

      return res.status(404).json({

        success: false,
        message: "Seva not found or unauthorized"

      });

    }



    res.json({

      success: true,
      message: "Seva deleted successfully"

    });

  }

  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

/**
 * SEARCH  SEVA
 */

export const searchSevas = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const { q } = req.query;

    //  Validate search query
    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = `%${q}%`;

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        id,
        seva_name,
        amount,
        is_recurring,
        recurring_interval,
        recurring_count
      FROM sevas
      WHERE organization_id = ?
      AND temple_id = ?
      AND seva_name LIKE ?
      ORDER BY seva_name ASC
      LIMIT 10
      `,
      [organization_id, temple_id, searchTerm]
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