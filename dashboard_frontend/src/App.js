import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
 import { Navigate } from "react-router-dom";
// Pages
import Login from "./pages/Login";
import Acceuil from "./pages/Accueil";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

// Admin
import AdminLayout from "./pages/AdminLayout";
import AdminHome from "./pages/AdminHome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProjects from "./pages/AdminProjects";
import RolesPage from "./pages/RolesPage";
import TeamsPage from "./pages/TeamsPage";
import SubTeamsPage from "./pages/SubTeamsPage";

// PMO
import PmoLayout from "./pages/PmoLayout";
import PmoHome from "./pages/PmoHome";
import PmoDashboard from "./pages/PmoDashboard";
import PmoNotifications from "./pages/PmoNotifications";
import NotificationHistory from "./pages/NotificationHistory";

// User
import UserLayout from "./pages/UserLayout";
import UserHome from "./pages/UserHome";
import UserDashboard from "./pages/UserDashboard";
import CreateTask from "./pages/CreateTask";
import AddMembers from "./pages/AddMembers";
import ProjectTeam from "./pages/ProjectTeam";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import AllTasks from "./pages/AllTasks";

// Other
import DeveloperDashboard from "./pages/DeveloperDashboard";
import MemberTasks from "./pages/MemberTasks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Router>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Acceuil />} />
          <Route path="/login" element={<Login />} />

          {/*  ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="SYSTEM_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="subteams" element={<SubTeamsPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/*  PMO  */}
          <Route
            path="/pmo"
            element={
              <ProtectedRoute role="PMO">
                <PmoLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PmoHome />} />
            <Route path="projects" element={<PmoDashboard />} />
            <Route path="notifications" element={<PmoNotifications />} />
            <Route path="notifications/history" element={<NotificationHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/*  USER  */}
          <Route
            path="/user"
            element={
              <ProtectedRoute role="CHEF_PROJET">
                <UserLayout />
              </ProtectedRoute>
            }
          >
           

            <Route index element={<Navigate to="home" />} />
            <Route path="home" element={<UserHome />} />
            <Route path="tasks" element={<UserDashboard />} />
            <Route path="create-task/:id" element={<CreateTask />} />
            <Route path="edit-task/:id/:taskId" element={<CreateTask />} />
            <Route path="add-members/:id" element={<AddMembers />} />
            <Route path="project-team/:id" element={<ProjectTeam />} />
            <Route path="project-details/:id" element={<ProjectDetails />} />
            <Route path="task-details/:taskId" element={<TaskDetails />} />
            <Route path="all-tasks" element={<AllTasks />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/*  GENERAL (no layout)*/}
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />
          
         <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/member/:memberId/tasks/:projectId" element={<MemberTasks />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>


        </Routes>
      </Router>
    </>
  );
}

export default App;