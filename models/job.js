"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");



class Job {
    // creates a job, updates database, and returns job data  

  static async create(data) {
    const result = await db.query(
          `INSERT INTO jobs (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
          data.title,
          data.salary,
          data.equity,
          data.companyHandle,
        ]);
    let job = result.rows[0];

    return job;
  }

    //  lists jobs with optional filters
    // optional filters: minSalary, hasEquity, title

  static async findAll(searchFilters = {}) {
    let query = `SELECT j.id, j.title, j.salary, j.equity, 
                    j.company_handle AS "companyHandle", 
                    c.name AS "companyName"
                FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let expressions= [];
    let values = [];

    const { minSalary, hasEquity, title } = searchFilters;

    // for each filter add to expressions and values to create sql

    if (minSalary !== undefined) {
      values.push(minSalary);
      expressions.push(`salary >= $${values.length}`);
    }

    if (hasEquity === true) {
      expressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      values.push(`%${title}%`);
      expressions.push(`title ILIKE $${values.length}`);
    }

    // add all filter expressions to query
    if (expressions.length > 0) {
      query += " WHERE " + expressions.join(" AND ");
    }

    // search by all filters

    const jobs = await db.query(query, values);
    return jobs.rows;
  }

  
  //   gets details for a single job by id
  static async get(id) {
    const response = await db.query(
          `SELECT id, title, salary, equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);

    const job = response.rows[0];

    if (!job) throw new NotFoundError(`No job found: ${id}`);

    const companies = await db.query(
          `SELECT handle, name, description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);

    delete job.companyHandle;
    job.company = companies.rows[0];

    return job;
  }

//  updates information about a job and returns job information
// uses sqlForPartialUpdate
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data,{});
    const idIndex = "$" + (values.length + 1);

    const query = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idIndex} 
                      RETURNING id,title, salary, equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(query, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found: ${id}`);

    return job;
  }

//   delete job (by id)
  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job found : ${id}`);
  }
}

module.exports = Job;
