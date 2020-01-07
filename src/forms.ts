export interface SubmissionOptions {
  endpoint?: string;
  clientName?: string;
  fetchImpl?: typeof fetch;
}

interface SuccessResponse {
  id: string;
  data: object;
}

interface ErrorResponse {
  errors: Array<{
    field: string;
    message: string;
    code: string | null;
    properties: object;
  }>;
}

export type SubmissionBody = SuccessResponse | ErrorResponse;

export interface SubmissionResult {
  body: SubmissionBody;
  response: Response;
}
