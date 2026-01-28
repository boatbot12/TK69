# Technical Specification - LINE LIFF Influencer Marketing Platform

## 1. Overview

This document provides the technical specifications for the **1st MVP Sprint** of the LINE LIFF Influencer Marketing Platform. The sprint focuses on three core features:

1. **Registration Flow** - Complete 3-step wizard with Thai address autocomplete
2. **Campaign Dashboard** - Sorted list view with priority logic
3. **Campaign Detail** - Timeline view with Google Drive link validation

---

## 2. API Specifications

### 2.1 Authentication API

#### POST `/api/v1/auth/line-login/`

Authenticate user via LINE LIFF ID Token.

**Request:**

```json
{
  "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access_token": "optional_access_token"
}
```

**Response (200 OK):**

```json
{
  "token": "jwt_auth_token_here",
  "user": {
    "id": 1,
    "line_user_id": "U1234567890abcdef",
    "display_name": "John Doe",
    "picture_url": "https://profile.line-scdn.net/...",
    "status": "NEW",
    "has_profile": false
  }
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "invalid_token",
  "message": "LINE ID token is invalid or expired"
}
```

---

#### GET `/api/v1/auth/me/`

Get current authenticated user's information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "line_user_id": "U1234567890abcdef",
  "display_name": "John Doe",
  "picture_url": "https://profile.line-scdn.net/...",
  "status": "APPROVED",
  "profile": {
    "id": 1,
    "full_name_th": "สมชาย ใจดี",
    "full_name_en": "Somchai Jaidee",
    "interests": ["fashion", "food", "travel"]
  }
}
```

---

### 2.2 Registration API

#### GET `/api/v1/register/interests/`

List all available interest categories.

**Response (200 OK):**

```json
{
  "interests": [
    {
      "id": "fashion",
      "name": "Fashion & Beauty",
      "name_th": "แฟชั่นและความงาม",
      "icon": "✨"
    },
    {
      "id": "food",
      "name": "Food & Dining",
      "name_th": "อาหารและร้านอาหาร",
      "icon": "🍽️"
    },
    {
      "id": "travel",
      "name": "Travel & Lifestyle",
      "name_th": "ท่องเที่ยวและไลฟ์สไตล์",
      "icon": "✈️"
    },
    {
      "id": "tech",
      "name": "Tech & Gaming",
      "name_th": "เทคโนโลยีและเกม",
      "icon": "🎮"
    },
    {
      "id": "health",
      "name": "Health & Fitness",
      "name_th": "สุขภาพและฟิตเนส",
      "icon": "💪"
    },
    {
      "id": "entertainment",
      "name": "Entertainment",
      "name_th": "ความบันเทิง",
      "icon": "🎬"
    },
    {
      "id": "home",
      "name": "Home & Living",
      "name_th": "บ้านและการใช้ชีวิต",
      "icon": "🏠"
    },
    {
      "id": "education",
      "name": "Education",
      "name_th": "การศึกษา",
      "icon": "📚"
    },
    {
      "id": "pets",
      "name": "Pets & Animals",
      "name_th": "สัตว์เลี้ยง",
      "icon": "🐾"
    },
    {
      "id": "others",
      "name": "Others",
      "name_th": "อื่นๆ",
      "icon": "💡"
    }
  ]
}
```

---

#### POST `/api/v1/register/submit/`

Submit complete registration form (multipart/form-data).

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `interests` | string | Yes | JSON array of interest IDs, e.g., `["fashion","food"]` |
| `allow_boost` | boolean | Yes | Allow post boosting |
| `boost_price` | number | Conditional | Required if allow_boost is true |
| `allow_original_file` | boolean | Yes | Allow original file sharing |
| `original_file_price` | number | Conditional | Required if allow_original_file is true |
| `full_name_th` | string | Yes | Thai full name |
| `full_name_en` | string | Yes | English full name |
| `phone` | string | Yes | Phone number (10 digits) |
| `email` | string | No | Email address |
| `date_of_birth` | string | Yes | YYYY-MM-DD format |
| `house_no` | string | Yes | House number |
| `village` | string | No | Village/Building name |
| `moo` | string | No | Moo (Village number) |
| `soi` | string | No | Soi (Lane) |
| `road` | string | No | Road name |
| `sub_district` | string | Yes | Sub-district name |
| `district` | string | Yes | District name |
| `province` | string | Yes | Province name |
| `zipcode` | string | Yes | 5-digit zipcode |
| `id_card_front` | file | Yes | ID card front image (JPG/PNG/PDF, max 5MB) |
| `id_card_back` | file | Yes | ID card back image (JPG/PNG/PDF, max 5MB) |
| `bank_book` | file | Yes | Bank book image (JPG/PNG/PDF, max 5MB) |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Registration submitted successfully",
  "user": {
    "id": 1,
    "status": "PENDING"
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "errors": {
    "phone": ["Phone number must be 10 digits"],
    "interests": ["Select at least 1 and at most 3 interests"],
    "id_card_front": ["File size exceeds 5MB limit"]
  }
}
```

