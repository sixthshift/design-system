# PA UX Principles

This document defines the user experience philosophy for Personal Assistant, shaped fundamentally by the **single-user instance model**.

## The Core Insight

PA follows a **1 instance = 1 person** architecture. This isn't just a technical decision—it reshapes the entire user experience.

**Multi-user SaaS:** "You are a user of this service"
**Single-user PA:** "This is your tool"

The difference is like Gmail (your account on Google's service) versus a journal on your desk (yours, period).

---

## Mental Model

### What PA Feels Like

- A private journal
- Your own filing cabinet
- A tool that knows you
- An extension of your mind

### What PA Doesn't Feel Like

- A service watching you
- A platform you're on
- Something you have to "log into"
- A company's product you're using

### Analogies

| Product          | Relationship               |
| ---------------- | -------------------------- |
| iPhone           | Your device, you unlock it |
| Password manager | Your vault, one master key |
| Personal journal | Yours, no audience         |
| Desktop app      | Runs on your machine       |

PA should feel like these—personal, owned, private—not like a web service you have an account on.

---

## Authentication

### No Login, Just Unlock

Traditional multi-user apps need to know _who_ you are. PA already knows—there's only one user. Authentication is just verifying it's actually you.

**Not this:**

```
┌─────────────────────┐
│  Email: [________]  │
│  Password: [______] │
│  [Login]            │
└─────────────────────┘
```

**This:**

```
┌─────────────────────┐
│  🔒 Unlock PA       │
│  [____________]     │
│  [Unlock]           │
└─────────────────────┘
```

### Auth Options

| Method    | Context               | Notes                 |
| --------- | --------------------- | --------------------- |
| Password  | Web dashboard         | Simple unlock         |
| PIN       | Mobile quick access   | 4-6 digits            |
| Biometric | Mobile                | Face ID / fingerprint |
| Passkey   | Modern passwordless   | WebAuthn              |
| None      | Trusted local network | Power user option     |

### Session Behavior

- "Logout" → "Lock"
- "Remember this device" makes sense
- Configurable timeout per device
- Mobile can stay unlocked with biometric re-auth

---

## Language & Copy

The single-user model changes how PA speaks.

### Vocabulary Shifts

| Multi-User SaaS        | Single-User PA           |
| ---------------------- | ------------------------ |
| "Your account"         | "Your PA" or implicit    |
| "Create an account"    | "Set up your PA"         |
| "Sign in" / "Log in"   | "Unlock"                 |
| "Sign out" / "Log out" | "Lock"                   |
| "Your profile"         | "Preferences"            |
| "Account settings"     | "Settings"               |
| "We" / "Our service"   | Avoid—the tool just _is_ |
| "Users who..."         | Doesn't exist            |
| "Shared with you"      | External sharing only    |

### Tone & Voice

**SaaS tone:** Professional, company-to-customer, often performatively friendly

```
"Welcome back, John! Here's what's new in your account."
```

**PA tone:** Direct, utilitarian, respects your time

```
"3 tasks due today. 2 events."
```

Less greeting, less personality performance. More utility. The tool serves you without needing to charm you.

### Principles

1. **Direct** - No filler, no marketing speak
2. **Implicit ownership** - Don't say "your" constantly—everything is yours
3. **No audience** - You're not performing for other users
4. **Utility-first** - Information over personality

---

## UI Patterns

### What Disappears

These common SaaS patterns don't exist in PA:

| Pattern                     | Why It's Gone                                     |
| --------------------------- | ------------------------------------------------- |
| User avatar menu            | No user to identify                               |
| "Created by [user]"         | Only one possible creator                         |
| "Assigned to" dropdown      | No one to assign to                               |
| "Last modified by"          | Always you                                        |
| Activity feed with actors   | "John added..." → just "Added..."                 |
| @mentions                   | No other users to mention                         |
| "Share with [user]"         | No internal users (external sharing is different) |
| "X people viewing"          | Always just you                                   |
| Team/workspace switcher     | One instance, one workspace                       |
| Role badges (Admin, Member) | No roles                                          |
| "Invite user" flows         | No users to invite                                |
| User search/picker          | No users to search                                |

### What Changes

**User menu → Settings**

Traditional:

```
┌──────────────────────┐
│ 👤 John Smith     ▼  │
├──────────────────────┤
│ Profile              │
│ Account Settings     │
│ Switch Account       │
│ ──────────────       │
│ Logout               │
└──────────────────────┘
```

PA:

```
┌──────────────────────┐
│ ⚙️ Settings          │
├──────────────────────┤
│ Preferences          │
│ Integrations         │
│ Backup & Export      │
│ ──────────────       │
│ Lock                 │
└──────────────────────┘
```

Or simply: Settings as a page in navigation, no dropdown needed.

**Attribution → Timestamps only**

Traditional: "Modified by Sarah, 2 hours ago"
PA: "Modified 2 hours ago"

**Permissions → Don't exist**

No "who can see this?" on every item. Everything is yours. External sharing is a separate, explicit action.

### What Remains

- **Preferences** - Theme, defaults, display options
- **Integrations** - Connected services, API keys
- **Security** - Change password, view sessions, manage API tokens
- **Data** - Backup, export, import
- **Instance info** - Version, storage usage, system health

---

## Onboarding

### SaaS Onboarding (What We Don't Do)

1. Create account (email, password)
2. Verify email
3. Complete profile (name, avatar, bio)
4. Choose plan/tier
5. Invite team members
6. Start using

### PA Onboarding

1. Set a password
2. (Optional) Connect first integration
3. Done

No email verification—who would you verify to? No profile to complete—you know who you are. No plan selection—it's your server.

### First-Run Experience

Focus on:

- Getting data in (first integration)
- Showing immediate value
- Teaching the core concepts (domains, relationships)

Not on:

- Account setup theater
- Profile completion prompts
- Social features that don't exist

---

## Empty States

### SaaS Empty States

Often reference other users or social proof:

- "No one has added any tasks yet"
- "Invite teammates to get started"
- "Be the first to comment"

### PA Empty States

Just acknowledge the emptiness and offer action:

- "No tasks yet" + Add button
- "No events this week" + Create button
- "Connect a calendar to see events here"

No reference to "users" or "anyone" or "teammates"—it's just you.

---

## Notifications

### What Changes

**SaaS notifications** often involve other people:

- "John mentioned you"
- "Sarah shared a document with you"
- "New comment from Mike"

**PA notifications** are about things, not people's actions:

- "Task due in 1 hour"
- "Calendar conflict detected"
- "Weekly review ready"
- "Integration sync failed"

All notifications are about _data and events_, not _other users' actions on data_.

---

## Settings Architecture

### SaaS Settings (Split)

- Account settings (your stuff)
- Workspace settings (shared stuff)
- Admin settings (if you're admin)
- Team settings
- Billing settings

### PA Settings (Unified)

Just settings. No split needed because:

- Everything is "yours"
- No workspace/team distinction
- No roles (you're the only user)
- No billing (self-hosted)

Categories might be:

- Preferences (display, defaults)
- Integrations (connected services)
- Security (password, sessions)
- Data (backup, export)
- System (updates, storage)

---

## Error Messages

### Errors That Don't Exist

- "User not found"
- "You don't have permission"
- "Contact your admin"
- "This was shared with you, but access was revoked"
- "You've exceeded your plan limits"

### Error Philosophy

Fewer categories of errors overall. Most errors are:

- Integration failures (external service issues)
- Data validation (invalid input)
- System issues (storage, connectivity)

Not permission/access/user errors—those concepts don't apply.

---

## Visual Design Implications

### Less Chrome

- No user menu/avatar in header
- No team/workspace switcher
- No collaboration indicators
- Simpler header, more content space

### More Focus

- Content-forward design
- Less UI overhead
- Feels more like a native app than a web app

### Personalization vs. Identity

Customization (theme, layout) is about **preference**, not **identity**.

You might still have an avatar or name in settings—but it's decoration/preference, not identification to the system.

---

## External Sharing

While there are no internal users, external sharing is still needed:

- Share a read-only dashboard with family
- Export calendar to a public URL
- Generate shareable reports

This is fundamentally different from "share with teammate":

- Explicit, deliberate action
- Usually read-only
- External to the instance
- More like "publish" than "share"

---

## Summary

The single-user model simplifies PA's UX by removing entire categories of complexity:

| Removed         | Impact                                     |
| --------------- | ------------------------------------------ |
| User management | No user CRUD, no invites, no roles         |
| Permissions     | No access control UI on every item         |
| Attribution     | No "created by" / "modified by" everywhere |
| Social features | No mentions, no comments with authors      |
| Multi-account   | No account switching, no team/workspace    |

What remains is cleaner, more focused, more intimate. PA is your tool, not a service you're a user of.

---

## Navigation Architecture

### Rejecting Enterprise Patterns

Most UX patterns come from business/enterprise origins:

- Side nav organized by feature modules (Contacts, Projects, Calendar, Reports)
- Top nav with search, notifications, user profile
- Dashboard-centric entry points

This forces users to think: "What type of data am I looking for?" before they can do anything. That's backwards for personal use.

### Intent-Driven Design

PA navigation is organized around **what people actually want to do** when they reach for a life management tool:

| Intent Category          | Examples                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Capture & Record**     | "Get this out of my head", "Log this event", "Save for later"                      |
| **Recall & Find**        | "What was that thing?", "Everything related to X", "What happened then?"           |
| **Orient & Prepare**     | "What does today look like?", "What's coming up?", "Catch me up"                   |
| **Plan & Decide**        | "Help me think through this", "When can this happen?", "What matters most?"        |
| **Reflect & Understand** | "What happened worth noting?", "What patterns exist?", "How have I changed?"       |
| **Connect & Explore**    | "How does X connect to Y?", "Show me everything about this", "What's interesting?" |
| **Act & Automate**       | "Handle this for me", "Remind me to...", "The boring stuff"                        |

### Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│ [Space: All v]          [+ Capture]  [⌘ Search]    │  <- Top nav (global)
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Now     │                                          │
│          │                                          │
│ Timeline │         Main content area                │
│          │                                          │
│ Explore  │                                          │
│          │                                          │
│  Review  │                                          │
│          │                                          │
├──────────┤                                          │
│ Library  │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Top Nav (Global, Persistent)

Elements that affect the entire application or need to be accessible from anywhere.

**Space Selector**

A global filter that slices all views by context (All, Work, Family, Health, etc.).

Key insight: Spaces are lenses, not destinations. Selecting a space changes what all views show. This is fundamentally different from enterprise nav where filters are buried inside each view.

**Capture**

Zero-friction entry point for recording anything. Get something out of your head before it escapes.

Most apps bury "add new" inside each module. Capture says: "I don't care where this goes yet, I just need to get it out of my head now."

**Search/Command**

Universal entry point to find anything or do anything. Command palette pattern (like Spotlight, ⌘+K).

| Mode                     | Examples                                   |
| ------------------------ | ------------------------------------------ |
| **Search** (find things) | "John" → person, "dentist" → events/notes  |
| **Command** (do things)  | "new task", "add person", "go to timeline" |

### Side Nav (Views + Library)

Primary destinations - different ways of accessing and viewing your data.

**The Mental Model**

```
┌─────────────────────────────────────┐
│            LIBRARY                  │
│    You = Librarian (curating)       │
│    Source of truth, organized       │
│    People · Events · Tasks · ...    │
└──────────────┬──────────────────────┘
               │ serves data to
               ▼
┌────────┬──────────┬─────────┬────────┐
│  Now   │ Timeline │ Explore │ Review │
│          Views = Patrons             │
│    (consuming & presenting data)     │
└────────┴──────────┴─────────┴────────┘
```

**Library** is the source of truth. You are the librarian: curating, adding, editing, cleaning up the collection.

**Views** are patrons - they consume library data and present it through different lenses.

| View         | Purpose                                      | User Intent                          |
| ------------ | -------------------------------------------- | ------------------------------------ |
| **Now**      | Current awareness - what needs attention now | "What's my situation right now?"     |
| **Timeline** | Navigate through time - past and future      | "What happened?" / "What's coming?"  |
| **Explore**  | AI-driven discovery and connection surfacing  | "What's interesting that I haven't noticed?" |
| **Review**   | Patterns, reflections, summaries             | "What patterns exist?"               |
| **Library**  | Direct access to entities                 | "I want to work with actual records" |

### Navigation Principles

1. **Spaces are lenses, not destinations** - They affect all views simultaneously
2. **Views are angles into data** - Same data, different perspectives
3. **Library is the source** - Views consume it, you maintain it
4. **Domains are close but not primary** - 2 clicks away (Library → Domain)
5. **Capture is always accessible** - Never more than one click away
6. **No enterprise module thinking** - Organized by intent, not feature category

### Capture vs Search/Command

| Aspect           | Capture                      | Search/Command                    |
| ---------------- | ---------------------------- | --------------------------------- |
| **Intent**       | Get something OUT of my head | Find or do something specific     |
| **Input**        | Unstructured, quick dump     | Structured query or command       |
| **Mental state** | "Record this NOW"            | "Looking for X" or "Want to do Y" |

---

## Related Documents

- [Design Tokens](design-tokens.md) - Visual tokens and component specifications

---

_This document captures UX principles for PA, shaped by the single-user model and intent-driven navigation._
