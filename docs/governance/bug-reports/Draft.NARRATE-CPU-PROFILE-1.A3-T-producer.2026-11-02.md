# CPU A3-T — literal PowerShell producer template for Brain review

Date: 2026-11-02. PLANNING ONLY / NOT READY / NO EXECUTION ADMISSION. This document compiles T-C5 from the existing T contract audit using Brain's CPU16 and CPU17 actual rulings, persisted in the adjacent producer and embedding ruling records. CPU17 accepts the literal by text inspection and prescribes the new-entry UTF8 round-trip check below; final T contract/embedding review remains separate from any source admission or producer runtime qualification. The preliminary escaping objection was retracted after actual raw-character counts proved the published PS body already correct; no escaping repair is claimed.

Read actual accepted P courier completely in the preceding audit and re-read its constants/path/membership code for this template: commit `270bf721eaf31006998c7972d73c984b3b21a7be`; helper raw SHA256 `0b561e69f205a548c396832a5f6dd7ec1b00a6850e9982244377fbe3bc7c139b`,11771bytes/221lines. P lines26–35 normalize drive-absolute paths lexically/case-insensitively and append one terminal separator to the selected root; lines82–98 exclude launcher/outside/basename-non-electron before command-line classification. Existing P policy stays untouched. No import, syntax check, PowerShell, CIM, process, helper or runtime execution occurred while authoring this document.

## Exact spawn contract — source/mocks only in T

CPU16 spelling:

```js
spawn('pwsh', ['-NoProfile', '-NonInteractive', '-Command', SCRIPT], {
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
  shell: false,
});
```

No PATH probe, executable lookup, PowerShell launch or CIM qualification in T. A future separately admitted runtime preparation resolves/receipts the actual absolute executable before genuine collection. This mock-only spelling does not certify which executable a live host would resolve.

## Literal SCRIPT template

Store the entire following text as one `String.raw` JavaScript template constant inside the existing helper. Its ONLY substitution tokens are `@@ROOT_UTF8_BASE64@@` and `@@LAUNCHER_PID@@`, each occurring once. The base64 token is within a single-quoted PowerShell string; it contains only base64 alphabet/padding. PID is a validated positive safe-integer decimal literal. No raw root/command line or shell expression is interpolated; no Invoke-Expression.

**CPU17 exact canonical literal boundary:** the unsubstituted script is4775 UTF8 bytes, LF only, no BOM, no leading LF and NO FINAL LF; first character `$`, last character `}`. Raw SHA256 `1756e618f18a4f051fc047117109354066bb4ec81d5de307dd5adb3a78ebb288`. Put first `$` immediately after the opening String.raw backtick and last `}` immediately before its closing backtick, or construct exactly equivalent bytes. Markdown's presentation LF before the closing fence is not part of the script. No generic trim, locale transformation or EOL normalization. Freeze the two-token template before safe root/PID substitution; the instantiated script naturally has its own input-specific raw identity. Final text acceptance is in the adjacent producer-final ruling record; no PowerShell parser/CIM run occurred.

