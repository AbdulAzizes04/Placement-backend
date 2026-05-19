"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteFilter = void 0;
const softDeleteFilter = (req, res, next) => {
    // This middleware can be used to automatically filter out soft deleted records
    // For Prisma, we can add where: { deletedAt: null } to queries
    // But since it's per model, better to handle in services
    next();
};
exports.softDeleteFilter = softDeleteFilter;
//# sourceMappingURL=softDelete.middleware.js.map