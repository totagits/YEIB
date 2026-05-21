import { Router } from "express";
import { asyncHandler } from "../../server/lib/async-handler.js";
import { requireAuth } from "../../server/middleware/auth.js";
import { requirePermission } from "../../server/middleware/authorize.js";
import { asStringParam } from "../../server/lib/http.js";
import { analyticsService } from "./service.js";
export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.get("/executive", requirePermission("analytics:view"), asyncHandler(async (_request, response) => {
    response.json(await analyticsService.executive());
}));
analyticsRouter.get("/county/:countyId", requirePermission("analytics:view"), asyncHandler(async (request, response) => {
    response.json(await analyticsService.county(asStringParam(request.params.countyId)));
}));
analyticsRouter.get("/data-quality", requirePermission("analytics:view"), asyncHandler(async (_request, response) => {
    response.json(await analyticsService.dataQuality());
}));
analyticsRouter.get("/partner", requirePermission("analytics:view"), asyncHandler(async (_request, response) => {
    response.json(await analyticsService.partner());
}));
