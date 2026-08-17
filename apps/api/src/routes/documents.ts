import { Router, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { s3Service } from "../services/s3";
import { getPlan } from "../services/plans";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         file_path:
 *           type: string
 *         file_size:
 *           type: integer
 *         total_pages:
 *           type: integer
 *         current_page:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: List user documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 */
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: "desc" },
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * @swagger
 * /documents/{id}/url:
 *   get:
 *     summary: Get document download URL (Presigned)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       404:
 *         description: Document not found
 */
router.get("/:id/url", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, user_id: req.user!.id },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });

    const url = await s3Service.getDownloadUrl(document.file_path);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate URL" });
  }
});

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               total_pages:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       400:
 *         description: No file uploaded
 */
router.post("/upload", authMiddleware, upload.single("pdf"), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { title, total_pages } = req.body;
  const fileId = uuidv4();
  const filePath = `documents/${req.user!.id}/${fileId}.pdf`;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { current_plan: true, plan_status: true },
    });
    const plan = getPlan(user?.plan_status === "ACTIVE" ? user.current_plan : "FREE");
    const documentCount = await prisma.document.count({ where: { user_id: req.user!.id } });

    if (plan.documentLimit !== null && documentCount >= plan.documentLimit) {
      return res.status(402).json({
        error: "Limite de documentos do plano atingido. Atualize seu plano para continuar.",
      });
    }

    // 1. Upload to iDrive e2
    await s3Service.uploadFile(filePath, req.file.buffer, "application/pdf");

    // 2. Save to database
    const document = await prisma.document.create({
      data: {
        id: fileId,
        user_id: req.user!.id,
        title: title || req.file.originalname,
        file_path: filePath,
        file_size: req.file.size,
        total_pages: parseInt(total_pages) || 0,
      },
    });

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.patch("/:id/progress", authMiddleware, async (req: AuthRequest, res: Response) => {
  const currentPage = parseOptionalPositiveInt(req.body.current_page);
  const totalPages = parseOptionalPositiveInt(req.body.total_pages);

  if (currentPage === null && totalPages === null) {
    return res.status(400).json({ error: "No progress data provided" });
  }

  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, user_id: req.user!.id },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });

    const nextTotalPages = totalPages ?? document.total_pages;
    const nextCurrentPage =
      currentPage === null
        ? document.current_page
        : clamp(currentPage, 1, Math.max(nextTotalPages, 1));

    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        ...(totalPages !== null ? { total_pages: totalPages } : {}),
        current_page: nextCurrentPage,
      },
    });

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reading progress" });
  }
});

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, user_id: req.user!.id },
    });

    if (!document) return res.status(404).json({ error: "Document not found" });

    // 1. Delete from S3
    await s3Service.deleteFile(document.file_path);

    // 2. Delete from DB (Highlights and Notebooks will be deleted by Cascade if configured in DB)
    await prisma.document.delete({ where: { id: document.id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

function parseOptionalPositiveInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1) return null;

  return numberValue;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default router;
