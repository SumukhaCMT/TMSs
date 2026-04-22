export interface Hundi {
    id: number;
    organization_id: number;
    temple_id: number;
    opened_at: string;
    witness_name: string;
    total_amount: number;
    total_items_value: number;
    remark?: string;
    created_at?: string;
}

export interface HundiDenomination {
    id: number;
    hundi_id: number;
    denomination_type: 'note' | 'coin';
    denomination_value: number;
    quantity: number;
    subtotal: number;
    remark?: string | null;
}