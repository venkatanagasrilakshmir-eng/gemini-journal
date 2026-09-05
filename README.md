# ReflectAI: User-Authenticated Journal & Gemini Reflections

A secure, full-stack personal reflection and journaling application built with React, Vite, Express, Cloud Firestore, and the Gemini 3.6 Flash API.

---

## 1. Threat Summary & Security Controls

| Threat Zone | Identified Threat | Countermeasure & Implementation |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious injection, oversized payloads, malformed JSON | `express.json({ limit: '2mb' })` with defensive destructuring and string sanitization before processing. |
| **Planning & Reasoning** | Prompt injection / jailbreak attempts to bypass journal scope | Strict system prompt framing, role boundary isolation, and structured conversational turns. |
| **Tool Execution** | SSRF or unauthorized execution risks | No arbitrary code execution or unauthenticated outbound webhooks; server-authoritative API proxy. |
| **Memory & State** | Cross-user data leaks or unauthorized document reads/writes | Strict owner-bound Firestore security rules (`request.auth.uid == userId`) isolating `users/{userId}/interactions/{id}`. Undefined-stripping sanitation before writes. |
| **Inter-System Communication** | Gemini API key leakage to browser client | All Gemini API calls are securely proxied through the server-side (`server.ts`). Keys are injected via environment variables or Secret Manager, never exposed in client bundles. |

---

## 2. Cloud Firestore Security Rules

To enforce strict user-level data isolation where users cannot read or modify another user's reflections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User root profile document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User interactions and journal entries isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Recursive rule for any user subcollections
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploying via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 3. Secret Manager Bindings

Store the `GEMINI_API_KEY` securely in Google Cloud Secret Manager and grant Cloud Run access:

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Google Cloud Run Deployment Flow

Deploy the containerized full-stack application to Cloud Run with automatic Secret Manager integration:

```bash
# Build and deploy to Cloud Run
gcloud run deploy reflective-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### Mandatory Verification Binding

Apply the mandatory challenge resource label to register the service for automated verification:

```bash
gcloud run services update reflective-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 5. Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. **Production Build & Verification**:
   ```bash
   npm run build
   npm start
   ```

---

## 6. Architecture & Gemini Model Resilience Ladder

The backend implements an automated fallback ladder catching recoverable status codes (`503`, `429`, `404`, `500`):
1. **Primary**: `gemini-3.6-flash`
2. **High-Availability Fallback**: `gemini-3.1-flash-lite`
3. **Dynamic Alias**: `gemini-flash-latest`
4. **Deep Reasoning Fallback**: `gemini-3.7-flash`
