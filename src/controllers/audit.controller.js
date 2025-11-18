// src/controllers/audit.controller.js
import * as auditService from "../services/audit.service.js";

export async function listAudits(req, res) {
  try {
    const audits = await auditService.getAllAudits();
    return res.status(200).json({ audits });
  } catch (error) {
    console.error("❌ Error listing audits:", error);
    return res.status(500).json({ mensaje: "Error interno al obtener auditorías." });
  }
}
