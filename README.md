# Vehicle Market Analytics Platform

End-to-end data platform for collecting, processing, and analyzing large-scale vehicle marketplace listings.

## Overview

The Vehicle Market Analytics Platform is a full-stack data engineering and analytics system designed to collect, normalize, store, and analyze used vehicle marketplace data. It automates extraction of vehicle listings, transforms raw listing data into structured datasets, and exposes analytics-ready APIs for downstream applications and dashboards.

The system implements a complete data pipeline — from web scraping and transformation to database ingestion and API-driven access — enabling market trend analysis, pricing insights, and regional inventory tracking.

## Features

- Automated collection of vehicle and parts listings from online marketplaces  
- Batch ETL pipeline transforming raw scraped data into structured datasets  
- Normalized relational database schema for vehicles, parts, and locations  
- Incremental ingestion support for continuous dataset growth  
- RESTful backend APIs with filtering, pagination, and analytics endpoints  
- JWT-based authentication and role-based access control  
- Analytical services for pricing trends and regional inventory tracking  
- Modern web frontend for search, exploration, and visualization  
- Modular monorepo architecture separating data, backend, and frontend layers  

## System Architecture

```mermaid
flowchart LR
    A[Scraper Service] --> B[NDJSON Files]
    B --> C[Ingestion Service]
    C --> D[(MySQL Database)]
    D --> E[Backend API]
    E --> F[Web Frontend]
