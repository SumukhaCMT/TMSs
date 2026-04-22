import { Request, Response } from 'express';
import db from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { uploadHundiImages } from '../middleware/uploadhundi';
import fs from 'fs';
import path from 'path';


const processUpload = (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
        uploadHundiImages.fields([
            { name: 'witness_img', maxCount: 1 },
            { name: 'signature_img', maxCount: 1 }
        ])(req, res, (err) => {
            if (err) reject(err);
            else resolve(true);
        });
    });
};

const UPLOAD_DIR = path.join(process.cwd(), 'src', 'public', 'hundi');
const ensureUploadDirExists = () => {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};

const deleteFile = (filename: string) => {
    if (!filename) return;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code !== 'ENOENT') console.error(`Failed to delete file: ${filePath}`, err);
        } else {
            console.log(`Deleted file: ${filePath}`);
        }
    });
};
export const getItemUnits = async (req: Request, res: Response) => {
    try {
        const { organization_id, temple_id } = req.user!;

        const [rows] = await db.query(
            `SELECT unit_name FROM item_units 
             WHERE organization_id = ? AND temple_id = ? AND status = 'active' 
             ORDER BY unit_name ASC`,
            [organization_id, temple_id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch units' });
    }
};

export const getAllHundis = async (req: Request, res: Response) => {
    try {
        const { organization_id, temple_id, user_type } = req.user!; // Use ! because authenticate ran first

        let query = 'SELECT * FROM hundi WHERE organization_id = ?';
        const params: any[] = [organization_id];

        if (!['super_admin', 'org_admin'].includes(user_type)) {
            query += ' AND temple_id = ?';
            params.push(temple_id);
        }

        query += ' ORDER BY opened_at DESC';

        const [rows] = await db.execute(query, params); // Use execute for consistency
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
export const getHundiById = async (req: Request, res: Response) => {
    try {
        const { organization_id } = req.user!;
        const hundiId = req.params.id;
        const [hundiRows] = await db.execute<RowDataPacket[]>(
            'SELECT * FROM hundi WHERE id = ? AND organization_id = ?',
            [hundiId, organization_id]
        );

        if (hundiRows.length === 0) return res.status(404).json({ success: false, message: 'Hundi not found' });

        const hundi = hundiRows[0];
        const [witnesses] = await db.query('SELECT * FROM hundi_witnesses WHERE hundi_id = ?', [hundiId]);
        const [denominations] = await db.query('SELECT * FROM hundi_denominations WHERE hundi_id = ?', [hundiId]);
        const [items] = await db.query(
            'SELECT id, item_name, quantity, unit, estimated_value, description, weight_value FROM hundi_items WHERE hundi_id = ?',
            [hundiId]
        );

        res.json({
            success: true,
            data: { ...hundi, witnesses, denominations, items }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch details' });
    }
};

export const createHundi = async (req: Request, res: Response) => {
    try {
        await processUpload(req, res);
        const bodyData = JSON.parse(req.body.data);

        const { organization_id, temple_id } = req.user!;
        // --- ADDED deity_ids EXTRACT HERE ---
        const { opened_at, deity_id, deity_ids, total_amount, total_items_value, remark, witnesses, denominations, items } = bodyData;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const witnessImgName = files?.witness_img ? files.witness_img[0].filename : null;
        const signatureImgName = files?.signature_img ? files.signature_img[0].filename : null;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // --- ADDED deity_ids TO INSERT QUERY ---
            const [hundiResult] = await connection.query<ResultSetHeader>(
                `INSERT INTO hundi (
                    organization_id, temple_id, opened_at, deity_id, deity_ids,
                    total_amount, total_items_value, remark, 
                    hundi_img_name, hundi_witness_signature
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    organization_id, temple_id, opened_at, deity_id || null, deity_ids || null,
                    total_amount, total_items_value, remark,
                    witnessImgName, signatureImgName
                ]
            );
            const hundiId = hundiResult.insertId;

            if (witnesses?.length) {
                await connection.query(
                    `INSERT INTO hundi_witnesses (hundi_id, name, email, phone, designation, address_line1, address_line2, city, pincode, remark) VALUES ?`,
                    [witnesses.map((w: any) => [hundiId, w.name, w.email, w.phone, w.designation, w.address_line1, w.address_line2, w.city, w.pincode, w.remark])]
                );
            }

            if (denominations?.length) {
                await connection.query(
                    `INSERT INTO hundi_denominations (hundi_id, denomination_type, denomination_value, quantity, subtotal) VALUES ?`,
                    [denominations.map((d: any) => [
                        hundiId,
                        d.denomination_type,
                        d.denomination_value,
                        d.quantity,
                        d.denomination_value * d.quantity
                    ])]
                );
            }

            if (items?.length) {
                await connection.query(
                    `INSERT INTO hundi_items (hundi_id, item_name, quantity, unit, description, estimated_value, weight_value) VALUES ?`,
                    [items.map((i: any) => [hundiId, i.item_name, i.quantity, i.unit, i.description, i.estimated_value, i.weight_value])]
                );

                const standardUnits = ['gms', 'kgs', 'mg', 'pcs'];
                const uniqueUnits = [...new Set(items.map((i: any) => String(i.unit)))]
                    .filter((u: any) => !standardUnits.includes(String(u).toLowerCase()) && u !== 'Other');

                for (const unitName of uniqueUnits) {
                    if (unitName && typeof unitName === 'string') {
                        await connection.query(
                            `INSERT IGNORE INTO item_units (organization_id, temple_id, unit_name) VALUES (?, ?, ?)`,
                            [organization_id, temple_id, unitName]
                        );
                    }
                }
            }

            await connection.commit();
            res.status(201).json({ success: true, message: 'Hundi created successfully', data: { id: hundiId } });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create hundi' });
    }
};

export const updateHundi = async (req: Request, res: Response) => {
    try {
        await processUpload(req, res);
        const hundiId = req.params.id;
        const bodyData = JSON.parse(req.body.data);

        // --- ADDED deity_ids EXTRACT HERE ---
        const {
            organization_id, temple_id, opened_at, deity_id, deity_ids,
            total_amount, total_items_value, remark,
            witnesses, denominations, items, delete_witness_image
        } = bodyData;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const [existingHundi] = await db.execute<RowDataPacket[]>(
            'SELECT hundi_img_name, hundi_witness_signature FROM hundi WHERE id = ?',
            [hundiId]
        );

        if (existingHundi.length === 0) return res.status(404).json({ success: false, message: 'Hundi not found' });

        const currentWitnessImg = existingHundi[0].hundi_img_name;
        const currentSignatureImg = existingHundi[0].hundi_witness_signature;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // --- ADDED deity_ids TO UPDATE QUERY ---
            let updateQuery = `UPDATE hundi SET opened_at=?, deity_id=?, deity_ids=?, total_amount=?, total_items_value=?, remark=?`;
            const queryParams: any[] = [opened_at, deity_id || null, deity_ids || null, total_amount, total_items_value, remark];

            if (files?.witness_img) {
                if (currentWitnessImg) deleteFile(currentWitnessImg);
                updateQuery += `, hundi_img_name=?`;
                queryParams.push(files.witness_img[0].filename);
            } else if (delete_witness_image) {
                if (currentWitnessImg) deleteFile(currentWitnessImg);
                updateQuery += `, hundi_img_name=NULL`;
            }

            if (files?.signature_img) {
                if (currentSignatureImg) deleteFile(currentSignatureImg);
                updateQuery += `, hundi_witness_signature=?`;
                queryParams.push(files.signature_img[0].filename);
            }

            updateQuery += ` WHERE id=?`;
            queryParams.push(hundiId);

            await connection.query(updateQuery, queryParams);

            await connection.query('DELETE FROM hundi_witnesses WHERE hundi_id = ?', [hundiId]);
            await connection.query('DELETE FROM hundi_denominations WHERE hundi_id = ?', [hundiId]);
            await connection.query('DELETE FROM hundi_items WHERE hundi_id = ?', [hundiId]);

            if (witnesses?.length) {
                await connection.query(
                    `INSERT INTO hundi_witnesses (hundi_id, name, email, phone, designation, address_line1, address_line2, city, pincode, remark) VALUES ?`,
                    [witnesses.map((w: any) => [hundiId, w.name, w.email, w.phone, w.designation, w.address_line1, w.address_line2, w.city, w.pincode, w.remark])]
                );
            }
            if (denominations?.length) {
                await connection.query(
                    `INSERT INTO hundi_denominations (hundi_id, denomination_type, denomination_value, quantity, subtotal) VALUES ?`,
                    [denominations.map((d: any) => [
                        hundiId,
                        d.denomination_type,
                        d.denomination_value,
                        d.quantity,
                        d.denomination_value * d.quantity
                    ])]
                );
            }

            if (items?.length) {
                await connection.query(
                    `INSERT INTO hundi_items (hundi_id, item_name, quantity, unit, description, estimated_value, weight_value) VALUES ?`,
                    [items.map((i: any) => [
                        hundiId,
                        i.item_name,
                        i.quantity,
                        i.unit,
                        i.description,
                        i.estimated_value,
                        i.weight_value])]
                );

                const standardUnits = ['gms', 'kgs', 'mg', 'pcs'];
                const uniqueUnits = [...new Set(items.map((i: any) => String(i.unit)))]
                    .filter((u: any) => !standardUnits.includes(String(u).toLowerCase()) && u !== 'Other');

                for (const unitName of uniqueUnits) {
                    if (unitName && typeof unitName === 'string') {
                        await connection.query(
                            `INSERT IGNORE INTO item_units (organization_id, temple_id, unit_name) VALUES (?, ?, ?)`,
                            [organization_id, temple_id, unitName]
                        );
                    }
                }
            }

            await connection.commit();
            res.json({ success: true, message: 'Hundi updated successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update hundi' });
    }
};

export const deleteHundi = async (req: Request, res: Response) => {
    try {
        const hundiId = req.params.id;
        const [rows] = await db.execute<RowDataPacket[]>(
            'SELECT hundi_img_name, hundi_witness_signature FROM hundi WHERE id = ?',
            [hundiId]
        );
        if (rows.length > 0) {
            const { hundi_img_name, hundi_witness_signature } = rows[0];
            if (hundi_img_name) deleteFile(hundi_img_name);
            if (hundi_witness_signature) deleteFile(hundi_witness_signature);
        }
        await db.query('DELETE FROM hundi WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Hundi deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete hundi' });
    }
};

export const getTemplesByOrg = async (req: Request, res: Response) => {
    const { orgId } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT id, name, address_line1, address_line2, city, state, pincode, phone 
             FROM temples 
             WHERE organization_id = ? AND deleted_at IS NULL`,
            [orgId]
        );
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ message: 'Database error' });
    }
};

export const deleteItemUnit = async (req: Request, res: Response) => {
    try {
        const { temple_id, unit_name } = req.body;
        const organization_id = req.user?.organization_id;

        if (!temple_id || !unit_name) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        await db.execute(
            `DELETE FROM item_units 
             WHERE organization_id = ? AND temple_id = ? AND unit_name = ?`,
            [organization_id, temple_id, unit_name]
        );

        res.status(200).json({ success: true, message: "Unit deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getWitnessSuggestions = async (req: Request, res: Response) => {
    const { templeId } = req.params;
    const { query } = req.query;

    if (!templeId || !query) return res.status(400).json({ success: false, message: "Missing parameters" });

    try {
        const searchTerm = `%${query}%`;

        const [trustees]: any = await db.execute(
            `SELECT name, email, phone, address_line1, address_line2, city, pincode FROM trustees WHERE temple_id = ? AND name LIKE ? LIMIT 5`,
            [templeId, searchTerm]
        );
        const trusteeResults = trustees.map((t: any) => ({ ...t, designation: 'Trustee' }));

        const [witnesses]: any = await db.execute(`
            SELECT hw.name, hw.designation, hw.email, hw.phone, hw.address_line1, hw.address_line2, hw.city, hw.pincode 
            FROM hundi_witnesses hw
            JOIN hundi h ON hw.hundi_id = h.id
            WHERE h.temple_id = ? AND hw.name LIKE ?
            LIMIT 5
        `, [templeId, searchTerm]);

        const combined = [...trusteeResults, ...witnesses].slice(0, 5);
        res.json({ success: true, data: combined });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
};

export const getOrgRoles = async (req: Request, res: Response) => {
    const { organization_id, temple_id } = req.query;
    if (!organization_id) return res.json({ success: true, data: [{ name: 'Trustee' }, { name: 'Admin' }] });

    try {
        const [rows]: any = await db.execute(`
            SELECT DISTINCT name FROM roles 
            WHERE organization_id = ? AND (temple_id IS NULL OR temple_id = ?) AND deleted_at IS NULL
        `, [organization_id, temple_id]);

        const roles = rows.length > 0 ? rows : [{ name: 'Trustee' }, { name: 'Admin' }];
        res.json({ success: true, data: roles });
    } catch (error) {
        res.json({ success: true, data: [{ name: 'Trustee' }, { name: 'Admin' }] });
    }
};

export const finalizeHundi = async (req: Request, res: Response) => {
    try {
        // Use your existing upload middleware logic
        await processUpload(req, res);

        const hundiId = req.params.id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // We only care about the signature_img
        if (!files?.signature_img) {
            return res.status(400).json({ success: false, message: 'No signature image uploaded' });
        }
        const [existing] = await db.execute<RowDataPacket[]>(
            'SELECT hundi_witness_signature FROM hundi WHERE id = ?',
            [hundiId]
        );

        if (existing.length > 0 && existing[0].hundi_witness_signature) {
            deleteFile(existing[0].hundi_witness_signature);
        }
        const signatureFilename = files.signature_img[0].filename;

        // Perform a simple UPDATE just for the signature field
        await db.query(
            'UPDATE hundi SET hundi_witness_signature = ? WHERE id = ?',
            [signatureFilename, hundiId]
        );

        res.json({ success: true, message: 'Signature uploaded successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to upload signature' });
    }
};

// Add this to your hundi.controller.ts

export const getMasterHundis = async (req: Request, res: Response) => {
    try {
        // Fetch all active defined hundis
        // Assuming you use something like mysql2 pool.query()
        const [rows] = await db.query(
            'SELECT * FROM define_hundi WHERE status = "active"'
        );

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching master hundis:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const createMasterHundi = async (req: Request, res: Response) => {
    try {
        const { organization_id, temple_id, deity_id, hundi_name, hundi_number } = req.body;

        // 1. Strict Check: Does this deity already have a Hundi defined?
        const [existingDeity] = await db.query<RowDataPacket[]>(
            `SELECT id FROM define_hundi WHERE temple_id = ? AND deity_id = ?`,
            [temple_id, deity_id]
        );

        if (existingDeity.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A Hundi is already defined for this specific deity. Please delete it first if you wish to re-define it.'
            });
        }

        // 2. Check for duplicate Name or Number to prevent confusion
        const [existingNameOrNumber] = await db.query<RowDataPacket[]>(
            `SELECT id FROM define_hundi WHERE temple_id = ? AND (hundi_name = ? OR hundi_number = ?)`,
            [temple_id, hundi_name, hundi_number]
        );

        if (existingNameOrNumber.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'A Hundi with this Name or Number is already defined in this temple!'
            });
        }

        // 3. Insert if all checks pass
        await db.query(
            `INSERT INTO define_hundi 
            (organization_id, temple_id, deity_id, hundi_name, hundi_number) 
            VALUES (?, ?, ?, ?, ?)`,
            [organization_id, temple_id, deity_id, hundi_name, hundi_number]
        );

        res.status(201).json({
            success: true,
            message: 'Hundi defined successfully'
        });
    } catch (error) {
        console.error('Error creating master hundi:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// src/controllers/hundi.controller.ts

export const deleteMasterHundi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Perform the deletion
        const [result] = await db.query<ResultSetHeader>(
            'DELETE FROM define_hundi WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Hundi not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Master Hundi deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting master hundi:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
