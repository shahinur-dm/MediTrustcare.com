import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { logAudit } from '../services/auditService';

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, brand, status, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    const inventory = await Inventory.find({ product: product._id }).populate('warehouse', 'name code district');
    res.json({ success: true, data: { product, inventory } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving product', error: error.message });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    await logAudit({
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE_PRODUCT',
      module: 'Products',
      entityId: product.code,
      details: `Created product ${product.name} (${product.code})`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    await logAudit({
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE_PRODUCT',
      module: 'Products',
      entityId: product.code,
      details: `Updated product ${product.name}`,
    });
    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const inv = await Inventory.findOne({ product: req.params.id, totalQuantity: { $gt: 0 } });
    if (inv) {
      res.status(400).json({ success: false, message: 'Cannot delete product with existing inventory stock.' });
      return;
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
};
