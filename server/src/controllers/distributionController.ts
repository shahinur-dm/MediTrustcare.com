import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DeliveryChallan } from '../models/DeliveryChallan';
import { SalesOrder } from '../models/SalesOrder';

export const getDeliveryChallans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, district } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (district) query.district = district;

    const challans = await DeliveryChallan.find(query)
      .populate('salesOrder', 'orderNumber grandTotal orderDate')
      .populate('customer', 'name code phone deliveryAddress district upazila')
      .populate('warehouse', 'name code')
      .populate('driver', 'name phone')
      .populate('vehicle', 'registrationNumber vehicleType brandModel')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: challans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch delivery challans', error: error.message });
  }
};

export const updateDeliveryStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, driver, vehicle, proofOfDeliveryNotes, receiverName, deliveryExpenses } = req.body;
    const challan = await DeliveryChallan.findById(req.params.id);
    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (driver) challan.driver = driver;
    if (vehicle) challan.vehicle = vehicle;
    if (proofOfDeliveryNotes) challan.proofOfDeliveryNotes = proofOfDeliveryNotes;
    if (receiverName) challan.receiverName = receiverName;
    if (deliveryExpenses !== undefined) challan.deliveryExpenses = deliveryExpenses;

    if (status) {
      challan.status = status;
      if (status === 'dispatched') challan.dispatchedAt = new Date();
      if (status === 'delivered') challan.deliveredAt = new Date();

      // Update linked sales order
      if (challan.salesOrder) {
        await SalesOrder.findByIdAndUpdate(challan.salesOrder, {
          deliveryStatus: status,
          status: status === 'delivered' ? 'delivered' : 'dispatched',
        });
      }
    }

    await challan.save();
    res.json({ success: true, data: challan, message: 'Delivery status updated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update delivery status', error: error.message });
  }
};
