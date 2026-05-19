# Databricks Apps

Workspace for Databricks AppKit applications, agent skills, and Cursor config.

```
databricks_apps/
├── .agents/          # Databricks agent skills (e.g. lakebase)
├── .cursor/          # Cursor workspace settings
├── skills-lock.json
├── fleetviz-app/     # Runnable Databricks app
└── README.md
```

## Apps

| App | Path | Description |
|-----|------|-------------|
| **Fleetviz** | [`fleetviz-app/`](./fleetviz-app/) | Lakebase-backed app connected to the `fleetviz` Postgres project |

## Quick start

```bash
cd fleetviz-app
npm install
npm run dev
```

Open http://localhost:8000