---

### 2.3 Campaign API

#### GET `/api/v1/campaigns/`

List all campaigns with sorting priority.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `status` | string | all | Filter by status: `open`, `closed`, `all` |

**Sorting Priority Logic:**

```python
# Priority Order (implemented in queryset)
SORT_PRIORITY = {
    'ACTIVE': 1,        # User is actively working on this
    'PENDING_REVIEW': 2, # User submitted, awaiting review
    'OPEN': 3,          # Open for applications
    'CLOSED': 4         # No longer accepting
}

# SQL equivalent
ORDER BY 
    CASE 
        WHEN user_has_active_application THEN 1
        WHEN user_has_pending_submission THEN 2
        WHEN status = 'OPEN' THEN 3
        ELSE 4
    END,
    application_deadline ASC
```

**Response (200 OK):**

```json
{
  "count": 45,
  "page": 1,
  "total_pages": 3,
  "results": [
    {
      "id": 101,
      "title": "Summer Fashion Campaign 2026",
      "brand_name": "Fashion Brand X",
      "brand_logo": "https://storage.example.com/brands/fashion-x.png",
      "description": "Looking for fashion influencers...",
      "budget_range": "฿5,000 - ฿15,000",
      "application_deadline": "2026-02-01",
      "content_deadline": "2026-02-15",
      "campaign_status": "OPEN",
      "user_status": null,
      "priority": 3
    },
    {
      "id": 102,
      "title": "Food Review Campaign",
      "brand_name": "Restaurant Chain Y",
      "brand_logo": "https://storage.example.com/brands/restaurant-y.png",
      "description": "Food bloggers needed...",
      "budget_range": "฿3,000 - ฿8,000",
      "application_deadline": "2026-01-25",
      "content_deadline": "2026-02-10",
      "campaign_status": "OPEN",
      "user_status": "WORK_IN_PROGRESS",
      "priority": 1
    }
  ]
}
```

---

#### GET `/api/v1/campaigns/{id}/`

