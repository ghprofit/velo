"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoles = void 0;
const common_1 = require("@nestjs/common");
const AdminRoles = (...roles) => (0, common_1.SetMetadata)('adminRoles', roles);
exports.AdminRoles = AdminRoles;
//# sourceMappingURL=admin-roles.decorator.js.map