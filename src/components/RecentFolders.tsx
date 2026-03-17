const api = window.electronAPI;

export default function RecentFolders({ recentFolders, currentFolder, onSwitch, onClose }) {
  if (!recentFolders || recentFolders.length === 0) return null;

  return (
    <div className="recent-folders">
      <div className="recent-folders-title">Recent folders</div>
      {recentFolders.map((folder) => (
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
    </div>
  );
}
