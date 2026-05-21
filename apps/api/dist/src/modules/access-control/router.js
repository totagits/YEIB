import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../server/lib/async-handler.js";
import { prisma } from "../../server/lib/prisma.js";
import { requireAuth } from "../../server/middleware/auth.js";
import { requirePermission } from "../../server/middleware/authorize.js";
import { recordAuditLog } from "../../server/lib/audit.js";
import { asStringParam } from "../../server/lib/http.js";
const updateRolePermissionsSchema = z.object({
    permissionIds: z.array(z.string())
});
export const rolesRouter = Router();
export const permissionsRouter = Router();
rolesRouter.use(requireAuth);
permissionsRouter.use(requireAuth);
rolesRouter.get("/", requirePermission("roles:view"), asyncHandler(async (_request, response) => {
    const roles = await prisma.role.findMany({
        include: {
            rolePermissions: {
                include: {
                    permission: true
                }
            }
        },
        orderBy: { name: "asc" }
    });
    response.json(roles.map((role) => ({
        ...role,
        permissions: role.rolePermissions.map((rolePermission) => rolePermission.permission)
    })));
}));
rolesRouter.patch("/:id/permissions", requirePermission("roles:update"), asyncHandler(async (request, response) => {
    const roleId = asStringParam(request.params.id);
    const payload = updateRolePermissionsSchema.parse(request.body);
    await prisma.rolePermission.deleteMany({
        where: { roleId }
    });
    if (payload.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
            data: payload.permissionIds.map((permissionId) => ({
                roleId,
                permissionId
            }))
        });
    }
    await recordAuditLog({
        action: "CHANGE_PERMISSION",
        entityType: "ROLE",
        entityId: roleId,
        userId: request.user.id,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        newValue: payload,
        description: "Role permissions updated"
    });
    const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
            rolePermissions: {
                include: {
                    permission: true
                }
            }
        }
    });
    if (!role) {
        response.status(404).json({ message: "Role not found" });
        return;
    }
    response.json({
        ...role,
        permissions: role.rolePermissions.map((rolePermission) => rolePermission.permission)
    });
}));
permissionsRouter.get("/", requirePermission("roles:view"), asyncHandler(async (_request, response) => {
    response.json(await prisma.permission.findMany({
        orderBy: [{ module: "asc" }, { name: "asc" }]
    }));
}));
