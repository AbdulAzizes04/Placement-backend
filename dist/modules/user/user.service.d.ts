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
        email: string | null;
        phone: string | null;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        college_id: string;
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