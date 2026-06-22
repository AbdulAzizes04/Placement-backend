export declare class ApplicationService {
    apply(studentId: string, announcementId: string): Promise<{
        status: import(".prisma/client").$Enums.ApplicationStatus;
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        student_id: string;
        announcement_id: string;
        applied_at: Date;
    }>;
    getApplications(studentId: string): Promise<({
        announcement: {
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
        };
    } & {
        status: import(".prisma/client").$Enums.ApplicationStatus;
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        student_id: string;
        announcement_id: string;
        applied_at: Date;
    })[]>;
    updateStatus(id: string, status: any): Promise<{
        status: import(".prisma/client").$Enums.ApplicationStatus;
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        student_id: string;
        announcement_id: string;
        applied_at: Date;
    }>;
    getAll(filters: any, page?: number, limit?: number): Promise<{
        applications: ({
            announcement: {
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
            };
            student: {
                user: {
                    name: string;
                    email: string | null;
                    phone: string | null;
                };
            } & {
                status: string;
                id: string;
                college_id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                year: number;
                roll_no: string;
                roll_no_hash: string;
                branch: string;
                cgpa: number;
                batch: string;
                is_crt: boolean;
                crt_marks: number | null;
                allocated_batch: string | null;
                skills: string[];
                resume_url: string | null;
                marks10_url: string | null;
                marks12_url: string | null;
                user_id: string;
                crt_batch_id: string | null;
            };
        } & {
            status: import(".prisma/client").$Enums.ApplicationStatus;
            id: string;
            updated_at: Date;
            is_deleted: boolean;
            student_id: string;
            announcement_id: string;
            applied_at: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    bulkUpdateStatuses(companyName: string, updates: Array<{
        roll_no: string;
        status: any;
    }>): Promise<{
        success: boolean;
        message: string;
        successCount: number;
        errors: any[];
    }>;
}
//# sourceMappingURL=application.service.d.ts.map