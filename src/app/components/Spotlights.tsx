import React from 'react';
import './spotlight.css';

interface SpotlightProps {
    visible: boolean;
}

const Spotlights: React.FC<SpotlightProps> = ({ visible }) => {
    return (
        <>
            {visible && (
                <>
                    <div className="spotlight" style={{ top: '0%', left: '0%' }}></div>
                    <div className="spotlight" style={{ top: '0%', left: '100%' }}></div>
                </>
            )}
        </>
    );
};

export default Spotlights;