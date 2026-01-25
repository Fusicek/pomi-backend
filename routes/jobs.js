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
    const {
      title,
      description,
      mode,
      requesterEmail,
    } = req.body;

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
    console.error(err);
    res.status(500).json({ error: "Nelze vytvořit zakázku" });
  }
});

/**
 * ZÍSKÁNÍ ZAKÁZEK ZADAVATELE
 */
router.get("/my/:email", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { requesterEmail: req.params.email },
      order: [["createdAt", "DESC"]],
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Nelze načíst zakázky" });
  }
});

/**
 * ZMĚNA STAVU ZAKÁZKY + EMAIL NOTIFIKACE
 */
router.post("/:id/status", async (req, res) => {
  const { newStatus, agreedDate, helperEmail } = req.body;

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

    // při MATCHED ukládáme pomocníka
    if (newStatus === JobStatus.MATCHED && helperEmail) {
      job.helperEmail = helperEmail;
    }

    // při AGREED ukládáme datum
    if (newStatus === JobStatus.AGREED && agreedDate) {
      job.agreedDate = agreedDate;
    }

    job.status = newStatus;

    await job.save();

    // 🔔 EMAIL NOTIFIKACE (CENTRÁLNĚ)
    await handleJobStatusEmail(job);

    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba při změně stavu zakázky" });
  }
});

/**
 * ZRUŠENÍ ZAKÁZKY
 */
router.post("/:id/cancel", async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Zakázka nenalezena" });
    }

    job.status = JobStatus.CANCELLED;
    await job.save();

    await handleJobStatusEmail(job);

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Nelze zrušit zakázku" });
  }
});

export default router;




