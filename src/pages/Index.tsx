import AgentHeader from "@/components/agent/AgentHeader";
import BannerCarousel from "@/components/agent/BannerCarousel";
import QuickActionsGrid from "@/components/agent/QuickActionsGrid";
import SuggestedQuestions from "@/components/agent/SuggestedQuestions";
import ChatInputBar from "@/components/agent/ChatInputBar";
import BottomTabBar from "@/components/agent/BottomTabBar";

const Index = () => {
  return (
    <>
      {/* SEO */}
      <h1 className="sr-only">EXP 智能体 - 企业 AI 工作助手</h1>

      <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
        <AgentHeader />

        <main className="flex-1 space-y-4 overflow-y-auto pb-2 pt-1 scrollbar-hide">
          <BannerCarousel />
          <QuickActionsGrid />
          <SuggestedQuestions />
          <div className="h-2" />
        </main>

        <ChatInputBar />
        <BottomTabBar />
      </div>
    </>
  );
};

export default Index;
