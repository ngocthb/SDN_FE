// components/RouteLoadingOverlay.jsx
import { useRouteLoading } from "../context/RouteLoadingContext";

const RouteLoadingOverlay = () => {
  const { isRouteLoading, loadingRoute } = useRouteLoading();

  if (!isRouteLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animate-reverse"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-white font-medium">Loading...</p>
          {loadingRoute && (
            <p className="text-white/70 text-sm mt-1">
              Navigating to{" "}
              {loadingRoute.replace("/admin/", "").replace("/", " ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteLoadingOverlay;
