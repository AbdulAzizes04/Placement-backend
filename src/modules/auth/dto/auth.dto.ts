export interface LoginDto {
    identifier: string;
    password: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'STUDENT' | 'STAFF' | 'TPO' | 'ADMIN';
    college_id: string;
}
