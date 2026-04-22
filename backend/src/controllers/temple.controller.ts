import { Request, Response } from "express"
import db from "../config/db"
import { ResultSetHeader, RowDataPacket } from "mysql2"
import fs from "fs";
import path from "path";

const uploadDir = path.join(__dirname, "../public/temple");
/**
 * Create Temple
 */
export const createTemple = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id
    const data = { ...req.body, organization_id }

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO temples SET ?",
      [data]
    )

    return res.status(201).json({
      success: true,
      message: "Temple created successfully",
      id: result.insertId,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Get All Temples (Organization Based)
 */
export const getAllTemples = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM temples
       WHERE organization_id = ?
       AND deleted_at IS NULL
       ORDER BY id DESC`,
      [organization_id]
    )

    return res.json({
      success: true,
      data: rows,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Get Temple By ID
 */
export const getTempleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const organization_id = req.user!.organization_id

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM temples
       WHERE id = ?
       AND organization_id = ?
       AND deleted_at IS NULL`,
      [id, organization_id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      })
    }

    return res.json({
      success: true,
      data: rows[0],
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateTemple = async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const updated_by_user_id = req.user!.id;
    const temple_id = req.user!.temple_id;
    // =====================================
    // 1 Fetch old record
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM temples 
       WHERE id=? AND organization_id=? AND deleted_at IS NULL`,
      [id, organization_id, temple_id]
    );

    if (!oldRows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    return res.json({
      success: true,
      message: "Temple updated successfully",
    })
  } catch (error: any) {
    await connection.rollback();

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};
/**
 * Soft Delete Temple
 */
export const deleteTemple = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const organization_id = req.user!.organization_id

    const [result] = await db.query<ResultSetHeader>(
      `UPDATE temples
       SET deleted_at = NOW()
       WHERE id = ?
       AND organization_id = ?`,
      [id, organization_id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Temple not found or unauthorized",
      })
    }

    return res.json({
      success: true,
      message: "Temple deleted successfully",
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}