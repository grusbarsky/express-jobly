"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { adminOnly } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });


// admin only authorization
// creates new job
// pass data as a json object {"title": "val1", "companyHandle": "val2", "salary:": "val3", "equity": "val4" }
router.post("/", adminOnly, async function (req, res, next) {
  try {
    const validate = jsonschema.validate(req.body, jobNewSchema);
    if (!validate.valid) {
      const errs = validate.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


// get a list of all jobs
// may filter using query key value pairs including: minSalary, title, hasEquity
router.get("/", async function (req, res, next) {
  const query = req.query;
 
  if (query.minSalary !== undefined) query.minSalary = +query.minSalary;
  query.hasEquity = query.hasEquity === "true";

  try {
    const validate = jsonschema.validate(query, jobSearchSchema);
    if (!validate.valid) {
      const error = validate.errors.map(e => e.stack);
      throw new BadRequestError(error);
    }

    const jobs = await Job.findAll(query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// get info on a single job by job id
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


// admin only auhtorization
// update a job by id 
// pass a JSON object of key-value pairs
// possible keys: title, salary, and/or equity
router.patch("/:id", adminOnly, async function (req, res, next) {
  try {
    const validate = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validate.valid) {
      const error = validate.errors.map(e => e.stack);
      throw new BadRequestError(error);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// admin only authorization
// delete a job by id
router.delete("/:id", adminOnly, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
