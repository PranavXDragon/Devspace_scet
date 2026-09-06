import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary, deleteFromCloudinary, updateOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';

const addTeamMember = asyncHandler(async (req, res) => {
  const { academicYear, subTeam, name, post, sequenceNumber, email } = req.body;

  if (!academicYear || !subTeam || !name || !post) {
    throw new ApiError(400, 'All fields (academicYear, subTeam, name, post) are required');
  }

  const photoLocalPath = req.file?.path;

  if (!photoLocalPath) {
    throw new ApiError(400, 'Photo is required');
  }

  const photo = await uploadOnCloudinary(photoLocalPath, 'Devspace/team');

  if (!photo) {
    throw new ApiError(500, 'Error while uploading photo');
  }

  const { data: member, error } = await supabase.from('team_members').insert([{
    academicYear,
    subTeam,
    name,
    post,
    email,
    sequenceNumber: sequenceNumber ? Number(sequenceNumber) : 0,
    photo: photo.url,
  }]).select().single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(201).json(new ApiResponse(201, member, 'Team member added successfully'));
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;

  let query = supabase.from('team_members').select('*');

  if (academicYear) {
    query = query.eq('academicYear', academicYear);
  }

  const { data: members, error } = await query.order('subTeam', { ascending: true }).order('sequenceNumber', { ascending: true });

  if (error) {
    throw new ApiError(500, error.message);
  }

  // Remove email field
  const sanitizedMembers = members.map(m => {
    delete m.email;
    return m;
  });

  return res.status(200).json(new ApiResponse(200, sanitizedMembers, 'Team members fetched successfully'));
});

const deleteTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: member, error: findError } = await supabase.from('team_members').select('*').eq('id', id).single();

  if (findError || !member) {
    throw new ApiError(404, 'Team member not found');
  }

  const publicId = getPublicIdFromUrl(member.photo);
  await deleteFromCloudinary(publicId);

  const { error: deleteError } = await supabase.from('team_members').delete().eq('id', id);

  if (deleteError) {
    throw new ApiError(500, deleteError.message);
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Team member deleted successfully'));
});

const updateTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { academicYear, subTeam, name, post, sequenceNumber, email } = req.body;
  
  const { data: member, error: findError } = await supabase.from('team_members').select('*').eq('id', id).single();

  if (findError || !member) {
    throw new ApiError(404, 'Team member not found');
  }

  let newPhotoUrl = member.photo;

  if (req.file) {
    const oldPublicId = getPublicIdFromUrl(member.photo);

    const uploadedImage = await updateOnCloudinary(req.file.path, oldPublicId);
    if (!uploadedImage) {
      throw new ApiError(500, 'Error while updating photo');
    }
    newPhotoUrl = uploadedImage.url;
  }

  const updates = {
    photo: newPhotoUrl,
    updated_at: new Date().toISOString()
  };

  if (academicYear) updates.academicYear = academicYear;
  if (subTeam) updates.subTeam = subTeam;
  if (name) updates.name = name;
  if (post) updates.post = post;
  if (email !== undefined) updates.email = email;
  if (sequenceNumber !== undefined) updates.sequenceNumber = Number(sequenceNumber);

  const { data: updatedMember, error: updateError } = await supabase.from('team_members').update(updates).eq('id', id).select().single();

  if (updateError) {
    throw new ApiError(500, updateError.message);
  }

  return res.status(200).json(new ApiResponse(200, updatedMember, 'Team member updated successfully'));
});

export { addTeamMember, getTeamMembers, deleteTeamMember, updateTeamMember };
