"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResponse = exports.getPaginationOptions = void 0;
const getPaginationOptions = (options) => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.getPaginationOptions = getPaginationOptions;
const createPaginatedResponse = (data, total, options) => {
    const { page, limit } = (0, exports.getPaginationOptions)(options);
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    };
};
exports.createPaginatedResponse = createPaginatedResponse;
//# sourceMappingURL=pagination.js.map