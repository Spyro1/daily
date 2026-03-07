# Daily - Promts

## Building the backend

- Generate the Database table models based on the schema.md file which contains the er-model diagram of the db.
- Review the database model, change it in order to make a professional db schema, add indexes and constraints to it based on the specification (spec.md) file.
- Review and finalize the Profiles to Users refactor in the backend/ directory, ensuring end-to-end consistency across FastAPI models, SQLAlchemy async relationships, and PostgreSQL schema. Scan for residual naming in imports, type hints, and function arguments—excluding the OAuth 'profile' scope—and verify that Alembic migrations align with the new table names. Additionally, validate that the recent logging middleware correctly captures all API requests and that the Google OAuth callback fully utilizes the updated user services. Provide a report of file-specific fixes and any remaining runtime risks.

## Building the frontend