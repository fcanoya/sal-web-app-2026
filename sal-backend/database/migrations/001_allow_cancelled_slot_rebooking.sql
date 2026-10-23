-- Apply only to databases created from the earlier schema that defines this unique index.
-- Cancelled appointments must not reserve the doctor's time slot.
ALTER TABLE cita DROP INDEX uq_cita_doctor;
