# B-READ — independent planning and capacity review

2026-11-03. Reviewer: b_read_independent_review, independent of the packet author. **COMPLIANCE HOLD — CORRECTION REQUIRED; NOT READY; NO ADMISSION.** Recommendation: preserve the frozen packet and this review, correct the final-record serialization contract and clarify pagination/clock boundaries, then remeasure the complete route. Do not waive proof, increase a cap or start A.

## Exact subjects and review scope

- Draft.FLAT-OPERATIVE-CONTRACT.instruction-B-READ.2026-11-03.md: 23,996 bytes; SHA256 `1e37c9944c82e227f1e87819cc3433494c595ef45ef7e22c25c2f275f1791b5b`.
- Capacity.FLAT-OPERATIVE-CONTRACT.instruction-B-READ.2026-11-03.json: 37,133 bytes; SHA256 `7d1a2ac359ac7d4071b9d6ddd3f373f39f205532076a5c8e106a31012e5e256f`.

Read the complete AGENTS.md, LL-176 through LL-180, the complete B-READ draft, and the complete actual three-deliverable and observation/clock rulings (a592de6f and 13cb7cec). Parsed the complete Capacity as local DATA and inspected its authority, source domains, carried-input manifest, all frame records, recipe, output cardinality, capture, accounting, historical references, gates and scope. No claim of actual quiet input availability, quiet semantic reading, runtime qualification or source execution follows.

Brief LOCAL standard-library DATA work independently rehashed all five current raw source files and reconstructed their complete selected domains. CLAUDE/layout were full; ROADMAP and lessons used the exact source byte ranges; snapshot selection preserved the six complete header fields, complete thirteen item objects in stable-ID order, and cacheOnly=true. All raw/selected identities matched, total 211,573 selected bytes. Reconstructed all 23 semantic envelopes from the actual local selected bytes, verified every part hash and gap-free byte offsets, strict UTF8 boundaries, full reassembly, compact JSON plus CRLF character/byte counts and whole-envelope SHA256. Zero mismatches. Independently reconstructed all three complete recipe frames and the full 23,996-byte recipe; zero mismatches. These are local planning measurements, not actual future quiet deliveries.

## First: specification compliance — HOLD

### F1 — Required final coverage metadata already exceeds its entire output ceiling

The draft prescribes one final coverage.v1 record, whose entire JSON, newline and actual tool framing must fit 10,000 characters. Its required coverage.frames field contains all 23 entries with frame, charactersIncludingFraming, utf8Bytes, sha256 and full parts metadata. The fixed baseline has 27 parts.

Independently serializing **only that frames array** gives **11,966 ASCII characters / UTF8 bytes**, SHA256 `e119e63c3328cefdf89eb03a7f3d4cedc28243fd7a960b87c14b336105ce8492`. This is before the coverage/frames property names, outer object, fifteen final input observations, five domain/range records, actor, A binding, chronology, accounting, preservation, failures, limitations, disposition, newline or framing. Therefore the currently prescribed successful final record cannot fit. Capacity's fullFinalCoverageSchemaFits10000=UNKNOWN understates a deterministic lower-bound failure for this expanded representation.

Exact DATA reproduction: read Capacity.selectedFiveFrames; for each entry in order, create a JSON-native object with keys in this order: frame (1-based ordinal), charactersIncludingFraming (copied from charactersIncludingCRLF), utf8Bytes, sha256, parts (the complete original ordered parts objects). Serialize the resulting 23-element array with Python json.dumps(ensure_ascii=False,separators=(',',':')), UTF8, no newline/BOM. No frame text, native output or future actual observation is manufactured. PowerShell compact JSON independently gave the same 11,966 length; Python supplied the exact hash above.

Required correction: obtain/select an information-complete finite final-record representation, including any exact resolvable interning/equality mappings and distinct actual facts, and measure the whole success and bounded failure output. This reviewer does not select that schema, permit omissions, add frames/files, or accept a surrogate as an actual receipt. The existing semantic-frame payload/range selection remains unchanged. The output lower bound is independent of the unresolved native aggregate count.

### F2 — Scope the pagination stop to the selected turn, not unrelated older history

The Root capture paragraph says generic hasMore/unresolvedcursor causes HOLD. The supported read_thread interface uses older-turn cursors; hasMore can describe older turns outside the selected complete B-READ turn. Such a page flag is not itself proof that the desired turn's command records were clipped.

Clarify the exact selected-turn completeness criterion: expected source chat/actual turn and all thirty actual record IDs/bodies, full per-item output/command fields and explicit truncation/preview checks. Preserve HOLD for missing or incomplete required records and unresolved paging that actually prevents their recovery. Distinguish unrelated older-turn pagination from selected-turn completeness. This is a contract clarification, not permission to ignore a real clip, invent a cursor, add an uncounted history read or query the quiet host.

