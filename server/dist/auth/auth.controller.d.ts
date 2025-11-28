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
                id: any;
                email: any;
                role: any;
                emailVerified: any;
                creatorProfile: {
                    id: any;
                    displayName: any;
                    verificationStatus: any;
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
                id: any;
                email: any;
                role: any;
                emailVerified: any;
                creatorProfile: any;
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
            id: any;
            email: any;
            role: any;
            emailVerified: any;
            creatorProfile: any;
        };
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map