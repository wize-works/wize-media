# 📘 WizeExample API

[![status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/wizeworks/wize-wize-media)  
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![build](https://img.shields.io/badge/build-passing-success)]()  
[![graphql](https://img.shields.io/badge/graphql-supported-ff69b4.svg)]()  
[![mongodb](https://img.shields.io/badge/mongodb-integrated-4db33d.svg)]()

**wize-media** is a lightweight, multi-tenant **GraphQL API** for managing wize-medias, designed for flexible client applications.  
It supports dynamic, metadata-driven schemas, full GraphQL CRUD operations, and fine-grained API key access control.

---

## 🚀 Features
- **Multi-tenant data isolation** via dynamic `tenantId` filtering
- **Dynamic schema generation** from MongoDB-stored metadata
- **API key authentication** with scope validation (`examples:read`, `examples:write`, `examples:delete`)
- **GraphQL Yoga** server for query, mutation, and subscription support
- **MongoDB Atlas** (or local Mongo) as backend database
- **Pluggable logger/tracer** interfaces for observability

---

## 🛠 Setup

### 1. Environment Variables
Create a `.env` file in the root:

```env
MONGO_URI=mongodb://localhost:27017
WIZE_API_KEY_SECRET=<optional-secret-for-signing-keys>
PORT=3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the API Server
```bash
npm run dev
```

---

## 🔑 API Authentication
All requests must include a header:

```http
wize-api-key: <your-api-key>
```

This API key is validated against stored keys in MongoDB and must be active and scoped correctly.

---

## 📋 Example GraphQL Query
```graphql
query FindExamples($filter: ExampleFilter, $sort: ExampleSort, $paging: PagingInput) {
  findExample(filter: $filter, sort: $sort, paging: $paging) {
    count
    data {
      id
      wize-media
      createdAt
      createdBy
    }
  }
}
```

---

## ✏️ Example GraphQL Mutation
```graphql
mutation InsertExample($input: ExampleInput!) {
  insertExample(input: $input) {
    id
    wize-media
    createdAt
  }
}
```

---

## 🔄 Example GraphQL Subscription
```graphql
subscription OnExampleCreated {
  onExampleCreated {
    id
    wize-media
    createdAt
  }
}
```

---

## 📤 Deployment
This app is built to run as a backend microservice.  
You can deploy it to:
- Azure Kubernetes Service (AKS) or Amazon EKS
- Render / Railway / Fly.io
- Docker container
- Express server behind a reverse proxy (NGINX, etc.)

---

## 🧩 Notes
- `tenantId` is automatically injected and **never** exposed in API responses.
- All models (schemas) are stored dynamically in MongoDB (`wize-configuration.schemas` collection).
- The system enforces critical system fields (`tenantId`, `createdAt`, `createdBy`, etc.) even if client apps modify metadata.
- Supports pluggable tracing (Sentry, Datadog, etc.) via custom tracer adapters.

---

## 📞 Contact
Built and maintained by the JobSight and WizeWorks engineering teams.
