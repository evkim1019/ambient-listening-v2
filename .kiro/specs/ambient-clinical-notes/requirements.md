# Requirements Document

## Introduction

Ambient Clinical Notes is a multi-screen feature that enables healthcare providers to capture patient encounters through ambient audio listening, transcribe the audio, apply legal compliance transformations, generate structured clinical notes using selectable templates, and export finalized notes to Electronic Health Record (EHR) systems. The feature follows a five-screen user journey: ambient listening, active recording, transcription review with options, note drafting and editing, and final export.

## Glossary

- **Ambient_Listener**: The audio capture component that uses the device microphone to record ambient clinical conversations in real time.
- **Transcription_Engine**: The backend service that converts captured audio into text transcription.
- **Compliance_Transformer**: The component that replaces clinically sensitive terms with legally compliant alternatives in the transcription and generated notes.
- **Note_Generator**: The service that produces structured clinical notes from transcription text, optionally applying a selected template and the provider's writing style.
- **Template_Selector**: The UI component that allows the provider to choose a clinical note template from a predefined list.
- **Note_Editor**: The screen where the provider reviews, edits, and finalizes the generated clinical note draft.
- **EHR_Exporter**: The component responsible for exporting the finalized clinical note to external Electronic Health Record systems.
- **Provider**: The authenticated healthcare professional using the application.
- **Writing_Style_Model**: The component that analyzes a provider's past notes to replicate their specific writing style in generated notes.
- **Recommended_Sentence**: A contextually relevant sentence suggestion displayed in the Note_Editor when no template is used.
- **Volatile_Audio_Buffer**: The temporary in-memory storage that holds raw audio and transcription data during a session; data in this buffer is not persisted unless the Provider explicitly confirms retention.
- **Data_Retention_Confirmation**: The explicit action a Provider takes after a visit to approve saving raw audio and transcription data; without this confirmation, the Volatile_Audio_Buffer is purged.
- **Gap_Identifier**: The component that analyzes a generated clinical note in real time to detect missing documentation elements required for billing, compliance, or clinical completeness.
- **Documentation_Gap**: A missing or incomplete element in a clinical note, such as absent social determinants of health (SDOH), missing counseling duration, or missing diagnosis codes.
- **Real_Time_Sensitivity_Monitor**: The component that analyzes the audio stream during active recording to detect sensitive topics and alert the Provider in real time.
- **Sensitivity_Flag**: A visual indicator displayed on the clinician's device when the Real_Time_Sensitivity_Monitor detects a sensitive topic during active recording.
- **Segment_Redaction**: The process of marking a flagged audio/transcription segment for automatic removal or neutralization from the final output.
- **Attestation_Panel**: The UI component where the Provider formally reviews and signs off on the generated clinical note, confirming it as their own work before export.
- **Clinician_Attestation**: The formal sign-off action by the Provider confirming that the finalized note accurately represents the clinical encounter and is the Provider's own work product.

## Requirements

### Requirement 1: Start Ambient Listening

**User Story:** As a Provider, I want to start ambient audio capture with a single click, so that I can begin recording a patient encounter hands-free.

#### Acceptance Criteria

1. THE Ambient_Listener screen SHALL display a "Start" button in an idle state.
2. WHEN the Provider clicks the "Start" button, THE Ambient_Listener SHALL request microphone access from the device.
3. IF the device denies microphone access, THEN THE Ambient_Listener SHALL display an error message indicating that microphone permission is required.
4. WHEN microphone access is granted, THE Ambient_Listener SHALL begin capturing audio and transition to the active listening screen.

### Requirement 2: Active Listening with Visual Feedback

**User Story:** As a Provider, I want to see a visual indicator that ambient listening is active, so that I can confirm the system is recording.

#### Acceptance Criteria

1. WHILE the Ambient_Listener is capturing audio, THE Ambient_Listener SHALL display a pulsing circle animation to indicate active listening.
2. WHILE the Ambient_Listener is capturing audio, THE Ambient_Listener SHALL display a "Pause" button and a "Completed" button.
3. WHEN the Provider clicks the "Pause" button, THE Ambient_Listener SHALL pause audio capture and stop the pulsing animation.
4. WHILE the Ambient_Listener is paused, THE Ambient_Listener SHALL display a "Resume" button in place of the "Pause" button.
5. WHEN the Provider clicks the "Resume" button, THE Ambient_Listener SHALL resume audio capture and restart the pulsing animation.
6. WHEN the Provider clicks the "Completed" button, THE Ambient_Listener SHALL stop audio capture and send the recorded audio to the Transcription_Engine.

