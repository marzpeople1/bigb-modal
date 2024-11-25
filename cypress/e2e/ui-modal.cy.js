describe("Loan calculation modal", () => {
    const qs = {
        amount: 5000,
        period: 60,
        productName: "SMALL_LOAN",
        loanPurpose: "DAILY_SETTLEMENTS"
    }
    const modalEl = "div.bb-overlay.bb-calculator-modal"
    const headingEl = "div.bb-modal__header"
    const closeBtnEl = "button.bb-modal__close"
    const loanAmountEl = "input[name='header-calculator-amount']"
    const periodEl = "input[name='header-calculator-period']"
    const resultEl = "div.bb-calculator__result-for-sliders .bb-labeled-value__value"
    const saveBtnEl = "button.bb-calculator-modal__submit-button"
    const editAmountEl = "div.bb-edit-amount__amount"
    const paymentSpinnerEl = "div.bb-calculator__result-value--loader"

    const HEADER_TEXT = 'Vali sobiv summa ja periood'

    const setNewCalculation = (loanAmount, period, expectedPayment) => {
        const formattedPayment = `€${expectedPayment}`

        // Check modal open
        cy.get(modalEl).should('exist')
        cy.get(loanAmountEl).clear()
        cy.get(loanAmountEl).type(loanAmount)

        cy.get(periodEl).clear()
        cy.get(periodEl).type(period)

        // Wait for calculation to render
        cy.get(resultEl).should('be.visible')
        cy.get(paymentSpinnerEl).should('not.exist') // Wait for spinner to dismiss
        cy.get(resultEl)
            .invoke('text')
            .invoke('trim')
            .should(payment =>
                expect(payment, "Verify monthly payment is correct").to.eq(formattedPayment))
    }

    beforeEach("", () => {
        // Suppresses xhr/fetch logs
        cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
        cy.visit('/', {qs})
    })

    it("Close modal by clicking the 'X' button", () => {
        cy.log("Verify modal can be closed when no changes have been made.")
        cy.get(modalEl).should('exist')
        cy.get(headingEl).should('include.text', HEADER_TEXT)
        cy.log('Modal is open')

        cy.get(closeBtnEl).click()
        cy.log("Click 'X'")

        cy.get(modalEl).should('not.exist')
        cy.log('Modal is closed')
    })

    it("Save new calculation", () => {
        const loanAmount = '10000'

        setNewCalculation(loanAmount, 12, 251.57)

        cy.get(saveBtnEl).click()
        cy.get(editAmountEl)
            .invoke('text')
            // .invoke('trim')
            .should(newLoanAmt => {
                const actualAmt = newLoanAmt.trim().split(' ')[0]
                expect(actualAmt, "Verify updated Loan Amount shows on the application page").to.eq(loanAmount)
            })
    })

    it('Refresh browser - Unsaved changes', () => {
        let defaultLoan, defaultPeriod, defaultPayment

        // Read initial values
        cy.get(modalEl).should('exist')
        cy.get(loanAmountEl).invoke('val').should(amount => defaultLoan = amount)
        cy.get(periodEl).invoke('val').should(monthsNbr => defaultPeriod = monthsNbr)

        cy.wait(10) // Not the best approach but helps waiting for the right monthly payment to render
        cy.get(resultEl).invoke('text')
            .invoke('trim')
            .should(total => defaultPayment = total)

        cy.then(() => {
            cy.log(defaultLoan)
            cy.log(defaultPeriod)
            cy.log(defaultPayment)

            setNewCalculation(15000, 12, 375.35)
            cy.reload()

            cy.log('Verify values are set to default after refreshing the browser')
            cy.get(loanAmountEl).invoke('val').should('eq', defaultLoan)
            cy.get(periodEl).invoke('val').should('eq', defaultPeriod)
            cy.get(resultEl)
                .invoke('text')
                .invoke('trim')
                .should(reloadedPayment => expect(reloadedPayment).to.eq(defaultPayment))

        })

    })

    it("Refresh browser - Saved changes", () => {
        const loanAmount = 25000
        const period = 60
        const payment = 622.93

        cy.get(modalEl).should('exist')
        setNewCalculation(loanAmount, period, payment)
        cy.get(saveBtnEl).click()

        cy.reload()
        cy.get(loanAmountEl)
            .invoke('val')
            .invoke('split', ',')
            .invoke('join', '')
            .should(amount => {
                expect(amount, "Verify Loan Amount").to.eq(loanAmount)
            })
        cy.get(periodEl)
            .invoke('val')
            .should(monthsNbr => {
                expect(parseInt(monthsNbr), "Verify loan terms").to.eq(period)
            })
        cy.get(resultEl)
            .invoke('text')
            .invoke('trim')
            .should(total => {
                expect(total, "Verify Monthly Payment").to.eq(`€${payment}`)
            })
    })

})