<div align="center">

<img src="https://github.com/immanueljebaraj/Secure-Cloud-Share-Blockchain/blob/main/frontend/public/favicon.svg" width="72" height="72" alt="SecureShare Shield"/>

# SecureShare

### Cloud-Based Secure File Sharing with Blockchain-Based Immutable Logging

[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.1.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Solidity-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)](https://soliditylang.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3_Compatible-C72E49?style=flat-square&logo=minio&logoColor=white)](https://min.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)

*A research prototype implementing consent-driven, tamper-proof file sharing for enterprises and their vendors — with every action immutably recorded on the Ethereum blockchain.*

[**Architecture**](#architecture) · [**Getting Started**](#getting-started) · [**Demo Accounts**](#demo-accounts) · [**Research Paper**](#research-paper)

---

</div>

---

## Overview

SecureShare addresses a fundamental gap in conventional cloud file-sharing: **the inability to prove that an audit trail has not been tampered with**. Systems like Google Drive and Dropbox rely on centralised access logs that any sufficiently privileged administrator can modify or delete.

This system combines:
- **MinIO / Amazon S3** for scalable, cost-effective file storage
- **Ethereum blockchain** (via a Solidity smart contract) for an append-only, tamper-proof audit trail
- **SHA-256 cryptographic hashing** for file integrity verification
- **Time-limited pre-signed URLs** for consent-gated, expiry-enforced downloads
- **Role-Based Access Control** enforced at the API layer

Files are never stored on-chain. Only SHA-256 hashes and event metadata are logged, keeping gas costs negligible while preserving full auditability and non-repudiation.

---

## Features

| Feature | Description |
|---|---|
| 🔐 **SHA-256 Integrity** | Every uploaded file is fingerprinted. Any tampering is detectable on retrieval. |
| ⛓️ **Immutable Audit Trail** | UPLOAD, REQUEST, APPROVE, DOWNLOAD, and REVOKE events logged on Ethereum via a Solidity smart contract. |
| ✅ **Consent-Based Access** | Vendors submit reason-attached access requests. Only the file owner can approve. |
| ⏱️ **Time-Limited Links** | Pre-signed download URLs expire after a configurable TTL. Expired links re-enable the request flow. |
| 👥 **Role-Based Access Control** | Owner and vendor roles are strictly isolated at the API layer — vendors cannot approve their own requests. |
| 🔍 **Live Blockchain Status** | UI shows real-time Verified / Confirming… state per audit entry based on txHash presence. |
| ☁️ **Off-Chain Storage** | Files stored in MinIO (dev) / Amazon S3 (prod) — not on-chain, keeping costs low. |
| 🗑️ **Audited Deletion** | File deletions are logged on-chain before the object is removed from storage. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│         Owner Portal (teal)  ·  Vendor Portal (green)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (Vite proxy → :8080)
┌──────────────────────────▼──────────────────────────────────┐
│                  Spring Boot REST API                        │
│   Auth · File Ops · Consent · Pre-signed URL · RBAC         │
└────────┬──────────────────┬──────────────────┬──────────────┘
         │                  │                  │
┌────────▼──────┐  ┌────────▼──────┐  ┌────────▼──────┐
│  MySQL / PG   │  │   Ethereum    │  │  MinIO / S3   │
│  Metadata &   │  │  Smart Cont.  │  │  File Objects │
│  App State    │  │  Audit Log    │  │  Pre-signed   │
└───────────────┘  └───────────────┘  └───────────────┘
```

### Blockchain Smart Contract

The `FileAudit.sol` contract uses an event-only design — no storage arrays, minimal gas cost:

```solidity
event FileEvent(
    bytes32 indexed fileHash,
    address indexed user,
    uint8 action,        // 0=UPLOAD 1=REQUEST 2=APPROVE 3=DOWNLOAD 4=REVOKE
    uint256 timestamp,
    string meta
);
```

All transactions remain traceable through the Ethereum event log. The backend uses **Web3j** to submit transactions asynchronously — blockchain confirmation never blocks the user response.

### Upload Latency (Theoretical, AMD Ryzen 7 7435HS)

| File Size | SHA-256 Hash | Cloud Upload | Pre-signed URL | **Total** |
|:---------:|:------------:|:------------:|:--------------:|:---------:|
| 500 KB    | 1.2 ms       | 25 ms        | 4 ms           | **30 ms** |
| 2 MB      | 4.8 ms       | 30 ms        | 4 ms           | **39 ms** |
| 10 MB     | 23.8 ms      | 75 ms        | 4 ms           | **103 ms**|
| 25 MB     | 59.5 ms      | 165 ms       | 4 ms           | **229 ms**|

*Blockchain confirmation (~12–15s on Sepolia) is fully asynchronous and excluded from user-facing latency.*

---

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.1.4**
- **Spring Data JPA** + **MySQL** (operational metadata)
- **MinIO Java SDK** (S3-compatible object storage)
- **Web3j** (Ethereum RPC client)
- **Hardhat** (smart contract development & local chain)
- **Solidity ^0.8.19** (FileAudit smart contract)
- Custom `IdentityFilter` — header-based `X-USER-ID` / `X-USER-ROLE` auth

### Frontend
- **React 18** + **Vite**
- **React Router v6** (nested protected routes)
- **Axios** (request interceptor injects auth headers from `sessionStorage`)
- **IBM Plex Sans / IBM Plex Mono / Syne** — design system fonts
- `sessionStorage` per-tab sessions (owner + vendor can run simultaneously)

---

## Project Structure

```
.
├── fyp-backend/                   # Spring Boot backend
│   └── src/main/java/com/shadow/fyp/
│       ├── config/
│       │   ├── CorsConfig.java        # CORS for localhost:5173
│       │   ├── IdentityFilter.java    # X-USER-ID / X-USER-ROLE extraction
│       │   └── MinioConfig.java
│       ├── controller/
│       │   ├── FileController.java        # POST /api/files, GET, DELETE
│       │   ├── AccessRequestController.java  # POST /api/requests, approve, reject, download
│       │   └── AuditLogController.java    # GET /api/audit
│       ├── model/
│       │   ├── FileEntity.java
│       │   ├── AccessRequest.java         # Status: PENDING / APPROVED / REJECTED
│       │   └── AuditLog.java              # txHash, blockNumber, action
│       └── service/
│           ├── FileService.java           # SHA-256 hashing + MinIO upload + audit
│           ├── AccessRequestService.java  # Consent flow + pre-signed URL generation
│           ├── BlockchainService.java     # Async Web3j event logging
│           └── MinioService.java
│
└── fyp-frontend/                  # React + Vite frontend
    └── src/
        ├── api/
        │   ├── axios.js               # Interceptor — injects headers from sessionStorage
        │   ├── files.js
        │   ├── requests.js
        │   └── audit.js
        ├── app/
        │   ├── owner/                 # Owner portal (teal #00B4D8)
        │   │   ├── OwnerLayout.jsx    # Sidebar, breadcrumb, dynamic tab title
        │   │   ├── OwnerDashboard.jsx # Stats, blockchain activity feed
        │   │   ├── OwnerFiles.jsx     # Upload (stage modal) + SHA-256 table + delete
        │   │   ├── OwnerRequests.jsx  # Approve / reject vendor requests
        │   │   └── OwnerAudit.jsx     # Full audit log with Chain Status column
        │   └── vendor/                # Vendor portal (green #00C9A7)
        │       ├── VendorLayout.jsx
        │       ├── VendorBrowse.jsx   # Browse files, request/re-request access
        │       ├── VendorRequests.jsx # Request status, expiry timer, download
        │       └── VendorAudit.jsx    # Vendor's own audit trail
        ├── public/
        │   ├── SecureShareHomepage.jsx  # Landing page (paper-driven content)
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        └── css/
            ├── OwnerDashboard.css
            ├── VendorDashboard.css
            └── PublicPages.css
```

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Java JDK | 17+ | Backend runtime |
| Maven | 3.8+ | Backend build |
| Node.js | 18+ | Frontend runtime |
| MySQL | 8.0+ | Application database |
| MinIO | Latest | Local S3-compatible storage |
| Ganache | Latest | Local Ethereum blockchain |
| Hardhat | Latest | Smart contract deployment |

---

### 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/secureshare.git
cd secureshare
```

---

### 2 — Start Infrastructure Services

**MinIO** (local S3):
```bash
# macOS / Linux
minio server ~/minio-data --console-address ":9001"

# Windows
minio.exe server C:\minio-data --console-address ":9001"
```
MinIO console → `http://localhost:9001` (default: `minioadmin` / `minioadmin`)
Create a bucket named `secureshare`.

**Ganache** (local Ethereum):
```bash
# GUI — just open Ganache and start a workspace
# or CLI
npx ganache --port 7545
```

---

### 3 — Deploy the Smart Contract

```bash
cd contracts   # or wherever your Hardhat project lives
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
# Copy the deployed contract address — you'll need it in application.properties
```

---

### 4 — Configure the Backend

Copy the example config:
```bash
cd fyp-backend
cp src/main/resources/application.example.properties src/main/resources/application.properties
```

Edit `application.properties`:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/secureshare
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# MinIO
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
minio.bucket=secureshare
minio.presign.expiry.seconds=300

# Blockchain
blockchain.rpc-url=http://localhost:7545
blockchain.contract-address=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
blockchain.private-key=YOUR_GANACHE_ACCOUNT_PRIVATE_KEY
```

---

### 5 — Run the Backend

```bash
cd fyp-backend
mvn spring-boot:run
```
Backend starts at `http://localhost:8080`

---

### 6 — Run the Frontend

```bash
cd fyp-frontend
npm install
npm run dev
```
Frontend starts at `http://localhost:5173`

---

### Demo Accounts

| Role | Email | Password |
|:----:|-------|----------|
| **Owner** | `owner@secureshare.com` | `demo1234` |
| **Vendor** | `vendor@secureshare.com` | `demo1234` |

> **Tip:** Open Owner and Vendor portals in separate browser tabs — `sessionStorage` keeps the sessions fully isolated so both work simultaneously.

---

## API Reference

### Files — `POST /api/files`
Upload a file. Computes SHA-256 hash, stores in MinIO, logs on blockchain.
```
POST /api/files
Headers: X-USER-ID: 1, X-USER-ROLE: OWNER
Body (multipart): file=<binary>, ownerId=1
Response: FileEntity { id, filename, ownerId, fileHash, size, contentType, storageUrl }
```

### Files — `GET /api/files`
List all files.

### Files — `DELETE /api/files/{id}`
Delete a file. Logs DELETE event on blockchain, removes from MinIO.
```
Headers: X-USER-ID: 1, X-USER-ROLE: OWNER
```

### Requests — `POST /api/requests`
Vendor requests access to a file.
```
Headers: X-USER-ID: 2, X-USER-ROLE: VENDOR
Params: fileId=1, reason=<string>
Response: AccessRequest { id, fileId, requesterId, ownerId, status, reason, createdAt }
```

### Requests — `POST /api/requests/{id}/approve`
Owner approves a request. Generates pre-signed URL with TTL.
```
Headers: X-USER-ID: 1, X-USER-ROLE: OWNER
Response: AccessRequest { ...status: APPROVED, presignedUrl, expiresAt }
```

### Requests — `POST /api/requests/{id}/reject`
Owner rejects a request.

### Requests — `GET /api/requests/owner/{ownerId}`
List all requests for an owner's files.

### Requests — `GET /api/requests/requester/{requesterId}`
List all requests submitted by a vendor.

### Requests — `GET /api/requests/{id}/download?requesterId={id}`
Download an approved file. Validates consent + expiry, logs DOWNLOAD on blockchain, returns `302` redirect to a fresh short-TTL pre-signed URL.

### Audit — `GET /api/audit`
Returns all audit log entries sorted by `createdAt DESC`.
```
Response: AuditLog[] { id, fileId, userId, action, txHash, blockNumber, payload, createdAt }
```

---

## Blockchain Events

All events are emitted by `FileAudit.sol` and stored in the Ethereum event log:

| Code | Action | Triggered By |
|:----:|--------|--------------|
| `0` | `UPLOAD` | File owner uploads a file |
| `1` | `REQUEST` | Vendor submits an access request |
| `2` | `APPROVE` | Owner approves a request |
| `3` | `REJECT` | Owner rejects a request |
| `4` | `REVOKE` / `DELETE` | Owner deletes a file |

Each event carries: `fileHash (bytes32)`, `user (address)`, `action (uint8)`, `timestamp (uint256)`, `meta (string)`.

---

## Feature Comparison

| Feature | Google Drive | Dropbox | **SecureShare** |
|---|:---:|:---:|:---:|
| Immutable Audit Logs | ✗ | ✗ | ✓ |
| Consent-Based Access | ✗ | ✗ | ✓ |
| Time-Limited Links | ~ | ~ | ✓ |
| SHA-256 Integrity Proof | ✗ | ✗ | ✓ |
| Decentralised Trust | ✗ | ✗ | ✓ |
| Role-Based Access (RBAC) | ~ | ~ | ✓ |
| Non-Repudiation | ✗ | ✗ | ✓ |
| Off-Chain File Storage | ✓ | ✓ | ✓ |

*✓ Fully supported · ~ Partial · ✗ Not supported*

---

## Research Paper

This repository is the implementation artefact for:

> **"A Cloud-Based Secure File Sharing System with Blockchain-Based Immutable Logging"**
> Immanuel Jebaraj · Haswinth T
> Department of Computer Science and Engineering
> Sathyabama Institute of Science and Technology, Chennai, India

The paper proposes a novel combination of consent-based access control, temporal pre-signed URL-based file sharing, and blockchain-based tamper-proof logging for enterprise document collaboration — the first system to address all eight enterprise security requirements simultaneously.

---

## Known Limitations

- Performance figures are **theoretical estimates** based on hardware benchmarks, not instrumented production measurements.
- Gas cost estimates are based on the **Ganache / Sepolia testnet** — mainnet costs will differ due to congestion.
- Concurrent load testing (100+ users) has not been performed.
- Files are not **encrypted at rest** — confidentiality depends on cloud storage access controls. AES-256 at-rest encryption is planned for future work.
- The current auth model uses **header-based identity** (`X-USER-ID`, `X-USER-ROLE`) suitable for demo purposes. Production deployment should use JWT or OAuth2.

---

## Roadmap

- [ ] AES-256 encryption at rest
- [ ] IPFS integration for fully decentralised storage
- [ ] Attribute-based access control (ABAC) for granular enterprise permissions
- [ ] Load testing with 100 concurrent users
- [ ] Smart contract gas optimisation
- [ ] Migration to Ethereum Sepolia testnet (one-line RPC URL change)
- [ ] Proper JWT authentication replacing header-based identity

---

<div align="center">

*Cloud for storage. Blockchain for trust.*

</div>
