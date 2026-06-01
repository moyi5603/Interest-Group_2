import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index.tsx";
import MoreAgents from "./pages/MoreAgents.tsx";
import ColleagueAgent from "./pages/ColleagueAgent.tsx";
import EmployeeDetail from "./pages/EmployeeDetail.tsx";
import EmployeeProfile from "./pages/EmployeeProfile.tsx";
import DepartmentDetail from "./pages/DepartmentDetail.tsx";
import CapabilityDetail from "./pages/CapabilityDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import InterestGroupHome from "./pages/interest/InterestGroupHome.tsx";
import InterestGroupChat from "./pages/interest/InterestGroupChat.tsx";
import GroupDetail from "./pages/interest/GroupDetail.tsx";
import GroupCreate from "./pages/interest/GroupCreate.tsx";
import GroupEdit from "./pages/interest/GroupEdit.tsx";
import ActivityDetail from "./pages/interest/ActivityDetail.tsx";
import ActivityCreate from "./pages/interest/ActivityCreate.tsx";
import ActivityEdit from "./pages/interest/ActivityEdit.tsx";
import InterestGroupSectionList from "./pages/interest/InterestGroupSectionList.tsx";
import InterestGroupDiscover from "./pages/interest/InterestGroupDiscover.tsx";
import InterestGroupMyActivities from "./pages/interest/InterestGroupMyActivities.tsx";
import InterestGroupAdminList from "./pages/interest/InterestGroupAdminList.tsx";
import ManagerMessages from "./pages/ManagerMessages.tsx";
import GrowthEngineMessages from "./pages/GrowthEngineMessages.tsx";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <>
    <Toaster />
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/manager" element={<ManagerMessages />} />
        <Route path="/manager/growth-engine" element={<GrowthEngineMessages />} />
        <Route path="/agents" element={<MoreAgents />} />
        <Route path="/agents/interest-groups" element={<InterestGroupHome />} />
        <Route path="/agents/interest-groups/chat" element={<InterestGroupChat />} />
        <Route path="/agents/interest-groups/new" element={<GroupCreate />} />
        <Route path="/agents/interest-groups/discover" element={<InterestGroupDiscover />} />
        <Route path="/agents/interest-groups/my-activities" element={<InterestGroupMyActivities />} />
        <Route path="/agents/interest-groups/admin/:kind" element={<InterestGroupAdminList />} />
        <Route path="/agents/interest-groups/list/:section" element={<InterestGroupSectionList />} />
        <Route path="/agents/interest-groups/:groupId/edit" element={<GroupEdit />} />
        <Route path="/agents/interest-groups/:groupId/activities/new" element={<ActivityCreate />} />
        <Route path="/agents/interest-groups/activities/:activityId/edit" element={<ActivityEdit />} />
        <Route path="/agents/interest-groups/activities/:activityId" element={<ActivityDetail />} />
        <Route path="/agents/interest-groups/:groupId" element={<GroupDetail />} />
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
