# Emi.locker | Enterprise Mobile Finance Security

This is the NextJS control center for Emi.locker, an MDM solution for mobile retailers. It provides a multi-vendor dashboard for managing remote hardware assets, enforcing EMI payments, and deploying custom MDM agents.

## Repository
**GitHub:** [https://github.com/khan33255-source/Emi.locker.git](https://github.com/khan33255-source/Emi.locker.git)

## Initial Setup & Deployment

To push your local code to your new GitHub repository, run these commands in your terminal:

```bash
# Initialize local git repository
git init

# Add all project files
git add .

# Create initial commit
git commit -m "Initial commit: Emi.locker Enterprise System"

# Set default branch to main
git branch -M main

# Link to GitHub remote
git remote add origin https://github.com/khan33255-source/Emi.locker.git

# Push code to GitHub
git push -u origin main
```

## APK Signature Checksum
When deploying your custom MDM agent (`com.emilocker.mdm`), you must provide a SHA-256 signature checksum in the provisioning JSON. Use the following command to generate it from your `.apk` file:

```bash
shasum -a 256 your-app.apk | cut -d " " -f 1 | xxd -r -p | base64 | tr "+/" "-_"
```

This generates a URL-safe Base64 encoded string required for the `PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM` field in the MDM Provisioning QR.

## Project Structure
- `src/app`: Next.js App Router pages and layouts (Command Terminal).
- `src/ai`: Genkit AI flows for dynamic messaging and automation.
- `src/components`: UI components (ShadCN).
- `agent-app-android`: Source code for the custom MDM DPC Agent.
- `docs/android`: Android DPC manifest and receiver templates for reference.
- `.github/workflows`: Automated APK build pipelines using GitHub Actions.

## Security Roles
- **Super Admin (Faisal)**: Global oversight of all vendors and devices via the `?bypass=faisal_owner` route.
- **Vendors**: Shop-specific dashboard for customer enrollment and hardware management.
