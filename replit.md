# is-a.dev Register - Replit Setup

## Overview
This is the **is-a.dev** domain registration repository - a test suite that validates DNS subdomain registration requests for the is-a.dev service. It allows developers to get a `.is-a.dev` subdomain for their personal websites.

### Purpose
- Validates domain JSON configurations in pull requests
- Tests DNS record integrity and ownership rules
- Ensures compliance with is-a.dev subdomain policies

### Current State
- **Environment**: Node.js 20
- **Testing Framework**: AVA
- **Status**: Fully configured and operational
- **Workflow**: Tests run automatically via the "Tests" workflow

## Project Architecture

### Structure
```
.
├── domains/          # JSON files for each registered subdomain
├── tests/           # Test suite validating domain configurations
│   ├── domains.test.js   # Subdomain hierarchy and ownership tests
│   ├── json.test.js      # JSON validation tests
│   ├── pr.test.js        # Pull request validation
│   ├── proxy.test.js     # Cloudflare proxy tests
│   └── records.test.js   # DNS record validation
├── util/            # Utility files (reserved domains, internal configs)
├── dnsconfig.js     # DNSControl configuration for Cloudflare
└── package.json     # Node.js dependencies
```

### Key Components
1. **Domain Files**: JSON files in `domains/` directory containing DNS records and owner information
2. **Test Suite**: Validates domain configurations, ownership, nesting rules, and DNS records
3. **DNSControl**: Manages DNS records on Cloudflare (used in GitHub Actions)

### Testing
The project includes comprehensive tests that validate:
- JSON file structure and validity
- DNS record correctness (A, AAAA, CNAME, MX, NS, TXT, etc.)
- Subdomain ownership and nesting rules
- Cloudflare proxy configuration
- Single character subdomain limits

## Recent Changes
- **2025-10-10**: Initial Replit environment setup
  - Installed npm dependencies (ava, fs-extra)
  - Configured Tests workflow
  - All 13 tests passing successfully

## Development

### Running Tests
```bash
npm test
```

### Workflow
The "Tests" workflow is configured to automatically run the test suite. It executes:
```bash
npm test
```

### Dependencies
- **ava** (v6.2.0): Test runner
- **fs-extra** (v11.2.0): Enhanced file system operations

## Notes
- This is a test suite repository, not a web application
- No frontend or backend server required
- The .gitignore includes `*.js` but tracked JS files are preserved
- DNSControl is used in GitHub Actions for actual DNS deployment
