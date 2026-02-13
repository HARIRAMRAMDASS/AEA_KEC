import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '100px 20px',
                    textAlign: 'center',
                    background: '#0A0A0A',
                    color: 'white',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <h1 style={{ color: '#ff4d4d', fontSize: '2rem', marginBottom: '20px' }}>SYSTEM CRITICAL ERROR</h1>
                    <p style={{ opacity: 0.7, maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
                        Something went wrong while preparing the paddock. This might be due to a malformed link or temporary server issues.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-primary"
                        style={{ padding: '15px 40px' }}
                    >
                        RETURN TO HOME
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ marginTop: '40px', textAlign: 'left', background: '#111', padding: '20px', borderRadius: '10px', fontSize: '0.8rem', color: '#ff4d4d', overflow: 'auto', maxWidth: '90vw' }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
