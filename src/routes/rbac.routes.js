import express from "express";
import { verifyToken, authorizeRole } from "../middleware/auth.middleware.js";
import * as rbac from "../controllers/rbac.controller.js";

const router = express.Router();

/* ===== Roles ===== */
router.get("/roles", verifyToken, authorizeRole("admin"), rbac.listRoles);
router.post("/roles", verifyToken, authorizeRole("admin"), rbac.addRole);
router.patch("/roles/:id", verifyToken, authorizeRole("admin"), rbac.editRole);
router.delete("/roles/:id", verifyToken, authorizeRole("admin"), rbac.deleteRole);

/* ===== Permissions ===== */
router.get("/permissions", verifyToken, authorizeRole("admin"), rbac.listPermissions);
router.post("/permissions", verifyToken, authorizeRole("admin"), rbac.addPermission);
router.delete("/permissions/:id", verifyToken, authorizeRole("admin"), rbac.deletePermission);

/* ===== Assignments ===== */
router.post("/roles/assign", verifyToken, authorizeRole("admin"), rbac.assignRoleToUser);
router.post("/roles/unassign", verifyToken, authorizeRole("admin"), rbac.removeRoleFromUser);
router.post("/permissions/assign", verifyToken, authorizeRole("admin"), rbac.grantPermissionToRole);
router.post("/permissions/revoke", verifyToken, authorizeRole("admin"), rbac.revokePermissionFromRole);

export default router;
