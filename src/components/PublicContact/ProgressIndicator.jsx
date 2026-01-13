// src/components/PublicContact/ProgressIndicator.jsx
import React from 'react';

const ProgressIndicator = ({ currentPhase, themeColor }) => {
    const steps = [
        { id: 'info', label: 'Your Info', number: 1 },
        { id: 'vehicle', label: 'Vehicle', number: 2 },
        { id: 'glass', label: 'Glass Type', number: 3 },
    ];

    const getStepStatus = (stepId) => {
        const stepOrder = ['info', 'vehicle', 'glass'];
        const currentIndex = stepOrder.indexOf(currentPhase);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    return (
        <div className="progress-indicator">
            <div className="progress-steps">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    return (
                        <React.Fragment key={step.id}>
                            <div className="progress-step">
                                <div
                                    className={`step-circle ${status}`}
                                    style={status === 'active' || status === 'completed'
                                        ? { backgroundColor: themeColor, boxShadow: status === 'active' ? `0 0 0 4px ${themeColor}20` : 'none' }
                                        : {}
                                    }
                                >
                                    {status === 'completed' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20,6 9,17 4,12"></polyline>
                                        </svg>
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span className={`step-label ${status}`} style={status === 'active' ? { color: themeColor } : {}}>
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`step-connector ${status === 'completed' ? 'completed' : ''}`}
                                    style={status === 'completed' ? { backgroundColor: themeColor } : {}}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressIndicator;
