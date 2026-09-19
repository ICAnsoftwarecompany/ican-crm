import { Component } from 'react'
import { Button } from '../ui/Button'
import { useTranslation } from 'react-i18next'

function ErrorFallback({ error, onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <p className="text-red-600 dark:text-red-300 text-sm mb-4 font-arabic">
        {error?.message || t('common.error')}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  )
}

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
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} />
    }
    return this.props.children
  }
}
