// Cracker.tsx
import React from 'react';
import './cracker.css';

interface CrackerProps {
    visible: boolean;
}

const Cracker: React.FC<CrackerProps> = ({ visible }) => {
    return (
        <>
            {visible && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="confetti"></div>
                    ))}
                </div>
            )}
        </>
    );
};

export default Cracker;