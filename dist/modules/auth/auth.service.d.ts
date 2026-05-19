import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    register(data: RegisterDto): Promise<{
        id: string;
        name: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
        college_id: string;
    }>;
    login(data: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map