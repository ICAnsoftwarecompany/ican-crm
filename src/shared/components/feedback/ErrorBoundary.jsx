import { Component } from 'react'
import { Button } from '../ui/Button'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-8">
          <p className="text-[#EF4444] text-sm mb-4 font-arabic">
            {this.state.error?.message || 'حدث خطأ غير متوقع'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            إعادة المحاولة
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
