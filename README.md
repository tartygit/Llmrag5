# Software Development Document Environment (SDDE)

## Overview
**Software Development Document Environment (SDDE)** is an enterprise-grade document upload, verification, and local Retrieval-Augmented Generation (RAG) recommendations service. Built utilizing **Spring Boot** (Java 21) for strict Maker-Checker double authentication document flows, **React + Vite** for a modern user dashboard, and **Python Flask + FAISS + Docling + Ollama** for a fully local conversational AI assistant.

---

## Architecture Blueprint
1. **Back-end Server (Port 8080)**: Spring Boot (Java 21), Spring Security, H2 Database (with full Oracle, PostgreSQL, and SQL Server setup configurations).
2. **Local AI RAG Back-end (Port 5000)**: Python Flask Web API with FAISS Vector database and Docling document processing pipelines.
3. **Front-end Dashboard (Port 3000)**: React 18, Vite, Tailwind CSS, Lucide icons. Supports mock Active Directory LDAP and Clerk auth.

---

## Deliverables & Documentation Catalog
All documentation files have been created in real, professional formats under the `docs/` folder:
- `docs/walkthrough.docx`: Interactive Walkthrough Guide.
- `docs/functional_spec.xlsx`: Functional Specification Matrix.
- `docs/instructions.pptx`: Slide Deck & Operations Instructions.

---

## Technical Prerequisites
- Java 21 JDK
- Maven 3.9+
- Node.js v22+
- Python 3.12+
- Ollama (running locally with `llama3.2:latest` and `nomic-embed-text` models pulled).

---

## Quick Start Guide

### 1. Run the Project Compiling & Packaging Script
Compile all back-end objects, install front-end modules, and prepare package targets:
- **Windows**:
  ```bash
  build.bat
  ```

### 2. Execute JUnit Testing Suite
Verify security, active directory toggles, and maker-checker dynamic document sequencing:
- **Windows**:
  ```bash
  run_tests.bat
  ```
- **Linux/macOS**:
  ```bash
  cd sde-app && mvn test
  ```

### 3. Run the Entire SDDE Application
- **Windows**:
  ```bash
  start.bat
  ```
- **Linux/macOS**:
  ```bash
  chmod +x start.sh
  ./start.sh
  ```

Once started, navigate to:
- **Main Dashboard Portal**: `http://localhost:3000`
- **Spring Boot API (Swagger UI docs)**: `http://localhost:8080/swagger-ui/index.html`
- **RAG Back-end Health**: `http://localhost:5000/health`

### 4. Running via Docker Compose
To run the fully orchestrated Dockerized containers:
```bash
docker-compose up --build
```
This binds back-ends and front-end seamlessly into an isolated local container group.

---

## Secure Maker-Checker Operations Walkthrough
1. **Sign Up or Login**: Sign up as either `MAKER`, `CHECKER`, or `ADMIN`. Toggle "Authenticate with Windows AD (LDAP)" at login to test Active Directory emulation.
2. **Submit deliverable (Maker)**: Navigate to the **Maker Portal**, choose the application code and phase, fill in descriptions, and select a document file to upload.
3. **Verify Sequence (Auto-Generated)**: SDDE automatically assigns sequential identifiers (e.g. `SDE-P101` for Phase 1 deliverable 1, `SDE-P201` for Phase 2 deliverable 1, `SDE-P202` for Phase 2 deliverable 2).
4. **Approve deliverable (Checker)**: Go to **Checker Approvals** tab. A Checker can preview files and approve/reject with audit remarks.
5. **Report Generation**: Go to **Reports Center** tab to view status matrices online, or download compiled reports as actual Excel or PDF binaries.
6. **AI RAG (Recommendations)**: In **Local LLM AI RAG** tab, upload documentation to feed the FAISS vector database, trigger semantic keyword matches, and chat live with full citation tracking!
