export type CreateUserDto = {
    address: string;
    account: string;
    referrer?: string;
    amount: number;
}