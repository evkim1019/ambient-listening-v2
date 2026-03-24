# Implementation Plan: Ambient Clinical Notes

## Overview

Build a seven-screen ambient clinical notes feature using React + TypeScript + Vite with AWS Amplify backend. All backend services use mock/dummy implementations. The implementation follows an incremental approach: foundational types and data first, then mock services, then shared components, then screens wired together with routing and state management, and finally data persistence.

## Tasks

- [x] 1. Set up project foundation: types, data constants, and routing
  - [x] 1.1 Create shared TypeScript types
    - Create `src/features/ambient-notes/types.ts` with all shared interfaces and types: `TemplateName`, `ComplianceMapping`, `TranscriptionResult`, `GeneratedNote`, `WritingStyleProfile`, `EHRSystem`, `ExportResult`, `ListeningStatus`, `SensitivityDetection`, `DocumentationGap`, `GapAnalysisResult`, `AttestationRecord`, `VolatileBufferState`
    - _Requirements: All_

  - [x] 1.2 Create static data constants
    - Create `src/features/ambient-notes/data/complianceMappings.ts` with the `COMPLIANCE_MAPPINGS` array
    - Create `src/features/ambient-notes/data/templates.ts` with `TEMPLATE_SECTIONS` record for all 7 templates
    - Create `src/features/ambient-notes/data/ehrSystems.ts` with `EHR_SYSTEMS` array (Epic, Cerner, Allscripts, athenahealth)
    - Create `src/features/ambient-notes/data/sensitiveTopicPatterns.ts` with `SENSITIVE_TOPIC_PATTERNS` array
    - Create `src/features/ambient-notes/data/gapDetectionRules.ts` with `GAP_DETECTION_RULES` array
    - _Requirements: 4.4, 5.2, 10.2, 15.6, 14.1_

  - [x] 1.3 Install react-router-dom and set up routing skeleton
    - Install `react-router-dom` dependency
    - Create `src/features/ambient-notes/routes.tsx` defining all 7 routes under `/ambient-notes`
    - Create placeholder screen components (empty functional components) for all 7 screens
    - Update `src/App.tsx` to include React Router with the ambient-notes routes
    - _Requirements: 1.1, 12.1_

  - [x] 1.4 Create AuthGuard wrapper component
    - Create `src/features/ambient-notes/components/AuthGuard.tsx` that checks Amplify Auth status
    - Redirect unauthenticated users to login screen
    - Wrap all ambient-notes routes with AuthGuard
    - _Requirements: 12.1, 12.2_

- [x] 2. Implement mock services and volatile buffer
  - [x] 2.1 Implement volatile audio buffer
    - Create `src/features/ambient-notes/services/volatileAudioBuffer.ts`
    - Implement `storeInBuffer`, `addRedactedSegment`, `getBufferState`, `purgeBuffer`, `isBufferActive` functions
    - Buffer holds data in module-level variables (in-memory only, no localStorage/IndexedDB)
    - _Requirements: 13.1, 13.5, 13.6_

  - [x] 2.2 Implement mock transcription service
    - Create `src/features/ambient-notes/services/mockTranscriptionService.ts`
    - `transcribeAudio(audioBlob)` returns a realistic dummy clinical encounter transcription after a simulated delay (1-2s)
    - Support optional `simulateError` flag for error path testing
    - _Requirements: 3.1_

  - [x] 2.3 Implement mock compliance service
    - Create `src/features/ambient-notes/services/mockComplianceService.ts`
    - `applyCompliance(text)` replaces sensitive terms using `COMPLIANCE_MAPPINGS` and returns transformed text with mappings
    - `getComplianceMappings()` returns the full mapping list
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 2.4 Implement mock note generator service
    - Create `src/features/ambient-notes/services/mockNoteGeneratorService.ts`
    - `generateNote(options)` returns structured note when template provided (using `TEMPLATE_SECTIONS`), or unstructured note with recommended sentences when no template
    - Integrates compliance and writing style options
    - Support optional `simulateError` flag
    - _Requirements: 7.2, 7.3_

  - [x] 2.5 Implement mock writing style service
    - Create `src/features/ambient-notes/services/mockWritingStyleService.ts`
    - `getWritingStyleProfile(providerId)` returns dummy style profile; specific provider ID returns `{ available: false }` for testing
    - _Requirements: 6.2, 6.4_

  - [x] 2.6 Implement mock sensitivity monitor service
    - Create `src/features/ambient-notes/services/mockSensitivityMonitorService.ts`
    - `analyzeAudioChunk(audioChunk)` returns a `SensitivityDetection` or null with simulated delay
    - `getSensitiveTopicPatterns()` returns the configurable patterns list
    - _Requirements: 15.1, 15.5, 15.6_

  - [x] 2.7 Implement mock gap identifier service
    - Create `src/features/ambient-notes/services/mockGapIdentifierService.ts`
    - `analyzeNoteForGaps(noteContent, templateName?)` checks for absence of keywords from `GAP_DETECTION_RULES` and returns matching gaps
    - _Requirements: 14.1, 14.4_

  - [x] 2.8 Implement mock EHR export service
    - Create `src/features/ambient-notes/services/mockEHRExportService.ts`
    - `getAvailableEHRSystems()` returns dummy EHR systems list
    - `exportToEHR(ehrSystemId, note, transcript?)` simulates export and returns success result with reference ID
    - Support optional `simulateError` flag
    - _Requirements: 10.2, 10.3_

