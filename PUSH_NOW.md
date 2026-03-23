# Push Your Code Using Token

## Quick Solution - Copy & Paste

Go to: https://github.com/settings/tokens/new
- Create token with `repo` scope
- Copy it

Then run in PowerShell:

```powershell
$token = "ghp_YOUR_TOKEN_HERE"  # PASTE YOUR TOKEN HERE
$url = "https://priya4042:$token@github.com/priya4042/-School-Bus-Fee-Management-System.git"
git push $url main
```

## After First Push

Store for future use:
```powershell
git remote set-url origin "https://priya4042:$token@github.com/priya4042/-School-Bus-Fee-Management-System.git"
```

Then future pushes are just:
```powershell
git push origin main
```

## What You're Pushing

Your commit `9ec05b3`:
- ✅ Updated meta tags in `index.html`
- ✅ Added CORS documentation

This will auto-deploy to Vercel within 5 minutes! 🚀

