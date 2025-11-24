# Test Suite

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── utils/
│   └── logger.test.js
├── middleware/
│   └── cache.test.js
└── controllers/
    └── OrderController.test.js
```

## Test Categories

### Unit Tests
- Utility functions
- Helper functions
- Pure functions

### Integration Tests
- API endpoints
- Database operations
- Service integrations

### Mocking

Use `jest.mock()` for external dependencies:

```javascript
jest.mock('../services/EmailService.js');
```

