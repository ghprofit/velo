import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                emailVerified: boolean;
                creatorProfile: {
                    id: string | undefined;
                    displayName: string | undefined;
                    verificationStatus: import(".prisma/client").$Enums.VerificationStatus | undefined;
                };
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
            };
        };
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                emailVerified: boolean;
                creatorProfile: {
                    displayName: string;
                    id: string;
                    profileImage: string | null;
                    verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                } | null;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
            };
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(dto: LogoutDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            creatorProfile: {
                displayName: string;
                firstName: string | null;
                lastName: string | null;
                country: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                bio: string | null;
                profileImage: string | null;
                coverImage: string | null;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                veriffSessionId: string | null;
                veriffDecisionId: string | null;
                verifiedAt: Date | null;
                verificationNotes: string | null;
                dateOfBirth: Date | null;
                paypalEmail: string | null;
                stripeAccountId: string | null;
                totalEarnings: number;
                totalViews: number;
                totalPurchases: number;
                userId: string;
            } | null;
        };
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map