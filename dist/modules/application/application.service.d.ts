export declare class ApplicationService {
    apply(studentId: string, announcementId: string): Promise<{
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        student_id: string;
        applied_at: Date;
        announcement_id: string;
    }>;
    getApplications(studentId: string): Promise<({
        announcement: {
            id: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            college_id: string;
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
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        student_id: string;
        applied_at: Date;
        announcement_id: string;
    })[]>;
    updateStatus(id: string, status: any): Promise<{
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        student_id: string;
        applied_at: Date;
        announcement_id: string;
    }>;
    getAll(filters: any, page?: number, limit?: number): Promise<{
        applications: ({
            announcement: {
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                college_id: string;
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
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                college_id: string;
                year: number;
                status: string;
                roll_no: string;
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
            id: string;
            updated_at: Date;
            is_deleted: boolean;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            student_id: string;
            applied_at: Date;
            announcement_id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=application.service.d.ts.map