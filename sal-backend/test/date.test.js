const test = require("node:test");
const assert = require("node:assert/strict");
const { isValidDate } = require("../src/utils/date");
const { dateWeekday } = require("../src/modules/appointments/appointment.service");
const { validTime } = require("../src/modules/doctors/doctor.service");

test("validates real calendar dates", () => {
    assert.equal(isValidDate("2024-02-29"), true);
    assert.equal(isValidDate("2025-02-29"), false);
    assert.equal(isValidDate("2025-13-01"), false);
});

test("maps dates to Monday-based weekdays", () => {
    assert.equal(dateWeekday("2025-10-20"), 0);
    assert.equal(dateWeekday("2025-10-26"), 6);
    assert.equal(dateWeekday("2025-02-30"), null);
});

test("accepts only 24-hour HH:mm time values", () => {
    assert.equal(validTime("09:30"), true);
    assert.equal(validTime("24:00"), false);
    assert.equal(validTime("9:30"), false);
});
