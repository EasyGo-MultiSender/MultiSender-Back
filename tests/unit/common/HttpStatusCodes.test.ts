import HttpStatusCodes from '@src/common/HttpStatusCodes';

describe('HttpStatusCodes', () => {
  it('should have correct status code values', () => {
    expect(HttpStatusCodes.OK).toBe(200);
    expect(HttpStatusCodes.CREATED).toBe(201);
    expect(HttpStatusCodes.NO_CONTENT).toBe(204);
    expect(HttpStatusCodes.BAD_REQUEST).toBe(400);
    expect(HttpStatusCodes.UNAUTHORIZED).toBe(401);
    expect(HttpStatusCodes.NOT_FOUND).toBe(404);
    expect(HttpStatusCodes.INTERNAL_SERVER_ERROR).toBe(500);
  });
}); 