### Requirement 3: Audio Transcription

**User Story:** As a Provider, I want the recorded audio to be transcribed into text, so that I can review and use the conversation content for clinical notes.

#### Acceptance Criteria

1. WHEN the Ambient_Listener sends recorded audio, THE Transcription_Engine SHALL convert the audio into a text transcription.
2. WHILE the Transcription_Engine is processing audio, THE application SHALL display a loading indicator to the Provider.
3. WHEN transcription is complete, THE application SHALL navigate the Provider to the transcription review screen displaying the full transcription text.
4. IF the Transcription_Engine fails to process the audio, THEN THE application SHALL display an error message and offer the Provider an option to retry.

### Requirement 4: Legal Compliance Transformation

**User Story:** As a Provider, I want to toggle legal compliance wording modifications, so that sensitive clinical terms are replaced with legally appropriate alternatives in my notes.

#### Acceptance Criteria

1. THE transcription review screen SHALL display a "Modify wordings to legal compliance" toggle, defaulting to off.
2. WHEN the Provider enables the "Modify wordings to legal compliance" toggle, THE Compliance_Transformer SHALL replace sensitive terms with legally compliant alternatives (e.g., "suicide" becomes "threatening own life", "abortion" becomes "female's health management").
3. WHEN the Provider disables the "Modify wordings to legal compliance" toggle, THE Compliance_Transformer SHALL revert all replacements to the original transcription terms.
4. THE Compliance_Transformer SHALL maintain a configurable mapping of sensitive terms to compliant alternatives.

### Requirement 5: Template Selection

**User Story:** As a Provider, I want to select a clinical note template, so that the generated note follows a standardized format appropriate for my documentation needs.

#### Acceptance Criteria

1. THE transcription review screen SHALL display a "Start with template" toggle, defaulting to off.
2. WHEN the Provider enables the "Start with template" toggle, THE Template_Selector SHALL display a dropdown with the following template options: "Behavioral SOAP", "BIRP", "DAP", "GIRPP", "SIRP", "Physical SOAP", and "Historical and Physical".
3. WHILE the "Start with template" toggle is enabled, THE Template_Selector SHALL require the Provider to select one template before proceeding.
4. WHEN the Provider disables the "Start with template" toggle, THE Template_Selector SHALL hide the template dropdown and clear any previous selection.

### Requirement 6: Writing Style Personalization

**User Story:** As a Provider, I want the generated notes to match my personal writing style, so that the documentation is consistent with my previous clinical notes.

#### Acceptance Criteria

1. THE transcription review screen SHALL display a "Use my writing style" toggle, defaulting to off.
2. WHEN the Provider enables the "Use my writing style" toggle, THE Writing_Style_Model SHALL analyze the Provider's past notes to determine the Provider's writing style.
3. WHEN the "Use my writing style" toggle is enabled during note generation, THE Note_Generator SHALL apply the Provider's writing style to the generated note.
4. IF the Writing_Style_Model has no past notes for the Provider, THEN THE application SHALL display a message indicating that no writing style data is available and use a default writing style.

### Requirement 7: Generate Clinical Note

**User Story:** As a Provider, I want to generate a clinical note from the transcription, so that I can produce documentation efficiently.

#### Acceptance Criteria

1. THE transcription review screen SHALL display a "Generate Note" button.
2. WHEN the Provider clicks the "Generate Note" button with a template selected, THE Note_Generator SHALL produce a structured clinical note using the selected template, the transcription text, and any enabled options (compliance transformation, writing style).
3. WHEN the Provider clicks the "Generate Note" button without a template selected, THE Note_Generator SHALL produce an unstructured note draft from the transcription text with any enabled options applied.
4. WHILE the Note_Generator is producing the note, THE application SHALL display a loading indicator.
5. WHEN note generation is complete, THE application SHALL navigate the Provider to the Note_Editor screen.
6. IF the Note_Generator fails to produce a note, THEN THE application SHALL display an error message and offer the Provider an option to retry.

### Requirement 8: Note Draft Review with Template

**User Story:** As a Provider, I want to review the generated note with compliance modifications highlighted, so that I can see what was changed and verify the original wording.

