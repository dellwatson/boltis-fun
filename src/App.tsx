import AppRouter from "./AppRouter";
import { usePlayerStore } from "./store/playerStore";
import { useEffect } from "react";

const TechBadges = () => (
  <div className="fixed bottom-2 right-2 md:bottom-2 md:right-10 z-50 flex items-center gap-3 md:gap-4 p-2 md:p-3 md:scale-125 scale-75 ">
    {/* Reddit */}
    <a
      href="https://reddit.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform duration-200"
    >
      <img
        src="/reddit.webp"
        alt="Join us on Reddit"
        className="h-3 md:h-5 w-auto"
      />
    </a>

    {/* Supabase */}
    <a
      href="https://supabase.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform duration-200"
    >
      <img
        src="/supabase.svg"
        alt="Powered by Supabase"
        className="h-7 md:h-9 w-auto"
      />
    </a>

    {/* Netlify */}
    <a
      href="https://netlify.com"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform duration-200"
    >
      <img
        src="/netlify.svg"
        alt="Deployed on Netlify"
        className="h-5 md:h-7 w-auto"
      />
    </a>

    {/* Bolt */}
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:scale-110 transition-transform duration-200"
    >
      <img
        src="/white_circle_360x360.webp"
        alt="Built with Bolt"
        className="w-8 h-8 md:w-11 md:h-11 rounded-full"
      />
    </a>
  </div>
);

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
        <TechBadges />
      </div>
    </div>
  );
}

export default App;
