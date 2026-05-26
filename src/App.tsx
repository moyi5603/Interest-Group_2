import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index.tsx";
import MoreAgents from "./pages/MoreAgents.tsx";
import HumanityCare from "./pages/HumanityCare.tsx";
import CareModuleDetail from "./pages/CareModuleDetail.tsx";
import CareCreateRule from "./pages/CareCreateRule.tsx";
import CareReceive from "./pages/CareReceive.tsx";
import ColleagueAgent from "./pages/ColleagueAgent.tsx";
import EmployeeDetail from "./pages/EmployeeDetail.tsx";
import EmployeeProfile from "./pages/EmployeeProfile.tsx";
import DepartmentDetail from "./pages/DepartmentDetail.tsx";
import CapabilityDetail from "./pages/CapabilityDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <>
    <Toaster />
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/agents" element={<MoreAgents />} />
        <Route path="/agents/humanity-care" element={<HumanityCare />} />
        <Route path="/agents/humanity-care/:type" element={<CareModuleDetail />} />
        <Route path="/agents/humanity-care/:type/new" element={<CareCreateRule />} />
        <Route path="/agents/humanity-care/:type/receive" element={<CareReceive />} />
        <Route path="/colleagues" element={<ColleagueAgent />} />
        <Route path="/colleagues/employee/:id" element={<EmployeeDetail />} />
        <Route path="/colleagues/employee/:id/profile" element={<EmployeeProfile />} />
        <Route path="/colleagues/dept/:id" element={<DepartmentDetail />} />
        <Route path="/colleagues/capability/:key" element={<CapabilityDetail />} />
        <Route path="/colleagues/depts" element={<Navigate to="/colleagues/capability/dept" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
