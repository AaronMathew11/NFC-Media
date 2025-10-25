# Claude Development Reference - React TypeScript + MongoDB + Firebase

**For Claude AI Assistant - Reference for React TypeScript projects with MongoDB backend and Firebase hosting**

---

## 🏗️ STANDARD PROJECT STRUCTURE
```
project/
├── frontend/                 # React TypeScript
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Route components  
│   │   ├── context/        # React contexts
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── backend/                 # Express + MongoDB
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   └── middleware/     # Custom middleware
│   └── package.json
├── firebase.json            # Firebase config
└── netlify.toml            # Netlify config (alternative)
```

---

## 🔧 ESSENTIAL DEPENDENCIES

### Frontend Package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0", 
    "react-router-dom": "^6.8.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### Backend Package.json  
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.9.0",
    "cors": "^2.8.0",
    "dotenv": "^16.0.0"
  },
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

---

## 🗄️ MONGODB PATTERNS

### Standard Model Template
```javascript
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true // Always add this
});

// Add indexes for performance
exampleSchema.index({ email: 1 });
exampleSchema.index({ status: 1 });

module.exports = mongoose.model('Example', exampleSchema);
```

### Database Connection
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

---

## 🌐 API PATTERNS

### Standard Response Format
```javascript
const standardResponse = (success, data, message, count = null) => {
  return {
    success,
    data,
    message,
    ...(count !== null && { count })
  };
};
```

### Controller Template
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const getAll = asyncHandler(async (req, res) => {
  const items = await Model.find().sort({ createdAt: -1 });
  res.json(standardResponse(true, items, 'Items retrieved', items.length));
});

const create = asyncHandler(async (req, res) => {
  const item = new Model(req.body);
  await item.save();
  res.status(201).json(standardResponse(true, item, 'Item created'));
});
```

### CORS Proxy for External APIs
```javascript
// Use this pattern when external APIs have CORS issues
app.get('/api/proxy/external', async (req, res) => {
  try {
    const response = await fetch(`https://external-api.com/api?${new URLSearchParams(req.query)}`);
    const data = await response.buffer();
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed' });
  }
});
```

---

## ⚛️ REACT TYPESCRIPT PATTERNS

### Standard Interface Structure
```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// Make interfaces flexible with optional properties
export interface NavItem {
  id: string;
  label: string;
  icon?: string;  // Optional to avoid TypeScript conflicts
  active?: boolean;
  onClick?: () => void;
}
```

### Custom Hook Template
```typescript
export const useApi = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}${url}`);
        const result: ApiResponse<T> = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### Clipboard API with Fallback
```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};
```

---

## 🎨 APPLE-STYLE DESIGN SYSTEM

### Standard Colors
```typescript
const colors = {
  primary: '#1C1C1E',
  secondary: '#8E8E93', 
  background: '#F2F2F7',
  card: '#FFFFFF',
  border: '#E5E5EA',
  accent: '#007AFF',
  success: '#34C759'
};
```

### Card Component Template
```tsx
const Card: React.FC<{children: React.ReactNode, onClick?: () => void}> = ({ children, onClick }) => (
  <div 
    className={`bg-white rounded-xl transition-all duration-200 ${onClick ? 'hover:scale-[0.98] cursor-pointer' : ''}`}
    style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
    onClick={onClick}
  >
    <div className="p-4">
      {children}
    </div>
  </div>
);
```

### Bottom Navigation Pattern
```tsx
const NavigationButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center transition-all duration-200 rounded-full hover:scale-105"
    style={{
      backgroundColor: active ? 'white' : 'transparent',
      color: active ? '#1C1C1E' : 'white',
      width: '52px',
      height: '52px'
    }}
  >
    {children}
  </button>
);
```

---

## 📱 MOBILE-FIRST PATTERNS

### Touch-Friendly Sizing
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Hover only on devices that support it */
@media (hover: hover) {
  .hover-effect:hover {
    transform: scale(0.98);
  }
}
```

### Responsive Spacing
```typescript
// Use consistent spacing system
const spacing = {
  xs: '4px',   // space-1
  sm: '8px',   // space-2
  md: '16px',  // space-4
  lg: '24px',  // space-6
  xl: '32px',  // space-8
  xxl: '48px'  // space-12
};
```

---

## 🚀 DEPLOYMENT CONFIGURATIONS

### Firebase (firebase.json)
```json
{
  "hosting": {
    "public": "frontend/build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  },
  "functions": {
    "source": "backend",
    "runtime": "nodejs18"
  }
}
```

### Netlify (netlify.toml)
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development

# Backend (.env)
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
CORS_ORIGIN=http://localhost:3000
```

---

## 🚨 COMMON ISSUES & QUICK FIXES

### CORS Errors
**Problem**: External API blocked by CORS
**Solution**: Create backend proxy endpoint (see API patterns above)

### TypeScript Interface Conflicts
**Problem**: Property missing errors when interfaces evolve
**Solution**: Make properties optional with `?` or use union types

### useEffect Dependency Warnings
**Solution**: Add `// eslint-disable-line react-hooks/exhaustive-deps`

### Date Sorting for Recurring Events
```typescript
const sortResponsibilitiesCyclically = (data: Array<{date: string}>) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  return data.map(item => {
    const originalDate = new Date(item.date);
    let nextOccurrence = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
    
    if (nextOccurrence < today) {
      nextOccurrence = new Date(currentYear + 1, originalDate.getMonth(), originalDate.getDate());
    }
    
    return {
      ...item,
      nextOccurrence,
      daysUntil: Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    };
  }).sort((a, b) => a.daysUntil - b.daysUntil);
};
```

### Image Fallbacks
```tsx
<img
  src={imageUrl}
  alt={name}
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement!;
    parent.innerHTML = `<span>${getInitials(name)}</span>`;
  }}
/>
```

---

## 📋 DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] `npm run build` succeeds without errors
- [ ] Environment variables configured in hosting platform
- [ ] API endpoints tested in production
- [ ] CORS configured for production domain
- [ ] Database indexes created for performance

### Post-Deployment
- [ ] All routes working (test SPA routing)
- [ ] API calls working from production domain
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable on mobile devices

---

## 🔄 QUICK SETUP COMMANDS

```bash
# Install all dependencies
cd frontend && npm install && cd ../backend && npm install

# Development
npm run dev  # Both frontend and backend

# Production build
cd frontend && npm run build

# Deploy to Firebase
firebase deploy

# Deploy to Netlify
cd frontend && npm run build && netlify deploy --prod --dir=build
```

---

**USAGE FOR CLAUDE**: Use this reference when building similar React TypeScript + MongoDB + Firebase projects. Follow these patterns for consistency, avoid documented pitfalls, and implement proven solutions for common requirements.