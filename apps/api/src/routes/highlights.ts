import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { getPlan } from "../services/plans";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MarginNote:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         highlight_id:
 *           type: string
 *           format: uuid
 *         comment_text:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     Highlight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         document_id:
 *           type: string
 *           format: uuid
 *         page_number:
 *           type: integer
 *         text_content:
 *           type: string
 *         color_token:
 *           type: string
 *         bounding_rects:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         margin_notes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MarginNote'
 */

/**
 * @swagger
 * /highlights/{documentId}:
 *   get:
 *     summary: Get highlights for a document
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of highlights
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Highlight'
 */
router.get("/:documentId", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const highlights = await prisma.highlight.findMany({
      where: {
        document_id: req.params.documentId,
        document: { user_id: req.user!.id }
      },
      include: { margin_notes: true },
    });
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

/**
 * @swagger
 * /highlights:
 *   post:
 *     summary: Create/Update highlight
 *     tags: [Highlights]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_id
 *               - page_number
 *             properties:
 *               document_id:
 *                 type: string
 *                 format: uuid
 *               page_number:
 *                 type: integer
 *               text_content:
 *                 type: string
 *               color_token:
 *                 type: string
 *               bounding_rects:
 *                 type: object
 *               margin_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Highlight created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Highlight'
 *       403:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { document_id, page_number, text_content, color_token, bounding_rects, margin_note } = req.body;

  try {
    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: { id: document_id, user_id: req.user!.id }
    });
    if (!document) return res.status(403).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { current_plan: true, plan_status: true },
    });
    const plan = getPlan(user?.plan_status === "ACTIVE" ? user.current_plan : "FREE");

    if (plan.highlightLimit !== null) {
      const highlightCount = await prisma.highlight.count({
        where: { document: { user_id: req.user!.id } },
      });

      if (highlightCount >= plan.highlightLimit) {
        return res.status(402).json({
          error: "Limite de destaques do plano atingido. Atualize seu plano para continuar.",
        });
      }
    }

    const highlight = await prisma.highlight.create({
      data: {
        document_id,
        page_number,
        text_content,
        color_token,
        bounding_rects,
        margin_notes: margin_note ? {
          create: { comment_text: margin_note }
        } : undefined
      },
      include: { margin_notes: true }
    });

    res.json(highlight);
  } catch (error) {
    res.status(500).json({ error: "Failed to create highlight" });
  }
});

/**
 * @swagger
 * /highlights/{id}:
 *   delete:
 *     summary: Delete highlight
 *     tags: [Highlights]
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
 *         description: Highlight deleted successfully
 *       404:
 *         description: Highlight not found
 */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const highlight = await prisma.highlight.findFirst({
      where: {
        id: req.params.id,
        document: { user_id: req.user!.id }
      }
    });

    if (!highlight) return res.status(404).json({ error: "Highlight not found" });

    await prisma.highlight.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete highlight" });
  }
});

export default router;
