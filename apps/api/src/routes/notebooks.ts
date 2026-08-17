import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notebook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         document_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         content_json:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /notebooks:
 *   get:
 *     summary: Get notebook for a document or user's general notebook
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: documentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional document ID to get a specific notebook
 *     responses:
 *       200:
 *         description: The notebook object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notebook'
 */
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { documentId } = req.query;

  try {
    const notebook = await prisma.notebook.findFirst({
      where: {
        user_id: req.user!.id,
        document_id: (documentId as string) || null
      }
    });

    if (!notebook) {
      // Create empty notebook if it doesn't exist
      const newNotebook = await prisma.notebook.create({
        data: {
          user_id: req.user!.id,
          document_id: (documentId as string) || null,
          content_json: {} // Empty TipTap schema
        }
      });
      return res.json(newNotebook);
    }

    res.json(notebook);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notebook" });
  }
});

/**
 * @swagger
 * /notebooks/{id}:
 *   patch:
 *     summary: Update notebook content (Autosave/Sync)
 *     tags: [Notebooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content_json:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notebook updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notebook'
 *       404:
 *         description: Notebook not found
 */
router.patch("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { content_json } = req.body;

  try {
    const notebook = await prisma.notebook.findFirst({
      where: { id: req.params.id, user_id: req.user!.id }
    });

    if (!notebook) return res.status(404).json({ error: "Notebook not found" });

    const updatedNotebook = await prisma.notebook.update({
      where: { id: req.params.id },
      data: { content_json, updated_at: new Date() }
    });

    res.json(updatedNotebook);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notebook" });
  }
});

export default router;
