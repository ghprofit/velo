export class SessionResponseDto {
  status: string;
  verification: {
    id: string;
    url: string;
    vendorData?: string;
    host?: string;
    status?: string;
    sessionToken?: string;
  };
}

export class VerificationStatusDto {
  status: string;
  verification: {
    id: string;
    code: number;
    person?: {
      firstName?: string;
      lastName?: string;
      idNumber?: string;
      dateOfBirth?: string;
      nationality?: string;
      gender?: string;
    };
    document?: {
      number?: string;
      type?: string;
      country?: string;
      validFrom?: string;
      validUntil?: string;
    };
    status?: string;
    reason?: string;
    reasonCode?: number;
    decisionTime?: string;
    acceptanceTime?: string;
  };
}
