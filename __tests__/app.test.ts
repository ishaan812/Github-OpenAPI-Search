import request from "supertest";
import app from "../src/app.js";

describe("Test app.ts", () => {
  test("Catch-all route", async () => {
    const res = request(app).get("/");
    expect(res).toEqual("TypeScript With Express");
  });
});
