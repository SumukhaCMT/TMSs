import { Request, Response } from 'express';
import { loginUser, logoutUser, requestPasswordReset, resetPassword,changePassword } from '../services/auth.service';
import { sendMail } from '../utils/mail';
import mjml2html from 'mjml';
import fs from 'fs';
import path from 'path';

export const login = async (req: Request, res: Response) => {
    const { login, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress as string;
    const ua = req.headers['user-agent'] as string;

    const result: any = await loginUser(login, password, ip, ua);

    if (result.error === 'INVALID_CREDENTIALS') return res.status(401).json({ message: 'Invalid credentials' });
    if (result.error === 'ACCOUNT_DISABLED') return res.status(403).json({ message: 'Account disabled' });
    if (result.error) return res.status(400).json({ message: result.error });

    res.json(result);
};

export const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
        await logoutUser(token);
    }

    res.json({ success: true });
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const result = await requestPasswordReset(email);

    if (!result) return res.status(404).json({ message: 'User not found' });

    const link = `${process.env.CLIENT_URL}/reset-password?token=${result.token}`;
    const name = result.name;
    const templatePath = path.join(__dirname, '../templates/reset-password.mjml');

    if (fs.existsSync(templatePath)) {
        let content = fs.readFileSync(templatePath, 'utf8');
        content = content.replace(/{{name}}/g, name).replace(/{{resetLink}}/g, link);
        const { html } = mjml2html(content);

        await sendMail({
            to: email,
            subject: 'Reset Your Password',
            html,
            text: `Hi ${name}, Reset Link: ${link}`
        });
    }

    res.json({ message: `Reset link sent to ${email}` });
};

export const resetPasswordController = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const result: any = await resetPassword(token, password);

    if (result.error === 'INVALID_TOKEN') return res.status(400).json({ message: 'Invalid or expired Link' });

    const { email, name } = result;
    const loginLink = `${process.env.CLIENT_URL}/login`;
    const templatePath = path.join(__dirname, '../templates/password-changed.mjml');

    if (fs.existsSync(templatePath)) {
        let content = fs.readFileSync(templatePath, 'utf8');
        content = content.replace(/{{name}}/g, name).replace(/{{loginLink}}/g, loginLink);
        const { html } = mjml2html(content);

        await sendMail({
            to: email,
            subject: 'Password Changed Successfully',
            html,
            text: `Hi ${name}, Your password has been changed.`
        });
    }

    res.json({ message: 'Password updated successfully' });
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { oldPassword, newPassword } = req.body

    //  basic validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required',
      })
    }

    const result: any = await changePassword(
      token,
      oldPassword,
      newPassword
    )

    //  HANDLE ALL POSSIBLE ERRORS
    if (result.error === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' })
    }

    if (result.error === 'INVALID_OLD_PASSWORD') {
      return res.status(400).json({
        message: 'Old password is incorrect',
      })
    }

    if (result.error === 'CHANGE_PASSWORD_FAILED') {
      return res.status(500).json({
        message: 'Something went wrong. Please try again',
      })
    }

    return res.json({
      message: 'Password changed successfully',
    })

  } catch (error) {
    console.error('Change password error:', error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
