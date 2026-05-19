import { CreateStudentDto, BulkStudentDto } from './dto/student.dto';
export declare class StudentService {
    createStudentWithUser(collegeId: string, data: CreateStudentDto): Promise<{
        user: {
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
        };
        profile: {
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
    }>;
    createProfile(userId: string, collegeId: string, data: any): Promise<{
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
    }>;
    getProfile(userId: string): Promise<{
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
    } | null>;
    getStudentByRollNo(rollNo: string): Promise<{
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
    } | null>;
    updateProfile(userId: string, data: any): Promise<{
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
    }>;
    getStatistics(collegeId: string, filters?: any): Promise<{
        total: number;
        placed: number;
        crt: number;
        unplaced: number;
        branchDistribution: {
            branch: string;
            total: number;
            placed: number;
        }[];
    }>;
    getAllStudents(filters: any, page?: number, limit?: number): Promise<{
        students: ({
            user: {
                id: string;
                name: string;
                username: string | null;
                email: string | null;
                role: import(".prisma/client").$Enums.Role;
                college_id: string;
            };
            placement_records: {
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                student_id: string;
                company_name: string;
                package: number | null;
                offer_letter_url: string | null;
                placed_at: Date;
            }[];
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    bulkCreateStudents(students: BulkStudentDto[], collegeId: string): Promise<{
        inserted: number;
        updated: number;
        skipped: number;
        failed: number;
        errors: any[];
    }>;
    bulkSyncStudents(students: BulkStudentDto[], collegeId: string): Promise<{
        updated: number;
        skipped: number;
        failed: number;
        errors: any[];
    }>;
    deleteStudent(userIdOrProfileId: string): Promise<{
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
    bulkDeleteStudents(userIds: string[]): Promise<{
        count: number;
    }>;
    deleteAllStudents(collegeId: string): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=student.service.d.ts.map