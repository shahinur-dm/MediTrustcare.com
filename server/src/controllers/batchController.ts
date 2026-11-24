import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Batch } from '../models/Batch';
import { EXPIRY_ALERT_DAYS } from '../config/constants';

export const getBatches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, warehouseId, filter } = req.query;
    const query: any = {};
    if (productId) query.product = productId;
    if (warehouseId) query.warehouse = warehouseId;

    const now = new Date();
    if (filter === 'expired') {
      query.expDate = { $lte: now };
    } else if (filter === 'near_expiry_30') {
      const d30 = new Date();
      d30.setDate(d30.getDate() + EXPIRY_ALERT_DAYS.CRITICAL);
      query.expDate = { $gt: now, $lte: d30 };
    } else if (filter === 'near_expiry_90') {
      const d90 = new Date();
      d90.setDate(d90.getDate() + EXPIRY_ALERT_DAYS.WARNING);
      query.expDate = { $gt: now, $lte: d90 };
    } else if (filter === 'near_expiry_180') {
      const d180 = new Date();
      d180.setDate(d180.getDate() + EXPIRY_ALERT_DAYS.ATTENTION);
      query.expDate = { $gt: now, $lte: d180 };
    }

    const batches = await Batch.find(query)
      .populate('product', 'name code unit dosageForm strength mrp')
      .populate('warehouse', 'name code district')
      .sort({ expDate: 1 });

    res.json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch batches', error: error.message });
  }
};
