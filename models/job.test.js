"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("create", function () {
  let newJob = {
    companyHandle: "c1",
    title: "testJob",
    salary: 10000,
    equity: "0.0",
  };

  test("create new job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});


describe("findAll", function () {
  test("find all jobs with no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "job2",
        salary: 2000,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
      {
        id: testJobIds[2],
        title: "job3",
        salary: 3000,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });

  test("search by min salary", async function () {
    let jobs = await Job.findAll({ minSalary: 2500 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "job3",
        salary: 3000,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3",
      },
    ]);
  });

  test("search by equity", async function () {
    let jobs = await Job.findAll({hasEquity: true});
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[1],
        title: "job2",
        salary: 2000,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("search by min salary and equity", async function () {
    let jobs = await Job.findAll({ minSalary: 1500, hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "job2",
        salary: 2000,
        equity: "0.2",
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("search by name", async function () {
    let jobs = await Job.findAll({ title: "1" });
    expect(jobs).toEqual([
      {
        id: testJobIds[0],
        title: "job1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });
});


describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "job1",
      salary: 1000,
      equity: "0.1",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("thrown error when job doesn't exist", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


describe("update", function () {
  let updateData = {
    title: "newJob",
    salary: 800,
    equity: "0.0",
  };
  test("update", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      companyHandle: "c1",
      ...updateData,
    });
  });

  test("thrown error if job is not found", async function () {
    try {
      await Job.update(0, {
        title: "testJob",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("error thrown if no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("remove job", async function () {
    await Job.remove(testJobIds[0]);
    const response = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
    expect(response.rows.length).toEqual(0);
  });

  test("error thrown if job does not exist", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});