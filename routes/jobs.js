import express from "express";
import Job from "../models/Job.js";
import { JobStatus } from "../constants/jobStatus.js";
import { canTransition } from "../services/jobStateMachine.js";
import { handleJobStatusEmail } from "../services/jobEmailTriggers.js";

const router = express.Router();

/**
 * VYTVOŘENÍ ZAKÁZKY
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, mode, requesterEmail } = req.body;

    const job = await Job.create({
      title,
      description,
      mode,
      requesterEmail,
      status:
        mode === "wait"
          ? JobStatus.NEW_WAITING
          : JobStatus.NEW_CHOOSING,
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Nelze vytvořit zakázku" });
  }
});

/**
 * ZAKÁZKY ZADAVATELE
 */
router.get("/my/:email", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { requesterEmail: req.params.email },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch {
    res.status(500).json({ error: "Nelze načíst zakázky" });
  }
});

/**
 * ZAKÁZKY PRO POMOCNÍKA (POUZE WAITING)
 */
router.get("/available", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: {
        status: JobStatus.NEW_WAITING,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch {
    res.status(500).json({ error: "Nelze načíst zakázky" });
  }
});

/**
 * ZMĚNA STAVU + EMAILY
 */
router.post("/:id/status", async (req, res) => {
  const { newStatus, helperEmail, agreedDate } = req.body;

  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Zakázka nenalezena" });
    }

    if (!canTransition(job.status, newStatus)) {
      return res.status(400).json({
        error: `Nelze přejít ze stavu ${job.status} do ${newStatus}`,
      });
    }

    if (newStatus === JobStatus.MATCHED && helperEmail) {
      job.helperEmail = helperEmail;
    }

    if (newStatus === JobStatus.AGREED && agreedDate) {
      job.agreedDate = agreedDate;
    }

    job.status = newStatus;
    await job.save();

    await handleJobStatusEmail(job);

    res.json(job);
  } catch {
    res.status(500).json({ error: "Chyba při změně stavu" });
  }
});

export default router;




