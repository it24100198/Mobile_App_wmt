import { ManufacturingJob, PackingBatch } from '../models/index.js';
import { JOB_STATUS } from '../utils/statusMachine.js';
import { PACKING_STATUS } from '../models/PackingBatch.js';

export async function listFinalJobs() {
  return ManufacturingJob.find({
    status: { $in: [JOB_STATUS.PACKING_COMPLETED] },
  })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getFinalJobDetail(jobId) {
  const [job, batches] = await Promise.all([
    ManufacturingJob.findById(jobId).lean(),
    PackingBatch.find({ jobId }).sort({ createdAt: -1 }).populate('packedBy', 'name').lean(),
  ]);
  if (!job) throw new Error('Job not found');
  return { job, batches };
}

export async function createPackingBatch(jobId, data, userId) {
  const job = await ManufacturingJob.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (![JOB_STATUS.AFTER_WASH_RECEIVED, JOB_STATUS.PACKING_COMPLETED].includes(job.status)) {
    throw new Error('Job must be in AFTER_WASH_RECEIVED or PACKING_COMPLETED status');
  }

  const batchCount = await PackingBatch.countDocuments({ jobId });
  const batchNumber = `${job.jobNumber}-BATCH-${String(batchCount + 1).padStart(3, '0')}`;

  const batch = await PackingBatch.create({
    jobId,
    batchNumber,
    quantity: data.quantity,
    type: data.type || 'good',
    packedBy: userId,
    notes: data.notes || '',
  });
  return batch.toObject();
}

export async function finalizeJob(jobId, userId) {
  const job = await ManufacturingJob.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (job.status !== JOB_STATUS.PACKING_COMPLETED) {
    throw new Error('Job must be in PACKING_COMPLETED status');
  }
  job.status = JOB_STATUS.WAREHOUSE_RECEIVED;
  await job.save();

  await PackingBatch.updateMany(
    { jobId, status: PACKING_STATUS.PACKING },
    { $set: { status: PACKING_STATUS.COMPLETED, finalCheckedBy: userId, completedAt: new Date() } }
  );

  return job.toObject();
}
