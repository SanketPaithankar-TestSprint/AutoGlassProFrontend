# 🎨 Frontend Implementation Plan: Public AI Contact Form with User Slugs

## 📋 Executive Summary

This document outlines the implementation plan for a **public-facing AI contact form** that allows customers to submit vehicle/glass inquiries through a unique URL slug associated with each registered business owner.

### Key URL Pattern:
```
https://yourapp.com/contact/{user_slug}
Examples:
- /contact/joes-auto-glass
- /contact/miami-windshield-pros
- /contact/quick-glass-repair
```

---

## 🏗️ Phase 1: Project Setup & API Layer

### 1.1 Create New API Functions
**Location:** `src/api/publicContactForm.js`

| Function | Purpose | HTTP Method | Endpoint |
|----------|---------|-------------|----------|
| `validateSlug(slug)` | Validate business slug and get business info | GET | `/agp/v1/user-by-slug/{slug}` |
| `sendAiChatMessage(sessionId, message, userId)` | Send chat message to AI | POST | `/agp/v1/ai-chat` |

**Expected Response for `validateSlug`:**
```json
{
  "valid": true,
  "user_id": 123,
  "business_name": "Joe's Auto Glass",
  "logo_url": "https://...",
  "theme_color": "#7E5CFE",
  "tagline": "Fast, Reliable, Affordable"
}
```

**Expected Response for `sendAiChatMessage`:**
```json
{
  "status": "in_progress" | "complete",
  "message": "Thanks John! Now tell me about your vehicle...",
  "action": "ask_year",
  "collected_data": { ... },
  "available_options": { ... } | null,
  "user_id": 42,
  "saved_to_db": true
}
```

### 1.2 Create Utility Functions
**Location:** `src/utils/sessionUtils.js`

| Function | Purpose |
|----------|---------|
| `generateSessionId()` | Generate unique UUID for chat session |
| `getSessionId()` | Get or create session ID from sessionStorage |

---

## 🧩 Phase 2: Component Architecture

### 2.1 New Components Directory Structure
```
src/components/PublicContact/
├── PublicContactRoot.jsx          # Main container with routing
├── SlugValidator.jsx              # Handles slug validation on load
├── NotFoundPage.jsx               # 404 page for invalid slugs
├── BrandedHeader.jsx              # Business logo + name + tagline
├── ProgressIndicator.jsx          # 3-step progress bar
├── ChatContainer.jsx              # Main chat wrapper
│   ├── MessageList.jsx            # Scrollable message history
│   ├── MessageBubble.jsx          # Individual message (AI/User)
│   ├── OptionTiles.jsx            # Clickable option grid
│   ├── GroupedOptionTiles.jsx     # Grouped tiles for glass types
│   └── ChatInput.jsx              # Text input + send button
├── CompletionScreen.jsx           # Thank you + summary screen
└── PublicContactFooter.jsx        # Powered by + links
```

### 2.2 Component Specifications

#### **PublicContactRoot.jsx** (Main Container)
- **Responsibilities:**
  - Extract `slug` from URL params
  - Manage all page-level state
  - Orchestrate child components
  - Handle theme color application

- **State Variables:**
```javascript
const [slug, setSlug] = useState(null);                    // From URL
const [isValidating, setIsValidating] = useState(true);    // Loading state
const [isValidSlug, setIsValidSlug] = useState(false);     // Validation result
const [userId, setUserId] = useState(null);                // From API
const [businessInfo, setBusinessInfo] = useState(null);    // Business branding
const [sessionId, setSessionId] = useState(null);          // Chat session
const [messages, setMessages] = useState([]);              // Chat history
const [isLoading, setIsLoading] = useState(false);         // API loading
const [availableOptions, setAvailableOptions] = useState(null); // Tile options
const [collectedData, setCollectedData] = useState({});    // Form data
const [currentPhase, setCurrentPhase] = useState('info');  // Progress step
const [isComplete, setIsComplete] = useState(false);       // Form done
```

#### **SlugValidator.jsx**
- **Props:** `slug`, `onValidated`, `onInvalid`, `isLoading`
- **Shows:** Loading spinner during validation
- **Behavior:** Calls `validateSlug` API on mount

#### **BrandedHeader.jsx**
- **Props:** `businessName`, `logoUrl`, `tagline`, `themeColor`
- **Shows:** Business logo (or placeholder), name, optional tagline
- **Styling:** Uses `themeColor` for accents

#### **ProgressIndicator.jsx**
- **Props:** `currentPhase`, `themeColor`
- **Steps:** `Your Info` → `Vehicle` → `Glass Type`
- **Styling:** Active step uses `themeColor`

#### **ChatContainer.jsx**
- **Props:** All chat-related state and handlers
- **Contains:** `MessageList`, `OptionTiles`/`GroupedOptionTiles`, `ChatInput`
- **Behavior:** Scrolls to bottom on new messages

#### **MessageBubble.jsx**
- **Props:** `message`, `sender` ('ai' | 'user'), `themeColor`
- **Styling:** 
  - AI: Left-aligned, light background, robot icon
  - User: Right-aligned, `themeColor` background