Get campaign detail with timeline.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "id": 102,
  "title": "Food Review Campaign",
  "brand_name": "Restaurant Chain Y",
  "brand_logo": "https://storage.example.com/brands/restaurant-y.png",
  "description": "We are looking for food bloggers to review our new menu items...",
  "full_description": "Detailed campaign brief with requirements...",
  "budget_min": 3000,
  "budget_max": 8000,
  "application_deadline": "2026-01-25",
  "content_deadline": "2026-02-10",
  "status": "OPEN",
  "requirements": {
    "min_followers": 5000,
    "platforms": ["instagram", "tiktok"],
    "content_type": "video",
    "hashtags": ["#FoodReview", "#RestaurantY"]
  },
  "timeline_stages": [
    {
      "id": "brief",
      "name": "Brief",
      "name_th": "รับบรีฟ",
      "icon": "📋",
      "description": "Review campaign brief and requirements"
    },
    {
      "id": "script",
      "name": "Script",
      "name_th": "สคริปต์",
      "icon": "📝",
      "description": "Submit content script for approval"
    },
    {
      "id": "draft",
      "name": "Draft",
      "name_th": "Draft",
      "icon": "🎬",
      "description": "Submit draft content for review"
    },
    {
      "id": "final",
      "name": "Final",
      "name_th": "เผยแพร่",
      "icon": "✅",
      "description": "Publish final content"
    }
  ],
  "user_application": {
    "id": 501,
    "status": "WORK_IN_PROGRESS",
    "current_stage": "brief",
    "applied_at": "2026-01-15T10:30:00Z",
    "submissions": {
      "script": null,
      "draft": null,
      "final": null
    }
  }
}
```

---

#### POST `/api/v1/campaigns/{id}/apply/`

Apply to a campaign.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request:**

```json
{
  "note": "I would love to participate in this campaign..."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "application": {
    "id": 501,
    "campaign_id": 102,
    "status": "WAITING",
    "applied_at": "2026-01-16T14:00:00Z"
  }
}
```

**Response (403 Forbidden - User not approved):**

```json
{
  "error": "user_not_approved",
  "message": "You must be approved before applying to campaigns"
}
```

---

### 2.4 Submission API

#### POST `/api/v1/applications/{id}/submit/`

Submit work for a specific stage.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "stage": "script",
  "link": "https://docs.google.com/document/d/abc123...",
  "notes": "Here is my script draft for review"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "submission": {
    "stage": "script",
    "link": "https://docs.google.com/document/d/abc123...",
    "submitted_at": "2026-01-16T15:00:00Z",
    "status": "pending"
  },
  "application_status": "SUBMITTED_SCRIPT"
}
```

---

### 2.5 Google Drive Link Validator API

#### POST `/api/v1/validate-drive-link/`

Validate if a Google Drive link is publicly accessible.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "link": "https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing"
}
```

**Validation Logic:**

```python
import requests

def validate_drive_link(link: str) -> dict:
    """
    Validate Google Drive link accessibility.
    
    Logic:
    1. Extract file ID from various Google Drive URL formats
    2. Send HEAD request to the direct download URL
    3. Check HTTP response code
    
    Returns:
        {
            "valid": bool,
            "accessible": bool,
            "message": str
        }
    """
    
    # Extract file ID from URL
    file_id = extract_file_id(link)
    if not file_id:
        return {
            "valid": False,
            "accessible": False,
            "message": "Invalid Google Drive URL format"
        }
    
    # Construct direct access URL
    check_url = f"https://drive.google.com/uc?id={file_id}"
    
    try:
        response = requests.head(
            check_url, 
            allow_redirects=True, 
            timeout=10
        )
        
        if response.status_code == 200:
            return {
                "valid": True,
                "accessible": True,
                "message": "Link is publicly accessible"
            }
        elif response.status_code == 403:
            return {
                "valid": True,
                "accessible": False,
                "message": "Link is private or restricted. Please enable public access."
            }
        else:
            return {
                "valid": True,
                "accessible": False,
                "message": f"Unable to access link (HTTP {response.status_code})"
            }
            
    except requests.Timeout:
        return {
            "valid": True,
            "accessible": None,
            "message": "Request timed out. Please try again."
        }
    except requests.RequestException as e:
        return {
            "valid": False,
            "accessible": None,
            "message": f"Error checking link: {str(e)}"
        }
