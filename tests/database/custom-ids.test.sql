-- Test custom ID generation functions
BEGIN;
SELECT plan(4);

-- Test lead ID generation format
SELECT matches(
  generate_lead_id(),
  '^QSLID\d{6}$',
  'Lead ID follows correct format QSLID######'
);

-- Test opportunity ID generation format
SELECT matches(
  generate_opportunity_id(),
  '^QSOID\d{6}$',
  'Opportunity ID follows correct format QSOID######'
);

-- Test project ID generation format
SELECT matches(
  generate_project_id(),
  '^QSPID\d{6}$',
  'Project ID follows correct format QSPID######'
);

-- Test installation ID generation format
SELECT matches(
  generate_installation_id(),
  '^QSIID\d{6}$',
  'Installation ID follows correct format QSIID######'
);

SELECT finish();
ROLLBACK;