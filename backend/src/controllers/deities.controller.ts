





import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../config/db";
import fs from "fs";
import path from "path";
// import { logAudit } from "../utils/auditLogger";
const uploadDir = path.join(__dirname, "../public/deities");

/** GET ALL DEITIES */
export const getDeities = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM deities
       WHERE organization_id=? AND temple_id=?
       ORDER BY created_at DESC`,
      [organization_id, temple_id]
    );

    res.json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET SINGLE DEITY */
export const getDeityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT * FROM deities
       WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Deity not found" });

    res.json({ success: true, data: rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** CREATE DEITY */
export const createDeity = async (req: Request, res: Response) => {
  let img_name: string | null = null;

  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const { name, code, description, status } = req.body;

    if (!name) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Deity name is required" });
    }

    if (req.file) img_name = req.file.filename;

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO deities
       (organization_id, temple_id, name, img_name, code, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [organization_id, temple_id, name, img_name, code || null, description || null, status || "active"]
    );

    res.status(201).json({ success: true, message: "Deity created successfully", id: result.insertId });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    if (error.code === "ER_DUP_ENTRY")
      return res.status(400).json({ success: false, message: "Deity already exists" });
    res.status(500).json({ success: false, message: error.message });
  }
};

/** UPDATE DEITY */





export const updateDeity = async (req: Request, res: Response) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;
    const updated_by_user_id = req.user!.id;

    // =====================================
    // 1 Fetch old record snapshot
    // =====================================
    const [oldRows]: any = await connection.query(
      `SELECT * FROM deities WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!oldRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Deity not found" });
    }

    const oldData = oldRows[0];
    let img_name = oldData.img_name;

    // =====================================
    // 2 Handle file upload (image)
    // =====================================
    if (req.file) {
      if (img_name) {
        const filePath = path.join(uploadDir, img_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      img_name = req.file.filename;
    }

    const { name, code, description, status } = req.body;

    // =====================================
    // 3 Update deity
    // =====================================
    await connection.query(
      `UPDATE deities SET name=?, img_name=?, code=?, description=?, status=?, updated_at=NOW()
       WHERE id=? AND organization_id=? AND temple_id=?`,
      [name, img_name, code, description, status, id, organization_id, temple_id]
    );

    // =====================================
    // 4 Insert audit log
    // =====================================
    const newData = { name, img_name, code, description, status };
    await connection.query(
      `INSERT INTO audit_logs
        (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
       VALUES (?, ?, ?, 'deities', ?, 'update', ?, ?, NOW())`,
      [
        updated_by_user_id,
        organization_id,
        temple_id,
        id,
        JSON.stringify(oldData),
        JSON.stringify(newData),
      ]
    );
//     await logAudit({
//   connection,
 
//   actor_user_id: updated_by_user_id,
//   organization_id,
//   temple_id,
//   table_name: "deities",
//   record_id: Number(id),
//   action: "update",
//   old_data: oldData,
//   new_data: { name, img_name, code, description, status }
// });

    await connection.commit();

    res.json({ success: true, message: "Deity updated successfully" });
  } catch (error: any) {
    await connection.rollback();
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};
/** DELETE DEITY */
export const deleteDeity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows]: any = await db.query(
      `SELECT img_name FROM deities
       WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: "Not found" });

    if (rows[0].img_name) {
      const filePath = path.join(uploadDir, rows[0].img_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query(
      `DELETE FROM deities WHERE id=? AND organization_id=? AND temple_id=?`,
      [id, organization_id, temple_id]
    );

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};