export declare class UserService {
    getUserById(id: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
    } | null>;
    updateUser(id: string, data: any): Promise<{
        id: string;
        name: string;
        username: string | null;
        username_hash: string | null;
        email: string | null;
        email_hash: string | null;
        phone: string | null;
        phone_hash: string | null;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        college_id: string;
        mustChangePassword: boolean;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
    }>;
    getAllUsers(): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        created_at: Date;
    }[]>;
}
//# sourceMappingURL=user.service.d.ts.map