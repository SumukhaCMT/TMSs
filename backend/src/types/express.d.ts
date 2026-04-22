import "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      user_type: string;
      organization_id: number;
      temple_id: number;
      session_id: number;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};