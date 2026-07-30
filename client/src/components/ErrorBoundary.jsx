import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('App ErrorBoundary caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    minHeight: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎙️</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        ConvoPilot Session Error
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '340px', marginBottom: '1.25rem' }}>
                        An error occurred while loading the workspace.
                    </p>

                    <div style={{
                        maxWidth: '90%',
                        background: '#1e293b',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.725rem',
                        fontFamily: 'monospace',
                        color: '#f87171',
                        textAlign: 'left',
                        overflowX: 'auto',
                        marginBottom: '1.5rem',
                        border: '1px solid #334155'
                    }}>
                        {this.state.error ? this.state.error.toString() : 'Unknown render error'}
                    </div>

                    <button
                        onClick={() => {
                            try {
                                localStorage.clear();
                            } catch (e) { }
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '9999px',
                            background: '#006B5C',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,107,92,0.4)'
                        }}
                    >
                        Reset & Reload ConvoPilot
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
