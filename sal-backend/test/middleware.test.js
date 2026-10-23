const test = require("node:test");
const assert = require("node:assert/strict");
const validateBody = require("../src/middlewares/validateBody.middleware");
const validateId = require("../src/middlewares/validateId.middleware");
const authorizeRoles = require("../src/middlewares/role.middleware");

test("requires JSON object bodies", () => {
    let status;
    let body;
    validateBody({ body: undefined }, {
        status(value) {
            status = value;
            return this;
        },
        json(value) {
            body = value;
        }
    }, () => assert.fail("next should not run"));
    assert.equal(status, 400);
    assert.equal(body.message, "A JSON object body is required");

    let called = false;
    validateBody({ body: { ok: true } }, {}, () => { called = true; });
    assert.equal(called, true);
});

test("normalizes positive safe route IDs and rejects malformed IDs", () => {
    const req = { params: { id: "42" } };
    let nextCalled = false;
    validateId()(req, {}, () => { nextCalled = true; });
    assert.equal(req.params.id, 42);
    assert.equal(nextCalled, true);

    let status;
    validateId()({ params: { id: "1abc" } }, {
        status(value) {
            status = value;
            return this;
        },
        json() {}
    }, () => assert.fail("next should not run"));
    assert.equal(status, 400);
});

test("authorizes only configured role names", () => {
    let status;
    authorizeRoles("SYSTEM_ADMIN")({ user: { role: "PACIENTE" } }, {
        status(value) {
            status = value;
            return this;
        },
        json() {}
    }, () => assert.fail("next should not run"));
    assert.equal(status, 403);
});
