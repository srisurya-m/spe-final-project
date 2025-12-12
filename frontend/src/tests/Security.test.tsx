import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1. Define types for the component props (Fixes TypeScript error 7031)
interface ServiceDisplayProps {
  serviceName: string;
  serviceDesc: string;
}

// MOCK COMPONENT: Simulate rendering data from the backend
const ServiceDisplay = ({ serviceName, serviceDesc }: ServiceDisplayProps) => {
    return (
        <div data-testid="service-card">
            <h2>{serviceName}</h2>
            <p>{serviceDesc}</p>
        </div>
    );
};

// 2. Add 'jest' to the types array in frontend/tsconfig.json to fix global errors (describe/test/expect)
describe('🛡️ Frontend XSS Security Test', () => {
    
    // TEST 1: XSS PREVENTION
    test('React should escape malicious script and render it as safe text', () => {
        // Hacker input: Script disguised as an image error handler
        const maliciousScript = "<img src=x onerror=alert('HACKED') />";
        const safeDesc = "Safe description";

        render(<ServiceDisplay serviceName={maliciousScript} serviceDesc={safeDesc} />);

        // ASSERTION 1: Verify the literal script text is visible (proving it was escaped)
        expect(screen.queryByText(/<img src=x onerror=alert\('HACKED'\) \/>/i)).toBeInTheDocument();
        
        // ASSERTION 2: Verify that the element itself is NOT a runnable image tag
        expect(screen.queryByRole('img')).not.toBeInTheDocument(); 
    });

    // TEST 2: Basic Rendering Logic
    test('Standard component rendering works', () => {
        render(<ServiceDisplay serviceName="Door Repair" serviceDesc="Quick Fix" />);
        expect(screen.getByText("Door Repair")).toBeInTheDocument();
    });
});