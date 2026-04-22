import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                user_type: string;
                organization_id: number;
                temple_id: number;
                session_id: number;
                permissions: Record<string, number>;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, String(process.env.JWT_SECRET)) as any;
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT s.id as session_id, u.id as user_id, u.organization_id, u.temple_id, u.user_type
             FROM user_auth_sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.access_token_hash = ? AND s.revoked = 0 AND s.token_expires_at > NOW() AND u.deleted_at IS NULL`,
            [hash]
        );

        if (!rows.length) return res.status(401).json({ message: 'Invalid session' });

        const { user_id, organization_id, temple_id, session_id, user_type } = rows[0];

        // Validate temple belongs to organization (skip for super_admin and org_admin)
        if (temple_id && !['super_admin', 'org_admin'].includes(user_type)) {
            const [temples] = await db.execute<RowDataPacket[]>(
                `SELECT id FROM temples WHERE id = ? AND organization_id = ? AND deleted_at IS NULL`,
                [temple_id, organization_id]
            );

            if (!temples.length) return res.status(403).json({ message: 'Temple does not belong to your organization' });
        }

        req.user = {
            id: user_id,
            user_type: decoded.user_type,
            organization_id,
            temple_id,
            session_id,
            permissions: decoded.permissions || {}
        };

        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const requirePermission = (code: string, minLevel: number = 1) =>
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (['super_admin', 'org_admin'].includes(req.user.user_type)) return next();

        const userLevel = req.user.permissions[code] || 0;

        if (userLevel < minLevel) {
            return res.status(403).json({
                message: `Access denied: Required level ${minLevel} for ${code}`
            });
        }

        next();
    };

export const validateBodyOwnership = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const bodyOrgId = req.body.organization_id;
    const bodyTempleId = req.body.temple_id;

    if (bodyOrgId !== undefined && Number(bodyOrgId) !== req.user.organization_id) {
        return res.status(403).json({ message: 'organization_id does not match your account' });
    }

    if (bodyTempleId !== undefined && Number(bodyTempleId) !== req.user.temple_id) {
        return res.status(403).json({ message: 'temple_id does not match your account' });
    }

    next();
};