#### Acceptance Criteria

1. WHEN a note is generated with legal compliance enabled, THE Note_Editor SHALL highlight all compliance-modified terms in the note draft.
2. WHEN the Provider hovers over a highlighted compliance-modified term, THE Note_Editor SHALL display a tooltip showing the original transcription wording.
3. THE Note_Editor SHALL allow the Provider to edit the generated note text directly.
4. THE Note_Editor SHALL display a checkbox labeled "Save original transcript" to allow the Provider to choose whether to persist the raw transcription alongside the final note.

### Requirement 9: Note Draft Review without Template

**User Story:** As a Provider, I want to build a note from scratch with AI-recommended sentences when no template is used, so that I can compose documentation with intelligent assistance.

#### Acceptance Criteria

1. WHEN a note is generated without a template, THE Note_Editor SHALL display a blank text box for the Provider to write in.
2. WHEN a note is generated without a template, THE Note_Editor SHALL display a list of recommended sentences derived from the transcription.
3. WHEN the Provider clicks a recommended sentence, THE Note_Editor SHALL append that sentence to the note text at the current cursor position.
4. THE Note_Editor SHALL allow the Provider to edit the note text directly in the blank text box.
5. WHEN a note is generated without a template and legal compliance is enabled, THE Note_Editor SHALL apply compliance modifications to the recommended sentences and highlight modified terms.

### Requirement 10: Export to EHR

**User Story:** As a Provider, I want to export the finalized clinical note to an EHR system, so that the documentation is stored in the patient's electronic health record.

#### Acceptance Criteria

1. WHEN the Provider finalizes the note in the Note_Editor, THE application SHALL navigate the Provider to the export screen.
2. THE EHR_Exporter screen SHALL display available EHR system export options.
3. WHEN the Provider selects an EHR system and confirms export, THE EHR_Exporter SHALL transmit the finalized note to the selected EHR system.
4. WHEN the Provider opted to save the original transcript, THE EHR_Exporter SHALL include the original transcript alongside the finalized note in the export.
5. IF the export to the EHR system fails, THEN THE EHR_Exporter SHALL display an error message and offer the Provider an option to retry.
6. WHEN the export is successful, THE EHR_Exporter SHALL display a confirmation message to the Provider.

### Requirement 11: Data Persistence

**User Story:** As a Provider, I want my clinical notes and transcriptions to be saved, so that I can access them later.

#### Acceptance Criteria

1. WHEN the Provider finalizes a note, THE application SHALL persist the finalized note to the Amplify data backend associated with the authenticated Provider.
2. WHEN the Provider opts to save the original transcript, THE application SHALL persist the original transcription text alongside the finalized note.
3. THE application SHALL associate each saved note and transcript with the authenticated Provider's identity.
4. IF a save operation fails, THEN THE application SHALL display an error message and offer the Provider an option to retry.

### Requirement 12: Authentication Guard

**User Story:** As a Provider, I want the ambient clinical notes feature to be accessible only when I am authenticated, so that patient data remains secure.

#### Acceptance Criteria

1. THE application SHALL require the Provider to be authenticated before accessing any ambient clinical notes screen.
2. IF an unauthenticated user attempts to access an ambient clinical notes screen, THEN THE application SHALL redirect the user to the login screen.

### Requirement 13: Volatile Memory Processing and Clinician-Controlled Data Retention

**User Story:** As a Provider, I want raw audio and transcription data to be held in a volatile state by default and purged unless I explicitly confirm retention, so that I have full agency over what clinical data is permanently stored.

#### Acceptance Criteria

1. WHILE a clinical encounter session is active, THE Volatile_Audio_Buffer SHALL hold raw audio and transcription data in temporary in-memory storage without persisting the data to any permanent store.
2. WHEN the Provider completes a session and navigates to the Note_Editor, THE application SHALL display a Data_Retention_Confirmation prompt asking the Provider to explicitly confirm whether to save the raw audio and transcription data.
3. THE Data_Retention_Confirmation prompt SHALL default to "do not save" so that no raw data is retained unless the Provider explicitly opts in.
4. WHEN the Provider confirms data retention via the Data_Retention_Confirmation prompt, THE application SHALL persist the raw transcription data alongside the finalized note.
5. WHEN the Provider declines data retention or does not interact with the Data_Retention_Confirmation prompt before finalizing, THE application SHALL purge all raw audio and transcription data from the Volatile_Audio_Buffer, retaining only the clinician-approved finalized note.
6. IF the Provider's session ends unexpectedly (e.g., browser close, navigation away), THEN THE application SHALL purge all data in the Volatile_Audio_Buffer.

