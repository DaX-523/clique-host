```markdown
# Clique Host 🚀  
**One-Click Frontend Hosting & Deployment (Vercel-like Architecture)**  

![Docker](https://img.shields.io/badge/Docker-✔️-green) ![Redis](https://img.shields.io/badge/Redis-✔️-red) ![AWS](https://img.shields.io/badge/AWS-☁️-orange) ![Cloudflare_R2](https://img.shields.io/badge/Cloudflare_R2-🪣-blue)  

Effortlessly deploy frontend projects with a single click! Dockerized and ready for local testing.  

---

## 🛠️ **Prerequisites**  
- Docker ([Install](https://docs.docker.com/get-docker/))  
- Docker Compose ([Install](https://docs.docker.com/compose/install/))  
- Node.js v18+ (Optional: Only needed for local development/modules)  

---

## 🚀 **Quick Start**  
### 1. Clone the Repository  
```bash  
git clone https://github.com/yourusername/clique-host.git  
cd clique-host  
```

### 2. Set Up Environment Variables  
**Root Directory**:  
```bash  
cp .env.example .env  # Update values in the root .env file  
```  

**Per-Service Configuration**:  
Each service (`upload-service`, `deployment-service`, etc.) has its own `.env.example`. Copy them:  
```bash  
# Example for upload-service  
cd upload-service && cp .env.example .env && cd ..  
# Repeat for other services  
```  

### 3. Start Containers  
```bash  
docker-compose up --build  
```  
The system will spin up:  
- Redis (Queue Management)  
- Upload Service (Port 3001)  
- Deployment Service (Port 3002)  
- Request Handling Service (Port 3003)  
- Frontend (Port 3000)  

---

## 🔧 **Configuration**  
### Key Environment Variables (`.env`)  
- `REDIS_URL=redis://redis:6379`
These can be found in constants
- `CLOUDFLARE_R2_ACCESS_KEY=<YOUR_KEY>` (Use `test` for local simulation)  
- `CLOUDFLARE_R2_ACCOUNT_ID=<YOUR_ACCOUNT_ID>`

- Update baseUrl inside frontend/src/components/GitHubDeployer.tsx to localhost

⚠️ **Never commit real credentials!** Use `.env` files only locally.  

---

## 📂 **Project Structure**  
```  
├── docker-compose.yml  
├── .env.example              # Root configuration  
├── upload-service/  
│   ├── src/  
│   ├── Dockerfile  
│   └── .env.example          # Service-specific vars  
├── deployment-service/  
│   ├── src/  
│   ├── Dockerfile  
│   └── .env.example
├── request-handler-service/  
│   ├── src/  
│   ├── Dockerfile  
│   └── .env.example  
├── frontend/                 # Demo UI (Optional)  
│   ├── src/  
│   └── Dockerfile  
└── redis/                    # Redis configuration  
```  

---

## 🧪 **Testing Locally**  
1. Run `docker-compose up --build`  
2. Use the **upload-service** endpoint (`http://localhost:3000/`) to POST your project Git URL.  
3. Check Redis queues and logs for build status:  
```bash  
docker-compose logs -f deployment-service  
```  
4. Once built, access static files via `http://<UNIQUE_ID>localhost:3000/`.  

---

## 🤝 **Contributing**  
1. Fork the repo and create a branch.  
2. **Always reference `.env.example`** when adding new environment variables.  
3. Test changes with `docker-compose up --build`.  
4. Submit a PR with details on fixes/features!  

---

## 📜 **License**  
MIT License (See [LICENSE](LICENSE)).  

---

**Happy Hosting!** ✨  
*Questions? Open an issue or DM !*  
``` 

---

### 📌 **Notes**  
- **AWS/Cloudflare Integration**: Final cloud deployment flow is WIP. Local testing uses simulated R2 buckets.  
- **Environment Variables**: Use `.env.example` as the source of truth for required configs.  
- **Windows Users**: Replace `cp` with manual file copying if needed.
