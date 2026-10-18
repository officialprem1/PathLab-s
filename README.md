# Path LIS — Laboratory Information System
### Production-Grade Pathology Management Software for Single Laboratories
**Default Lab Name:** Maa PathLab's  
**Address:** At Gopalganj, Seoni MP  
**Author / Lab Director:** Dr. A. K. Mishra, MBBS, MD (Pathology)  

---

## 🌟 Overview & Key Capabilities

**Path LIS** is a full-featured, responsive Laboratory Information System engineered specifically for diagnostic pathology laboratories. It covers the entire diagnostic lifecycle from patient reception to authorized report release and payment collection.

### Core Modules:
1. **Multi-Role Security & RBAC**:
   - **Admin**: Lab profile settings, user management, test pricing, database backups, complete clinical audit log.
   - **Lab Staff**: Patient registration, duplicate detection, sample collection, initial result entry, cashiering.
   - **Pathologist**: Result review, clinical validation, auto-calculation formula verification, authorization, digital release, controlled amendments.
2. **Bilingual User Experience (English & हिन्दी)**:
   - Instant language switcher in the header for smooth lab staff operations in Indian Hindi or English.
3. **Clinical Workflows & Statuses**:
   - `Registered` ➔ `Sample Collected` ➔ `Processing` ➔ `Results Entered` ➔ `Pending Verification` ➔ `Verified` ➔ `Authorized` ➔ `Released`.
   - Controlled amendment/correction workflow with mandatory reason logging and historic version snapshots.
   - Critical panic value alert banner with acknowledgment logging.
4. **Starter Clinical Catalog & Formula Engine**:
   - 10+ standard panels: Complete Blood Count (CBC with 16 parameters & red cell indices), Liver Function Test (LFT), Kidney Function Test (KFT with eGFR), Lipid Profile (Friedewald LDL/VLDL), Thyroid (T3/T4/TSH), Glucose, Urine Routine & Microscopy, Serology, PT/INR.
   - Safe client-side mathematical formula engine for LDL, VLDL, A/G Ratio, BUN, eGFR (CKD-EPI), eAG (HbA1c), MCV/MCH/MCHC without arbitrary code execution.
5. **Medical PDF Reports & Receipts**:
   - Standard clinical letterhead with patient demographic bar, test results, color-coded abnormal/critical flags, reference intervals, pathologist digital sign-off, and disclaimer.
   - In-browser PDF download, native print preview, and WhatsApp sharing fallback.
   - Thermal/A6 receipt generation for cashiering.
6. **Billing & Collections**:
   - Subtotal, discounts, split payments, Cash/UPI/Card tracking with reference numbers, and outstanding balance tracking.
   - Daily and monthly collection analytics.
7. **Free-Tier Cloud Deployment**:
   - Designed to run 100% on free tiers: **Vercel** (Frontend) + **Supabase** (PostgreSQL & Auth).
   - Zero paid APIs or proprietary software required.

---

## 📱 Mobile-Friendly Deployment Guide (Deploy from an Android Phone)

You can deploy and run **Path LIS** entirely from an Android mobile browser (Chrome/Brave) in less than 10 minutes:

### Step 1: Create Free Supabase Database
1. On your phone, visit [supabase.com](https://supabase.com) and create a free account.
2. Tap **"New Project"**.
3. Name your project (e.g., `MaaPathLab`), choose your nearest region (e.g. `Singapore` or `Mumbai`), and set a database password.
4. Once the project finishes provisioning (~2 minutes):
   - In the left sidebar, tap **SQL Editor**.
   - Tap **"New Query"**.
   - Copy the contents of the `supabase-schema.sql` file provided in this repository and paste it into the editor.
   - Tap **Run**. All 15+ tables, RLS policies, indexes, and starter tests are created automatically.
5. In **Project Settings** ➔ **API**, copy your:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public key` (starts with `ey...`)

### Step 2: Deploy to Vercel (Free Tier)
1. Go to [github.com](https://github.com) on your mobile browser (or desktop).
2. Create a new repository (e.g. `path-lis`) and upload this project code.
3. Visit [vercel.com](https://vercel.com) and tap **Add New Project**.
4. Import your `path-lis` GitHub repository.
5. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
6. Tap **Deploy**. In under 60 seconds, your laboratory web application will be live at a free `https://path-lis.vercel.app` URL!

---

## 💻 Local Development Setup

To run locally on computer:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

App will be available on `http://localhost:3000`.

To run automated unit tests:
```bash
npm run test
```

---

## 🛡️ Default Provisioned Accounts (For Initial Sign-in)

For instant evaluation and testing, Path LIS includes role switching and pre-configured test profiles:

| Role | Name | Email | Initial Designation |
|---|---|---|---|
| **Administrator** | Lab Admin | `admin@maapathlab.com` | Laboratory Director |
| **Lab Staff** | Pooja Verma | `staff@maapathlab.com` | Senior Medical Lab Technician |
| **Pathologist** | Dr. A. K. Mishra | `pathologist@maapathlab.com` | Consultant Pathologist (MD Path) |

*Note: In production with Supabase Auth enabled, the Admin invites staff members via Supabase Auth with custom secure passwords.*

---

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)** enabled on all PostgreSQL tables.
- **Service-role secret keys are NEVER bundled or exposed** in client-side code.
- **Strict Audit Trails**: Every clinical action (registration, result entry, verification, amendment, and payment collection) logs user ID, name, role, timestamp, and amendment reason.
- **Controlled Amendments**: Once a report is authorized or released, edits require unlocking with a formal clinical reason, incrementing the report version (v1, v2...) while preserving the immutable historical snapshot.

---

## ⚕️ Clinical Disclaimer
The starter reference intervals and formulas provided are standard reference values. Diagnostic intervals, cutoff ranges, and calculation formulas must always be reviewed, adjusted, and approved by the laboratory's qualified pathologist and local regulatory requirements before clinical reliance.
