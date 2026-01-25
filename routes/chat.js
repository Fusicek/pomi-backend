import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const router = express.Router();

/**
 * VYTVOŘENÍ CHATU (při propojení)
 */
router.post("/", async (req, res) => {
  const { jobId, userAEmail, userBEmail } = req.body;

  try {
    const chat = await Chat.create({
      jobId,
      userAEmail,
      userBEmail,
    });

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Nelze vytvořit chat" });
  }
});

/**
 * ZÍSKÁNÍ CHATU + ZPRÁV
 */
router.get("/:jobId", async (req, res) => {
  try {
    const chat = await Chat.findOne({
      where: { jobId: req.params.jobId },
      include: Message,
      order: [[Message, "createdAt", "ASC"]],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat nenalezen" });
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba při načítání chatu" });
  }
});

/**
 * ODESLÁNÍ ZPRÁVY
 */
router.post("/message", async (req, res) => {
  const { chatId, senderEmail, text } = req.body;

  try {
    const message = await Message.create({
      chatId,
      senderEmail,
      text,
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Nelze odeslat zprávu" });
  }
});

export default router;
