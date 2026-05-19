"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudent = exports.isTPO = exports.isStaff = exports.isAdmin = exports.authorize = void 0;
const constants_1 = require("../config/constants");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};
exports.authorize = authorize;
exports.isAdmin = (0, exports.authorize)(constants_1.ROLES.ADMIN);
exports.isStaff = (0, exports.authorize)(constants_1.ROLES.STAFF);
exports.isTPO = (0, exports.authorize)(constants_1.ROLES.TPO);
exports.isStudent = (0, exports.authorize)(constants_1.ROLES.STUDENT);
//# sourceMappingURL=role.middleware.js.map