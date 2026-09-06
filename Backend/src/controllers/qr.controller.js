import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { generateQRCodeWithLogo } from '../utils/qrGenerator.js';
import crypto from 'crypto';
import path from 'path';
import os from 'os';

const generateCustomQR = asyncHandler(async (req, res) => {
  const { link } = req.body;

  if (!link) {
    throw new ApiError(400, 'Link is required to generate a QR code');
  }

  try {
    const dataUri = await generateQRCodeWithLogo(link);
    
    const uploadedImage = await uploadOnCloudinary(dataUri, 'Devspace/qrcodes');
    
    if (!uploadedImage) {
      throw new ApiError(500, 'Failed to upload QR code to Cloudinary');
    }

    const qrCodeUrl = uploadedImage.url;

    const { data: customQr, error } = await supabase.from('custom_qrs').insert([{
      link,
      qrUrl: qrCodeUrl
    }]).select().single();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json(new ApiResponse(201, customQr, 'QR code generated and uploaded successfully'));
  } catch (error) {
    throw new ApiError(500, `Failed to generate QR code: ${error.message}`);
  }
});

const getCustomQRs = asyncHandler(async (req, res) => {
  const { data: qrs, error } = await supabase.from('custom_qrs').select('*').order('created_at', { ascending: false }).limit(50);
  
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, qrs, 'Custom QR history fetched successfully'));
});

const deleteCustomQR = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: customQr, error: findError } = await supabase.from('custom_qrs').select('*').eq('id', id).single();
  
  if (findError || !customQr) {
    throw new ApiError(404, 'QR code not found');
  }

  const publicId = getPublicIdFromUrl(customQr.qrUrl);
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }

  const { error: deleteError } = await supabase.from('custom_qrs').delete().eq('id', id);

  if (deleteError) {
    throw new ApiError(500, deleteError.message);
  }

  return res.status(200).json(new ApiResponse(200, {}, 'QR code deleted successfully'));
});

export { generateCustomQR, getCustomQRs, deleteCustomQR };