- [x] 3. Checkpoint - Ensure foundation compiles
  - Ensure all types, data constants, mock services, and routing compile without errors. Ask the user if questions arise.

- [x] 4. Implement shared UI components
  - [x] 4.1 Create LoadingIndicator and ErrorRetry components
    - Create `src/features/ambient-notes/components/LoadingIndicator.tsx` — shared loading spinner
    - Create `src/features/ambient-notes/components/ErrorRetry.tsx` — error message with retry button, accepts `message` and `onRetry` props
    - _Requirements: 3.2, 3.4, 7.4, 7.6, 10.5_

  - [x] 4.2 Create PulsingCircle component
    - Create `src/features/ambient-notes/components/PulsingCircle.tsx` with CSS-animated pulsing circle for active listening indicator
    - _Requirements: 2.1_

  - [x] 4.3 Create ComplianceHighlight component
    - Create `src/features/ambient-notes/components/ComplianceHighlight.tsx` — highlighted span with tooltip showing original term on hover
    - _Requirements: 8.1, 8.2_

  - [x] 4.4 Create TemplateDropdown component
    - Create `src/features/ambient-notes/components/TemplateDropdown.tsx` — dropdown listing all 7 templates, controlled by parent
    - _Requirements: 5.2_

  - [x] 4.5 Create RecommendedSentence component
    - Create `src/features/ambient-notes/components/RecommendedSentence.tsx` — clickable sentence chip that calls an `onInsert` callback
    - _Requirements: 9.2, 9.3_

  - [x] 4.6 Create SensitivityFlag component
    - Create `src/features/ambient-notes/components/SensitivityFlag.tsx` — visual alert showing detected topic category, with "Pause" and "Flag for Redaction" action buttons, and suggested alternative display
    - _Requirements: 15.2, 15.3, 15.5_

  - [x] 4.7 Create GapNotificationPanel and GapItem components
    - Create `src/features/ambient-notes/components/GapItem.tsx` — individual gap entry with description, severity badge, and "Add Suggestion" button
    - Create `src/features/ambient-notes/components/GapNotificationPanel.tsx` — panel listing `GapItem` components with severity categorization
    - _Requirements: 14.2, 14.3, 14.4_

  - [x] 4.8 Create AttestationForm component
    - Create `src/features/ambient-notes/components/AttestationForm.tsx` — attestation statement text, checkbox, and "Sign and Proceed" button; button disabled until checkbox is checked
    - _Requirements: 16.3, 16.4_

  - [x] 4.9 Create DataRetentionPrompt component
    - Create `src/features/ambient-notes/components/DataRetentionPrompt.tsx` — confirmation dialog with "Save Raw Data" and "Purge" options; defaults to "do not save"
    - _Requirements: 13.2, 13.3_

- [x] 5. Implement AmbientNotesContext for session state management
  - [x] 5.1 Create AmbientNotesContext and provider
    - Create `src/features/ambient-notes/context/AmbientNotesContext.tsx`
    - Define `AmbientNotesState` interface with all session state fields (audio, listening status, transcription, options, generated note, gaps, retention, attestation, export)
    - Implement context provider with state management actions (dispatch or setter functions)
    - Include `resetSession` action that purges volatile buffer and resets all state
    - _Requirements: 1.4, 2.6, 13.1_

  - [x] 5.2 Wire context provider into routing layout
    - Wrap ambient-notes route layout with `AmbientNotesProvider`
    - Register `beforeunload` event handler that calls `purgeBuffer()` on the volatile audio buffer
    - _Requirements: 13.6_

