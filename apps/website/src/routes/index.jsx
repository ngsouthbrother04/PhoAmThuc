import Map from "../pages/Map";
import Home from "../pages/Home";
import AdminDashboard from "../pages/AdminDashboard";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import PartnerProfile from "../pages/PartnerProfile";
import NotFound from "../pages/NotFound";

export const routes = [
  {
    path: "/",
    element: <Map />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/partner-profile",
    element: <PartnerProfile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
