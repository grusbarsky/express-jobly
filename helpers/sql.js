const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Helper function for updating a querie
// send dataToUpdate as {object} such as {key: newVal, key: newVal ...}
// the keys corresponding to database columns 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // if no data is passed, throw error
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'John', lastName:'Doe'} => ['"first_name"=$1', '"last_name"=$2']
  // maps objects to column name and value
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
