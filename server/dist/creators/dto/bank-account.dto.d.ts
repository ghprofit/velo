export declare class SetupBankAccountDto {
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankRoutingNumber?: string;
    bankSwiftCode?: string;
    bankIban?: string;
    bankCountry: string;
    bankCurrency?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}
export declare class BankAccountResponseDto {
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankCountry: string;
    bankCurrency: string;
    payoutSetupCompleted: boolean;
    stripeAccountId?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}
//# sourceMappingURL=bank-account.dto.d.ts.map