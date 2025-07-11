import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import RootRouter from "./routes/RootRouter";
import { useDispatch } from "react-redux";
import { fetchUserProfileThunk } from "./redux/features/user/userThunk";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Gọi action để khôi phục session từ token ngay khi App được mount
    dispatch(fetchUserProfileThunk());
  }, [dispatch]);
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
        <RootRouter />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </AuthProvider>
  );
}

export default App;
