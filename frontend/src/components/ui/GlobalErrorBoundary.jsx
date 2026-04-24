import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Button from './Button';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GlobalErrorBoundary] Error caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white">
              <AlertTriangle className="text-red-500 w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-primary-navy tracking-tight">Something went wrong</h1>
              <p className="text-slate-500 font-medium">
                The application encountered an unexpected error on this page. Our team has been notified.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                iconLeading={RefreshCcw}
                onClick={this.handleReload}
                className="w-full h-14 !rounded-2xl"
              >
                Reload this page
              </Button>
              <Button 
                variant="secondary" 
                iconLeading={Home}
                onClick={this.handleGoHome}
                className="w-full h-14 !rounded-2xl"
              >
                Go to home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