```

**Response (200 OK - Link is Public):**

```json
{
  "valid": true,
  "accessible": true,
  "message": "Link is publicly accessible"
}
```

**Response (200 OK - Link is Private):**

```json
{
  "valid": true,
  "accessible": false,
  "message": "Link is private or restricted. Please enable public access."
}
```

**Response (200 OK - Invalid URL):**

```json
{
  "valid": false,
  "accessible": false,
  "message": "Invalid Google Drive URL format"
}
```

---

## 3. State Machines

### 3.1 User Status State Machine

```mermaid
stateDiagram-v2
    [*] --> NEW: User created via LINE login
    NEW --> PENDING: Submit registration
    PENDING --> APPROVED: Admin approves
    PENDING --> REJECTED: Admin rejects
    REJECTED --> PENDING: User resubmits (if allowed)
    APPROVED --> [*]
```

**Transition Rules:**

| From | To | Trigger | Conditions |
|------|----|---------|------------|
| `NEW` | `PENDING` | `submit_registration()` | Valid form data, files uploaded |
| `PENDING` | `APPROVED` | `admin_approve()` | Admin action |
| `PENDING` | `REJECTED` | `admin_reject()` | Admin action with reason |
| `REJECTED` | `PENDING` | `resubmit()` | If resubmission allowed |

**Status Permission Matrix:**

| Status | Can Access Jobs | Can Apply | Can Edit Profile |
|--------|-----------------|-----------|------------------|
| `NEW` | ❌ | ❌ | N/A |
| `PENDING` | ❌ | ❌ | ❌ |
| `APPROVED` | ✅ | ✅ | ✅ |
| `REJECTED` | ❌ | ❌ | ❌ |

---

### 3.2 Campaign Application Status State Machine

```mermaid
stateDiagram-v2
    [*] --> WAITING: User applies
    WAITING --> APPROVED: Admin approves application
    WAITING --> REJECTED: Admin rejects application
    APPROVED --> WORK_IN_PROGRESS: Auto-transition
    WORK_IN_PROGRESS --> SUBMITTED_SCRIPT: Submit script
    SUBMITTED_SCRIPT --> SCRIPT_APPROVED: Admin approves
    SUBMITTED_SCRIPT --> WORK_IN_PROGRESS: Admin requests revision
    SCRIPT_APPROVED --> SUBMITTED_DRAFT: Submit draft
    SUBMITTED_DRAFT --> DRAFT_APPROVED: Admin approves
    SUBMITTED_DRAFT --> SCRIPT_APPROVED: Admin requests revision
    DRAFT_APPROVED --> SUBMITTED_FINAL: Submit final
    SUBMITTED_FINAL --> COMPLETED: Admin approves
    SUBMITTED_FINAL --> DRAFT_APPROVED: Admin requests revision
    COMPLETED --> [*]
    REJECTED --> [*]
```

**Transition Table:**

| Current Status | Action | Next Status | Actor |
|---------------|--------|-------------|-------|
| `WAITING` | approve | `APPROVED` → `WORK_IN_PROGRESS` | Admin |
| `WAITING` | reject | `REJECTED` | Admin |
| `WORK_IN_PROGRESS` | submit_script | `SUBMITTED_SCRIPT` | User |
| `SUBMITTED_SCRIPT` | approve | `SCRIPT_APPROVED` | Admin |
| `SUBMITTED_SCRIPT` | request_revision | `WORK_IN_PROGRESS` | Admin |
| `SCRIPT_APPROVED` | submit_draft | `SUBMITTED_DRAFT` | User |
| `SUBMITTED_DRAFT` | approve | `DRAFT_APPROVED` | Admin |
| `SUBMITTED_DRAFT` | request_revision | `SCRIPT_APPROVED` | Admin |
| `DRAFT_APPROVED` | submit_final | `SUBMITTED_FINAL` | User |
| `SUBMITTED_FINAL` | approve | `COMPLETED` | Admin |
| `SUBMITTED_FINAL` | request_revision | `DRAFT_APPROVED` | Admin |

---

## 4. Frontend Technical Specifications

### 4.1 LIFF Integration

#### Mock LIFF Service

```javascript
// src/services/liff.js

