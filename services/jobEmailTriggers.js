import { JobStatus } from "../constants/jobStatus.js";
import { sendEmail } from "./emailService.js";
import {
  matchedEmail,
  completedEmail,
  cancelledEmail,
} from "./emailTemplates.js";

export async function handleJobStatusEmail(job) {
  const recipients = [job.requesterEmail, job.helperEmail].filter(Boolean);

  if (job.status === JobStatus.MATCHED) {
    const email = matchedEmail(job.id);
    for (const to of recipients) {
      await sendEmail({ to, ...email });
    }
  }

  if (job.status === JobStatus.COMPLETED) {
    const email = completedEmail(job.id);
    for (const to of recipients) {
      await sendEmail({ to, ...email });
    }
  }

  if (job.status === JobStatus.CANCELLED) {
    const email = cancelledEmail(job.id);
    for (const to of recipients) {
      await sendEmail({ to, ...email });
    }
  }
}
