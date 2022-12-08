
/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from '@testing-library/dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES_PATH} from '../constants/routes.js';
import mockStore from '../__mocks__/store.js';
import {localStorageMock} from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import BillsUI from '../views/BillsUI.js';
import {bills} from '../fixtures/bills.js';

jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
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
    test('Then the NewBills page should be rendered', async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const newBillButton = screen.getByText('Envoyer une note de frais')
      expect(newBillButton).toBeTruthy()
    })
    test('Then the NewBills form image should change file', async () => {
      const newBillsContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      document.body.innerHTML = NewBillUI()
      await waitFor(() => screen.getByTestId('file'))
      const addFileIcon = screen.getByTestId('file')
      expect(addFileIcon).toBeTruthy()
      const handleChangeFile = jest.fn((e) => {
        newBillsContainer.handleChangeFile(e)
      });
      addFileIcon.addEventListener('click', handleChangeFile)
      addFileIcon.click()
      expect(handleChangeFile).toBeCalled()
    })
    test('Then the NewBills form button should submit', async () => {
      const newBillsContainer = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });
      document.body.innerHTML = NewBillUI();
      await waitFor(() => screen.getByRole('button'));
      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeTruthy();
      const handleSubmitClick = jest.fn((e) => {
        newBillsContainer.handleSubmit(e);
      });
      submitButton.addEventListener('click', handleSubmitClick)
      submitButton.click()
      expect(handleSubmitClick).toBeCalled()
    })
  })
})
