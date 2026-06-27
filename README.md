# Unigreen Project Workspace

This project has been restructured as an npm monorepo/workspace containing separate frontend and backend directories.

## Project Structure

- **`frontend/`**: The React + Vite + Tailwind CSS application (exported interactive website design).
- **`backend/`**: A boilerplate Node.js + Express backend service.

## Getting Started

### 1. Install Dependencies

Install all dependencies for the workspace (root, frontend, and backend packages) by running the following command in the project root:

```bash
npm install
```

### 2. Running the Development Servers

You can run the applications using the following commands from the root directory:

- **Run both Frontend and Backend concurrently:**
  ```bash
  npm run dev
  ```

- **Run Frontend only:**
  ```bash
  npm run dev:frontend
  ```

- **Run Backend only:**
  ```bash
  npm run dev:backend
  ```

## Making Changes

- To put your backend database models, routing, or database connection logic, start editing the files inside the `backend/` folder (e.g. `backend/index.js`).
- To adjust UI or frontend business logic, edit files inside the `frontend/` folder.