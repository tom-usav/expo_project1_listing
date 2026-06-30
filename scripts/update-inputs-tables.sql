ALTER TABLE dynamic_inputs
  ADD COLUMN latitude VARCHAR(32) NULL AFTER values_json,
  ADD COLUMN longitude VARCHAR(32) NULL AFTER latitude;

ALTER TABLE business_inputs
  ADD COLUMN latitude VARCHAR(32) NULL AFTER values_json,
  ADD COLUMN longitude VARCHAR(32) NULL AFTER latitude;

