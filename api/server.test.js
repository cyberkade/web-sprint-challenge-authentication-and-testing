const server = require("../api/server");
const request = require("supertest");
const db = require("../data/dbConfig");

test("sanity", () => {
  expect(true).toBe(true);
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

describe("[POST] /api/auth/register", () => {
  let res;
  beforeEach(async () => {
    res = await request(server)
      .post("/api/auth/register")
      .send({ username: "johnCena", password: "ucantcme" });
  });
  it("responds with 201 CREATED", async () => {
    expect(res.status).toBe(201);
  });
  it("responds with the correct data structure", async () => {
    const expected = {
      id: 1,
      username: "johnCena",
    };
    expect(res.body).toMatchObject(expected);
    expect(res.body.password).not.toBe("ucantcme");
  });
});

describe("[POST] /api/auth/login", () => {
  let res;
  beforeEach(async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "johnCena", password: "ucantcme" });
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "johnCena", password: "ucantcme" });
  });
  it("responds with 200 OK", async () => {
    expect(res.status).toBe(200);
  });
  it("sends a token back to client", async () => {
    const token = res.body.token;
    expect(token).toBeDefined();
  });
  it("responds with correct message structure ", () => {
    expect(res.body.message).toBe("welcome, johnCena");
  });
});

describe("[GET] /api/jokes", () => {
  let res;
  beforeEach(async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "johnCena", password: "ucantcme" });
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "johnCena", password: "ucantcme" });
  });
  it("responds with 200 OK if correct token sent in header", async () => {
    expect(res.body.token).toBeDefined();
    // const jokes = await request(server);
    const jokes = await request(server)
      .get("/api/jokes")
      .set("Authorization", res.body.token);
    expect(jokes.status).toBe(200);
  });
  it("rejects user if no token is sent in header", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.body.message).toBe("token required");
  });
  it("responds with correct message structure ", async () => {
    expect(res.body.token).toBeDefined();
    const expected = [
      {
        id: "0189hNRf2g",
        joke: "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
      },
      {
        id: "08EQZ8EQukb",
        joke: "Did you hear about the guy whose whole left side was cut off? He's all right now.",
      },
      {
        id: "08xHQCdx5Ed",
        joke: "Why didn’t the skeleton cross the road? Because he had no guts.",
      },
    ];
    const jokes = await request(server)
      .get("/api/jokes")
      .set("Authorization", res.body.token);
    expect(jokes.body).toEqual(expected);
  });
});
