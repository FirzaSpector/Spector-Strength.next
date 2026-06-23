---
title: Spector Strength Pro API
emoji: 🏋️
colorFrom: gray
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# Spector Strength Pro — Backend API

FastAPI backend for the Spector Strength powerlifting tracker.

## Required Secrets

Set these in Space **Settings → Variables and secrets**:

| Name | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SECRET_KEY` | Long random string for JWT signing |

## Endpoints

| Method | Route | Auth |
|---|---|---|
| GET | `/` | — |
| POST | `/register` | — |
| POST | `/login` | — |
| GET/PUT | `/profile` | ✅ |
| GET/POST | `/lifts` | ✅ |
| GET/POST | `/meets` | ✅ |
| GET/POST | `/meets/{id}/attempts` | ✅ |
