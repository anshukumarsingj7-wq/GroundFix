# GroundFix

### **Report. Fix. Safer Roads.**

> GroundFix turns citizen road-hazard reports into actionable road-safety intelligence for authorities and drivers.

---

## 🌟 Overview

**GroundFix** is a citizen-powered road hazard reporting and road-safety intelligence platform designed for rapid civic intervention, driver awareness, and municipal workflow tracking.

- **Zero-Barrier Citizen Reporting**: Instant reporting without login, signup, passwords, or KYC.
- **Image Authenticity Verification**: Multi-factor validation (format, header signatures, camera EXIF analysis, and optional external AI) to prevent fraudulent or synthetic submissions.
- **Dynamic 0–100 Risk Score**: Transparent calculation factoring in hazard severity, community confirmations (+3 each), near-miss incidents (+4 to +8 each), and transit corridor density.
- **Officer Smart Priority Queue**: Automated triage for municipal teams (🔴 **FIX FIRST**, 🟠 **FIX NEXT**, 🟡 **NORMAL**) with Before/After repair evidence photo validation.
- **Citizen Re-verification**: Citizens verify whether repairs actually fixed the problem, with one-click reopening if the defect persists.
- **Driver Mode Co-Pilot**: Real-time proximity hazard alerts (350m–1km), speed HUD, speech audio warnings, and direct deep-links to Google Maps.
- **Multilingual System**: 100% complete translations in **English**, **हिन्दी (Hindi)**, and **ಕನ್ನಡ (Kannada)** with localStorage persistence.
- **Dark & Light Mode**: Accessible design system with CSS custom properties.
- **GroundFix AI Assistant**: Contextual chatbot answering citizen and officer questions in their chosen language with built-in rule-based fallback.

---

## 🗂 Project Structure

```text
groundfix/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badges.jsx                    # Priority, Status, Severity Badges
│   │   │   ├── Footer.jsx                    # GroundFix footer
│   │   │   ├── GroundFixAssistant.jsx        # Floating AI Assistant widget
│   │   │   ├── ImageUploadWithVerification.jsx # Camera/Upload & Authenticity check
│   │   │   ├── LocationPickerModal.jsx       # Leaflet interactive map pin selector
│   │   │   ├── Navbar.jsx                    # Navigation, Language & Theme toggles
│   │   │   └── RiskGauge.jsx                 # 0-100 visual risk score gauge
│   │   ├── context/
│   │   │   ├── LanguageContext.jsx           # Multilingual context (en, hi, kn)
│   │   │   └── ThemeContext.jsx              # Dark/Light mode context
│   │   ├── data/
│   │   │   └── translations/
│   │   │       ├── en.js                     # English dictionary
│   │   │       ├── hi.js                     # Hindi dictionary
│   │   │       ├── kn.js                     # Kannada dictionary
│   │   │       └── index.js                  # Safe translation resolver
│   │   ├── pages/
│   │   │   ├── DriverMode.jsx                # Driver co-pilot with proximity alerts
│   │   │   ├── Home.jsx                      # Landing page with process flow & KPIs
│   │   │   ├── OfficerDashboard.jsx          # Priority queue, filters & repair proofs
│   │   │   ├── ReportHazard.jsx              # Photo, GPS, voice & near-miss form
│   │   │   ├── RoadHealth.jsx                # Corridor safety indices & metrics
│   │   │   ├── RoadSafetyMap.jsx             # Leaflet OSM hazard pins & popups
│   │   │   └── TrackComplaint.jsx            # Timeline, confirms & re-verification
│   │   ├── services/
│   │   │   └── api.js                        # Frontend REST API client
│   │   ├── styles/
│   │   │   └── theme.css                     # Design system variables & utilities
│   │   ├── utils/
│   │   │   └── clientIdentifier.js           # Anti-spam browser session token
│   │   ├── App.jsx                           # Route configuration
│   │   ├── main.jsx                          # React root
│   │   └── index.html                        # HTML entry & Leaflet assets
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json                           # Vercel SPA routing
│   └── vite.config.js                        # Vite bundler configuration
│
├── backend/
│   ├── controllers/
│   │   ├── aiController.js                   # AI Assistant handler
│   │   ├── complaintsController.js           # Complaint lifecycle & duplicate logic
│   │   ├── dashboardController.js            # KPIs & Department listing
│   │   ├── hazardsController.js              # Nearby proximity search
│   │   ├── imageVerificationController.js    # Photo authenticity endpoint
│   │   └── roadsController.js                # Road health summaries
│   ├── middleware/
│   │   ├── errorHandler.js                   # Centralized error handler
│   │   └── uploadMiddleware.js               # Multer buffer file upload
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── complaintsRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── hazardsRoutes.js
│   │   ├── imageVerificationRoutes.js
│   │   └── roadsRoutes.js
│   ├── services/
│   │   ├── aiService.js                      # Multilingual NLP knowledge base
│   │   ├── dbService.js                      # Supabase / Local JSON atomic datastore
│   │   ├── imageVerificationService.js       # Authenticity checks & fallback
│   │   ├── riskCalculationService.js         # Deterministic 0-100 risk formula
│   │   └── storageService.js                 # Supabase Storage & local uploads
│   ├── utils/
│   │   └── geoUtils.js                       # Haversine distance & duplicate checks
│   ├── test.js                               # 20-point automated test suite
│   ├── server.js                             # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql                            # PostgreSQL / Supabase schema & demo seed
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer recommended, tested on Node v24)
- npm (v9 or newer)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```
The backend API starts on **http://localhost:5001**.
Health check: **http://localhost:5001/api/health**