```powershell
$ErrorActionPreference = 'Stop'
try {
    $utf8 = [System.Text.UTF8Encoding]::new($false, $true)
    $outWriter = [System.IO.StreamWriter]::new([Console]::OpenStandardOutput(), $utf8)
    $outWriter.AutoFlush = $true
    [Console]::SetOut($outWriter)
    $errWriter = [System.IO.StreamWriter]::new([Console]::OpenStandardError(), $utf8)
    $errWriter.AutoFlush = $true
    [Console]::SetError($errWriter)
    $culture = [System.Globalization.CultureInfo]::InvariantCulture
    $maxSafeInteger = [long]9007199254740991

    function Convert-CanonicalCounter {
        param([object]$Value)
        if ($null -eq $Value) { throw 'CPU_SAMPLER_CIM_FAILED' }
        if ($Value -is [uint64]) {
            return $Value.ToString($culture)
        }
        if ($Value -isnot [string] -or $Value -cnotmatch '^(0|[1-9][0-9]*)$') {
            throw 'CPU_SAMPLER_CIM_FAILED'
        }
        $parsed = [uint64]0
        if (-not [uint64]::TryParse($Value, [System.Globalization.NumberStyles]::None, $culture, [ref]$parsed)) {
            throw 'CPU_SAMPLER_CIM_FAILED'
        }
        return $parsed.ToString($culture)
    }

    function Convert-DriveAbsolutePath {
        param([object]$Value)
        if ($Value -isnot [string] -or $Value -cnotmatch '^[A-Za-z]:[\\/]' -or $Value.IndexOf([char]0) -ge 0) {
            throw 'CPU_SAMPLER_CIM_FAILED'
        }
        return [System.IO.Path]::GetFullPath($Value.Replace('/', '\'))
    }

    $rootBytes = [Convert]::FromBase64String('@@ROOT_UTF8_BASE64@@')
    $rootWithSeparator = $utf8.GetString($rootBytes)
    $normalizedRoot = Convert-DriveAbsolutePath $rootWithSeparator
    $rootPrefix = $normalizedRoot.TrimEnd([char]92) + '\'
    if (-not [string]::Equals($rootWithSeparator, $rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'CPU_SAMPLER_CIM_FAILED'
    }
    $launcherPid = [long]@@LAUNCHER_PID@@
    if ($launcherPid -le 0 -or $launcherPid -gt $maxSafeInteger) { throw 'CPU_SAMPLER_CIM_FAILED' }
    $sequence = [long]0
    $lastTime = [long]-1

    while ($true) {
        $processes = @(Get-CimInstance -ClassName Win32_Process -Filter "Name = 'electron.exe'" -ErrorAction Stop |
            Sort-Object -Property ProcessId -Stable)
        $rows = [System.Collections.Generic.List[object]]::new()
        foreach ($process in $processes) {
            $rawPid = $process.ProcessId
            if ($rawPid -isnot [uint32] -or $rawPid -eq 0) { throw 'CPU_SAMPLER_CIM_FAILED' }
            $processPid = [long]$rawPid
            if ($processPid -eq $launcherPid) { continue }

            $executablePath = Convert-DriveAbsolutePath $process.ExecutablePath
            if (-not $executablePath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) { continue }
            if (-not [string]::Equals([System.IO.Path]::GetFileName($executablePath), 'electron.exe', [StringComparison]::OrdinalIgnoreCase)) { continue }

            $creationDate = $process.CreationDate
            if ($creationDate -isnot [datetime]) { throw 'CPU_SAMPLER_CIM_FAILED' }
            $ticks = $creationDate.ToUniversalTime().Ticks
            if ($ticks -le 0) { throw 'CPU_SAMPLER_CIM_FAILED' }
            $startUtcTicks = $ticks.ToString($culture)
            if ($startUtcTicks -cnotmatch '^[1-9][0-9]*$') { throw 'CPU_SAMPLER_CIM_FAILED' }

            $commandLine = $process.CommandLine
            if ($null -ne $commandLine -and $commandLine -isnot [string]) { throw 'CPU_SAMPLER_CIM_FAILED' }
            $kernel100ns = Convert-CanonicalCounter $process.KernelModeTime
            $user100ns = Convert-CanonicalCounter $process.UserModeTime
            [void]$rows.Add([ordered]@{
                name = 'electron.exe'
                pid = $processPid
                startUtcTicks = $startUtcTicks
                executablePath = $executablePath
                commandLine = $commandLine
                kernel100ns = $kernel100ns
                user100ns = $user100ns
            })
        }

        if ($sequence -ge $maxSafeInteger) { throw 'CPU_SAMPLER_CIM_FAILED' }
        $sequence = $sequence + 1
        $time = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        if ($time -lt 0 -or $time -gt $maxSafeInteger -or $time -le $lastTime) { throw 'CPU_SAMPLER_CIM_FAILED' }
        $frame = [ordered]@{
            schemaVersion = 'narrate.cpu-sampler.v1'
            sequence = $sequence
            t = $time
            rows = @($rows.ToArray())
        }
        $json = ConvertTo-Json -InputObject $frame -Depth 4 -Compress
        [Console]::Out.WriteLine($json)
        [Console]::Out.Flush()
        $lastTime = $time
        Start-Sleep -Milliseconds 500
    }
} catch {
    [Console]::Error.WriteLine('CPU_SAMPLER_CIM_FAILED')
    [Console]::Error.Flush()
    exit 1
}
```

