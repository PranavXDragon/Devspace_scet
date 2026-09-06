import { supabase } from '../config/supabase.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { contactFormReceivedEmail, contactReplyEmail } from "../utils/emailTemplates.js";
import { verifyTurnstileToken } from "../utils/turnstile.js";

const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message, turnstileToken } = req.body;

  if (!turnstileToken) {
    throw new ApiError(400, "Bot verification token is missing");
  }

  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    throw new ApiError(400, "Bot verification failed. Please try again.");
  }

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "All fields are required");
  }

  const { data: contact, error } = await supabase.from('contacts').insert([{
    name,
    email,
    subject,
    message,
  }]).select().single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  const { html, text } = contactFormReceivedEmail(name);
  sendEmail({
    email,
    subject: "We received your message - Devspace",
    message: html,
    textMessage: text,
  }).catch((err) => {
    console.error("Failed to send contact confirmation email:", err);
  });

  return res.status(201).json(
    new ApiResponse(201, contact, "Message sent successfully")
  );
});

const getAllContactMessages = asyncHandler(async (req, res) => {
  const { data: messages, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(
    new ApiResponse(200, messages, "Contact messages fetched successfully")
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: message, error } = await supabase.from('contacts').update({ isRead: true }).eq('id', id).select().single();

  if (error || !message) {
    throw new ApiError(404, "Message not found");
  }

  return res.status(200).json(
    new ApiResponse(200, message, "Message marked as read")
  );
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from('contacts').delete().eq('id', id);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Message deleted successfully")
  );
});

const replyToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage) {
    throw new ApiError(400, "Reply message is required");
  }

  const { data: message, error: findError } = await supabase.from('contacts').select('*').eq('id', id).single();

  if (findError || !message) {
    throw new ApiError(404, "Message not found");
  }

  const { html, text } = contactReplyEmail(message.name, message.subject, replyMessage);

  await sendEmail({
    email: message.email,
    subject: `Re: ${message.subject} - Devspace`,
    message: html,
    textMessage: text,
  });

  const { data: updatedMessage, error: updateError } = await supabase.from('contacts').update({ isReplied: true }).eq('id', id).select().single();

  if (updateError) {
    throw new ApiError(500, updateError.message);
  }

  return res.status(200).json(
    new ApiResponse(200, updatedMessage, "Reply sent successfully")
  );
});

export {
  submitContactForm,
  getAllContactMessages,
  markAsRead,
  deleteMessage,
  replyToMessage,
};
