import db from '../config/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

const JWT_SECRET = String(process.env.JWT_SECRET);
const JWT_EXPIRES_IN = String(process.env.JWT_EXPIRES_IN);

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const resolvePermissions = async (userId: number, userType: string) => {
    const [permissions] = await db.execute<RowDataPacket[]>(
        `SELECT code, permissions FROM permissions WHERE deleted_at IS NULL AND is_deprecated = 0`
    );

    const permissionMap: Record<string, number> = {};

    permissions.forEach((p: any) => {
        if (userType === 'super_admin') {
            permissionMap[p.code] = 4;
            return;
        }

        const permStr = String(p.permissions).padStart(3, '0');
        let level = 0;

        if (userType === 'org_admin') level = parseInt(permStr[0]);
        else if (userType === 'temple_admin') level = parseInt(permStr[1]);
        else if (userType === 'user') level = parseInt(permStr[2]);

        if (level > 0) {
            permissionMap[p.code] = level;
        }
    });

    const [overrides] = await db.execute<RowDataPacket[]>(
        `SELECT p.code, uo.permission 
         FROM user_permission_overrides uo 
         JOIN permissions p ON p.id = uo.permission_id 
         WHERE uo.user_id = ? AND p.deleted_at IS NULL AND p.is_deprecated = 0`,
        [userId]
    );

    overrides.forEach((o: any) => {
        if (o.permission > 0) {
            permissionMap[o.code] = o.permission;
        } else {
            delete permissionMap[o.code];
        }
    });

    return permissionMap;
};

export const loginUser = async (login: string, pass: string, ip: string, ua: string) => {
    const [users]: any = await db.execute(
        `SELECT u.*, o.status AS org_status, t.status AS temple_status 
         FROM users u
         LEFT JOIN organizations o ON u.organization_id = o.id
         LEFT JOIN temples t ON u.temple_id = t.id
         WHERE (u.email = ? OR u.phone = ? OR u.id = ?) 
         AND u.deleted_at IS NULL
         LIMIT 1`,
        [login, login, login]
    );

    if (users.length === 0) return { error: 'INVALID_CREDENTIALS' };

    const user = users[0];
    const validPass = await bcrypt.compare(pass, user.password_hash);

    if (!validPass) {
        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, email, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Invalid password')`,
            [user.id, user.organization_id, user.temple_id, user.email, ip, ua]
        );
        return { error: 'INVALID_CREDENTIALS' };
    }

    const isOrgActive = user.org_status === 'active';
    const isUserActive = user.status === 'active';

    const isTempleActive = user.temple_id
        ? user.temple_status === 'active'
        : (user.user_type === 'super_admin' || user.user_type === 'org_admin');

    if (!isUserActive || (user.organization_id && !isOrgActive) || !isTempleActive) {
        await db.execute(
            `INSERT INTO login_history (user_id, organization_id, temple_id, email, ip_address, user_agent, success, failure_reason) VALUES (?, ?, ?, ?, ?, ?, 0, 'Account disabled')`,
            [user.id, user.organization_id, user.temple_id, user.email, ip, ua]
        );
        return { error: 'ACCOUNT_DISABLED' };
    }

    await db.execute(
        `INSERT INTO login_history (user_id, organization_id, temple_id, email, ip_address, user_agent, success, login_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
        [user.id, user.organization_id, user.temple_id, user.email, ip, ua]
    );

    await db.execute(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    const perms = await resolvePermissions(user.id, user.user_type);

    const accessToken = jwt.sign(
        {
            id: user.id,
            user_type: user.user_type,
            permissions: perms 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_SECRET, 
        { expiresIn: '7d' }
    );

    const decodedToken = jwt.decode(accessToken) as jwt.JwtPayload;
    const tokenExp = new Date((decodedToken.exp as number) * 1000);
    const refreshExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);
    await db.execute(
        `INSERT INTO user_auth_sessions 
        (user_id, organization_id, temple_id, provider, access_token_hash, refresh_token_hash, token_expires_at, refresh_expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user.id,
            user.organization_id,
            user.temple_id,
            'normal',
            accessTokenHash,
            refreshTokenHash,
            tokenExp,
            refreshExp,
            ip,
            ua
        ]
    );

    let returnUser: any = {};

    switch (user.user_type) {
        case 'user':
            const [roles]: any = await db.execute(`SELECT r.id as role_id, r.name as role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ? LIMIT 1`, [user.id]);
            returnUser = {
                id: user.id,
                name: user.name,
                user_type: user.user_type,
                user_code: user.user_code,
                email: user.email,
                phone: user.phone,
                temple_id: user.temple_id,
                organization_id: user.organization_id,

                Role: roles[0]?.role_name,
                permissions: perms
            };
            break;
        case 'temple_admin':
            returnUser = {
                id: user.id,
                user_type: user.user_type,
                name: user.name,
                user_code: user.user_code,
                email: user.email,
                phone: user.phone,
                temple_id: user.temple_id,
                organization_id: user.organization_id,

                permissions: perms
            };
            break;
        case 'org_admin':
            const [counts]: any = await db.execute(
                `SELECT 
                    (SELECT COUNT(id) FROM users WHERE organization_id = ? AND deleted_at IS NULL) as user_count, 
                    (SELECT COUNT(id) FROM temples WHERE organization_id = ? AND deleted_at IS NULL) as temple_count`,
                [user.organization_id, user.organization_id]
            );
            returnUser = {
                id: user.id,
                user_type: user.user_type,
                name: user.name,
                user_code: user.user_code,
                email: user.email,
                phone: user.phone,
                organization_id: user.organization_id,

                number_of_users: counts[0]?.user_count,
                number_of_temples: counts[0]?.temple_count,
                permissions: perms
            };
            break;
        case 'super_admin':
            const [orgs]: any = await db.execute(`SELECT id, name FROM organizations WHERE deleted_at IS NULL`);
            const totalOrgs = orgs.length;

            returnUser = {
                id: user.id,
                name: user.name,
                user_code: user.user_code,
                email: user.email,
                phone: user.phone,
                user_type: user.user_type,
                organizations: orgs,
                number_of_organisations: totalOrgs,
                permissions: perms
            };
            break;
    }

    return {
        message: 'Login successful',
        access_token: accessToken,
        refresh_token: refreshToken,
        user: returnUser
    };
};
export const logoutUser = async (token: string) => {
    const hash = hashToken(token);

    const [sessions] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM user_auth_sessions WHERE access_token_hash = ?`,
        [hash]
    );

    if (sessions.length > 0) {
        const sessionId = sessions[0].id;

        await db.execute(
            `DELETE FROM session_permissions WHERE session_id = ?`,
            [sessionId]
        );

        await db.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE id = ?`,
            [sessionId]
        );
    }
};
export const requestPasswordReset = async (email: string) => {
    const [users] = await db.execute<RowDataPacket[]>(
        `SELECT id, name FROM users WHERE email = ? AND deleted_at IS NULL AND status = 'active'`,
        [email]
    );

    if (users.length === 0) return null;

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    await db.execute(
        `INSERT INTO password_resets (email, token_hash, request_count, last_requested_at) VALUES (?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash), last_requested_at = NOW(), request_count = request_count + 1`,
        [email, tokenHash]
    );

    return { token: rawToken, name: user.name };
};

