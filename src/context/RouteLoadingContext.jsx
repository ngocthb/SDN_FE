// context/RouteLoadingContext.jsx
import { createContext, useContext, useState } from "react";

const RouteLoadingContext = createContext();

export const useRouteLoading = () => {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error("useRouteLoading must be used within RouteLoadingProvider");
  }
  return context;
};

export const RouteLoadingProvider = ({ children }) => {
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(null);

  const startRouteLoading = (routePath) => {
    setLoadingRoute(routePath);
    setIsRouteLoading(true);
  };

  const stopRouteLoading = () => {
    setIsRouteLoading(false);
    setLoadingRoute(null);
  };

  const value = {
    isRouteLoading,
    loadingRoute,
    startRouteLoading,
    stopRouteLoading,
  };

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
    </RouteLoadingContext.Provider>
  );
};

export default RouteLoadingContext;
