# Navi – OIXIO Service Navigator

## Deployment
- This web app runs on Railway, not on the developer's computer.
- Railway deploys it automatically from the `main` branch of this GitHub repo (github.com/sigridhanni-debug/Navi-Service-Navigator).

## Database
- The database is a Railway PostgreSQL database.
- It is available only through the `DATABASE_URL` environment variable on Railway.
- Do not set up a local database or a local server.

## Workflow
- Before every push, run `npm run build` to make sure the app builds.
- After each finished task, commit and push to GitHub so that Railway deploys the new version.
