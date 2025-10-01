import express from "express";
import {
  verifyToken,
  authorizeRole,
  authorizeAdmin,
} from "../middleware/auth.middleware.js";
import * as rbac from "../controllers/rbac.controller.js";

const router = express.Router();

/* ===== Roles ===== */
router.get("/roles", authorizeAdmin, rbac.listRoles);
router.post("/roles", authorizeAdmin, rbac.addRole);
router.patch("/roles/:id", authorizeAdmin, rbac.editRole);
router.delete("/roles/:id", authorizeAdmin, rbac.deleteRole);

/* ===== Permissions ===== */
router.get("/permissions", authorizeAdmin, rbac.listPermissions);
router.post("/permissions", authorizeAdmin, rbac.addPermission);
router.delete("/permissions/:id", authorizeAdmin, rbac.deletePermission);

/* ===== Assignments ===== */
router.post("/roles/assign", authorizeAdmin, rbac.assignRoleToUser);
router.post("/roles/unassign", authorizeAdmin, rbac.removeRoleFromUser);
router.post("/permissions/assign", authorizeAdmin, rbac.grantPermissionToRole);
router.post(
  "/permissions/revoke",
  authorizeAdmin,
  rbac.revokePermissionFromRole,
);

export default router;
