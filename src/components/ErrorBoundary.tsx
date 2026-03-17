import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // Log to file via IPC if available
    if (window.electronAPI?.logError) {
      window.electronAPI.logError(`${error.message}\n${errorInfo.componentStack}`);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "#e8e4de",
          fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
          gap: 16,
          padding: 40,
        }}>
          <div style={{ fontSize: 18, fontWeight: 300 }}>Something went wrong</div>
          <div style={{ fontSize: 12, color: "#888", maxWidth: 500, textAlign: "center", lineHeight: 1.8 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </div>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 16,
              background: "#e8e4de",
              color: "#111",
              border: "none",
              borderRadius: 6,
              padding: "9px 20px",
              fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
