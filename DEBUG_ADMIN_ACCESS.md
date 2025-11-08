# Debugging Admin Route Access from UI

## Issue
Admin routes work in Postman but not in the UI.

## What I've Fixed

### 1. Enhanced Error Handling in AdminDashboard
- Added detailed console logging to track the API request/response
- Improved error messages to show what went wrong
- Added support for different response structures

### 2. Improved API Service Error Handling
- Added specific handling for 403 Forbidden errors
- Added logging for token presence
- Better error messages

### 3. Response Structure Handling
The component now handles both response structures:
- `res.data.data` (nested structure)
- `res.data` (direct structure)

## How to Debug

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Navigate to `/admin` in your app

### Step 2: Check Console Logs
Look for these log messages:
- `"Fetching admin sales stats..."`
- `"API Request - Token found, adding Authorization header"` (or warning if no token)
- `"API Request: ..."`
- `"API Response: ..."`
- `"Admin sales stats response: ..."`

### Step 3: Common Issues and Solutions

#### Issue 1: No Token Found
**Symptoms:**
- Console shows: `"API Request - No token found in localStorage"`
- Error: "Not authorized" (401)

**Solution:**
1. Make sure you're logged in
2. Check if token exists: In browser console, run `localStorage.getItem("authToken")`
3. If token doesn't exist, log out and log back in

#### Issue 2: Token Expired or Invalid
**Symptoms:**
- Console shows: `"401 Unauthorized"`
- Error: "Token expired" or "Invalid token"

**Solution:**
1. Log out and log back in
2. If you recently changed your role to ADMIN, you MUST log out and back in for the new role to take effect

#### Issue 3: User Not Admin
**Symptoms:**
- Console shows: `"403 Forbidden - User does not have required permissions"`
- Error: "Access denied: Admins only"
- Console shows: `"User role: USER, required: ADMIN"`

**Solution:**
1. Promote your user to ADMIN:
   ```bash
   cd be/shrivesta-backend
   npm run make-admin <your-email>
   ```
2. Log out and log back in (important!)

#### Issue 4: Response Structure Mismatch
**Symptoms:**
- Console shows response but data is empty
- No error message, but stats don't display

**Solution:**
- Check the console log: `"Admin sales stats response:"`
- The response structure should be handled automatically now
- If you see the data in the response but it's not displaying, check the structure

#### Issue 5: CORS Issues
**Symptoms:**
- Console shows: `"Failed to fetch"`
- Network tab shows CORS error

**Solution:**
1. Make sure backend is running on port 3000
2. Make sure frontend is configured to use the correct API URL
3. Check backend CORS configuration

### Step 4: Check Network Tab
1. Open Developer Tools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for the request to `/admin/stats/sales`
4. Check:
   - Request Headers: Should include `Authorization: Bearer <token>`
   - Response Status: Should be 200 (not 401 or 403)
   - Response Body: Should contain the sales data

### Step 5: Verify Backend is Running
1. Check if backend is running: `http://localhost:3000/health`
2. Should return: `{ "status": "ok", "message": "Server is running" }`

## Testing Checklist

- [ ] Backend server is running on port 3000
- [ ] Frontend is running and can make API calls
- [ ] User is logged in (token exists in localStorage)
- [ ] User has ADMIN role (check with make-admin script)
- [ ] User logged out and back in after role change
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API request with 200 status
- [ ] Response contains sales data

## Quick Test in Browser Console

Run this in your browser console (on the admin page):

```javascript
// Check if token exists
console.log("Token:", localStorage.getItem("authToken"));

// Manually test the API call
fetch('http://localhost:3000/api/v1/admin/stats/sales', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem("authToken")}`
  }
})
.then(r => r.json())
.then(data => console.log("Response:", data))
.catch(err => console.error("Error:", err));
```

This will help you see exactly what the backend is returning.

