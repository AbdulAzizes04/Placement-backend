import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    register(data: RegisterDto): Promise<{
        email: string;
        id: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        college_id: string;
        created_at: Date;
    }>;
    login(data: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        user: any;
        token: string;
    }>;
    resetPasswordDirect(identifier: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map