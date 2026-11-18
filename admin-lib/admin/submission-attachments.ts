import "server-only";

import type { GardenDeskSubmission } from "@/admin-lib/admin/submissions";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

type SubmissionAttachmentRecord = {
  id: string;
  bucket_id: string;
  storage_path: string;
  original_filename: string | null;
  content_type: string | null;
  byte_size: number | null;
};

export async function serializeSubmissionAttachments(
  attachments: SubmissionAttachmentRecord[] | null | undefined,
): Promise<GardenDeskSubmission["attachments"]> {
  const service = createSupabaseServiceClient();
  const signedAttachments = await Promise.all((attachments ?? []).map(async (attachment) => {
    const { data, error } = await service.storage
      .from(attachment.bucket_id)
      .createSignedUrl(attachment.storage_path, 10 * 60);

    if (error || !data?.signedUrl) return null;
    return {
      id: attachment.id,
      filename: attachment.original_filename,
      contentType: attachment.content_type,
      byteSize: attachment.byte_size,
      signedUrl: data.signedUrl,
    };
  }));

  return signedAttachments.filter((attachment): attachment is GardenDeskSubmission["attachments"][number] => attachment !== null);
}
