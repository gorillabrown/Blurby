import type { ReactNode } from "react";
import { APP_TABS, APP_TAB_LABELS, type AppTab } from "../utils/libraryHome";

// APP-TABS-1: the tab bar under the title bar. The right-hand icons (filter, search, settings) come in as children.
interface AppTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  children?: ReactNode;
}

export default function AppTabBar({ activeTab, onTabChange, children }: AppTabBarProps) {
  return (
    <nav className="app-tab-bar" aria-label="Library sections">
      <div className="app-tab-list" role="tablist">
        {APP_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className="app-tab"
            role="tab"
            id={`app-tab-${tab}`}
            aria-selected={tab === activeTab}
            aria-controls={`app-tabpanel-${tab}`}
            onClick={() => onTabChange(tab)}
          >{APP_TAB_LABELS[tab]}</button>
        ))}
      </div>
      <div className="app-tab-actions">{children}</div>
    </nav>
  );
}
