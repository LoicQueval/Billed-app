/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import {bills} from '../fixtures/bills.js'
import {ROUTES_PATH} from '../constants/routes.js'
import {localStorageMock} from '../__mocks__/localStorage.js'
import Bills from '../containers/Bills.js'
import mockStore from '../__mocks__/store'
import '@testing-library/jest-dom'

import router from '../app/Router.js'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
    describe('When I am on Bills Page', () => {
        beforeEach(() => {
            jest.spyOn(mockStore, 'bills')
            Object.defineProperty(
                window,
                'localStorage',
                {value: localStorageMock}
            )
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee',
            }))
            const root = document.createElement('div')
            root.setAttribute('id', 'root')
            document.body.appendChild(root)
            router()
        })
        test('Then bill icon in vertical layout should be highlighted', async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            //to-do write expect expression
            expect(windowIcon).toBeTruthy()
        })
        test('Then bills should be ordered from earliest to latest', () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
        test('Then click on icon-eye should show a modal ', async () => {
            const billsContainer = new Bills({
                document, onNavigate, store: null, localStorage: window.localStorage
            })
            document.body.innerHTML = BillsUI({data: bills})
            await waitFor(() => screen.getAllByTestId('icon-eye'))
            const windowIcon = screen.getAllByTestId('icon-eye')[0]
            expect(windowIcon).toBeTruthy()
            const handleClick = jest.fn((e) => {
                billsContainer.handleClickIconEye(windowIcon)
            });
            windowIcon.addEventListener('click', handleClick)
            windowIcon.click()
            expect(handleClick).toBeCalled()
        })
        /* test('Then NewBills btn should be navigate to NewBill page', async () => {
             const billsContainer = new Bills({
                 document, onNavigate, store: null, localStorage: window.localStorage
             })
             document.body.innerHTML = BillsUI({data: bills})
             await waitFor(() => screen.getByTestId('btn-new-bill'))
             const windowIcon2 = screen.getByTestId('btn-new-bill')
             expect(windowIcon2).toBeTruthy()
             const handleClickNewBill = jest.fn((e) => {
                 billsContainer.handleClickNewBill()
             });
             windowIcon2.addEventListener('click', handleClickNewBill)
             windowIcon2.click()
             expect(handleClickNewBill).toBeCalled()
         })
             */
        test('Then the bills are fetched from the simulated API GET', async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByText('Mes notes de frais'))
            const newBillButton = screen.getByText('Nouvelle note de frais')
            expect(newBillButton).toBeTruthy()
        })
    })

    describe('When an error occurs on API', () => {
        beforeEach(() => {
            jest.spyOn(mockStore, 'bills')
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            const root = document.createElement('div')
            root.setAttribute('id', 'root')
            document.body.appendChild(root)
            router()
        })
        test('fetches bills from an API and fails with 404 message error', async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error('Erreur 404'))
                    },
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })
        test('fetches messages from an API and fails with 500 message error', async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error('Erreur 500'))
                    },
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })
    })
})
