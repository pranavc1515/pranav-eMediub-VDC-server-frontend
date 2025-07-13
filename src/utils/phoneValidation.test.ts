import { cleanPhoneNumber, validatePhoneNumber, formatPhoneNumber } from './validationSchemas'

// Test cases for phone validation
const testCases = [
  // Valid phone numbers
  { input: '6281470907', expected: true, description: 'Valid 10-digit number starting with 6' },
  { input: '9876543210', expected: true, description: 'Valid 10-digit number starting with 9' },
  { input: '8765432109', expected: true, description: 'Valid 10-digit number starting with 8' },
  { input: '7654321098', expected: true, description: 'Valid 10-digit number starting with 7' },
  
  // Invalid phone numbers
  { input: '1234567890', expected: false, description: 'Invalid - starts with 1' },
  { input: '2345678901', expected: false, description: 'Invalid - starts with 2' },
  { input: '3456789012', expected: false, description: 'Invalid - starts with 3' },
  { input: '4567890123', expected: false, description: 'Invalid - starts with 4' },
  { input: '5678901234', expected: false, description: 'Invalid - starts with 5' },
  { input: '123456789', expected: false, description: 'Invalid - only 9 digits' },
  { input: '12345678901', expected: false, description: 'Invalid - 11 digits' },
  { input: '628147090', expected: false, description: 'Invalid - only 9 digits' },
  
  // Edge cases
  { input: '', expected: false, description: 'Empty string' },
  { input: 'abc123def', expected: false, description: 'Contains letters' },
  { input: '628-147-0907', expected: false, description: 'Contains hyphens' },
  { input: '628 147 0907', expected: false, description: 'Contains spaces' },
]

// Test cleanPhoneNumber function
console.log('Testing cleanPhoneNumber function:')
testCases.forEach(({ input, description }) => {
  const cleaned = cleanPhoneNumber(input)
  console.log(`${description}: "${input}" -> "${cleaned}"`)
})

// Test validatePhoneNumber function
console.log('\nTesting validatePhoneNumber function:')
testCases.forEach(({ input, expected, description }) => {
  const validation = validatePhoneNumber(input)
  const passed = validation.isValid === expected
  console.log(`${description}: "${input}" -> ${validation.isValid} (expected: ${expected}) ${passed ? '✅' : '❌'}`)
  if (!passed) {
    console.log(`  Error: ${validation.error}`)
  }
})

// Test formatPhoneNumber function
console.log('\nTesting formatPhoneNumber function:')
const formatTestCases = [
  '6281470907',
  '+916281470907',
  '916281470907',
  '628-147-0907',
  '628 147 0907',
]

formatTestCases.forEach(input => {
  const formatted = formatPhoneNumber(input)
  console.log(`"${input}" -> "${formatted}"`)
})

export { testCases } 