---
description: Translation workflow for Next.js components using next-intl
---

# Translation Workflow for Next.js Components

## 1. Determine Component Type
- **Server Component (RSC)**: Use `getTranslations` from `next-intl/server`
- **Client Component**: Use `useTranslations` from `next-intl`

## 2. Check Component Location
Look for the component's `messages` folder structure:
- Check same directory as component: `./messages/`
- Check parent directories: `../messages/`, `../../messages/`
- Check app-level messages: `src/messages/` or `messages/`

## 3. Translation Implementation

### For Server Components (RSC)
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyServerComponent() {
  const t = await getTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### For Client Components
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

## 4. Translation File Structure
update translation files in the appropriate messages folder. If the file doesn't exist, don't create it.

### Structure
```
messages/
├── en.json
├── es.json
└── [other-locales].json
```

### Content Format
```json
{
  "namespace": {
    "title": "Your title here",
    "description": "Your description here",
    "button": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  }
}
```

## 5. Adding New Translations

### Step 1: Identify Translation Keys
Look for hardcoded strings in the component:
- Text content: `"Hello World"`
- Labels: `"Email address"`
- Placeholders: `"Enter your name"`
- Error messages: `"This field is required"`

### Step 2: Create Translation Keys
Replace hardcoded strings with translation keys:
```typescript
// Before
<h1>Welcome to our platform</h1>

// After
<h1>{t('welcome')}</h1>
```

### Step 3: Add to Translation Files
Add the key-value pairs to all locale files:

**en.json**
```json
{
  "welcome": "Welcome to our platform"
}
```

**es.json**
```json
{
  "welcome": "Bienvenido a nuestra plataforma"
}
```

## 6. Common Patterns

### Dynamic Content
```typescript
const t = useTranslations('form');

// With variables
<p>{t('greeting', { name: userName })}</p>

// In translation files
{
  "greeting": "Hello {name}, welcome back!"
}
```

### Pluralization
```typescript
const t = useTranslations('products');

<p>{t('items', { count: items.length })}</p>

// In translation files
{
  "items": "{count, plural, =0 {No items} one {1 item} other {# items}}"
}
```

## 7. Finding Messages Folder
Use these commands to locate the correct messages folder:
```bash
# Check current directory
ls -la ./messages/

# Check parent directories
ls -la ../messages/
ls -la ../../messages/

# Check from project root
find . -name "messages" -type d
```

## 8. Validation Checklist
- [ ] Component type correctly identified (RSC vs Client)
- [ ] Correct import used (getTranslations vs useTranslations)
- [ ] Translation namespace defined
- [ ] All hardcoded strings replaced with translation keys
- [ ] Translation files updated for all supported locales
- [ ] Keys added to all language files consistently
- [ ] Dynamic content and pluralization handled correctly
