export interface User {
    id: number;
    name: string;
    email: string;
    user_type: string;
    organization_id?: number;
    temple_id?: number;
}