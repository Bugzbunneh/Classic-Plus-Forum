"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { redirectWithError } from "@/lib/redirect-with-error";
import { ensureWriteSucceeded } from "@/lib/ensure-write-succeeded";
import { getFormString } from "@/lib/form-data";

function targetQuery(postId: string | null, commentId: string | null) {
  return postId ? `postId=${postId}` : `commentId=${commentId}`;
}

export async function createReport(formData: FormData) {
  const postId = getFormString(formData, "postId") || null;
  const commentId = getFormString(formData, "commentId") || null;
  const reason = getFormString(formData, "reason").trim();

  const profile = await requireProfile(`/report?${targetQuery(postId, commentId)}`);

  if (!postId && !commentId) {
    redirect("/");
  }

  if (!reason) {
    redirectWithError(`/report?${targetQuery(postId, commentId)}`, "Please describe the issue");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: profile.id,
    post_id: postId,
    comment_id: commentId,
    reason,
  });
  if (error) {
    redirectWithError(`/report?${targetQuery(postId, commentId)}`, error.message);
  }

  redirect("/report/thanks");
}

export async function resolveReport(reportId: string) {
  const supabase = await createClient();

  const result = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId)
    .select("id");
  ensureWriteSucceeded(result, "/admin/reports");

  revalidatePath("/admin/reports");
}