### Requirement 14: Agentic Gap Identification

**User Story:** As a Provider, I want the system to proactively identify documentation gaps in the generated clinical note, so that I can ensure the note is comprehensive enough for billing, compliance, and clinical completeness.

#### Acceptance Criteria

1. WHEN the Note_Generator produces a clinical note, THE Gap_Identifier SHALL analyze the note to detect Documentation_Gaps including missing social determinants of health (SDOH), missing counseling duration, missing diagnosis codes, and missing procedure justifications.
2. WHEN the Gap_Identifier detects one or more Documentation_Gaps, THE Note_Editor SHALL display a gap notification panel listing each identified gap with a description of what is missing and why it matters for billing or compliance.
3. WHEN the Provider clicks on a Documentation_Gap item in the gap notification panel, THE Note_Editor SHALL suggest specific text additions that address the identified gap.
4. THE Gap_Identifier SHALL categorize each Documentation_Gap by severity: "required for billing", "recommended for compliance", or "suggested for clinical completeness".
5. WHEN the Provider adds suggested text for a Documentation_Gap, THE Gap_Identifier SHALL remove that gap from the notification panel.
6. THE Gap_Identifier SHALL re-analyze the note content each time the Provider makes an edit to detect any newly introduced or resolved gaps.

### Requirement 15: Real-Time Legal Guardrails During Recording

**User Story:** As a Provider, I want to receive real-time alerts when sensitive topics are detected during active recording, so that I can pause recording or flag segments for redaction before the data is processed.

#### Acceptance Criteria

1. WHILE the Ambient_Listener is capturing audio, THE Real_Time_Sensitivity_Monitor SHALL analyze the audio stream to detect sensitive topics (e.g., references to substance abuse, self-harm, domestic violence, or other legally sensitive disclosures).
2. WHEN the Real_Time_Sensitivity_Monitor detects a sensitive topic, THE ActiveListeningScreen SHALL display a Sensitivity_Flag visual indicator identifying the detected topic category.
3. WHEN a Sensitivity_Flag is displayed, THE ActiveListeningScreen SHALL present the Provider with a single-click "Pause" action and a single-click "Flag for Redaction" action adjacent to the Sensitivity_Flag.
4. WHEN the Provider clicks "Flag for Redaction" on a Sensitivity_Flag, THE application SHALL mark the corresponding audio segment for Segment_Redaction so that the flagged content is automatically redacted from the transcription output.
5. WHEN the Real_Time_Sensitivity_Monitor detects a sensitive term, THE Real_Time_Sensitivity_Monitor SHALL suggest a neutral, medically standard terminology alternative that the Provider can accept to replace the detected term in the transcription.
6. THE Real_Time_Sensitivity_Monitor SHALL maintain a configurable list of sensitive topic patterns used for real-time detection.

### Requirement 16: Clinician Attestation and Sign-Off

**User Story:** As a Provider, I want to formally review and attest to the finalized clinical note before it is exported to the EHR, so that I confirm the note is accurate and represents my own work product.

#### Acceptance Criteria

1. WHEN the Provider finalizes the note in the Note_Editor, THE application SHALL navigate the Provider to the Attestation_Panel before proceeding to the EHR export screen.
2. THE Attestation_Panel SHALL display the complete finalized note in a read-only format for the Provider to review.
3. THE Attestation_Panel SHALL display a Clinician_Attestation statement reading: "I attest that this clinical note accurately represents the patient encounter and is my own work product."
4. THE Attestation_Panel SHALL require the Provider to check an attestation checkbox and click a "Sign and Proceed" button to complete the Clinician_Attestation.
5. IF the Provider has not completed the Clinician_Attestation, THEN THE application SHALL prevent navigation to the EHR export screen.
6. WHEN the Provider completes the Clinician_Attestation, THE application SHALL record the attestation timestamp and the Provider's identity, then navigate to the EHR export screen.
7. THE EHR_Exporter SHALL include the Clinician_Attestation timestamp and Provider identity in the export payload alongside the finalized note.