#### **OptionTiles.jsx**
- **Props:** `options`, `onSelect`, `themeColor`
- **Shows:** Grid of clickable tiles (Makes, Models, Body Styles)
- **Behavior:** Single-select, auto-sends on click

#### **GroupedOptionTiles.jsx**
- **Props:** `groupedOptions`, `onSelect`, `themeColor`
- **Shows:** Grouped tiles by category (e.g., glass types)
- **Behavior:** Click sends immediately (simple mode)

#### **ChatInput.jsx**
- **Props:** `value`, `onChange`, `onSend`, `disabled`, `themeColor`
- **Shows:** Text input with send button
- **Behavior:** Send on Enter or button click

#### **CompletionScreen.jsx**
- **Props:** `businessName`, `collectedData`, `onNewInquiry`, `themeColor`
- **Shows:** 
  - Success checkmark
  - Thank you message
  - Summary card (name, email, phone, vehicle, glass)
  - "Submit Another Inquiry" button

#### **NotFoundPage.jsx**
- **Props:** None
- **Shows:** 
  - "Business not found" message
  - Link back to main site

---

## 🎨 Phase 3: Styling & Theme System

### 3.1 Create Component Styles
**Location:** `src/components/PublicContact/PublicContact.css`

```css
/* CSS Variables for dynamic theming */
.public-contact-page {
  --theme-color: #7E5CFE;  /* Default, overridden by JS */
  --theme-color-light: rgba(126, 92, 254, 0.1);
  --theme-color-dark: #6a4ed4;
}

/* Example theme application */
.user-message {
  background-color: var(--theme-color);
}

.progress-step.active {
  border-color: var(--theme-color);
}
```

### 3.2 Mobile-First Responsive Design

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 600px` (Mobile) | Full-width, 2 tiles/row, fixed input at bottom |
| `600-900px` (Tablet) | Centered container, 3 tiles/row |
| `> 900px` (Desktop) | Centered container (max 700px), 4-5 tiles/row |

### 3.3 Design Tokens
```css
/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

/* Border Radius */
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 20px;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
```

---

## 🔌 Phase 4: Routing Integration

### 4.1 Update App.jsx
Add new public route that doesn't require authentication:

```jsx
// In the public (non-authenticated) routes section:
<Route path="/contact/:slug" element={<PublicContactRoot />} />
```

**Important:** This route should:
- NOT show the main Header/Footer (it has its own branded header/footer)
- NOT require authentication
- Be completely standalone

### 4.2 Route Configuration
The contact form should be a **standalone page** with its own layout:

```jsx
// Check if on contact page
const isContactPage = location.pathname.startsWith('/contact/');

// Render different layout for contact pages
{isContactPage ? (
  <Routes>
    <Route path="/contact/:slug" element={<PublicContactRoot />} />
  </Routes>
) : (
  // Normal layout with Header/Footer
)}
```

---

## 📡 Phase 5: API Integration Flow

### 5.1 Page Load Sequence
```
1. Extract slug from URL
2. Call validateSlug(slug)
   ├── Success → Store userId, businessInfo, generate sessionId
   └── Failure → Show NotFoundPage
3. Display branded header with business info
4. Show initial AI greeting message
5. User can start typing/interacting
```

### 5.2 Chat Message Flow
```
1. User types message or clicks tile
2. Add user message to messages[]
3. Set isLoading = true
4. Call sendAiChatMessage(sessionId, message, userId)
5. On response:
   ├── Add AI message to messages[]
   ├── Update collectedData
   ├── Update currentPhase (from action)
   ├── Set availableOptions (if present)
   └── If status === "complete":
       └── Set isComplete = true, show CompletionScreen
