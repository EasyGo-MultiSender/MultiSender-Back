import HttpStatusCodes from '@src/common/HttpStatusCodes';


/******************************************************************************
                              Classes
******************************************************************************/

/**
 * Error with status code and message.
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Validation in route layer errors.
 */
export class ValidationErr extends RouteError {
  public constructor(errObj: { message: string }) {
    super(HttpStatusCodes.BAD_REQUEST, errObj.message);
  }
}
