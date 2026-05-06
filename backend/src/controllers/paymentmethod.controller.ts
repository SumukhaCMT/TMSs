import { Request, Response } from "express";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


/**
 * GET ALL PAYMENT METHODS
 */
export const getPaymentMethods = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT *
       FROM payment_methods
       WHERE organization_id = ?
       AND temple_id = ?
       ORDER BY display_order ASC`,

      [organization_id, temple_id]

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
 * GET PAYMENT METHOD BY ID
 */
export const getPaymentMethodById = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT *
       FROM payment_methods
       WHERE id = ?`,

      [id]

    );

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
 * CREATE PAYMENT METHOD
 */
export const createPaymentMethod = async (req: Request, res: Response) => {

  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;


    const {

      payment_method,
      payment_method_type = "offline",
      remark = null,
      is_default = "no",
      display_order = 1,
      status = "active"

    } = req.body;


    if (!payment_method) {

      return res.status(400).json({

        success: false,
        message: "Payment method is required"

      });

    }


    const [result] = await db.query<ResultSetHeader>(

      `INSERT INTO payment_methods
      (
        organization_id,
        temple_id,
        payment_method,
        payment_method_type,
        remark,
        is_default,
        display_order,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

      [

        organization_id,
        temple_id,
        payment_method,
        payment_method_type,
        remark,
        is_default,
        display_order,
        status

      ]

    );


    res.status(201).json({

      success: true,
      message: "Payment Method created successfully",
      id: result.insertId

    });

  }

  catch (error: any) {

    if (error.code === "ER_DUP_ENTRY") {

      return res.status(400).json({

        success: false,
        message: "Payment Method already exists"

      });

    }

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};




/**
 * UPDATE PAYMENT METHOD
 */

export const updatePaymentMethod = async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const updated_by_user_id = req.user!.id; // the actor
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const { id } = req.params;

    const {
      payment_method,
      payment_method_type,
      remark,
      is_default,
      display_order,
      status
    } = req.body;

    // =====================================
    // 1 Fetch old record snapshot
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM payment_methods WHERE id=?`,
      [id]
    );

    if (!oldRows.length) {
      return res.status(404).json({
        success: false,
        message: "Payment Method not found"
      });
    }

    const oldData = oldRows[0];

    // =====================================
    // 2 Update Payment Method
    // =====================================
    const [result] = await connection.query(
      `UPDATE payment_methods SET
        payment_method = ?,
        payment_method_type = ?,
        remark = ?,
        is_default = ?,
        display_order = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        payment_method,
        payment_method_type,
        remark,
        is_default,
        display_order,
        status,
        id
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Payment Method not found"
      });
    }

    // =====================================
    // 3 Insert audit log
    // =====================================
    const newData = {
      payment_method,
      payment_method_type,
      remark,
      is_default,
      display_order,
      status
    };

    await connection.query(
      `INSERT INTO audit_logs
        (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
       VALUES (?, ?, ?, 'payment_methods', ?, 'update', ?, ?, NOW())`,
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
      message: "Payment Method updated successfully"
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
 * DELETE PAYMENT METHOD
 */
export const deletePaymentMethod = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    await db.query(

      `DELETE FROM payment_methods WHERE id = ?`,
      [id]

    );

    res.json({

      success: true,
      message: "Payment Method deleted successfully"

    });

  }

  catch (error: any) {

    res.status(500).json({

      success: false,
      message: error.message

    });

  }

};