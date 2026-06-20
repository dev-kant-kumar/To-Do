import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("[ErrorBoundary] Caught rendering crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/home";
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
          {/* Background Mesh Gradients */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
          </div>

          {/* Minimalistic Header */}
          <header className="relative z-10 w-full border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <div className="flex items-center gap-2 group select-none">
                <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-purple-500/20">
                  ✓
                </span>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  todo<span className="text-purple-500">.</span>
                </span>
              </div>
              
              <button 
                onClick={this.handleReset}
                className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors duration-250 select-none cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </header>

          {/* Main Container */}
          <main className="relative z-10 flex-grow max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
            <div className="relative group w-full">
              {/* Glowing Aura Effect */}
              <div className="absolute -inset-0.5 bg-red-600/10 rounded-2xl blur-xl opacity-100" />
              
              <div className="relative bg-zinc-950/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl w-full flex flex-col items-center gap-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                    Application Error
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    Something went wrong
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                    An unexpected crash occurred while rendering the application interface. Your task database is safe and secure.
                  </p>
                </div>

                {/* Collapsible Error Log */}
                {this.state.error && (
                  <div className="w-full text-left bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    <p className="text-red-400 font-mono text-xs font-semibold mb-1">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-zinc-500 font-mono text-[10px] leading-4 select-text">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                  <button
                    onClick={this.handleReload}
                    className="py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/30 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-purple-500/20 focus:outline-none cursor-pointer"
                  >
                    Reload Application
                  </button>
                  <button
                    onClick={this.handleReset}
                    className="py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-sm rounded-xl border border-zinc-800 hover:border-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
