import validator from 'validator';

const hasNoSQLOperators = (input: any): boolean => {
    const str = JSON.stringify(input);
    return str.includes('"$') || str.includes('{$'); 
};

const createEmailTemplate = (text: string, name: string) => {
    if (!text) throw new Error("Text is undefined");
    return text.replace("[customerName]", name);
};

describe('🛡️ Security & Quality Gate', () => {

    // --- TEST 1 & 2: NoSQL INJECTION PREVENTION ---
    test('Should detect and block NoSQL Injection payloads', () => {
        const maliciousPayload = { password: { "$ne": null } };
        expect(hasNoSQLOperators(maliciousPayload)).toBe(true);
    });

    test('Should allow safe, standard JSON payloads', () => {
        const safePayload = { password: "mySafePassword123" };
        expect(hasNoSQLOperators(safePayload)).toBe(false);
    });

    // --- TEST 3: INPUT VALIDATION (XSS/SQL) ---
    test('Should reject malicious email formats (SQL/XSS vectors)', () => {
        const maliciousEmail = "<script>alert('hacked')</script>@gmail.com";
        expect(validator.isEmail(maliciousEmail)).toBe(false);
    });

    // --- TEST 4: BUSINESS LOGIC (Email Templates) ---
    test('Email Template should correctly replace placeholders', () => {
        const rawTemplate = "Hello, [customerName]. Welcome!";
        const customer = "Surya";
        const result = createEmailTemplate(rawTemplate, customer);
        expect(result).toBe("Hello, Surya. Welcome!");
    });
});