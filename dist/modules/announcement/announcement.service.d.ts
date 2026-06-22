export declare class AnnouncementService {
    create(data: any, userId: string, collegeId: string): Promise<{
        id: string;
        college_id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        company_name: string;
        package: string | null;
        job_role: string;
        description: string;
        application_link: string | null;
        required_cgpa: number | null;
        required_skills: string[];
        allowed_branches: string[];
        is_crt_only: boolean;
        deadline: Date;
        created_by: string;
    }>;
    getAll(filters: any, page?: number, limit?: number): Promise<{
        announcements: ({
            creator: {
                name: string;
            };
        } & {
            id: string;
            college_id: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            company_name: string;
            package: string | null;
            job_role: string;
            description: string;
            application_link: string | null;
            required_cgpa: number | null;
            required_skills: string[];
            allowed_branches: string[];
            is_crt_only: boolean;
            deadline: Date;
            created_by: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        id: string;
        college_id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        company_name: string;
        package: string | null;
        job_role: string;
        description: string;
        application_link: string | null;
        required_cgpa: number | null;
        required_skills: string[];
        allowed_branches: string[];
        is_crt_only: boolean;
        deadline: Date;
        created_by: string;
    } | null>;
    update(id: string, data: any): Promise<{
        id: string;
        college_id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        company_name: string;
        package: string | null;
        job_role: string;
        description: string;
        application_link: string | null;
        required_cgpa: number | null;
        required_skills: string[];
        allowed_branches: string[];
        is_crt_only: boolean;
        deadline: Date;
        created_by: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        college_id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        company_name: string;
        package: string | null;
        job_role: string;
        description: string;
        application_link: string | null;
        required_cgpa: number | null;
        required_skills: string[];
        allowed_branches: string[];
        is_crt_only: boolean;
        deadline: Date;
        created_by: string;
    }>;
    bulkDelete(ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=announcement.service.d.ts.map