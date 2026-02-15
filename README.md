# Emi.locker | Enterprise Mobile Finance Security

This is the NextJS control center for Emi.locker, an MDM solution for mobile retailers.

## Repository
**GitHub:** [https://github.com/khan33255-source/Emi.locker.git](https://github.com/khan33255-source/Emi.locker.git)

## Deployment

### Initial Push to GitHub
To push your local code to your new repository, run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial commit: Emi.locker Enterprise System"
git branch -M main
git remote add origin https://github.com/khan33255-source/Emi.locker.git
git push -u origin main
```

### APK Signature Checksum
When deploying your custom MDM agent (`com.emilocker.mdm`), you must provide a SHA-256 signature checksum in the provisioning JSON. Use the following command to generate it from your `.apk` file:

```bash
shasum -a 256 your-app.apk | cut -d " " -f 1 | xxd -r -p | base64 | tr "+/" "-_"
```

This generates a URL-safe Base64 encoded string required for the `PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM` field.

## Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/ai`: Genkit AI flows for dynamic messaging.
- `src/components`: UI components (ShadCN).
- `agent-app-android`: Source code for the custom MDM DPC Agent.
- `docs/android`: Android DPC manifest and receiver templates.
- `.github/workflows`: Automated APK build pipelines.
