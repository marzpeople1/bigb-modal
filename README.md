# Loan origination calculator - Automation suite

## Prerequisites
1. Install latest versions of
- Node.js
- NPM
- Cypress
2. `npm install` in the root folder
  
## How to run scripts
- Open a new Terminal/Command Line window
- While on the root directory, run each test as follows  
UI script:
`$npm run cy:ui`  
API script:
`$npm run cy:api`

> Note that the `--no-exit` flag has been added to the scripts so Cypress doesn't
close the browser after test has been executed. Please close the browser
before running the next test (alternatively, remove `--no-exit` from scripts definition
within `/package.json` so the window closes automatically).