6. Set isLoading = false
```

### 5.3 Phase Determination Logic
```javascript
const determinePhase = (action) => {
  const infoActions = ['ask_name', 'ask_email', 'ask_phone'];
  const vehicleActions = ['ask_year', 'ask_make', 'ask_model', 'ask_body'];
  const glassActions = ['ask_glass', 'confirm'];
  
  if (infoActions.includes(action)) return 'info';
  if (vehicleActions.includes(action)) return 'vehicle';
  if (glassActions.includes(action)) return 'glass';
  return 'info';
};
```

---

## 📋 Phase 6: Implementation Order (Step-by-Step)

### Step 1: API Layer (Day 1)
- [ ] Create `src/api/publicContactForm.js`
- [ ] Implement `validateSlug(slug)` function
- [ ] Implement `sendAiChatMessage(sessionId, message, userId)` function
- [ ] Create `src/utils/sessionUtils.js` with UUID generation

### Step 2: Core Components (Day 2-3)
- [ ] Create `PublicContact/` directory structure
- [ ] Create `NotFoundPage.jsx` (simple, standalone)
- [ ] Create `SlugValidator.jsx` (loading + validation)
- [ ] Create `PublicContactRoot.jsx` with state management
- [ ] Create `BrandedHeader.jsx`
- [ ] Create `ProgressIndicator.jsx`

### Step 3: Chat Components (Day 3-4)
- [ ] Create `MessageBubble.jsx`
- [ ] Create `MessageList.jsx`
- [ ] Create `ChatInput.jsx`
- [ ] Create `ChatContainer.jsx` (integrate above)

### Step 4: Option Tiles (Day 4-5)
- [ ] Create `OptionTiles.jsx` (flat grid)
- [ ] Create `GroupedOptionTiles.jsx` (categorized tiles)
- [ ] Integrate tiles into `ChatContainer.jsx`

### Step 5: Completion & Styling (Day 5-6)
- [ ] Create `CompletionScreen.jsx`
- [ ] Create `PublicContactFooter.jsx`
- [ ] Create `PublicContact.css` with full styling
- [ ] Implement responsive design
- [ ] Apply theme color dynamically

### Step 6: Routing & Testing (Day 6-7)
- [ ] Update `App.jsx` with new route
- [ ] Test slug validation (valid + invalid)
- [ ] Test full chat flow
- [ ] Test mobile responsiveness
- [ ] Test completion screen

---

## 🎯 Key Implementation Notes

### Note 1: No Authentication Required
This page is completely public. Do NOT import `getValidToken` or check for authentication.

### Note 2: Session ID Persistence
Generate `sessionId` once per page visit and store in sessionStorage. This allows the conversation to persist if the user refreshes the page accidentally.

### Note 3: Theme Color Application
Apply the business's `theme_color` using CSS variables:
```jsx
useEffect(() => {
  if (businessInfo?.theme_color) {
    document.documentElement.style.setProperty('--theme-color', businessInfo.theme_color);
  }
}, [businessInfo]);
```

### Note 4: Graceful Fallbacks
- If `logo_url` is missing, show a placeholder or just the business name
- If `theme_color` is missing, use default `#7E5CFE`
- If `tagline` is missing, use "Get Your Free Quote"

### Note 5: Initial Message
The initial AI greeting should include the business name:
```javascript
const initialMessage = {
  id: 1,
  text: `Hi! Welcome to ${businessInfo.business_name}. I'm here to help you get a quick quote for your auto glass needs. Let's start with your contact information - what's your name?`,
  sender: 'ai'
};
```

---

## 📊 File Summary

| File | Type | Status |
|------|------|--------|
| `src/api/publicContactForm.js` | API | To Create |
| `src/utils/sessionUtils.js` | Utility | To Create |
| `src/components/PublicContact/PublicContactRoot.jsx` | Component | To Create |
| `src/components/PublicContact/SlugValidator.jsx` | Component | To Create |
| `src/components/PublicContact/NotFoundPage.jsx` | Component | To Create |
| `src/components/PublicContact/BrandedHeader.jsx` | Component | To Create |
| `src/components/PublicContact/ProgressIndicator.jsx` | Component | To Create |
| `src/components/PublicContact/ChatContainer.jsx` | Component | To Create |
| `src/components/PublicContact/MessageList.jsx` | Component | To Create |
| `src/components/PublicContact/MessageBubble.jsx` | Component | To Create |
| `src/components/PublicContact/OptionTiles.jsx` | Component | To Create |
| `src/components/PublicContact/GroupedOptionTiles.jsx` | Component | To Create |
| `src/components/PublicContact/ChatInput.jsx` | Component | To Create |
| `src/components/PublicContact/CompletionScreen.jsx` | Component | To Create |
| `src/components/PublicContact/PublicContactFooter.jsx` | Component | To Create |
| `src/components/PublicContact/PublicContact.css` | Styles | To Create |
| `src/App.jsx` | Routing | To Modify |

**Total: 16 new files, 1 modified file**

---

## ⏱️ Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 0.5 day | API Layer |
| Phase 2 | 2 days | Core Components |
| Phase 3 | 1 day | Styling System |
| Phase 4 | 0.5 day | Routing |
| Phase 5 | 1 day | API Integration |
| Phase 6 | 1 day | Testing & Polish |

**Total Estimated Time: 6 days**

---

## ✅ Acceptance Criteria

1. ✅ URL `/contact/{slug}` loads and validates the slug
2. ✅ Invalid slugs show a friendly 404 page
3. ✅ Valid slugs display business branding (name, logo, colors)
4. ✅ Chat interface allows text input and tile selection
5. ✅ Messages display correctly (AI left, user right)
6. ✅ Progress indicator updates based on current phase
7. ✅ Options tiles display and trigger message on click
8. ✅ Completion screen shows summary when done
9. ✅ Page is fully responsive (mobile, tablet, desktop)
10. ✅ No authentication required to access
11. ✅ Theme colors apply from business settings

---

## 🚀 Ready to Implement?

Once you approve this plan, I'll begin implementation starting with **Phase 1: API Layer**.

**Please confirm:**
1. Is the backend API ready? (`GET /agp/v1/user-by-slug/{slug}` and `POST /agp/v1/ai-chat`)
2. Any modifications to the component structure?
3. Any specific design preferences (colors, animations)?
4. Should I proceed with implementation?
