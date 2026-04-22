

import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * GET TRUSTEES
 */
export const getTrustees = async (req: Request, res: Response) => {
  try {
    const { organization_id, temple_id } = req.user!;

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT *
      FROM trustees
      WHERE deleted_at IS NULL
        AND organization_id = ?
        AND (
          (temple_id IS NULL AND ? IS NULL)
          OR temple_id = ?
        )
      ORDER BY display_order ASC
      `,
      [organization_id, temple_id, temple_id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getTrusteeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { organization_id, temple_id } = req.user!

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT *
      FROM trustees
       WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?
      `,
      [id, organization_id,  temple_id]
    )

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Trustee not found",
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })

  } catch (error: any) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

/**
 * CREATE TRUSTEE
 */
export const createTrustee = async (req: Request, res: Response) => {
  try {
    const { organization_id, temple_id } = req.user!;

    let {
      name,
      email,
      phone,
      position,
      display_order = 1,
      address_line1 = null,
      address_line2 = null,
      city = null,
      state = null,
      country = "India",
      pincode = null,
      status = "active",
    } = req.body;

    // ✅ Trim values
    name = name?.trim();
    email = email?.trim() || null;
    phone = phone?.trim();

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone required",
      });
    }

    // 🔍 Duplicate Check (safe for NULL email)
    const [existing]: any = await db.query(
      `
      SELECT id FROM trustees
      WHERE deleted_at IS NULL
        AND organization_id = ?
        AND (
          (temple_id IS NULL AND ? IS NULL)
          OR temple_id = ?
        )
        AND (
          phone = ?
          OR (email IS NOT NULL AND email = ?)
        )
      LIMIT 1
      `,
      [organization_id, temple_id, temple_id, phone, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone or Email already exists",
      });
    }

    const [result] = await db.query<ResultSetHeader>(
      `
      INSERT INTO trustees
      (organization_id, temple_id, name, email, phone, position,
       display_order, address_line1, address_line2, city,
       state, country, pincode, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        organization_id,
        temple_id || null,
        name,
        email,
        phone,
        position,
        display_order,
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
      id: result.insertId,
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Duplicate phone or email",
      });
    }

    res.status(500).json({ success: false });
  }
};

/**
 * UPDATE TRUSTEE
 */
export const updateTrustee = async (req: Request, res: Response) => {
  try {
    const { organization_id, temple_id } = req.user!;
    const { id } = req.params;

    let {
      name,
      email,
      phone,
      position,
      display_order,
      address_line1,
      address_line2,
      city,
      state,
      country,
      pincode,
      status,
    } = req.body;

    // ✅ Trim
    name = name?.trim();
    email = email?.trim() || null;
    phone = phone?.trim();

    // 🔍 Duplicate Check
    const [existing]: any = await db.query(
      `
      SELECT id FROM trustees
      WHERE deleted_at IS NULL
        AND organization_id = ?
        AND (
          (temple_id IS NULL AND ? IS NULL)
          OR temple_id = ?
        )
        AND (
          phone = ?
          OR (email IS NOT NULL AND email = ?)
        )
        AND id != ?
      LIMIT 1
      `,
      [organization_id, temple_id, temple_id, phone, email, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone or Email already exists",
      });
    }

    const [result] = await db.query<ResultSetHeader>(
      `
      UPDATE trustees SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        position = COALESCE(?, position),
        display_order = COALESCE(?, display_order),
        address_line1 = COALESCE(?, address_line1),
        address_line2 = COALESCE(?, address_line2),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        pincode = COALESCE(?, pincode),
        status = COALESCE(?, status),
        updated_at = NOW()
      WHERE id = ?
        AND organization_id = ?
        AND (
          (temple_id IS NULL AND ? IS NULL)
          OR temple_id = ?
        )
      `,
      [
        name,
        email,
        phone,
        position,
        display_order,
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
        temple_id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Duplicate phone/email",
      });
    }

    res.status(500).json({ success: false });
  }
};

/**
 * DELETE TRUSTEE
 */
export const deleteTrustee = async (req: Request, res: Response) => {
  try {
    const { organization_id, temple_id } = req.user!;
    const { id } = req.params;

    const [result] = await db.query<ResultSetHeader>(
      `
      UPDATE trustees
      SET deleted_at = NOW()
      WHERE id = ?
        AND organization_id = ?
        AND (
          (temple_id IS NULL AND ? IS NULL)
          OR temple_id = ?
        )
      `,
      [id, organization_id, temple_id, temple_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
