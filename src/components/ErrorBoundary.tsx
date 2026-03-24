import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
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
        <div role="alert" className="error-boundary">
          <div className="error-boundary__title">Something went wrong</div>
          <div className="error-boundary__message">
            {this.state.error?.message || "An unexpected error occurred."}
          </div>
          <button className="error-boundary__reload" onClick={this.handleReload}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
