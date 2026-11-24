import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  district: string;
  binNumber: string;
  tinNumber: string;
  tradeLicense: string;
  drugLicense?: string;
  currency: string;
  currencySymbol: string;
  logo?: string;
  mushakHeader?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, default: 'MediTrust Care Bangladesh' },
    legalName: { type: String, default: 'MediTrust Healthcare & Distribution Ltd.' },
    email: { type: String, required: true, default: 'meditrust.healthcare2026@gmail.com' },
    phone: { type: String, required: true, default: '01763-638441' },
    website: { type: String, default: 'https://www.meditrustcarebd.com/' },
    address: { type: String, default: 'Faridpur, Dhaka, Bangladesh' },
    district: { type: String, default: 'Faridpur' },
    binNumber: { type: String, default: '003498214-0101' },
    tinNumber: { type: String, default: '849201948210' },
    tradeLicense: { type: String, default: 'TRAD/DSCC/2026/08942' },
    drugLicense: { type: String, default: 'DL-FD-2026-0914' },
    currency: { type: String, default: 'BDT' },
    currencySymbol: { type: String, default: '৳' },
    logo: { type: String, default: '' },
    mushakHeader: { type: String, default: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - জাতীয় রাজস্ব বোর্ড (মূসক-৬.৩)' },
    termsAndConditions: { type: String, default: 'Goods once sold are returnable only under verified quality guidelines.' },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
