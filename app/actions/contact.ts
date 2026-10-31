"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactActionState = {
  error?: string;
  message?: string;
};

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactMessage(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = formText(formData, "name");
  const email = formText(formData, "email").toLowerCase();
  const requestedTopic = formText(formData, "topic");
  const allowedTopics = new Set(["general", "download", "purchase", "creator"]);
  const topic = allowedTopics.has(requestedTopic) ? requestedTopic : "general";
  const message = formText(formData, "message");

  if (!name || !email || !message) {
    return { error: "Please complete your name, email, and message." };
  }
  if (name.length > 200 || email.length > 320 || message.length > 10000) {
    return { error: "One or more fields exceed the allowed length." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError") {
    return { error: `Unable to verify your account: ${authError.message}` };
  }

  const { error } = await supabase.from("contact_messages").insert({
    user_id: user?.id ?? null,
    name,
    email,
    subject: topic,
    message,
  });

  if (error) {
    return { error: `Your message could not be sent: ${error.message}` };
  }

  return { message: "Thanks for reaching out. Your message has been received." };
}