All initialization, decode, validation, conversion, CIM enumeration, sorting, serialization and loop work is under the one outer try/catch. There is no catch-and-continue or inaccessible-process omission. Failure emits one fixed ASCII diagnostic line, without user paths, metadata, stack or arbitrary error text; exits1. No stdout method except WriteLine(frameJson)/Flush is intentionally called. Helper functions return only their captured scalar values; rows.Add is explicitly void. No Write-Error/Write-Host/formatting pipeline is used.

## Exact JavaScript embedding/substitution plan

The following is prospective source text, not code run during planning. `PRODUCER_TEMPLATE` means the exact literal above inside `String.raw` delimiters; its whitespace/newlines become part of the frozen script contract. Do not substitute any other token, append commands or concatenate a raw path. The template itself contains no JavaScript backticks or `${...}` expressions.

```js
const selected = membershipOptions({ root, launcherPid });
const rootBytes = Buffer.from(selected.root, 'utf8');
if (rootBytes.toString('utf8') !== selected.root) {
  throw new TypeError('CPU_SAMPLER_MEMBERSHIP');
}
const rootBase64 = rootBytes.toString('base64');
const pidLiteral = String(launcherPid);
if (!/^[A-Za-z0-9+/]+={0,2}$/.test(rootBase64) || !/^[1-9][0-9]*$/.test(pidLiteral)) {
  throw new TypeError('CPU_SAMPLER_MEMBERSHIP');
}
const SCRIPT = PRODUCER_TEMPLATE
  .replace('@@ROOT_UTF8_BASE64@@', rootBase64)
  .replace('@@LAUNCHER_PID@@', pidLiteral);
```

`membershipOptions` is the actual existing private helper at accepted P lines31–35, callable from new code in the same module; it is not a new export or a permission to refactor P. CPU10's remaining start options, including cores/injections, must be validated before effects separately. It lowercases/normalizes the lexical root and adds one terminal separator. Brain CPU17 requires the exact UTF8 round-trip check above in the NEW sampler entry before ANY spawn, clock, snapshot or timer call. Lossy unpaired-surrogate roots throw the existing membership TypeError; accepted P's five public policy functions keep their bytes and behavior. PID remains the already-validated positive safe integer; no exponent/float/negative/coercion form is accepted into the template. Template source/mocked checks require exactly one occurrence of each placeholder before replacement and no remaining placeholders afterward.

## Edge-case decisions exposed for Brain's raw review

These details make the template deterministic; review them explicitly rather than treating this draft as execution approval:

