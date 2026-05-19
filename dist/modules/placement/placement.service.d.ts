export declare class PlacementService {
    create(data: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        student_id: string;
        company_name: string;
        package: number | null;
        offer_letter_url: string | null;
        placed_at: Date;
    }>;
    getAll(filters: any, page?: number, limit?: number): Promise<{
        placements: ({
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
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            student_id: string;
            company_name: string;
            package: number | null;
            offer_letter_url: string | null;
            placed_at: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getByStudent(studentId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        student_id: string;
        company_name: string;
        package: number | null;
        offer_letter_url: string | null;
        placed_at: Date;
    }[]>;
}
//# sourceMappingURL=placement.service.d.ts.map