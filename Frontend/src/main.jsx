import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import "./index.css";
import App from "./App";
import MainLayout from "./layout/MainLayout";
import DashboardLayout from "./pages/admin/DashboardLayout";
import AdminLayout from "./layout/AdminLayout";
import GlobalError from "./pages/Error";

const StudentLayout = lazy(() => import("./pages/student/StudentLayout"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentRegistrations = lazy(() => import("./pages/student/StudentRegistrations"));
const StudentPasses = lazy(() => import("./pages/student/StudentPasses"));
const StudentCertificates = lazy(() => import("./pages/student/StudentCertificates"));
const ResourceLibrary = lazy(() => import("./pages/student/ResourceLibrary"));

import Home from "./pages/Home";

// Public pages
const Team = lazy(() => import("./pages/Team"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails")); 

const Register = lazy(() => import("./pages/Register"));

const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const VerifyBoardingPass = lazy(() => import("./pages/VerifyBoardingPass"));


// New Policy Pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const EventPolicy = lazy(() => import("./pages/EventPolicy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));

// Admin only pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminRegistrations = lazy(() => import("./pages/admin/Registrations"));
const AdminEvents = lazy(() => import("./pages/admin/ManageEvents"));
const AdminTeam = lazy(() => import("./pages/admin/ManageTeam"));
const BulkCertificates = lazy(() => import("./pages/admin/BulkCertificates"));
const BulkBoardingPasses = lazy(() => import("./pages/admin/BulkBoardingPasses"));
const QRGenerator = lazy(() => import("./pages/admin/QRGenerator"));
const ManageSessions = lazy(() => import("./pages/admin/ManageSessions"));
const ManageContacts = lazy(() => import("./pages/admin/ManageContacts"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnnouncements = lazy(() => import("./pages/admin/Announcements"));
const QuestionBank = lazy(() => import("./pages/admin/QuestionBank"));
const CreateQuestion = lazy(() => import("./pages/admin/CreateQuestion"));
const ManageResources = lazy(() => import("./pages/admin/ManageResources"));
const CreateResource = lazy(() => import("./pages/admin/CreateResource"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <GlobalError />,
    children: [
      { path: "/", element: <Home /> },

      { path: "/team", element: <Team /> },
      { path: "/events", element: <Events /> },
      { path: "/events/:id", element: <EventDetails /> },

      { path: "/register", element: <Register /> },
      { path: "/verify-certificate/:certificateId", element: <VerifyCertificate /> },
      { path: "/verify-boarding-pass/:boardingPassId", element: <VerifyBoardingPass /> },

      
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/terms-conditions", element: <TermsConditions /> },
      { path: "/community-guidelines", element: <CommunityGuidelines /> },
      { path: "/event-policy", element: <EventPolicy /> },
      { path: "/accessibility", element: <Accessibility /> },
    ],
  },
  {
    path: "/student",
    element: <StudentLayout />,
    errorElement: <GlobalError />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "registrations", element: <StudentRegistrations /> },
      { path: "passes", element: <StudentPasses /> },
      { path: "certificates", element: <StudentCertificates /> },
      { path: "resources", element: <ResourceLibrary /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <GlobalError />,
    children: [
      { path: "login", element: <AdminLogin /> },
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "registrations", element: <AdminRegistrations /> },
          { path: "events", element: <AdminEvents /> },
          { path: "team", element: <AdminTeam /> },
          { path: "certificates", element: <BulkCertificates /> },
          { path: "boarding-passes", element: <BulkBoardingPasses /> },
          { path: "qr-generator", element: <QRGenerator /> },
          { path: "sessions", element: <ManageSessions /> },
          { path: "messages", element: <ManageContacts /> },
          { path: "profile", element: <AdminProfile /> },
          { path: "settings", element: <AdminSettings /> },
          { path: "announcements", element: <AdminAnnouncements /> },
          { path: "questions", element: <QuestionBank /> },
          { path: "questions/new", element: <CreateQuestion /> },
          { path: "questions/edit/:id", element: <CreateQuestion /> },
          { path: "resources", element: <ManageResources /> },
          { path: "resources/new", element: <CreateResource /> },
          { path: "resources/edit/:id", element: <CreateResource /> },
        ],
      },
    ],
  },
]);

import { ClerkProvider } from '@clerk/clerk-react';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App>
          <RouterProvider router={router} />
        </App>
      </ClerkProvider>
    </Provider>
  </React.StrictMode>
);