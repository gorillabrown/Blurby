export default function RecentFolders({ recentFolders, currentFolder, onSwitch, onBrowse, onClose }) {
  return (
    <div className="recent-folders">
      <div className="recent-folders-title">Recent folders</div>
      {recentFolders && recentFolders.length > 0 && recentFolders.map((folder) => (
        <button
          key={folder}
          className={`recent-folder-item${folder === currentFolder ? " recent-folder-active" : ""}`}
          onClick={() => { onSwitch(folder); onClose(); }}
          title={folder}
        >
          <span className="recent-folder-name">{folder.split(/[/\\]/).pop()}</span>
          {folder === currentFolder && <span className="recent-folder-current">current</span>}
        </button>
      ))}
      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
      <button
        className="recent-folder-item"
        onClick={() => { onBrowse(); onClose(); }}
      >
        <span className="recent-folder-name">Browse for folder...</span>
      </button>
    </div>
  );
}
