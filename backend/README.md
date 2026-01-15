# Marketplace API (ASP.NET Core 8)

## Local run
1) Ensure MySQL is running and `ConnectionStrings:MySql` is set in `appsettings.json`.
2) From `backend/Marketplace.Api`:
```bash
dotnet restore
dotnet run
```
Swagger UI: `https://localhost:<port>/swagger`

## Endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/vehicles`
- GET `/api/parts`
- GET `/api/analytics/inventory-trend`
- GET `/api/analytics/avg-price-trend`

## Admin ingestion (role: admin)
- POST `/api/admin/ingest/ndjson?type=vehicle|part` (multipart/form-data)
- POST `/api/admin/ingest/from-s3` (JSON body)

## AWS credentials
Uses the default AWS credential chain. Common env vars:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## Admin users
`POST /api/auth/register` creates `user` only. To seed an admin, run `backend/seed_admin_user.sql`.
