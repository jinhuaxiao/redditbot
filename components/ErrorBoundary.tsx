import React from 'react'

interface Props {
  children: React.ReactNode
  fallback: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

export const ErrorFallback = () => (
  <div className="p-4">
    <h3 className="text-red-500 font-medium">Something went wrong</h3>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Refresh Page
    </button>
  </div>
) 