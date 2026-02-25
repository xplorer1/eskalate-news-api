export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(message: string, statusCode: number, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors ?? [message];
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, errors?: string[]) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message: string) {
    return new AppError(message, 401);
  }

  static forbidden(message: string) {
    return new AppError(message, 403);
  }

  static notFound(message: string) {
    return new AppError(message, 404);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }
}
