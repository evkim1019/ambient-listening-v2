import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import { AmbientNotesProvider } from "./context/AmbientNotesContext";
import { purgeBuffer } from "./services/volatileAudioBuffer";
import IdleScreen from "./screens/IdleScreen";
import ActiveListeningScreen from "./screens/ActiveListeningScreen";
import TranscriptionReviewScreen from "./screens/TranscriptionReviewScreen";
import DataRetentionScreen from "./screens/DataRetentionScreen";
import AttestationScreen from "./screens/AttestationScreen";
import EHRExportScreen from "./screens/EHRExportScreen";

function BeforeUnloadGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      purgeBuffer();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}

export default function AmbientNotesRoutes() {
  return (
    <AuthGuard>
      <AmbientNotesProvider>
        <BeforeUnloadGuard>
          <Routes>
            <Route index element={<IdleScreen />} />
            <Route path="listen" element={<ActiveListeningScreen />} />
            <Route path="review" element={<TranscriptionReviewScreen />} />
            <Route path="retention" element={<DataRetentionScreen />} />
            <Route path="attestation" element={<AttestationScreen />} />
            <Route path="export" element={<EHRExportScreen />} />
          </Routes>
        </BeforeUnloadGuard>
      </AmbientNotesProvider>
    </AuthGuard>
  );
}