1. **CIM native types:** ProcessId must be the native Win32_Process UInt32 and positive before casting to long; strings, floats, null and0 fail. Counter inputs accept native UInt64 or canonical decimal strings within UInt64, reject null/negative/sign/whitespace/leading-zero/float/overflow, and emit invariant canonical strings. CreationDate must be DateTime before UTC/ticks conversion, and ticks positive. This avoids null→0 or imprecise JSON numbers. Brain CPU17 accepts this as the prospective strict producer contract; actual CIM representations remain UNQUALIFIED because no CIM call was made.
2. **Unknown versus known outside:** the launcher PID is skipped before executable inspection; every other unknown/null/non-drive-absolute/NUL/invalid executable fails the producer. Valid normalized paths outside exact root+separator are excluded before CreationDate/CommandLine/counters. A valid within-root basename other than electron.exe is excluded, matching accepted P classification lines88–89. `cpu-old` does not match `cpu\`; drive-root selection retains `C:\`. No realpath/junction/8.3/native-identity claim.
3. **Lexical path parity:** `/` becomes `\` and GetFullPath follows a prior drive-absolute check. Case-insensitive ordinal root+separator and basename comparisons implement the intended lexical filter. Brain CPU17 explicitly states that Node normalization/JS lowercasing and .NET GetFullPath/OrdinalIgnoreCase do not establish universal Windows/Unicode parity. Unusual dot/space/device-like forms and Unicode case folding remain UNQUALIFIED. The named ordinary ASCII worktree and ordinary valid Unicode encoding can receive source/mock evidence only. Before genuine collection, actual producer path parity, executable identity and CIM route must be reviewed and separately qualified; otherwise HOLD before runtime. No additional path restriction, native canonicalization or probe is inferred.
4. **Rows cardinality:** a List[object] is converted explicitly to an array under the ordered frame, preserving JSON `rows:[]`, `rows:[one]`, `rows:[many]`. Do not pipe rows individually to ConvertTo-Json. Stable ProcessId sorting yields deterministic ordering; malformed native PID data fails instead of being coerced into a retained identity. Actual PowerShell cardinality/serialization remains unexecuted.
5. **Clock/counters:** sequence begins1 and increases as long while remaining a JS safe integer; Unix epoch milliseconds are numeric, safe/nonnegative and strictly increase before output. Backward/duplicate clock or exhausted sequence throws the fixed diagnostic. The sample cadence is one completed query/frame then sleep500ms; no claim of an exact metronomic interval or every short-lived process observed. CPU17 accepts the strict time check by text inspection; no observed producer timing is claimed.
6. **Command line:** selected CommandLine emits the actual string or null, no stringify/fallback. Null is serialized so accepted P can fail inaccessible selected metadata according to its contract; producer does not manufacture an empty command line/class. No command line is shell-evaluated or separately logged. Name is fixed electron.exe under the exact CIM name filter; basename matching is case-insensitive.
7. **Encoding/error boundary:** strict UTF8 is used to decode the base64 root and no-BOM UTF8 writers are installed for stdout/stderr. The fixed catch diagnostic is ASCII even if initialization fails before those writers are installed. No embedded arbitrary exception reaches stderr intentionally. An OS stream failure itself cannot be certified handled or delivered without later runtime qualification; no fake mock PASS proves stderr delivery.
8. **Unicode input root:** Brain CPU17 resolves the encoding choice with the exact new-entry round-trip refusal above. Node Buffer replacement of unpaired surrogate code units must be detected before effects. The original P public policy entry points are unchanged. Ordinary valid Unicode paths round-trip from the selected normalized root once without raw interpolation. This encoding proof does not certify .NET/Node Unicode path comparison parity.

## Required source/mock assertions before T acceptance

All are prospective external synthetic/source checks under separately admitted T. No actual PowerShell parser, binary, CIM or producer subprocess is invoked:

- Assert exact spawn command, four argv items and all three options; no shell, extra environment/probe/launcher argument or source-file fallback. SCRIPT must equal the frozen reviewed template with only the two allowed substitutions.
- Literal roots containing apostrophe, dollar, semicolon, spaces, backtick, valid non-ASCII text and Windows separators: expected base64 is independently authored/byte-compared; decoded value equals the normalized terminal-separated root under the selected Unicode rule. Ensure none of these raw roots appear as executable PowerShell syntax. PID999 renders only decimal999.
- New sampler-entry roots containing an unpaired high surrogate or unpaired low surrogate reject with TypeError CPU_SAMPLER_MEMBERSHIP before any spawn/clock/snapshot/timer effect; ordinary valid BMP and paired-surrogate Unicode round-trip without loss. These prospective controls do not add a rejection to or change the five accepted P policy functions.
- Assert exact error preference/UTF8-writer installation and outer try/catch boundary; exact CIM call/filter, stable ProcessId sort, launcher skip, unknown-path refusal, outside exclusion before metadata, UTC invariant ticks/counter strings, exact frame/row keys, array construction, depth4/compress, frame-only stdout and sleep500. Full source review accompanies assertions; substring presence alone cannot prove runtime control flow.
- Hand-authored NDJSON wire fixtures for0,1,many selected rows feed the actual T transport/accepted ledger; unknown selected metadata, counter strings and first-fault mapping use the separately ruled transport contract. These fixtures prove consumer behavior, not execution of the PowerShell producer.
- Opposing source controls locally mutate the template copy's filter, terminal-root-boundary check, null counter handling, row-array construction and stdout diagnostic; the exact source assertions must reject those wrong copies. Never modify the accepted production helper or globally patch it to manufacture a negative.
- Preserve failed and successful source/mock receipts, exact template/helper/control hashes, argv and explicit `PowerShell syntax/CIM/native producer: NOT RUN / UNQUALIFIED`. Use normal T external evidence/accounting fence. No new clock, toolkit/helper, syntax/runtime permission or additional source path follows from this document.

Recommendation: Brain verify the revised embedding and frozen literal identity under CPU17, then incorporate those exact decisions into the final T pointer. This closes a specification seam only. The real executable, PowerShell syntax, CIM native types/serialization, Windows path corner cases and actual process observations remain separately admitted qualification work. Genuine collection must HOLD before runtime until the actual executable/producer path-parity/CIM route is reviewed and separately qualified; mock/source success supplies no native substitute.
