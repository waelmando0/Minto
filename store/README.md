# Minto store listing kit

Everything to paste into **App Store Connect** and **Google Play Console**. Text limits are checked (see the counts in brackets).

> **Read this first: early access.** Minto doesn't move real money yet: **Top up adds test money** (the app says so), and investing isn't live. Both stores reject finance apps that look like they handle money but don't. Until real payments are connected:
> - use **TestFlight** (iOS) and **Play internal or closed testing** (Android) to put Minto on real phones;
> - if you do submit for public release, keep the "Early access" paragraph in the descriptions and the review notes below, so reviewers know what to expect.

## Links

| Field | Value |
|---|---|
| Privacy policy URL (both stores) | https://creatorix-w5pn.vercel.app/privacy |
| Support URL (App Store) | https://creatorix-w5pn.vercel.app/support |
| Marketing URL (App Store, optional) | https://creatorix-w5pn.vercel.app |
| Account deletion URL (Google Play) | https://creatorix-w5pn.vercel.app/delete-account |
| Contact email | wamoelti@gmail.com |
| Category | Finance |

## Assets

| File | Use |
|---|---|
| `screenshots/ios/*.png` | App Store, **iPhone 6.9"** (1320 × 2868). App Store Connect scales them down for smaller iPhones. |
| `screenshots/android/*.png` | Google Play, **phone screenshots** (1080 × 2160, 2:1) |
| `google-play/feature-graphic.png` | Google Play **feature graphic** (1024 × 500) |
| `google-play/icon-512.png` | Google Play **app icon** (512 × 512). The App Store icon comes from the build. |

Screenshots, in order: Home, Activity, Spending insights, Goals, Send money, Home in dark mode. They were taken from the app's demo mode (sample data, no real person) and show only features real accounts have. The investment chart and the sample bank list are left out on purpose: real accounts don't see them, and store screenshots must match the app.

To retake them after UI changes: export the app for web without Supabase settings, sign in with the demo code, and capture at 440 × 956 @3x (iOS) and 360 × 720 @3x (Android).

---

## App Store Connect

**Name** [5/30]
```
Minto
```

**Subtitle** [28/30]
```
Spending, goals and insights
```

**Promotional text** [119/170]
```
See where your money goes, save toward what matters, and move money between your accounts, all in one calm, simple app.
```

**Keywords** [90/100]
```
budget,spending,savings,goals,money,finance,expense,tracker,insights,personal finance,save
```

**Description**
```
Minto brings your everyday money into one simple app.

SEE WHERE IT GOES
• Every transaction in one place, grouped by day and searchable
• Spending insights for the last 7 days, 30 days or all time, broken down by category
• Money in and money out at a glance

SAVE FOR WHAT MATTERS
• Create savings goals from 12 templates, from a vacation to an emergency fund
• Add money to a goal and watch your progress
• Close a goal and its savings go straight back to your account

MOVE MONEY
• Two accounts, Personal and Investment, with your total balance on the home screen
• Send money, top up, and move cash to and from investing
• Every change is checked on our servers before it happens

PRIVATE BY DESIGN
• Sign in with a one-time code sent to your email, no password to forget
• Hide your balances with one tap
• No ads, no trackers, and you can delete your account in the app at any time

Light and dark mode are both built in.

EARLY ACCESS
Minto is in early access. Top-ups add test money while we connect real payments, and investing isn't live yet.
```

**What's New (first version)**
```
Welcome to Minto.
```

### App Review information

- **Sign-in:** reviewers can't read your inbox, so give them one they can. Create a mailbox just for review (for example a new Gmail account). Sign in to Minto with it once, then add its address and mailbox password in **Notes**.
- **Notes:**
```
Minto signs in with a one-time code sent by email (no passwords).
To sign in: enter the review email below in the app, then open that mailbox and enter the 6-digit code from the email "Your Minto sign-in code".
Review email: <review address>
Mailbox password: <password>

Minto is in early access: "Top up" adds test money and is clearly labelled in the app; no real payments are processed and no card or bank details are collected. Accounts can be deleted in Profile → Delete account.
```

### App Privacy ("nutrition label")

Data used to track you: **No**.

| Data type | Collected | Linked to the user | Used for tracking | Purpose |
|---|---|---|---|---|
| Contact Info → Email Address | Yes | Yes | No | App Functionality |
| Financial Info → Other Financial Info (balances, transactions, goals) | Yes | Yes | No | App Functionality |
| Identifiers → User ID | Yes | Yes | No | App Functionality |

Everything else: **Not collected.** That includes location, contacts, browsing history, usage data, diagnostics and payment info.

### Age rating

Answer **None / No** to every content question. Minto has no objectionable content and no unrestricted web access, so the rating comes out **4+**, which is normal for finance apps. The privacy policy still says Minto isn't intended for anyone under 18.

**Export compliance:** already answered by the build (`usesNonExemptEncryption: false`).

---

## Google Play Console

**App name** [5/30]
```
Minto
```

**Short description** [72/80]
```
Track spending, save toward goals and see where your money goes, simply.
```

**Full description:** use the App Store description above; it's under Google's 4000-character limit.

### Data safety

- Does your app collect or share any of the required user data types? **Yes**
- Is all of the user data collected by your app encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **Yes**, at https://creatorix-w5pn.vercel.app/delete-account

| Data type | Collected | Shared | Optional? | Purposes |
|---|---|---|---|---|
| Personal info → Email address | Yes | No | Required | Account management, App functionality |
| Financial info → Other financial info | Yes | No | Required | App functionality |
| Personal info → User IDs | Yes | No | Required | Account management |

Not collected: location, contacts, photos, app activity, web browsing, device IDs, crash logs and diagnostics.

"Shared" means sent to a third party for its own use. Supabase, Resend and Vercel process data on Minto's behalf (service providers), which Google doesn't count as sharing.

### Other Play Console answers

- **App category:** Finance
- **Ads:** No
- **Content rating (IARC questionnaire):** answer No to violence, sexuality, language, controlled substances, gambling and user-to-user communication. That gives an **Everyone / PEGI 3** rating.
- **Target audience:** 18 and over
- **Financial features declaration:** Minto doesn't offer loans, banking, crypto or payments to real third parties yet. Choose the options that match "personal finance management / budgeting", and update this declaration when real payments launch.
- **App access:** "All or some functionality is restricted" → add the review email and mailbox password with the same instructions as the App Store notes above.
