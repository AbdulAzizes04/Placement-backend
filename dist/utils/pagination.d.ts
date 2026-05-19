export interface PaginationOptions {
    page?: number;
    limit?: number;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const getPaginationOptions: (options: PaginationOptions) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const createPaginatedResponse: <T>(data: T[], total: number, options: PaginationOptions) => PaginatedResult<T>;
//# sourceMappingURL=pagination.d.ts.map