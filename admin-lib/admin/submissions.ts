export const DESK_SUBMISSION_TYPES = [
  "feedback",
  "feature_request",
  "bug_report",
  "plant_suggestion",
  "testflight_invitation",
] as const;

export type DeskSubmissionType = (typeof DESK_SUBMISSION_TYPES)[number];

export const DESK_SUBMISSION_STATUSES = [
  "new",
  "reviewing",
  "planned",
  "in_progress",
  "done",
] as const;

export type DeskSubmissionStatus = (typeof DESK_SUBMISSION_STATUSES)[number];

export type GardenDeskSubmission = {
  id: string;
  type: DeskSubmissionType;
  status: DeskSubmissionStatus;
  title: string | null;
  message: string | null;
  device: string | null;
  location: string | null;
  receivedAt: string;
  person: {
    display_name: string | null;
    email: string;
  };
  attachments: Array<{
    id: string;
    filename: string | null;
    contentType: string | null;
    byteSize: number | null;
    signedUrl: string;
  }>;
};

export function isDeskSubmissionType(value: unknown): value is DeskSubmissionType {
  return typeof value === "string" && DESK_SUBMISSION_TYPES.includes(value as DeskSubmissionType);
}

export function isDeskSubmissionStatus(value: unknown): value is DeskSubmissionStatus {
  return typeof value === "string" && DESK_SUBMISSION_STATUSES.includes(value as DeskSubmissionStatus);
}
