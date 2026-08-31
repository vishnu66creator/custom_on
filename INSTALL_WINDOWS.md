# CustomON Windows Installation

Open Command Prompt in this folder:

```text
customon_upload
```

Use **npm consistently** for this project. Do not run `bun install` after installing with npm.

```cmd
rmdir /s /q node_modules
npm ci
npm run check
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

If `npm ci` reports that the lockfile is out of sync, use:

```cmd
npm install
npm run check
npm run dev
```

The application needs `DATABASE_URL` only for database-backed features or the seed script. Do not put database credentials in frontend code. Create a local `.env` file when required:

```env
DATABASE_URL=postgres://username:password@host:5432/custom_on
```

The `check` command runs the production build and should finish without compilation errors. `npm run lint` may still show non-blocking legacy formatting warnings in untouched UI files.
