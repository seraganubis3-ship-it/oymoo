# API Documentation

## USER ROUTES

### POST /api/auth/login
**Auth required:** None
**Role required:** any
**Request body:** 
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| phone | string | Yes | 10-digit Saudi number starting with 05 |
| password | string | Yes | User's password |
**Response success:** `{ "success": true, "redirectTo": "/dashboard" }` (or `/setup` if no profile exists)
**Response errors:** 400 (Invalid credentials), 403 (Account blocked)
**Side effects:** Sets `oymo_user_token` httpOnly cookie.

### POST /api/auth/logout
**Auth required:** None
**Role required:** any
**Request body:** Empty
**Response success:** `{ "success": true }`
**Side effects:** Clears `oymo_user_token` cookie.

### POST /api/user/setup
**Auth required:** User JWT
**Role required:** any
**Request body:** FormData
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| firstSessionDate | date string | Yes | YYYY-MM-DD |
| preferredTime | time string | Yes | HH:MM |
| photo | File | No | Before photo |
**Response success:** `{ "success": true }`
**Response errors:** 400 (Missing data, profile exists), 500 (Upload fail)
**Side effects:** Uploads photo to B2, creates `Profile`, runs `generateSessions()`.

### POST /api/user/session/[id]/complete
**Auth required:** User JWT
**Role required:** any
**Request body:** FormData
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| photo | File | Yes | Progress photo |
**Response success:** `{ "success": true }`
**Response errors:** 400 (Photo missing), 404 (Session not found)
**Side effects:** Uploads photo to B2, sets `completedAt` to current date.

---

## ADMIN AUTH

### POST /api/admin/auth/login
**Auth required:** None
**Role required:** admin or super_admin
**Request body:** 
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| phone | string | Yes | Admin phone number |
| password | string | Yes | Admin password |
**Response success:** `{ "success": true }`
**Side effects:** Sets `oymo_admin_token` cookie.

### POST /api/admin/auth/logout
**Auth required:** None
**Side effects:** Clears `oymo_admin_token` cookie.

---

## ADMIN USERS

### GET /api/admin/users
**Auth required:** Admin JWT
**Query params:** `page`, `search`, `filter`, `sort`
**Response success:** `{ "users": [...], "total": 10, "page": 1, "pages": 1 }`

### POST /api/admin/users
**Auth required:** Admin JWT
**Request body:** `{ name, phone, password }`
**Response success:** `{ "success": true, "userId": "cuid..." }`
**Side effects:** Creates user, logs `create_user`.

### PUT /api/admin/users/[id]
**Auth required:** Admin JWT
**Request body:** `{ name?, phone?, password? }`
**Response success:** `{ "success": true }`
**Side effects:** Updates user, logs `update_user`.

### POST /api/admin/users/[id]/block
**Auth required:** Admin JWT
**Response success:** `{ "success": true, "isBlocked": boolean }`
**Side effects:** Toggles block status, logs `block_user`/`unblock_user`.

### DELETE /api/admin/users/[id]
**Auth required:** Admin JWT
**Role required:** super_admin
**Response success:** `{ "success": true }`
**Side effects:** Cascades delete on User/Profile/Sessions. Logs `delete_user`.

### POST /api/admin/users/[id]/reset-sessions
**Auth required:** Admin JWT
**Response success:** `{ "success": true }`
**Side effects:** Clears all completed dates/photos. Logs `reset_sessions`.

---

## ADMIN SESSIONS

### GET /api/admin/sessions
**Auth required:** Admin JWT
**Query params:** `page`, `from`, `to`, `status`
**Response success:** `{ "sessions": [...], "total": X }`

### POST /api/admin/sessions/[id]/complete
**Auth required:** Admin JWT
**Request body:** `{ completedAt: date }`
**Response success:** `{ "success": true }`
**Side effects:** Marks session complete. Logs `complete_session`.

### POST /api/admin/sessions/[id]/reset
**Auth required:** Admin JWT
**Response success:** `{ "success": true }`
**Side effects:** Deletes photo from B2, resets session. Logs `reset_session`.

---

## ADMIN SETTINGS

### GET /api/admin/settings
**Auth required:** Admin JWT
**Response success:** Array of AppSettings objects.

### PATCH /api/admin/settings
**Auth required:** Admin JWT
**Request body:** `{ settings: [{ key, value }] }`
**Response success:** `{ "success": true }`
**Side effects:** Updates settings, clears cache, logs `change_setting`.

---

## ADMIN OTHER

### GET /api/admin/stats
**Auth required:** Admin JWT
**Response success:** `{ totalUsers, activeUsers, totalSessions, completedSessions }`

### GET /api/admin/admins
**Auth required:** Admin JWT
**Response success:** Array of Admin objects.

### POST /api/admin/admins
**Auth required:** Admin JWT
**Role required:** super_admin
**Request body:** `{ name, phone, password, role }`

### DELETE /api/admin/admins/[id]
**Auth required:** Admin JWT
**Role required:** super_admin

### GET /api/admin/logs
**Auth required:** Admin JWT
**Query params:** `page`, `action`
**Response success:** `{ "logs": [...], "total": X }`
