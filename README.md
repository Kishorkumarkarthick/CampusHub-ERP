# CampusHub ERP - College Enterprise Resource Planning System

CampusHub ERP is a comprehensive, production-ready enterprise resource planning application designed for modern academic institutions. It provides dedicated portal environments and administrative consoles for Students, Faculty, and Administrators to coordinate academics, attendance, marksheet generation, fee payments, and request approvals.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React (TypeScript)
- **Bundler**: Vite
- **Styling**: TailwindCSS & Vanilla CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Spring Boot 3.4.1 (Java 17+)
- **Database**: MongoDB (via Spring Data MongoDB)
- **PDF Engine**: OpenPDF (for dynamic transcript and certificate generation)
- **Security**: Spring Security with stateless JWT Authentication

---

## 📂 Folder Structure

```text
├── .gitignore                      # Git exclusion rules
├── .env.production                 # Vite production environment configuration
├── package.json                    # Frontend node packaging settings
├── vite.config.ts                  # Vite build tool configuration
├── src/                            # Frontend source files
│   ├── main.tsx                    # Application entrypoint
│   ├── app/
│   │   ├── components/             # Reusable UI components & layouts
│   │   ├── context/                # Authentication state (AuthContext.tsx)
│   │   ├── routes/                 # Protected role-based routers
│   │   └── pages/                  # Student, Faculty, and Admin page workspaces
│   └── assets/                     # Styles, styling modules, and assets
└── backend/                        # Backend Spring Boot repository
    ├── pom.xml                     # Maven project specification
    └── src/main/java/com/college/erp/
        ├── config/                 # Security rules, JWT filters, data initializer
        ├── controller/             # REST API Controllers (Student requests, Auth, etc.)
        ├── model/                  # MongoDB Document Schema specifications
        └── repository/             # Spring Data repository interfaces
```

---

## 🛠️ Installation & Local Development

### Prerequisites
- Node.js (v18+) & npm/pnpm
- Java JDK 17 or higher
- Maven (v3.8+)
- Local MongoDB running on `mongodb://localhost:27017`

### 1. Database Setup
Ensure MongoDB is running locally. The Spring Boot application automatically seeds the `CampusHubERP` database with dummy student, faculty, course, and admin roles on its initial boot.

### 2. Run Backend Server
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
The REST API will boot and listen on port `8080` (accessible via `http://localhost:8080`).

### 3. Run Frontend Server
```bash
# In the project root workspace
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

### Backend Configuration
Configure the following env variables in your production environment (e.g., Render, Docker, or server shell):

| Key | Purpose | Default / Fallback |
|---|---|---|
| `MONGODB_URI` | Connection URI to MongoDB Atlas database | `mongodb://localhost:27017/CampusHubERP` |
| `PORT` | Web port listening for REST endpoints | `8080` |
| `JWT_SECRET` | Secret key signing authentication tokens | 256-bit hexadecimal string |
| `JWT_EXPIRATION_MS` | Validity period of user access tokens | `86400000` (24 Hours) |

### Frontend Configuration
Configure this variable in your hosting platform (e.g., Vercel, Netlify):

| Key | Purpose | Default / Fallback |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint of the deployed Spring Boot backend | `http://localhost:8080` |

---

## ☁️ Production Deployment Instructions

### 1. Database: MongoDB Atlas
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Database Cluster and choose a cloud provider.
3. In **Network Access**, whitelist `0.0.0.0/27` or allow access from anywhere (required for Render to connect).
4. Create a Database User with read and write permissions.
5. Retrieve your connection string from the Connect dialog, replacing `<password>` with your database user's password:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/CampusHubERP?retryWrites=true&w=majority`

### 2. Backend: Render Deployment
1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository.
4. Configure the following parameters:
   - **Environment**: `Java`
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `java -jar backend/target/erp-0.0.1-SNAPSHOT.jar`
5. Under **Advanced**, add the following **Environment Variables**:
   - `MONGODB_URI`: *Your MongoDB Atlas Connection String*
   - `PORT`: `8080`
   - `JWT_SECRET`: *A secure random hex string*
   - `JWT_EXPIRATION_MS`: `86400000`

### 3. Frontend: Vercel Deployment
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following build options:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: *The URL of your deployed Render Web Service (e.g. `https://your-app.onrender.com`)*
6. Click **Deploy**.

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/login` : Authenticate user credentials and return JWT
- `POST /api/auth/refresh` : Refresh expired JWT access token
- `GET /api/auth/profile` : Fetch profile of the authenticated user

### Student Requests (Leave, Bonafide, Marksheet)
- `POST /api/requests/student` : Submit a new student request
- `GET /api/requests/student/{studentId}` : Get request history for a student
- `DELETE /api/requests/student/{type}/{id}` : Cancel a pending request
- `GET /api/requests/faculty/{department}` : Fetch requests pending faculty approval
- `PUT /api/requests/faculty/{type}/{id}/approve` : Faculty approve & forward request
- `PUT /api/requests/faculty/{type}/{id}/reject` : Faculty reject request
- `GET /api/requests/admin` : Fetch requests forwarded to academic admin
- `PUT /api/requests/admin/{type}/{id}/approve` : Admin approve & generate certificate
- `PUT /api/requests/admin/{type}/{id}/reject` : Admin reject request
- `PUT /api/requests/admin/{type}/{id}/issue` : Admin mark request as ready/issued
- `GET /api/requests/{type}/{id}/pdf` : Download generated Bonafide or Marksheet PDF