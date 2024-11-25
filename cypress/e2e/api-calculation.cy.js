describe("API Automation - calculate endpoint", { defaultCommandTimeout: 1000 },() => {
    const url = "https://www.bigbank.ee/calc/api/v1/loan/calculate"

    const verifyResponse = res => {
        expect(res.status, "Check status code is correct").to.eq(200)

        const keys = Object.keys(res.body)
        expect(keys.includes("totalRepayableAmount")
            && keys.includes("monthlyPayment")
            && keys.includes("apr"),
            "Check totalRepayableAmount, monthlyPayment & apr are returned").to.eq(true)

        cy.log(`totalRepayableAmount: ${res.body["totalRepayableAmount"]}`)
        cy.log(`monthlyPayment: ${res.body["monthlyPayment"]}`)
        cy.log(`apr: ${res.body["apr"]}`)

        cy.wrap(res,{log: false})
    }

    const calculateLoanTerms = (period, amount, interestRate = 16.8, loanType = "SMALL_LOAN_EE01") =>
        cy.fixture('payload-template').then(template => {
            const body = {
                ...template,
                productType: loanType,
                maturity: period,
                amount,
                interestRate
            }

            const msg = `Call /loan/calculate endpoint for the given values:
            **period=${period}, amount=${amount}, interestRate=${interestRate}, loanType=${loanType}**
            `

            cy.log(msg)

            return cy.request({ method: "POST", url, body, failOnStatusCode: false })
                .then(verifyResponse)
        })

    const verifyRepayableAmount = (res, period) => {
        const {totalRepayableAmount, monthlyPayment, apr} = res.body
        const msg = `Check actual totalRepayableAmount is correct (${totalRepayableAmount})`
        expect(totalRepayableAmount, msg).to.eq(monthlyPayment * period)

        return cy.wrap(null, {log: false})
    }

    it("Calculate random monthly payment for a Small Loan", () => {
        cy.fixture('small-loan-testdata').then(testData => {
            const {minPeriod, maxPeriod, minAmount, maxAmount} = testData
            const period = Math.floor(Math.random() * (maxPeriod - minPeriod + 1)) + minPeriod;
            const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
            calculateLoanTerms(period, amount)
        })
    })

    it("Calculate monthly payment for Small Loan - Min period & Max amount", () => {
        cy.fixture('small-loan-testdata').then(testData => {
            const {minPeriod, maxAmount} = testData
            calculateLoanTerms(minPeriod, maxAmount)
        })
    })

    it("Calculate monthly payment for Small Loan - Max period & Min amount", () => {
        cy.fixture('small-loan-testdata').then(testData => {
            const {maxPeriod, minAmount} = testData
            calculateLoanTerms(maxPeriod, minAmount)
        })
    })

    it("Verify Repayable amount for the default loan terms", () => {
        cy.fixture('small-loan-testdata').then(testData => {
            const {defaultPeriod, defaultAmount} = testData
            calculateLoanTerms(defaultPeriod, defaultAmount)
                .then(res => verifyRepayableAmount(res, defaultPeriod))
        })
    })

    it("Calculate monthly payment for Small Loan and 20% interest rate", () => {
        cy.fixture('small-loan-testdata').then(testData => {
            const {defaultPeriod, defaultAmount} = testData
            calculateLoanTerms(defaultPeriod, defaultAmount, 20.0)
        })
    })
})