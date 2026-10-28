# Someday — Code Signing

## Goal
Eliminate "Unknown Publisher" warnings on Windows (SmartScreen) and "unidentified developer" warnings on macOS (Gatekeeper).

## Windows Code Signing

### Certificate Options

**Option A: OV (Organization Validation) Certificate**
- Providers: DigiCert ($474/yr), Sectigo ($219/yr), GlobalSign ($299/yr)
- Requires business registration proof (LLC/Corp documents)
- Instant SmartScreen trust after signing
- Hardware token (USB) required for private key storage

**Option B: Azure Trusted Signing**
- Part of Azure subscription (free tier may cover it)
- No physical hardware token needed
- Requires Azure identity verification
- Integrates with GitHub Actions CI/CD

**Option C: EV (Extended Validation) Certificate**
- Instant SmartScreen trust (no reputation building needed)
- $300-600/yr
- Stricter verification (business + personal identity)
- Hardware token required

### electron-builder Configuration
```json
// package.json build config
{
  "win": {
    "certificateFile": "./cert/blurby.pfx",
    "certificatePassword": "${WIN_CSC_KEY_PASSWORD}",
    "signingHashAlgorithms": ["sha256"],
    "rfc3161TimeStampServer": "http://timestamp.digicert.com"
  }
}
```

### CI/CD Integration
- Store `.pfx` certificate as GitHub Actions secret (base64 encoded)
- Decode and sign during `npm run package:win` step
- Timestamp server ensures signature remains valid after certificate expiration

## macOS Code Signing & Notarization

### Requirements
- Apple Developer Program membership ($99/yr)
- Developer ID Application certificate
- Notarization via `notarytool` (replaced `altool` in Xcode 14+)

### electron-builder Configuration
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  },
  "afterSign": "scripts/notarize.js"
}
```

### Notarization Script
```javascript
// scripts/notarize.js
const { notarize } = require("@electron/notarize");
exports.default = async function notarizing(context) {
  await notarize({
    appBundleId: "com.blurby.app",
    appPath: context.appOutDir + "/" + context.packager.appInfo.productFilename + ".app",
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  });
};
```

## Acceptance Criteria
- [ ] Windows installer shows "Published by: [Your Name]" instead of "Unknown publisher"
- [ ] SmartScreen does not block installation
- [ ] macOS app opens without Gatekeeper warning
- [ ] Signed builds verified via `signtool verify` (Windows) and `codesign --verify` (macOS)
- [ ] CI/CD pipeline produces signed builds automatically
