import { useState } from 'react';

const EvaluateComponent = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleExecute = async () => {
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const data = await response.json();
            setResult(data.result);
        } catch (err: any) {
            setError(err.message);
        }
    };


    return (
        <div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your code here"
            ></textarea>
            <button onClick={handleExecute}>Execute</button>
            {result && <div>Result: {result}</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </div>
    );
};

export default EvaluateComponent;