export const resetPassword = async (token: string, newPass: string) => {
    const tokenHash = hashToken(token);
    const [resets] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM password_resets WHERE token_hash = ? AND last_requested_at > (NOW() - INTERVAL 10 MINUTE)`,
        [tokenHash]
    );

    if (resets.length === 0) return { error: 'INVALID_TOKEN' };

    const email = resets[0].email;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await db.execute(`UPDATE users SET password_hash = ? WHERE email = ?`, [passwordHash, email]);

    const [users] = await db.execute<RowDataPacket[]>(`SELECT id, name FROM users WHERE email = ?`, [email]);

    if (users.length > 0) {
        const userId = users[0].id;

        await db.execute(
            `DELETE sp FROM session_permissions sp 
             JOIN user_auth_sessions s ON sp.session_id = s.id 
             WHERE s.user_id = ?`,
            [userId]
        );

        await db.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE user_id = ?`,
            [userId]
        );
    }

    await db.execute(`UPDATE password_resets SET token_hash = NULL WHERE email = ?`, [email]);

    return {
        success: true,
        email: email,
        name: users[0]?.name
    };
};

export const refreshAccessToken = async (oldRefreshToken: string, ip: string, ua: string) => {
    try {
        // 1. Verify the token signature
        const decoded = jwt.verify(oldRefreshToken, JWT_SECRET) as any;
        const oldHash = hashToken(oldRefreshToken);

        // 2. Check if this refresh token exists and isn't revoked
        const [sessions]: any = await db.execute(
            `SELECT s.*, u.user_type 
             FROM user_auth_sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.refresh_token_hash = ? AND s.revoked = 0 AND s.refresh_expires_at > NOW()`,
            [oldHash]
        );

        if (sessions.length === 0) return { error: 'INVALID_REFRESH_TOKEN' };
        const session = sessions[0];

        // 3. Resolve fresh permissions
        const perms = await resolvePermissions(session.user_id, session.user_type);

        // 4. Generate NEW Access Token
        const newAccessToken = jwt.sign(
            { id: session.user_id, user_type: session.user_type, permissions: perms },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN as any }
        );

        const newAccessHash = hashToken(newAccessToken);
        const decodedNew = jwt.decode(newAccessToken) as any;
        const newExp = new Date(decodedNew.exp * 1000);

        // 5. Update session with new access token hash
        await db.execute(
            `UPDATE user_auth_sessions SET access_token_hash = ?, token_expires_at = ? WHERE id = ?`,
            [newAccessHash, newExp, session.id]
        );

        return { access_token: newAccessToken };
    } catch (e) {
        return { error: 'INVALID_REFRESH_TOKEN' };
    }
};

export const changePassword = async (token: string, oldPassword: string, newPassword: string) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.id;
        const [users] = await db.execute<RowDataPacket[]>(
            `SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL`,
            [userId]
        );
        if (users.length === 0) return { error: 'USER_NOT_FOUND' };

        const user = users[0];
        const validPass = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validPass) return { error: 'INVALID_OLD_PASSWORD' };
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, userId]);
        await db.execute(
            `DELETE sp FROM session_permissions sp 
             JOIN user_auth_sessions s ON sp.session_id = s.id 
             WHERE s.user_id = ?`,
            [userId]
        );
        await db.execute(
            `UPDATE user_auth_sessions SET revoked = 1, revoked_at = NOW() WHERE user_id = ?`,
            [userId]
        );
        return { success: true };
    }

        catch (e) {
        return { error: 'CHANGE_PASSWORD_FAILED' };
        }
    }
