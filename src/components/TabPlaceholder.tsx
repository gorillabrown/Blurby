// APP-TABS-1: the two tabs whose content is built later (PODCAST-SOURCE-1; the Marketplace itself).
export function PodcastsPanel() {
  return (
    <div className="library-empty">
      <p className="library-empty-title">No podcasts yet</p>
    </div>
  );
}

export function MarketplacePanel() {
  return <div className="tab-banner" role="status">Coming soon</div>;
}
