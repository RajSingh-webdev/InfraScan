import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import RiskSummaryCards from "@/components/RiskSummaryCards";
import InfrastructureMap from "@/components/InfrastructureMap";
import AnalyticsSection from "@/components/AnalyticsSection";
import FailureImpactAnalysis from "@/components/FailureImpactAnalysis";
import InfrastructureTable from "@/components/InfrastructureTable";
import { infrastructureList, type InfrastructureItem } from "@/data/mockData";

const Index = () => {
  const location = useLocation();
  const delhiDefault = infrastructureList.find(i => i.location.includes("Delhi")) || infrastructureList[0];
  const [selected, setSelected] = useState<InfrastructureItem>(delhiDefault);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const state = location.state as { selectedId?: string } | null;
    if (state?.selectedId) {
      const item = infrastructureList.find(i => i.id === state.selectedId);
      if (item) setSelected(item);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      {!focusMode && <RiskSummaryCards />}
      <InfrastructureMap
        selected={selected}
        onSelect={setSelected}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode(f => !f)}
      />
      {!focusMode && (
        <>
          <AnalyticsSection selected={selected} />
          <FailureImpactAnalysis selected={selected} />
          <InfrastructureTable />
        </>
      )}
    </main>
  );
};

export default Index;