- [x] 6. Implement Screen 1 (Idle) and Screen 2 (Active Listening)
  - [x] 6.1 Implement IdleScreen
    - Implement `src/features/ambient-notes/screens/IdleScreen.tsx`
    - Display "Start" button in idle state
    - On click: request microphone permission via `navigator.mediaDevices.getUserMedia`
    - If denied: show error message using ErrorRetry component
    - If granted: navigate to `/ambient-notes/listen`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.2 Implement ActiveListeningScreen
    - Implement `src/features/ambient-notes/screens/ActiveListeningScreen.tsx`
    - Show PulsingCircle animation while listening
    - Display "Pause" and "Completed" buttons while listening
    - Pause: stop animation, show "Resume" button instead of "Pause"
    - Resume: restart animation, show "Pause" button
    - Completed: stop capture, store audio blob in volatile buffer, navigate to `/ambient-notes/review` (trigger mock transcription)
    - Integrate MockSensitivityMonitorService: periodically call `analyzeAudioChunk` during recording
    - Display SensitivityFlag components for detected sensitive topics
    - Handle "Pause" action from sensitivity flag
    - Handle "Flag for Redaction" action: mark segment via `addRedactedSegment` on volatile buffer
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 6.3 Write property tests for sensitivity monitoring
    - **Property 15: Real-time sensitivity detection produces valid flags**
    - **Property 16: Flagged segments are redacted from transcription**
    - **Validates: Requirements 15.1, 15.2, 15.4, 15.5**

- [x] 7. Implement Screen 3 (Transcription Review)
  - [x] 7.1 Implement TranscriptionReviewScreen
    - Implement `src/features/ambient-notes/screens/TranscriptionReviewScreen.tsx`
    - On mount: call `transcribeAudio` from mock service, show LoadingIndicator during processing
    - On failure: show ErrorRetry with retry option
    - Display full transcription text when ready
    - Add "Modify wordings to legal compliance" toggle (default off); when enabled, call `applyCompliance` and show transformed text; when disabled, revert to original
    - Add "Start with template" toggle (default off); when enabled, show TemplateDropdown; when disabled, hide dropdown and clear selection
    - Add "Use my writing style" toggle (default off); when enabled, call `getWritingStyleProfile`; if unavailable, show message
    - Add "Generate Note" button; disabled when template toggle is on but no template selected
    - On Generate Note click: call `generateNote` with current options, show LoadingIndicator, navigate to `/ambient-notes/editor` on success, show ErrorRetry on failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 7.2 Write property tests for compliance and template validation
    - **Property 1: Compliance transformation round-trip**
    - **Property 2: Compliance transformation completeness**
    - **Property 3: Template-based note contains all template sections**
    - **Property 4: Template selection is required when toggle is enabled**
    - **Validates: Requirements 4.2, 4.3, 5.3, 7.2**

- [x] 8. Checkpoint - Ensure screens 1-3 work end-to-end
  - Ensure all tests pass and the flow from Idle → Active Listening → Transcription Review works correctly. Ask the user if questions arise.

- [x] 9. Implement Screen 4 (Note Editor with Gap Identification)
  - [x] 9.1 Implement NoteEditorScreen with template-based view
    - Implement `src/features/ambient-notes/screens/NoteEditorScreen.tsx`
    - When note was generated with a template: display structured note content in an editable text area
    - Render compliance-modified terms using ComplianceHighlight components (highlighted with tooltip showing original)
    - Display "Save original transcript" checkbox
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 9.2 Implement NoteEditorScreen without-template view
    - When note was generated without a template: display blank text box for writing
    - Display list of recommended sentences using RecommendedSentence components
    - Clicking a recommended sentence inserts it at the current cursor position in the text box
    - Apply compliance highlights to recommended sentences when compliance is enabled
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 9.3 Integrate gap identification into NoteEditorScreen
    - On note load: call `analyzeNoteForGaps` and display results in GapNotificationPanel
    - Each gap shows description, severity badge, and suggested text
    - Clicking "Add Suggestion" on a gap inserts the suggested text into the note and removes the gap from the panel
    - Re-analyze gaps on each note edit (debounced)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 9.4 Add "Finalize" action to NoteEditorScreen
    - Add "Finalize" button that navigates to `/ambient-notes/retention`
    - _Requirements: 10.1_

  - [ ]* 9.5 Write property tests for note editor features
    - **Property 5: Compliance-modified terms are highlighted with original tooltip**
    - **Property 6: Recommended sentence insertion at cursor position**
    - **Property 13: Gap identification detects missing documentation elements**
    - **Property 14: Gap resolution removes gap from panel**
    - **Validates: Requirements 8.1, 8.2, 9.3, 14.1, 14.5, 14.6**

