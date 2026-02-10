# Repository Rename Summary

## What Was Done

This PR renames all references from "cleantext" to "textwash" throughout the codebase. The repository was accidentally created with the wrong name, and this update fixes all internal references.

### Files Updated:
1. **package.json** - Changed name from "cleantext" to "textwash"
2. **backend/package.json** - Changed name from "cleantext-backend" to "textwash-backend"
3. **README.md** - Updated:
   - Project folder structure (cleantext/ → textwash/)
   - Database name (cleantext → textwash)
   - Admin email (admin@cleantext.app → admin@textwash.app)
   - Product names (CleanText Starter/Pro → TextWash Starter/Pro)
4. **ADMIN_GUIDE.md** - Updated admin email addresses
5. **STRIPE_SETUP.md** - Updated product names
6. **PRE_LAUNCH_STATUS.md** - Updated database URLs and email addresses
7. **CHECKLIST.md** - Updated product names
8. **BUILD_SUMMARY.md** - Updated folder structure
9. **DEPLOYMENT.md** - Updated database names, emails, product names, and DNS examples
10. **.gitignore** - Created to exclude node_modules and build artifacts

### Code Functions Preserved:
- The JavaScript function `cleanText()` in app.js was **NOT** changed (it's a code identifier, not a product name)

## What Still Needs To Be Done

### On GitHub:
The repository itself is still named "cleantext" on GitHub. You have two options:

#### Option 1: Rename the Repository (Recommended)
1. Go to https://github.com/thomasbontrager/cleantext
2. Click "Settings" tab
3. Scroll down to "Repository name"
4. Change "cleantext" to "textwash"
5. Click "Rename"

**Benefits:**
- GitHub automatically sets up redirects
- All clone URLs update automatically
- Existing links continue to work

#### Option 2: Create New Repository and Transfer
1. Create new repository at https://github.com/thomasbontrager/textwash
2. Push this branch to the new repository
3. Update deployment settings to point to new repository
4. Archive or delete the old "cleantext" repository

### After Renaming:
1. **Update local git remote** (if working locally):
   ```bash
   git remote set-url origin https://github.com/thomasbontrager/textwash.git
   ```

2. **Update deployment configurations**:
   - Vercel/Netlify: Update repository connection
   - Any CI/CD pipelines: Update repository references
   - Domain DNS: Update if using GitHub Pages

3. **Create PostgreSQL database**:
   ```bash
   createdb textwash
   ```

4. **Update .env files** with new database name:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/textwash
   ADMIN_EMAIL=admin@textwash.app
   ```

5. **Run database migrations**:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

## Summary

✅ All code references updated from cleantext to textwash
✅ Package names updated
✅ Documentation updated
✅ Database references updated
✅ Email addresses updated
✅ Product names updated
⏳ GitHub repository name still needs to be renamed manually
⏳ Deployment configurations need to be updated after rename
⏳ Environment variables need to be updated with new database name

The codebase is now consistent with "textwash" branding!
