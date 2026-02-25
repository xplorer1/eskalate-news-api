import { Response } from "express";

interface BaseResponseBody {
  Success: boolean;
  Message: string;
  Object: object | null;
  Errors: string[] | null;
}

interface PaginatedResponseBody extends BaseResponseBody {
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
}

export function sendSuccess(
  res: Response,
  message: string,
  data: object | null = null,
  statusCode: number = 200
) {
  const body: BaseResponseBody = {
    Success: true,
    Message: message,
    Object: data,
    Errors: null,
  };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  errors: string[],
  statusCode: number = 400
) {
  const body: BaseResponseBody = {
    Success: false,
    Message: message,
    Object: null,
    Errors: errors,
  };
  return res.status(statusCode).json(body);
}

export function sendPaginated(
  res: Response,
  message: string,
  data: object[],
  pageNumber: number,
  pageSize: number,
  totalSize: number
) {
  const body: PaginatedResponseBody = {
    Success: true,
    Message: message,
    Object: data,
    PageNumber: pageNumber,
    PageSize: pageSize,
    TotalSize: totalSize,
    Errors: null,
  };
  return res.status(200).json(body);
}
