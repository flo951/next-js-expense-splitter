import { css } from '@emotion/react';
import { expenses, people } from '@prisma/client';
import { CreateExpenseResponseBody } from '../pages/api/expense';
import { Errors, formStyles, spanStyles } from '../pages/createevent';
import {
  expenseContainerStyles,
  expenseDetailStyles,
  inputExpenseStyles,
  inputExpenseSubmitStyles,
  removeButtonStyles,
  selectStyles,
  spanErrorStyles,
} from '../pages/users/[eventId]';

type ExpenseWithParticipants = expenses & { participantIds: number[] };

const participantCheckboxContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
`;

const checkboxLabelStyles = css`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  cursor: pointer;

  input {
    cursor: pointer;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

const participantListStyles = css`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

type Props = {
  personExpense: string;
  setPersonExpense: (person: string) => void;
  expenseError: string;
  setExpenseError: (error: string) => void;
  selectedPersonId: number;
  selectedParticipants: number[];
  setSelectedParticipants: (ids: number[]) => void;
  expenseName: string;
  setExpenseName: (name: string) => void;
  expenseList: ExpenseWithParticipants[];
  setExpenseList: (expense: ExpenseWithParticipants[]) => void;
  setErrors: (error: Errors | undefined) => void;
  peopleList: people[];
  eventId: number;
  deleteExpense: (expenseId: number) => void;
  handleSelectPerson: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};
export default function ExpenseList(props: Props) {
  return (
    <>
      <form
        css={formStyles}
        onSubmit={async (e) => {
          e.preventDefault();

          if (parseFloat(props.personExpense) <= 0) {
            props.setExpenseError(
              'Invalid input, please enter a positive value',
            );
            return;
          }
          const testNumber: number = parseInt(props.personExpense);

          if (!Number.isInteger(testNumber)) {
            props.setExpenseError('Invalid input, please enter a number');
            return;
          }

          if (props.selectedPersonId === 0) {
            props.setExpenseError('Please select a person');
            return;
          }

          if (props.selectedParticipants.length === 0) {
            props.setExpenseError('Please select at least one participant');
            return;
          }

          const createPersonResponse = await fetch('/api/expense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expensename: props.expenseName,
              cost: parseFloat(props.personExpense) * 100,
              eventId: props.eventId,
              paymaster: props.selectedPersonId,
              participantIds: props.selectedParticipants,
            }),
          });

          const createExpenseResponseBody =
            (await createPersonResponse.json()) as CreateExpenseResponseBody;

          if ('errors' in createExpenseResponseBody) {
            props.setErrors(createExpenseResponseBody.errors);
            return;
          }

          const createdExpenses: ExpenseWithParticipants[] = [
            ...props.expenseList,
            createExpenseResponseBody.expense,
          ];

          props.setExpenseList(createdExpenses);
          props.setExpenseName('');
          props.setPersonExpense('0');
          // Reset participants to all people for next expense
          props.setSelectedParticipants(props.peopleList.map((p) => p.id));

          props.setErrors([]);
          props.setExpenseError('');
        }}
      >
        <div css={expenseContainerStyles}>
          <h3>Expense List</h3>
          <label htmlFor="person-list">Who is paying?</label>
          <select
            data-test-id="select-person"
            id="person-list"
            onChange={props.handleSelectPerson}
            required
            css={selectStyles}
          >
            <option key="template" value={0}>
              Select Person
            </option>
            {props.peopleList.map((person) => {
              return (
                person.event_id === props.eventId && (
                  <option
                    key={`person-${person.name}-${person.id}`}
                    value={person.id}
                  >
                    {person.name}
                  </option>
                )
              );
            })}
          </select>

          <label>Who splits this expense?</label>
          <div css={participantCheckboxContainerStyles}>
            {props.peopleList.map((person) => {
              return (
                person.event_id === props.eventId && (
                  <label
                    key={`participant-${person.id}`}
                    css={checkboxLabelStyles}
                  >
                    <input
                      type="checkbox"
                      checked={props.selectedParticipants.includes(person.id)}
                      disabled={person.id === props.selectedPersonId}
                      onChange={(e) => {
                        if (e.target.checked) {
                          props.setSelectedParticipants([
                            ...props.selectedParticipants,
                            person.id,
                          ]);
                        } else {
                          // Don't allow unchecking the paymaster
                          if (person.id === props.selectedPersonId) {
                            return;
                          }
                          props.setSelectedParticipants(
                            props.selectedParticipants.filter(
                              (id) => id !== person.id,
                            ),
                          );
                        }
                      }}
                    />
                    {person.name}
                    {person.id === props.selectedPersonId && ' (paying)'}
                  </label>
                )
              );
            })}
          </div>

          <label htmlFor="expense">Cost</label>
          <input
            data-test-id="expense-value"
            css={inputExpenseStyles}
            id="expense"
            value={props.personExpense}
            placeholder="0 €"
            required
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/,/g, '.');
              props.setPersonExpense(e.currentTarget.value);
            }}
          />

          <label htmlFor="expense-name">What are you paying for?</label>
          <input
            css={inputExpenseStyles}
            data-test-id="expense-name"
            id="expense-name"
            value={props.expenseName}
            placeholder="Name of the Expense"
            required
            onChange={(e) => {
              props.setExpenseName(e.currentTarget.value);
            }}
          />
          {props.expenseError && (
            <span css={spanErrorStyles}> {props.expenseError}</span>
          )}
          <input
            data-test-id="complete-expense"
            css={inputExpenseSubmitStyles}
            type="submit"
            name="submit"
            value="Add Expense"
          />
        </div>
      </form>
      {props.expenseList.map((expense) => {
        const payerName = props.peopleList.find(
          (p) => p.id === expense.paymaster,
        )?.name;
        const participantNames = props.peopleList
          .filter((p) => expense.participantIds?.includes(p.id))
          .map((p) => p.name)
          .join(', ');

        return (
          <div key={`expense-${expense.id}}`}>
            <div css={expenseDetailStyles}>
              <span data-test-id="expense-value-name" css={spanStyles}>
                <span>
                  {expense.expensename} {expense.cost! / 100}€ paid by{' '}
                  {payerName}
                </span>
                {participantNames && (
                  <div css={participantListStyles}>
                    Split between: {participantNames}
                  </div>
                )}
              </span>

              <button
                css={removeButtonStyles}
                aria-label={`Delete Button for Expense: ${expense.expensename}`}
                onClick={() => {
                  props.deleteExpense(expense.id);
                }}
              >
                X
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
