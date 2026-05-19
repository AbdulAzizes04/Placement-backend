export interface CreateStudentDto {
    roll_no: string;
    name: string;
    email?: string;
    phone?: string;
    branch: string;
    year: number;
    batch: string;
    cgpa: number;
    skills?: string[];
    status?: string;
}
export interface BulkStudentDto {
    roll_no: string;
    name: string;
    email?: string;
    phone?: string;
    branch: string;
    year: number;
    batch: string;
    cgpa: number;
    skills?: string[];
    status?: string;
    is_crt?: boolean;
    crt_marks?: number;
}
//# sourceMappingURL=student.dto.d.ts.map