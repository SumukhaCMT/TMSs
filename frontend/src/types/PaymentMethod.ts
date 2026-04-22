
export default interface PaymentMethod {
    id: number
    payment_method: string
    payment_method_type: string
    is_default: string
    status: string
    display_order: number
    created_at: string
    updated_at: string
}