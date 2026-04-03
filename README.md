# Simple MERN Task Manager

A small website built with `HTML`, `CSS`, `JavaScript`, `React`, `Node.js`, `Express`, and `MongoDB`.

## What it does

- Create an account and log in
- Create tasks
- View all tasks
- Mark tasks as complete or open
- Delete tasks
- Store task data in MongoDB
- Show each user only their own tasks

## Tech stack

- Frontend: React loaded in the browser
- Backend: Express on Node.js
- Database: MongoDB with Mongoose

## Connect to MongoDB Atlas

1. In MongoDB Atlas, create or open your cluster.
2. Add your device IP to the Atlas IP access list.
3. Create a database user with a username and password.
4. In Atlas, open `Connect` -> `Drivers` and copy the Node.js connection string.
5. Create a `.env` file in the project root based on `.env.example`.
6. Replace `<db_password>` with your real Atlas database password.

Example:

```text
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-name>.mongodb.net/simple_task_manager?retryWrites=true&w=majority&appName=<app-name>
AUTH_SECRET=replace-this-with-a-long-random-secret
PORT=3000
HOST=127.0.0.1
```

If your password includes special characters such as `@`, `:`, or `/`, use the URL-encoded password from the Atlas driver connection string.
Set `AUTH_SECRET` to a long random string before deploying so login tokens stay private.

## Run locally

1. Install dependencies:

```powershell
npm install
```

2. Start the server:

```powershell
npm start
```

3. Open:

```text
http://127.0.0.1:3000
```

## Environment

- The app reads environment variables from `.env`.
- If `MONGODB_URI` is not set, it falls back to local MongoDB at `mongodb://127.0.0.1:27017/simple_task_manager`.
- `AUTH_SECRET` signs login tokens and should be unique in production.
