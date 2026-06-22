export declare class CRTService {
    createBatch(data: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        batch_name: string;
        academic_year: string;
        trainer_name: string | null;
        start_date: Date | null;
        end_date: Date | null;
    }>;
    getBatches(studentId?: string): Promise<{
        total_students: number;
        placed_students: number;
        unplaced_students: number;
        branch_breakdown: Record<string, number>;
        students: undefined;
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        batch_name: string;
        academic_year: string;
        trainer_name: string | null;
        start_date: Date | null;
        end_date: Date | null;
    }[]>;
    markAttendance(data: any): Promise<{
        status: import(".prisma/client").$Enums.AttendanceStatus;
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        date: Date;
        student_id: string;
        section: import(".prisma/client").$Enums.AttendanceSection;
        topic: string | null;
        marked_at: Date;
        schedule_id: string;
    }>;
    previewBatch(minMarks: number, maxMarks: number): Promise<{
        branches: Record<string, number>;
        total: number;
    }>;
    allocateBatch(batchName: string, totalStrength: number, allocations: Record<string, number>, // { CSE: 10, ECE: 5 }
    minMarks: number, maxMarks: number): Promise<{
        batch: {
            id: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            batch_name: string;
            academic_year: string;
            trainer_name: string | null;
            start_date: Date | null;
            end_date: Date | null;
        };
        allocatedCount: number;
    }>;
    importStudentMarks(students: any[]): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
    createSchedule(data: {
        type: 'BATCH' | 'BRANCH';
        academic_year: string;
        name: string;
        start_date: string | Date;
        end_date: string | Date;
        room_no: string;
        branch?: string;
        batch_ids?: string[];
        faculty_ids: string[];
    }): Promise<{
        batches: {
            id: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            batch_name: string;
            academic_year: string;
            trainer_name: string | null;
            start_date: Date | null;
            end_date: Date | null;
        }[];
        faculty: {
            id: string;
            name: string;
            email: string;
            email_hash: string | null;
            phone: string | null;
            phone_hash: string | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            user_id: string;
            assignedBranches: string[];
            assignedBatches: string[];
        }[];
    } & {
        type: import(".prisma/client").$Enums.ScheduleType;
        status: string;
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        branch: string | null;
        academic_year: string;
        start_date: Date;
        end_date: Date;
        room_no: string;
        attendance_completed: boolean;
        attendance_completed_at: Date | null;
    }>;
    getSchedules(filters: {
        academic_year?: string;
        type?: string;
        studentId?: string;
        branch?: string;
    }, page?: number, limit?: number): Promise<{
        schedules: ({
            _count: {
                attendances: number;
            };
            batches: {
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                batch_name: string;
                academic_year: string;
                trainer_name: string | null;
                start_date: Date | null;
                end_date: Date | null;
            }[];
            faculty: {
                id: string;
                name: string;
                email: string;
                email_hash: string | null;
                phone: string | null;
                phone_hash: string | null;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                user_id: string;
                assignedBranches: string[];
                assignedBatches: string[];
            }[];
        } & {
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            branch: string | null;
            academic_year: string;
            start_date: Date;
            end_date: Date;
            room_no: string;
            attendance_completed: boolean;
            attendance_completed_at: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    deleteSchedule(scheduleId: string): Promise<{
        type: import(".prisma/client").$Enums.ScheduleType;
        status: string;
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        branch: string | null;
        academic_year: string;
        start_date: Date;
        end_date: Date;
        room_no: string;
        attendance_completed: boolean;
        attendance_completed_at: Date | null;
    }>;
    getFacultySchedules(userId: string, page?: number, limit?: number): Promise<{
        schedules: {
            totalSessions: number;
            markedSessions: number;
            isPending: boolean;
            _count: {
                attendances: number;
            };
            batches: {
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                batch_name: string;
                academic_year: string;
                trainer_name: string | null;
                start_date: Date | null;
                end_date: Date | null;
            }[];
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            branch: string | null;
            academic_year: string;
            start_date: Date;
            end_date: Date;
            room_no: string;
            attendance_completed: boolean;
            attendance_completed_at: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private calculateScheduleProgress;
    getScheduleStudents(scheduleId: string): Promise<any[]>;
    markDailyAttendance(scheduleId: string, date: string | Date, section: 'MORNING' | 'AFTERNOON', topic: string, records: {
        student_id: string;
        status: 'PRESENT' | 'ABSENT';
    }[]): Promise<any[]>;
    getScheduleAnalytics(scheduleId: string): Promise<{
        schedule: {
            totalSessions: number;
            markedSessions: number;
            isPending: boolean;
            batches: {
                id: string;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                batch_name: string;
                academic_year: string;
                trainer_name: string | null;
                start_date: Date | null;
                end_date: Date | null;
            }[];
            faculty: {
                id: string;
                name: string;
                email: string;
                email_hash: string | null;
                phone: string | null;
                phone_hash: string | null;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                user_id: string;
                assignedBranches: string[];
                assignedBatches: string[];
            }[];
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            branch: string | null;
            academic_year: string;
            start_date: Date;
            end_date: Date;
            room_no: string;
            attendance_completed: boolean;
            attendance_completed_at: Date | null;
        };
        students: {
            id: any;
            roll_no: any;
            name: any;
            branch: any;
        }[];
        attendance: {
            status: import(".prisma/client").$Enums.AttendanceStatus;
            id: string;
            updated_at: Date;
            is_deleted: boolean;
            date: Date;
            student_id: string;
            section: import(".prisma/client").$Enums.AttendanceSection;
            topic: string | null;
            marked_at: Date;
            schedule_id: string;
        }[];
        stats: {
            totalSessions: number;
            markedSessions: number;
            isPending: boolean;
            totalClasses: number;
            totalPresent: number;
            totalAbsent: number;
            presentPercentage: number;
        };
    }>;
    getAttendanceBySlot(scheduleId: string, date: string, section: 'MORNING' | 'AFTERNOON'): Promise<{
        records: {
            student_id: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
        }[];
        topic: string | null;
    }>;
    getStudentAttendance(studentId: string): Promise<({
        schedule: {
            type: import(".prisma/client").$Enums.ScheduleType;
            name: string;
        };
    } & {
        status: import(".prisma/client").$Enums.AttendanceStatus;
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        date: Date;
        student_id: string;
        section: import(".prisma/client").$Enums.AttendanceSection;
        topic: string | null;
        marked_at: Date;
        schedule_id: string;
    })[]>;
}
//# sourceMappingURL=crt.service.d.ts.map