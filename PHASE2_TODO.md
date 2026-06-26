# Phase 2 TODO: Supabase Integration & RLS

This document maps the mock data structures created in Phase 1 to the actual Supabase tables that need to be created or updated in Phase 2.

## 1. Database Schema & Tables

The following tables correspond to the `src/types` and `src/lib/mock` files:

- **Profiles & Users:** `profiles` (add patient details or link to a new `patients` table)
- **Departments & Doctors:** `departments`, `doctors` (already exist)
- **Appointments:** `appointments` (already exist)
- **Medical Records:** `medical_records` (new)
- **Prescriptions:** `prescriptions`, `prescription_items` (new)
- **Pharmacy & Inventory:** `medicines`, `pharmacy_orders`, `vendors` (new)
- **Laboratory:** `lab_tests`, `lab_reports` (new)
- **Insurance:** `insurance_policies`, `insurance_claims` (new)
- **Billing:** `invoices`, `payments`, `refunds` (new)
- **Reception:** `walk_in_queue` (new)
- **Telemedicine:** `telemedicine_sessions` (new)
- **Emergency:** `emergency_cases`, `beds` (new)
- **Notifications & Audit:** `notifications`, `audit_logs` (new)

## 2. Row Level Security (RLS) Policies

For each new portal, RLS policies must be strictly implemented to prevent cross-tenant data leaks.

### Patient Portal (`PATIENT` role)
- **SELECT**: Can only read their own profile, appointments, medical records, prescriptions, lab reports, insurance claims, invoices, and tele-sessions (`WHERE patient_id = auth.uid()`).
- **INSERT/UPDATE**: Can only update their profile details, book appointments, and submit insurance claims.

### Pharmacy Portal (`PHARMACIST` role)
- **SELECT/UPDATE**: Full access to `medicines`, `pharmacy_orders`, `vendors`, and `prescriptions`.
- **INSERT/DELETE**: Can manage inventory items and vendors.

### Laboratory Portal (`TESTER` / `LAB` role)
- **SELECT/UPDATE**: Access to `lab_tests` and `lab_reports`.
- **INSERT**: Can upload and verify `lab_reports`.

### Insurance Portal (`INSURANCE` role)
- **SELECT/UPDATE**: Full access to `insurance_policies` and `insurance_claims`. Can approve/reject claims.

### Billing Portal (`BILLING` role)
- **SELECT/UPDATE**: Full access to `invoices`, `payments`, and `refunds`.

### Reception Portal (`RECEPTION` role)
- **SELECT/UPDATE**: Access to `walk_in_queue`, `appointments` (for today), and doctor availability.

### Telemedicine Portal (`TELEMEDICINE` role)
- **SELECT/UPDATE**: Access to `telemedicine_sessions`.         

### Emergency Portal (`EMERGENCY` role)
- **SELECT/UPDATE**: Access to `emergency_cases` and `beds`.

### Super Admin Portal (`SUPER_ADMIN` role)
- **ALL**: Full access to all tables, including `audit_logs` and role management.
- **ANALYTICS**: Holds all high-level analytics, financial settings, and department management (consolidated approach to avoid RLS complexity).

## 3. Phase 2 Architecture & UI Refactor
Before wiring the database, Phase 2 will commence with a massive UI upgrade:
1. **Corporate Re-design**: Migrating all 8 portals from the playful Phase 1 design to a strict Apollo/Practo corporate style (sharp edges, flat design, minimal gradients).
2. **Dedicated Logins**: Building separate login pages for every module (`/pharmacy/login`, etc.). Only patients get a register page.
3. **Consolidated Administration**: Keeping Staff roles focused on daily tasks, while pushing all department analytics into the Super Admin module.

## 4. Role Constants & Middleware Confirmation

In Phase 1, we added the following new roles to `src/lib/roles.ts` and `src/lib/supabase/middleware.ts`:
- `INSURANCE`
- `BILLING`
- `RECEPTION`
- `TELEMEDICINE`

We also preserved the `TESTER` role for the Lab portal.

**ACTION REQUIRED BEFORE PHASE 2:** Confirm with the product team if these role strings match the Supabase `auth.users` metadata setup or if they need to be adjusted (e.g., changing `TESTER` to `LAB`).

## 4. API Endpoints & Actions

Phase 2 will involve replacing all `useState` data mutations in the portal pages with Next.js Server Actions or API routes, calling the Supabase SSR client.

- Update `collectSample`, `startProcessing`, `completeTest` in Lab portal.
- Update `dispensePrescription`, `addVendor` in Pharmacy portal.
- Update `approveClaim`, `rejectClaim`, `checkCoverage` in Insurance portal.
- Update `collectPayment`, `approveRefund` in Billing portal.
- Update `registerPatient`, `moveUp`, `moveDown`, `markSeen`, `toggleDoctor` in Reception portal.
- Update `joinSession`, `endSession` in Telemedicine portal.
- Update `updateCaseStatus`, `toggleBed` in Emergency portal.
- Update `toggleUserStatus` in Super Admin portal.
- Update patient portal actions (`cancelAppointment`, `payInvoice`, `submitClaim`, `markNotificationRead`).