### F3 — Bind phase chronology before bootstrap and A intake

The counted route includes three recipe bootstrap records and one actual A-intake record in addition to the two entry records. The entry description says its first action reports the clock BEFORE work. A first clock taken only at b-entry1 would be late for bootstrap/intake.

The proposal must explicitly bind an actual conservative consumed-admission/app-turn start covering ALL work, with its authoritative event/UTC and externally assessed elapsed/late facts, while preserving the program's actual internal UTC/monotonic entry samples as their own later observations. Do not backdate an internal monotonic sample or substitute a future guessed platform timestamp. Clarify exact order and which source proves each clock/domain. This preserves the correction ruling rather than treating an internally recorded later timestamp as whole-phase evidence.

## Verified compliant planning constraints

1. The three-wave separation is preserved: A creates five raw copies; B-READ writes nothing and keeps receipt.json absent; C separately reviews the captured proof and subsequently gates the sole quiet receipt write. B's maximum disposition is SEMANTIC_COVERAGE_RECORDED/INDEPENDENT_REVIEW_PENDING, never instruction readiness or C admission.
2. Five full raw pins, exact selected domains, all 28 lesson IDs/38 occurrences, complete snapshot item values, and all 23 semantic displays are retained. No byte selection was narrowed to achieve a count.
3. Current byte/access observations are distinguished from historical same-actor reading declarations and actual current applicability attestation. No semantic credit is assigned to hashes, summaries, new workers or role labels. Missing current binding remains HOLD.
4. Quiet cardinality is correctly thirty: three bootstrap + one A intake + two entry + twenty-three semantic frames + one close. The conditional wrapper ledger sums forty: thirty quiet records + four proposed Root history reads + parse/reconstruct/serialize + apply_patch + ordinary readback/hash + ACK/closure + two reserve.
5. Forty is explicitly not whole-route fit. At least twenty-seven one-shot Python native invocations are identified separately; exact native/wrapper/tool aggregate interpretation and implementation remain unresolved. If those costs are additive, forty wrappers do not fit the aggregate cap. No hidden free generator, native exemption or automatic coalescing is established by this review.
6. The four Root history reads are an allowance proposal, not observed future capacity. Historical six-record extraction supports multi-record access but does not establish thirty-record aggregate completeness, <=20k complete command recovery, <=10k closed outputs, patch-request capacity, lossless actual field access or a bound on all additional calls. Preview/clipping/missing required fields remain HOLD. Tool-returned output text must not be mislabeled as independently captured native stdout/stderr bytes or EOF evidence absent from that interface.
7. The shared Root capsule path/schema is explicit: C-review root/B-READ.capsule.json, blurby.instruction-B-READ.root-capsule.v1. It stores complete actual returned history raw text plus complete actual command/output records and external A binding, not merely expected hashes. Actual namespace ownership/absence, exclusive materialization, raw reply identity, exact reconstruction and ordinary complete readback are not yet observed or qualified.
8. The old B draft remains 24,309/b51cd173d1ec4f861001f4a9a534f9cddf4714f76c90bb94fdb210e5f32d0d32; old Capacity remains 117,275/264a8ab2fbdefeb1e35a5d054666338b3bf00e328c335839905c3b8380329260. Rehashed both current raw files independently; identities match the historical references. Earlier 41/43 and 44/47 evidence is not rewritten as fit.
9. Prospective 45-minute cap, 39-minute work cutoff/six-minute reserve, and uncalibrated 33-minute plan are labeled honestly. Actual accepted A evidence and complete independently reviewed A/B/C budgets remain prerequisites before any A gate. No provider, status, Seq, terminal, source, package, native or release authority is elevated.

## Then: narrow planning quality assessment

Quality acceptance is **HELD after the compliance findings**, not declared PASS in advance of correcting F1–F3. The packet usefully preserves complete domain coverage and exposes capture/native accounting gaps. Its source-domain and frame DATA measurements are reproducible. However a final proof record larger than its entire allowed output and ambiguous paging/start-clock criteria would cause avoidable post-entry stops; these are pre-dispatch specification work.

Recommendation: keep all frozen history, resolve the exact final schema and chronology/pagination contract through Brain, author/review actual finite programs and transport, then recompute all three capacities. A smaller numerical wrapper count alone is insufficient.

Only this new review Markdown was authored. No quiet/Brain/executor message or query, tested-source/helper import, reviewed-code execution, application source change, native runtime, provider or Git mutation occurred. All subject and historical files remain unchanged.

