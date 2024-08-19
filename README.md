# Email Notification Service

This project was built based on the [prompt](PROMPT.md). 

## Tools Used

- [TypeScript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/)
- [Hono](https://honojs.dev/)
- [Drizzle ORM](https://drizzle-orm.com/)
- [SST Ion](https://ion.sst.dev/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- Project linting and formatting tools
  - [ESLint](https://eslint.org/)
  - [Prettier](https://prettier.io/)
  
A full list of dependencies can be found in the [`package.json`](./package.json) file.

## Project Structure

The application is structured as follows:

- `src` folder contains the source code of the application.
  - `drizzle.ts` file instantiates the ORM connection.
  - `index.ts` file contains the main application (API) logic.
  - `schemas.ts` file defines the input schemas for the API, structured with [Zod](https://zod.dev/).
  - `tables.sql.ts` file defines the database tables using [Drizzle ORM](https://drizzle-orm.com/).
  - `env.ts` file defines the environment variables using [T3 Env](https://github.com/T3-OSS/env-core).
- `migrations` folder contains the database migrations.
- `drizzle.config.ts` file configures the ORM and database settings.
- `sst.config.ts` file configures the infrastructure resources.

## Setup

- Configure you `SST` environment. Follow the instructions in the [SST documentation](https://ion.sst.dev/docs/).
- Install the dependencies by running the command `bun install`.
- Setup the PostgreSQL database by running the commands: 
  - `bun run db generate`
  - `bun run db migrate`
- Test the database connection by running the command `bun run db:studio`.

## Running the Application

To start the application, run the following command:

```bash
bun run dev
```

The application will be deployed and the url will be displayed in the terminal. You can then access the API at the specified URL.

Test the application by sending a POST request to the `/email` endpoint with a JSON payload containing the following properties:

```json
{
  "type": "news",
  "destination": "user@example.com",
  "message": "This is a test message"
}
```

> [!IMPORTANT]  
> Replace `user@example.com` with a valid email address.

AWS will then send an email to the specified address for testing purposes.

```bash
curl --location 'https://<your-aws-api-url>/email' \
--header 'Content-Type: application/json' \
--data-raw '{
	"type": "marketing",
	"message": "news message",
	"destination": "user@example.com"
}'
```