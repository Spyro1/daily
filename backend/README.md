# Daily - Backend

## Setup

### Instal libraries

```bash
pip install -r ./requirements.txt
```

If you added more libraries then export it into the requirements.txt
```bash
pip freeze > ./requirements.txt
```

### Create PostgreSQL User and Database
```bash
# 0. Log in to PostgreSQL with the default user
> psql -U postgres

# 1. Create or login with the existing user given in the .env file
CREATE USER daily_user WITH PASSWORD 'your_secure_password';

# 2. Create the database
CREATE DATABASE daily;

# 3. Grant all privileges on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE daily TO daily;

# 4. PostgreSQL 15+ specific: Grant schema permissions
# Connect to the 'daily' database first (
\c daily)
# then run:
GRANT ALL ON SCHEMA public TO daily;

# 5. Exit from the user 'postgres' and login via the new user 'daily'
> psql -U daily

```

### Run the migrations

```bash
# Run the migrations to upgrade to the latset
alembic upgrade head

# Check the database if the tables were created
# Login with the password
psql -U daily
# Display the tables in the database
\d
# Check individual table
\d <table_name>

```

## Create new migrations in DB

```bash
alembic revision --autogenerate -m "Description of changes"
``