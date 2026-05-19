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
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        status: import(".prisma/client").$Enums.AttendanceStatus;
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
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            user_id: string;
            assignedBranches: string[];
            assignedBatches: string[];
        }[];
    } & {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        type: import(".prisma/client").$Enums.ScheduleType;
        status: string;
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
                phone: string | null;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                user_id: string;
                assignedBranches: string[];
                assignedBatches: string[];
            }[];
        } & {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
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
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
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
                phone: string | null;
                created_at: Date;
                updated_at: Date;
                is_deleted: boolean;
                user_id: string;
                assignedBranches: string[];
                assignedBatches: string[];
            }[];
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            type: import(".prisma/client").$Enums.ScheduleType;
            status: string;
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
            id: string;
            updated_at: Date;
            is_deleted: boolean;
            status: import(".prisma/client").$Enums.AttendanceStatus;
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
            name: string;
            type: import(".prisma/client").$Enums.ScheduleType;
        };
    } & {
        id: string;
        updated_at: Date;
        is_deleted: boolean;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        date: Date;
        student_id: string;
        section: import(".prisma/client").$Enums.AttendanceSection;
        topic: string | null;
        marked_at: Date;
        schedule_id: string;
    })[]>;
}
//# sourceMappingURL=crt.service.d.ts.map