import { PoolConnection } from "mysql2/promise";
import db from "../config/db";
interface AuditLogParams {
  connection: PoolConnection;
  actor_user_id: number;
  organization_id: number;
  temple_id: number;
  table_name: string;
  record_id: number | string;
  action: "create" | "update" | "delete";
  old_data?: any;
  new_data?: any;
}

export const logAudit = async ({
  connection,
  actor_user_id,
  organization_id,
  temple_id,
  table_name,
  record_id,
  action,
  old_data = null,
  new_data = null,
}: AuditLogParams) => {
  await connection.query(
    `INSERT INTO audit_logs
     (actor_user_id, organization_id, temple_id, table_name, record_id, action, old_data, new_data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
        
      actor_user_id,
      organization_id,
      temple_id,
      table_name,
      record_id,
      action,
      old_data ? JSON.stringify(old_data) : null,
      new_data ? JSON.stringify(new_data) : null,
    ]
  );
};