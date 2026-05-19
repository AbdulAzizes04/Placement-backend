"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const router = (0, express_1.Router)();
router.post('/', schedule_controller_1.createSchedule);
router.get('/', schedule_controller_1.getSchedules);
router.get('/:id', schedule_controller_1.getScheduleById);
router.delete('/:id', schedule_controller_1.deleteSchedule);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map