interface RecentFoldersProps {
  recentFolders: string[];
  currentFolder: string | null;
  onSwitch: (folder: string) => void;
  onBrowse: () => void;
  onClose: () => void;
}

export default function RecentFolders({ recentFolders, currentFolder, onSwitch, onBrowse, onClose }: RecentFoldersProps) {
  return (
    <div className="recent-folders" role="menu" aria-label="Recent folders">
      <div className="recent-folders-title" aria-hidden="true">Recent folders</div>
      {recentFolders && recentFolders.length > 0 && recentFolders.map((folder) => (
        <button
          key={folder}
          className={`recent-folder-item${folder === currentFolder ? " recent-folder-active" : ""}`}
          onClick={() => { onSwitch(folder); onClose(); }}
          title={folder}
          role="menuitem"
          aria-current={folder === currentFolder ? "true" : undefined}
        >
          <span className="recent-folder-name">{folder.split(/[/\\]/).pop()}</span>
          {folder === currentFolder && <span className="recent-folder-current">current</span>}
        </button>
      ))}
      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} aria-hidden="true" />
      <button
        className="recent-folder-item"
        onClick={() => { onBrowse(); onClose(); }}
        role="menuitem"
      >
        <span className="recent-folder-name">Browse for folder...</span>
      </button>
    </div>
  );
}