- [x] 10. Implement Screen 5 (Data Retention), Screen 6 (Attestation), and Screen 7 (EHR Export)
  - [x] 10.1 Implement DataRetentionScreen
    - Implement `src/features/ambient-notes/screens/DataRetentionScreen.tsx`
    - Display DataRetentionPrompt component with "Save Raw Data" and "Purge" options
    - Default to "do not save" (purge)
    - On confirm save: set `dataRetentionConfirmed = true` in context, navigate to `/ambient-notes/attestation`
    - On decline/purge: call `purgeBuffer()`, set `dataRetentionConfirmed = false`, navigate to `/ambient-notes/attestation`
    - _Requirements: 13.2, 13.3, 13.4, 13.5_

  - [x] 10.2 Implement AttestationScreen
    - Implement `src/features/ambient-notes/screens/AttestationScreen.tsx`
    - Display the complete finalized note in read-only format
    - Display AttestationForm with attestation statement, checkbox, and "Sign and Proceed" button
    - Button disabled until checkbox is checked
    - On sign: record attestation timestamp and provider identity in context, navigate to `/ambient-notes/export`
    - Block navigation to export if attestation not completed (AttestationGuard)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [x] 10.3 Implement EHRExportScreen
    - Implement `src/features/ambient-notes/screens/EHRExportScreen.tsx`
    - Call `getAvailableEHRSystems()` and display EHR system options
    - On select + confirm: call `exportToEHR` with note, optional transcript (if retention confirmed), attestation data
    - Show LoadingIndicator during export
    - On success: display confirmation message with reference ID
    - On failure: show ErrorRetry
    - Include attestation timestamp and provider identity in export payload
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 16.7_

  - [ ]* 10.4 Write property tests for retention, attestation, and export
    - **Property 7: Export payload includes transcript when opted**
    - **Property 8: Persistence saves note and optional transcript based on retention confirmation**
    - **Property 11: Volatile buffer purge on non-confirmation**
    - **Property 12: Data retention default is "do not save"**
    - **Property 17: Attestation blocks export when incomplete**
    - **Property 18: Attestation record included in export payload**
    - **Validates: Requirements 10.3, 10.4, 11.1, 11.2, 13.3, 13.4, 13.5, 16.5, 16.7**

- [x] 11. Checkpoint - Ensure full seven-screen flow works
  - Ensure all tests pass and the complete flow from Idle through EHR Export works correctly. Ask the user if questions arise.

- [ ] 12. Data persistence and auth guard integration
  - [ ] 12.1 Extend Amplify data schema with ClinicalNote and Transcription models
    - Update `amplify/data/resource.ts` to add `ClinicalNote` and `Transcription` models with owner-based authorization
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ] 12.2 Implement data persistence in the export/finalization flow
    - After attestation, persist the finalized note to Amplify Data backend
    - If data retention was confirmed, also persist the raw transcription linked to the note
    - Associate saved data with the authenticated provider's identity
    - Handle save failures with ErrorRetry
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 12.3 Write property tests for auth guard and persistence
    - **Property 9: Authentication guard on all routes**
    - **Property 10: Transcription service returns valid structure**
    - **Property 19: Sensitivity monitor configurable patterns**
    - **Validates: Requirements 12.1, 12.2, 3.1, 15.6**

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, the complete seven-screen flow works end-to-end with data persistence, and auth guards are in place. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All backend services use mock/dummy implementations with simulated delays — no real API integrations
- The design uses TypeScript throughout; all code examples and implementations use TypeScript + React
- Property tests use fast-check with a minimum of 100 iterations each
- Checkpoints ensure incremental validation at key integration points
