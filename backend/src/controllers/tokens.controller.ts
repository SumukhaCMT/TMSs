// controllers/tokens.controller.ts
import { Request, Response } from "express";
import db from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * GET ALL TOKENS
 */

export const getTokens = async (req: Request, res: Response) => {
  try {
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT 
        t.id,
        t.organization_id,
        t.temple_id,
        t.token_code,
        t.token_name,
        t.description,

        -- Seva
        t.seva_id,
        s.seva_name,
        s.amount AS seva_amount,

        -- Deity
        t.deity_id,
        d.name AS deity_name,
        d.status AS deity_status,
        d.img_name AS deity_image,
        d.code AS deity_code,
        -- Token
        t.display_order,
        t.status AS status,

      
        IFNULL(SUM(ti.quantity), 0) AS quantity,

        t.created_at,
        t.updated_at

      FROM tokens t

      LEFT JOIN sevas s 
        ON t.seva_id = s.id

      LEFT JOIN deities d 
        ON t.deity_id = d.id

      LEFT JOIN token_issues ti 
        ON ti.token_id = t.id

      WHERE t.organization_id = ?
      AND t.temple_id = ?
      AND t.status != 'deleted'

      GROUP BY t.id

      ORDER BY t.display_order ASC
      `,
      [organization_id, temple_id]
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (error: any) {
    console.error("GET TOKENS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tokens",
    });
  }
};
/**
 * GET TOKEN BY ID
 */

export const getTokenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
        tk.*,

        -- Temple Details
        t.name AS temple_name,
        t.email AS temple_email,
        t.phone AS temple_phone,
        t.img_name AS temple_logo,

        CONCAT_WS(', ',
          t.address_line1,
          t.address_line2,
          t.city,
          t.state,
          t.country,
          t.pincode
        ) AS temple_address,

        -- Seva Details
        s.seva_name,
        s.amount AS seva_amount,

        -- Deity Details
        d.name AS deity_name,
        d.code AS deity_code,
        d.img_name AS deity_image

      FROM tokens tk

      LEFT JOIN temples t 
        ON tk.temple_id = t.id

      LEFT JOIN sevas s 
        ON tk.seva_id = s.id

      LEFT JOIN deities d 
        ON tk.deity_id = d.id

      WHERE tk.id = ?
        AND tk.organization_id = ?
        AND tk.temple_id = ?
        AND tk.status = 'active'`,
      [id, organization_id, temple_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * CREATE TOKEN
 */
export const createToken = async (req: Request, res: Response) => {
  try {

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const {
      token_name,
      description = null,
      seva_id,
      deity_id ,
      display_order = 1
    } = req.body;

    if (!token_name || !seva_id) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔥 STEP 1: Get last token_code
    const [rows]: any = await db.query(
      `SELECT token_code 
       FROM tokens 
       WHERE organization_id = ? 
       AND temple_id = ?
       ORDER BY id DESC 
       LIMIT 1`,
      [organization_id, temple_id]
    );

    let newTokenCode = "TKN001";

    if (rows.length > 0) {

      const lastCode = rows[0].token_code; // e.g. TKN005

      const numberPart = parseInt(lastCode.replace("TKN", ""), 10);

      const nextNumber = numberPart + 1;

      // format → TKN001
      newTokenCode = `TKN${String(nextNumber).padStart(3, "0")}`;
    }

    //  STEP 2: Insert
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO tokens
      (organization_id, temple_id, token_code, token_name, description, seva_id, deity_id, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organization_id,
        temple_id,
        newTokenCode,
        token_name,
        description,
        seva_id,
        deity_id,
        display_order
      ]
    );

    res.status(201).json({
      success: true,
      message: "Token created successfully",
      token_code: newTokenCode, // 👈 return generated code
      id: result.insertId
    });

  } catch (error: any) {

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Token already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * UPDATE TOKEN
 */
export const updateToken = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const {
      token_code,
      token_name,
      description,
      seva_id,
      deity_id,
      display_order,
      status
    } = req.body;

    const [result] = await db.query<ResultSetHeader>(
      `UPDATE tokens SET
        token_code = ?,
        token_name = ?,
        description = ?,
        seva_id = ?,
        deity_id = ?,
        display_order = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      AND organization_id = ?
      AND temple_id = ?`,
      [
        token_code,
        token_name,
        description,
        seva_id,
        deity_id,
        display_order,
        status,
        id,
        organization_id,
        temple_id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Token not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Token updated successfully"
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * DELETE TOKEN
 */
export const deleteToken = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;
    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    const [result] = await db.query<ResultSetHeader>(
      `DELETE FROM tokens
       WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?`,
      [id, organization_id, temple_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Token not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Token deleted successfully"
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const issueToken = async (req: Request, res: Response) => {
  try {
    const {
      token_id,
      quantity,
      seva_id,
      seva_name,
      deity_id,
      seva_amount,
      remark,
    } = req.body;

    const organization_id = req.user!.organization_id;
    const temple_id = req.user!.temple_id;

    //  Basic validation
    if (!token_id || !quantity || !seva_amount) {
      return res.status(400).json({
        success: false,
        message: "token_id, quantity and seva_amount are required",
      });
    }

    const total_amount = quantity * seva_amount;

    //  ALWAYS INSERT (no transaction needed)
    await db.query(
      `INSERT INTO token_issues 
      (organization_id, temple_id, token_id, seva_id, seva_name, deity_id, quantity, seva_amount, total_amount, remark)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organization_id,
        temple_id,
        token_id,
        seva_id || null,
        seva_name || "",
        deity_id || null,
        quantity,
        seva_amount,
        total_amount,
        remark || null,
      ]
    );

    res.json({
      success: true,
      message: "Token inserted successfully",
    });

  } catch (error: any) {
    console.error("ISSUE TOKEN ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};