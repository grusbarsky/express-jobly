"use strict";

const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /jobs", function () {
  test("admin can add job", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
          title: "New Job",
          salary: 1000,
          equity: "0.5",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        companyHandle: "c1",
        title: "New Job",
        salary: 1000,
        equity: "0.5",
      },
    });
  });

  test("users cannot add jobs", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          companyHandle: "c1",
          title: "New Job",
          salary: 1000,
          equity: "0.5",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});


describe("GET /jobs", function () {
  test("anyone can view jobs", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "tJob1",
              salary: 1,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "tJob2",
              salary: 2,
              equity: "0.2",
              companyHandle: "c2",
              companyName: "C2",
            },
            {
              id: expect.any(Number),
              title: "tJob3",
              salary: 3,
              equity: null,
              companyHandle: "c3",
              companyName: "C3",
            },
          ],
        },
    );
  });

  test("filtering jobs", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "tJob1",
              salary: 1,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "tJob2",
              salary: 2,
              equity: "0.2",
              companyHandle: "c2",
              companyName: "C2",
            },
          ],
        },
    );
  });

  test("filtering with 2 filters", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 2, title: "3" });
    expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "tJob3",
              salary: 3,
              equity: null,
              companyHandle: "c3",
              companyName: "C3",
            },
          ],
        },
    );
  });
});


describe("GET /jobs/:id", function () {
  test("anyone can get view a job", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "tJob1",
        salary: 1,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("job does not exist, error", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /jobs/:id", function () {
  test("admin can edit jobs", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "New Job",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New Job",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("users cannot edit a job", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "New Job",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("Job is not found", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

describe("DELETE /jobs/:id", function () {
  test("admin can delete job", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("others cannot delete a job", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});