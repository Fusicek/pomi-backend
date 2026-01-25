import { JobStatus } from "../constants/jobStatus.js";

const transitions = {
  [JobStatus.NEW_WAITING]: [JobStatus.MATCHED, JobStatus.CANCELLED],
  [JobStatus.NEW_CHOOSING]: [JobStatus.MATCHED, JobStatus.CANCELLED],
  [JobStatus.MATCHED]: [JobStatus.AGREED, JobStatus.CANCELLED],
  [JobStatus.AGREED]: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED],
  [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.CANCELLED]: [],
};

export function canTransition(from, to) {
  return transitions[from]?.includes(to);
}
