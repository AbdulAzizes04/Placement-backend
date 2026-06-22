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
        placements: any[];
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