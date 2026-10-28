# Windows Code Signing for Blurby

## Why Code Signing Matters

Without a code signature, Windows SmartScreen will flag the Blurby installer as "unrecognized" and show a warning dialog that most users will not click through. Code signing with an Authenticode certificate eliminates this warning and builds user trust.

## Certificate Types

| Type | Cost (annual) | SmartScreen | Notes |
|------|---------------|-------------|-------|
| **OV (Organization Validation)** | $100-300 | Builds reputation over time | Requires business identity verification. SmartScreen warnings gradually reduce as download count grows. |
| **EV (Extended Validation)** | $200-500 | Immediate trust | Requires hardware token (USB) or cloud HSM. Instant SmartScreen reputation -- no warm-up period. |
| **Azure Trusted Signing** | ~$10/month | Immediate trust | Microsoft's managed signing service. No hardware token needed. Requires Azure subscription + identity validation. |

## Recommendation for Blurby

**Azure Trusted Signing** is the best option for a small indie project:

- Lowest cost (~$120/year vs $200-500 for EV)
- No physical hardware token to manage
- Immediate SmartScreen reputation (same as EV)
- Integrates well with CI/CD (GitHub Actions)
- Microsoft-backed, so Windows trust is first-class

If Azure is not an option, an **OV certificate** from a provider like Sectigo or Comodo is the next best choice. It is cheaper than EV, though SmartScreen trust takes time to build.

## Certificate Providers

- **Azure Trusted Signing**: https://learn.microsoft.com/en-us/azure/trusted-signing/
- **Sectigo (Comodo)**: https://sectigo.com/code-signing
- **DigiCert**: https://www.digicert.com/signing/code-signing-certificates
- **SSL.com**: https://www.ssl.com/certificates/ev-code-signing/

## Integrating with electron-builder

### Option A: Certificate file (OV/EV with exported PFX)

Add to `package.json` under `build.win`:

```json
{
  "build": {
    "win": {
      "certificateFile": "./certs/blurby.pfx",
      "certificatePassword": ""
    }
  }
}
```

In CI, the certificate and password come from GitHub Actions secrets:

```yaml
- name: Decode certificate
  run: |
    echo "${{ secrets.WIN_CERT_BASE64 }}" | base64 -d > ./certs/blurby.pfx
  shell: bash

- name: Package Windows installer
  run: npm run package:win
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    CSC_LINK: ./certs/blurby.pfx
    CSC_KEY_PASSWORD: ${{ secrets.WIN_CERT_PASSWORD }}
```

### Option B: Azure Trusted Signing

Use the `azure-code-sign` electron-builder plugin or a post-build signing step:

```yaml
- name: Sign with Azure Trusted Signing
  uses: azure/trusted-signing-action@v0.5.0
  with:
    azure-tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    azure-client-id: ${{ secrets.AZURE_CLIENT_ID }}
    azure-client-secret: ${{ secrets.AZURE_CLIENT_SECRET }}
    endpoint: https://eus.codesigning.azure.net/
    trusted-signing-account-name: ${{ secrets.AZURE_SIGNING_ACCOUNT }}
    certificate-profile-name: ${{ secrets.AZURE_CERT_PROFILE }}
    files-folder: release/
    files-folder-filter: exe
```

### Option C: EV certificate with hardware token (local signing only)

EV certificates on hardware tokens (USB dongles) cannot be used in CI without specialized cloud HSM setups. For local-only signing:

```bash
# Sign after building locally
signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a "release/Blurby Setup 1.0.0.exe"
```

The token must be physically connected to the machine running the command.

## GitHub Actions Secrets Needed

For Option A (PFX file):

| Secret | Description |
|--------|-------------|
| `WIN_CERT_BASE64` | Base64-encoded PFX certificate file |
| `WIN_CERT_PASSWORD` | Password for the PFX file |

For Option B (Azure):

| Secret | Description |
|--------|-------------|
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Service principal client ID |
| `AZURE_CLIENT_SECRET` | Service principal secret |
| `AZURE_SIGNING_ACCOUNT` | Trusted Signing account name |
| `AZURE_CERT_PROFILE` | Certificate profile name |

## Steps to Get Started

1. **Choose a provider** -- Azure Trusted Signing recommended.
2. **Complete identity verification** -- business or individual, depending on provider.
3. **Obtain the certificate** -- download PFX or configure cloud HSM access.
4. **Store credentials in GitHub Secrets** -- Settings > Secrets and variables > Actions.
5. **Update the release workflow** -- add the signing step before the upload step.
6. **Test with a tag push** -- create a `v0.0.1-test` tag to verify the full pipeline.

Note: Purchasing and configuring the certificate is a manual step that requires human action.
