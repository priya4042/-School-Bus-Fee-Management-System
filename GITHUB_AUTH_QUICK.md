# Quick GitHub Authentication Setup

Your Git is now configured to use Windows Credential Manager.

## Step 1: Generate GitHub Personal Access Token

1. **Go to:** https://github.com/settings/tokens/new
2. **Create token:**
   - Name: `git-push-token-2026`
   - Expiration: `90 days`
   - Scopes: Check ✅ `repo` (all options)
3. **Click "Generate token"**
4. **Copy the token** (you'll only see it once!)

## Step 2: Store Token in Windows Credential Manager

Open PowerShell and run:

```powershell
# Store your GitHub credentials
$gitUrl = "https://github.com"
$username = "priya4042"
$token = "ghp_..." # PASTE YOUR TOKEN HERE

# Create credential
$credential = New-Object System.Management.Automation.PSCredential(
    $username,
    (ConvertTo-SecureString $token -AsPlainText -Force)
)

# Store in credential manager (this will prompt for Windows password once, then save it)
$credential | Export-Credential -Path "$env:USERPROFILE\.credentials\github.xml"

# Then configure git
git config --global credential.helper manager
```

## Step 3: Push Your Code

```powershell
git push origin main
```

When prompted (first time only):
- **Username:** `priya4042`
- **Password:** `ghp_...` (your token)

After first push, credentials are saved automatically! ✅

---

## Alternative: Use GitHub CLI (Easiest)

If you have GitHub CLI installed:

```powershell
gh auth login
# Follow the prompts, select HTTPS, then paste your token
```

Then push:
```powershell
git push origin main
```

---

## Reset Credentials If Needed

```powershell
# Clear stored credentials
git credential-manager delete https://github.com

# Try push again - will prompt for new credentials
git push origin main
```

