# Daily - Promts

## Building the backend

- Generate the Database table models based on the schema.md file which contains the er-model diagram of the db.
- Review the database model, change it in order to make a professional db schema, add indexes and constraints to it based on the specification (spec.md) file.
- Review and finalize the Profiles to Users refactor in the backend/ directory, ensuring end-to-end consistency across FastAPI models, SQLAlchemy async relationships, and PostgreSQL schema. Scan for residual naming in imports, type hints, and function arguments—excluding the OAuth 'profile' scope—and verify that Alembic migrations align with the new table names. Additionally, validate that the recent logging middleware correctly captures all API requests and that the Google OAuth callback fully utilizes the updated user services. Provide a report of file-specific fixes and any remaining runtime risks.
- for the backend instead of running the main.py, run uvicorn: command: ['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port' , '8000', '--workers', '2'] and read the ports from env var for the frontend too
- add watch and fast reload to backend and frontend so if a file changes then it syncs and rebuilds just that container
- I input the given access token copyed from the cookies of the frontend site then paste it to swagger and it does not validate it. Why?
- create verbose logging for every endpoint for better debugging

## Building the frontend

- clear the example routes and clear out the frontend and create a mobile login screen with local user login and google login likeon the image. optimize it to mobile first. Remove all CSS, and Use material UI. Create the login and register page from it. Create a theme file for theming the application with dark and light mode.
- Based on the tanstack react application from the beleptetosch-frontend folder, try to remake and fix any erros on t he daily/frontend folder and project. Make the theming work, the routers and the queryclient alike in the beleptetosch-frontend and make everything tidy and professional if a senior developer made it.
- make the frontend read env var from the root dir
- emove te auth shell and the created index content which i did not ask for. put the given colors (wallet gold, leaf green, coin glow, forest ink, canvas cream) in the theme file, and create the moden and clean login screen in the index.tsx file with the logo in the middle top and the login via Google button which redirects to backend. And then make the callback page which the backend redirects to after login and if i got the access-token it will redirect to the home dashboard page which should have a placeholder for now.
- Make it that by default that the pages have a maxium width which corresponds to mobile view and everything adjust to that, even the nav bar. Apply only borderRadius: 3 at components. Create the other pages defined by the nav bar.
- Seperate all component functions into their own component file. Modify and use the PageLayout for the templated unified look of every page (e.g: title, subtitle, content, poadding, etc), and make every recurring element of the sites a component for reuseability.
- Create an auth guard and verification hook in api folder that is required before each page except the "/" and the login ones that can show before login.
Use the endpoints /validate and /refresh if the access_token is expired or want to check if valid. If the refresh_token is expired too then redirect to the home page "/" for login.
- Create an response handeler for the queries and the mutation which is calledu pon error or success to display the response message and alert if was prohibited to call the endpoint. Give feedback based on status codes and the message in the request.
- Make a snackbar component provider for the toast message notifications.