const MOCK_USER = {
  userId: "U_DEV_12345",
  displayName: "Dev User",
  pictureUrl: "https://via.placeholder.com/150",
};

const MOCK_MODE = import.meta.env.VITE_MOCK_LIFF === 'true';

export const initializeLiff = async () => {
  if (MOCK_MODE) {
    console.log('[LIFF] Running in Mock Mode');
    return {
      isLoggedIn: true,
      isMock: true,
    };
  }
  
  await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
  
  if (!liff.isLoggedIn()) {
    liff.login();
    return { isLoggedIn: false };
  }
  
  return {
    isLoggedIn: true,
    isMock: false,
  };
};

export const getProfile = async () => {
  if (MOCK_MODE) {
    return MOCK_USER;
  }
  return await liff.getProfile();
};

export const getAccessToken = () => {
  if (MOCK_MODE) {
    return 'mock_access_token';
  }
  return liff.getAccessToken();
};

export const getIdToken = () => {
  if (MOCK_MODE) {
    return 'mock_id_token';
  }
  return liff.getIDToken();
};
```

### 4.2 Protected Route Component

```jsx
// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredStatus = ['APPROVED'],
  redirectTo = null 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Determine redirect based on user status
  const getRedirectPath = () => {
    switch (user.status) {
      case 'NEW':
        return '/register';
      case 'PENDING':
        return '/waiting';
      case 'REJECTED':
        return '/rejected';
      default:
        return redirectTo || '/jobs';
    }
  };
  
  if (!requiredStatus.includes(user.status)) {
    return <Navigate to={getRedirectPath()} replace />;
  }
  
  return children;
};
```

### 4.3 Thai Address Autocomplete Integration

```javascript
// src/utils/thaiAddress.js

import { 
  searchAddressByDistrict, 
  searchAddressByZipcode,
  getProvinces,
  getDistrictsOfProvince,
  getSubDistrictsOfDistrict
} from 'thai-address-database';

export const searchAddress = (query, type = 'auto') => {
  // Determine search type based on query
  const isZipcodeQuery = /^\d{1,5}$/.test(query);
  
  if (isZipcodeQuery || type === 'zipcode') {
    return searchAddressByZipcode(query);
  }
  
  return searchAddressByDistrict(query);
};

