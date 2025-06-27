import AppRouter from "./AppRouter";
import { usePlayerStore } from "./store/playerStore";
import { useEffect } from "react";

function App() {
  const { initializeGuestPlayer } = usePlayerStore();

  // Initialize guest player when the app loads
  useEffect(() => {
    initializeGuestPlayer();
  }, [initializeGuestPlayer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <div className="scrollable-content">
        <AppRouter />
      </div>
    </div>
  );
}

export default App;
