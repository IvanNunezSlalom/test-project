# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application for managing project assets and resources. Users can create projects and attach various resources (external links, local file paths, shared server paths) to organize their work across Miro boards, Figma prototypes, and file systems.

## Architecture

**Backend (Node.js + Express)**
- `backend/server.js`: RESTful API server with all CRUD endpoints for projects and resources
- `backend/data/projects.json`: JSON file storage (auto-initialized on first run)

**Frontend (Vanilla JavaScript)**
- `frontend/index.html`: Single-page application with modal-based forms
- `frontend/js/app.js`: Client-side logic handling API calls, rendering, and user interactions
- `frontend/css/styles.css`: Card-based responsive layout

**Data Model**
- Projects contain: `id`, `name`, `description`, `createdAt`, `resources[]`
- Resources contain: `id`, `type` (link/local-file/shared-file), `name`, `url`, `path`, `createdAt`

## Development Commands

Install dependencies:
```bash
npm install
```

Start server (production):
```bash
npm start
```

Start server with auto-reload (development):
```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Key Implementation Details

- All data persists to `backend/data/projects.json`
- Frontend communicates with backend via fetch API calls to `/api/*` endpoints
- Resource types determine UI behavior: links open in new tabs, file paths show path information
- Modal-based UI for creating/editing projects and resources