To run the automated backend test suite:
```bash
npm test
```

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
The React frontend starts on **http://localhost:5173**.

To build for production:
```bash
npm run build
```

---

## 🗄 Database & Supabase Configuration

GroundFix is architected to run **100% out of the box** using its built-in, atomic, local datastore (`backend/data/store.json`) seeded with realistic Bangalore corridor hazard reports.

When you are ready to connect a cloud **Supabase** instance:

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. In the **SQL Editor**, paste and execute the entire contents of `database/schema.sql`.

### Step 2: Create Storage Bucket
In the Supabase Dashboard, go to **Storage**:
1. Click **New Bucket**.
2. Name the bucket: `groundfix-images`
3. Set bucket access to **Public**.

### Step 3: Configure Environment Variables
In `backend/.env`:
```env
PORT=5001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
AI_API_KEY=
IMAGE_VERIFICATION_API_KEY=
```

In `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and platform metadata |
| `GET` | `/api/complaints` | Fetch complaints with optional filters (`status`, `severity`, `riskTier`, `road`, `search`) |
| `GET` | `/api/complaints/:complaintId` | Fetch single complaint details, status history, and near-misses |
| `POST` | `/api/complaints` | Submit hazard report (detects duplicates within 100m, runs photo authenticity) |
| `PATCH` | `/api/complaints/:complaintId/status` | Update status (`Reported`, `Verified`, `Assigned`, `In Progress`, `Resolved`, `Reopened`, `Rejected`), officer note, and before/after proof URLs |
| `POST` | `/api/complaints/:complaintId/confirm` | Community confirmation ("👥 I also see this problem", anti-spam protected) |
| `POST` | `/api/complaints/:complaintId/near-miss` | Add a near-miss incident to an existing complaint |
| `POST` | `/api/complaints/:complaintId/reverify` | Citizen re-verification (`is_fixed: true` keeps resolved; `is_fixed: false` reopens complaint) |
| `POST` | `/api/complaints/:complaintId/assign` | Assign municipal department to complaint |
| `GET` | `/api/dashboard/stats` | Officer dashboard KPIs (total, critical, high risk, pending, in progress, resolved, reopened) |
| `GET` | `/api/dashboard/departments` | List of municipal response departments |
| `GET` | `/api/roads` | Corridor-level road health indices (0–100) and defect summaries |
| `GET` | `/api/hazards/nearby` | Proximity search for Driver Mode based on `latitude` and `longitude` |
| `POST` | `/api/image-verification/check` | Pre-submission photo authenticity inspection |
| `POST` | `/api/ai/assistant` | Multilingual road-safety question answering |

---

## 🎯 Key Feature Flows

### 1. Citizen Hazard Reporting
1. Navigate to **Report Hazard** (`/report`).
2. Upload a photograph or capture with a mobile camera. The platform checks authenticity and computes an **Authenticity Confidence** rating.
3. Click **📍 Use My Location** for GPS or **🗺 Select Location on Map** to drop a pin on OpenStreetMap.
4. Select hazard severity (Low, Medium, High, Critical).
5. Specify any dangerous near-miss situation (Almost crashed, Vehicle damaged, Almost fell, etc.).
6. Click **Submit Hazard Report**. If a hazard already exists within 100m, GroundFix alerts the citizen with a duplicate prompt (**Confirm Existing** vs **Submit New**).
7. Receive a unique Complaint ID (e.g. `POT-1008`).

### 2. Complaint Tracking & Re-verification
1. Navigate to **Track Complaint** (`/track`) or search by ID.
2. View the full lifecycle: severity, photo with authenticity badge, dynamic 0–100 risk score, community confirmations, and status history timeline.
3. Click **👥 I also see this problem** to increase community confirmation count.
4. If marked **Resolved**, citizens can test road quality and click:
   - **✅ Yes, Fixed**: Verifies resolution.
   - **❌ No, Still Exists**: Reopens complaint immediately to `Reopened` and notifies municipal officers.

### 3. Officer Dashboard & Priority Dispatch
1. Navigate to **Officer Dashboard** (`/officer`).
2. View the **Smart Priority Queue**:
   - 🔴 **FIX FIRST**: Score 81–100 (Critical safety hazards)
   - 🟠 **FIX NEXT**: Score 61–80 (High-risk hazards)
   - 🟡 **NORMAL**: Score 0–60
3. Click **Manage** on any complaint to assign a department (e.g. *Road Infrastructure & Paving*), change status, add field inspection notes, and upload **Before & After repair evidence photos**.

### 4. Driver Mode Co-Pilot
1. Navigate to **Driver Mode** (`/driver`).
2. Click **Start Route Demo** to test live proximity detection without moving outdoors, or enable GPS.
3. Receive upcoming hazard alerts (e.g. `⚠️ POTHOLE AHEAD - 350 m - High Risk`).
4. Click **Open in Navigation** to launch Google Maps directions directly to the hazard coordinates.
5. Audio chime & speech synthesis alert automatically warns the driver when entering a 500m danger zone.

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select the `frontend` folder as the Root Directory.
4. Set Framework Preset to **Vite**.
5. Add the Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://groundfix-api.onrender.com`).
6. Click **Deploy**. SPA rewrites are already configured in `frontend/vercel.json`.

### Backend (Render, Railway, or VPS)
1. In Render/Railway, create a new **Web Service** pointing to the `backend` folder.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables:
   - `PORT`: `5001` (or provider default)
   - `SUPABASE_URL`: Your Supabase URL (optional)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret (optional)
   - `IMAGE_VERIFICATION_API_KEY`: (optional external vision API)
   - `AI_API_KEY`: (optional LLM API)

---

## ⚠️ Known Limitations & Design Decisions

1. **No Citizen Accounts**: GroundFix intentionally avoids signups and passwords per project rules. Citizens can report immediately and track reports via Complaint IDs.
2. **Authenticity Claims**: Per Rule 11, image authenticity analysis never claims 100% certainty. In the absence of third-party cloud vision keys, submissions pass format/signature checks and are honestly queued for **Manual Review** rather than generating fake certainty scores.
3. **Existing Navigation Integration**: GroundFix does not duplicate Google Maps routing. It specializes in road-hazard intelligence and deep-links to native navigation apps for directions.

---

## 📄 License
GroundFix is open-source software built for road safety hackathons and civic innovation.