export const formatAddressOption = (address) => ({
  value: address,
  label: `${address.district}, ${address.amphoe}, ${address.province} ${address.zipcode}`,
  subDistrict: address.district,      // ตำบล/แขวง
  district: address.amphoe,           // อำเภอ/เขต
  province: address.province,         // จังหวัด
  zipcode: address.zipcode.toString(),
});
```

### 4.4 localStorage Persistence Hook

```javascript
// src/hooks/useLocalStorage.js

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export const useRegistrationStorage = (key = 'registration_draft') => {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {
        step: 1,
        data: {
          interests: [],
          workConditions: {},
          personalInfo: {}
        },
        lastUpdated: null
      };
    } catch {
      return { step: 1, data: {}, lastUpdated: null };
    }
  });
  
  // Debounced save function
  const saveToStorage = useCallback(
    debounce((newData) => {
      try {
        const toSave = {
          ...newData,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(toSave));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, 500),
    [key]
  );
  
  // Update data and trigger save
  const updateData = useCallback((updates) => {
    setData(prev => {
      const updated = {
        ...prev,
        data: { ...prev.data, ...updates.data },
        step: updates.step ?? prev.step
      };
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);
  
  // Clear storage on successful submission
  const clearStorage = useCallback(() => {
    localStorage.removeItem(key);
    setData({ step: 1, data: {}, lastUpdated: null });
  }, [key]);
  
  return { data, updateData, clearStorage };
};
```

---

## 5. Validation Rules

### 5.1 Registration Form Validation

| Field | Rules | Error Message |
|-------|-------|---------------|
| `interests` | Array, min 1, max 3 | "Select 1-3 interests" |
| `boost_price` | Required if allow_boost, positive integer | "Please enter boost price" |
| `original_file_price` | Required if allow_original_file, positive integer | "Please enter original file price" |
| `full_name_th` | Required, Thai chars only, max 100 | "Please enter Thai name" |
| `full_name_en` | Required, English chars only, max 100 | "Please enter English name" |
| `phone` | Required, 10 digits, starts with 0 | "Invalid phone number" |
| `email` | Optional, valid email format | "Invalid email format" |
| `date_of_birth` | Required, 18+ years old | "Must be 18 or older" |
| `house_no` | Required, max 50 chars | "Please enter house number" |
| `sub_district` | Required, valid Thai sub-district | "Please select sub-district" |
| `district` | Required, valid Thai district | "Please select district" |
| `province` | Required, valid Thai province | "Please select province" |
| `zipcode` | Required, 5 digits | "Invalid zipcode" |
| `id_card_front` | Required, image/pdf, max 5MB | "Please upload ID card front" |
| `id_card_back` | Required, image/pdf, max 5MB | "Please upload ID card back" |
| `bank_book` | Required, image/pdf, max 5MB | "Please upload bank book" |

### 5.2 Google Drive Link Validation

**Supported URL Formats:**

```javascript
const DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/,
];

export const extractFileId = (url) => {
  for (const pattern of DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
```

---

## 6. Error Handling

### 6.1 API Error Response Format

**Standard Error Response:**

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Input validation failed |
| `unauthorized` | 401 | Missing or invalid auth token |
| `forbidden` | 403 | User not allowed to perform action |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Resource conflict (e.g., already applied) |
| `server_error` | 500 | Internal server error |

### 6.2 Frontend Error Handling

```javascript
// src/services/api.js

export const apiClient = {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message, error.error, error.details);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error. Please check your connection.');
    }
  }
};
```

---

## 7. Performance Considerations

### 7.1 Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| User Profile | React Query | 5 min | On update |
| Interests List | React Query | 24 hours | Never |
| Campaign List | React Query | 1 min | On navigation |
| Registration Draft | localStorage | Permanent | On submit |

### 7.2 Image Upload Optimization

```javascript
// Compress images before upload
export const compressImage = async (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

| Component | Test Coverage Target |
|-----------|---------------------|
| API Services | 80% |
| Utility Functions | 90% |
| State Machines | 100% |
| Validation Functions | 100% |

### 8.2 Integration Tests

| Flow | Priority |
|------|----------|
| LINE Login → Registration → Waiting | P0 |
| Campaign List → Apply → Submit | P0 |
| Google Drive Validation | P0 |
| Admin Approval Flow | P1 |

### 8.3 E2E Tests

| Scenario | Tool |
|----------|------|
| Full Registration Flow | Playwright |
| Campaign Submission Flow | Playwright |
| Mobile Responsiveness | Playwright Mobile |

---

## 9. Appendix

### A. Environment Variables

**Backend:**

```env
# Django
DEBUG=false
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=api.example.com

# Database
DATABASE_URL=postgres://user:pass@host:5432/db

# LINE
LINE_CHANNEL_ID=<channel-id>
LINE_CHANNEL_SECRET=<channel-secret>

# Storage
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_STORAGE_BUCKET_NAME=<bucket>
```

**Frontend:**

```env
VITE_API_URL=https://api.example.com/api/v1
VITE_LIFF_ID=<liff-id>
VITE_MOCK_LIFF=false
```

### B. Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_user_line_id ON users(line_user_id);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_campaign_status ON campaigns(status);
CREATE INDEX idx_campaign_deadline ON campaigns(application_deadline);
CREATE INDEX idx_application_user ON campaign_applications(user_id);
CREATE INDEX idx_application_campaign ON campaign_applications(campaign_id);
CREATE INDEX idx_application_status ON campaign_applications(status);
```
