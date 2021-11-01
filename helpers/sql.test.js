const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("update 1 value", function () {
    const result = sqlForPartialUpdate(
        { key1: "newVal" },
        { key1: "key1", key2: "val2" });
    expect(result).toEqual({
      setCols: "\"key1\"=$1",
      values: ["newVal"],
    });
  });

  test("updates 2 values", function () {
    const result = sqlForPartialUpdate(
        { key1: "newVal", key2: "newVal2" },
        { key2: "key2" });
    expect(result).toEqual({
      setCols: "\"key1\"=$1, \"key2\"=$2",
      values: ["newVal", "newVal2"],
    });
  });
});
