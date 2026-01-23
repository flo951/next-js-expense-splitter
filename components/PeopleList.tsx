import { useState } from 'react';
import { DeletePersonResponseBody } from '../pages/api/person';
import {
  divPersonListStyles,
  Errors,
  formStyles,
  inputSubmitStyles,
  nameInputStyles,
  personStyles,
  spanStyles,
} from '../pages/createevent';
import { removeButtonStyles } from '../pages/users/[eventId]';
import { User } from '../util/database';
import { expenses, people } from '@prisma/client';

type ExpenseWithParticipants = expenses & { participantIds: number[] };

type Props = {
  user: User;
  setErrors: (errors: Errors) => void;
  expenseList: ExpenseWithParticipants[];
  setExpenseList: (expense: ExpenseWithParticipants[]) => void;
  eventId: number;
  setPeopleList: (people: people[]) => void;
  peopleList: people[];
};
export default function PeopleList(props: Props) {
  const [personName, setPersonName] = useState('');

  // function to delete created people
  async function deletePerson(id: number) {
    const deleteResponse = await fetch(`/api/person`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personId: id,
        user: props.user,
      }),
    });
    const deletePersonResponseBody =
      (await deleteResponse.json()) as DeletePersonResponseBody;

    if ('errors' in deletePersonResponseBody) {
      props.setErrors(deletePersonResponseBody.errors);
      return;
    }
    if ('person' in deletePersonResponseBody) {
      const newPeopleList = props.peopleList.filter((person) => {
        return deletePersonResponseBody.person.id !== person.id;
      });
      props.setPeopleList(newPeopleList);

      // Filter out expenses where the deleted person is the paymaster
      // and remove the deleted person from participantIds of remaining expenses
      const newExpenseList = props.expenseList
        .filter((expense) => {
          return deletePersonResponseBody.person.id !== expense.paymaster;
        })
        .map((expense) => ({
          ...expense,
          participantIds: expense.participantIds.filter(
            (id) => id !== deletePersonResponseBody.person.id,
          ),
        }));
      props.setExpenseList(newExpenseList);

      return;
    }
  }
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const createPersonResponse = await fetch('/api/person', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: personName,
              user: props.user,
              eventId: props.eventId,
            }),
          });

          const createPersonResponseBody =
            (await createPersonResponse.json()) as DeletePersonResponseBody;
          if ('person' in createPersonResponseBody) {
            const createdPeople: people[] = [
              ...props.peopleList,
              createPersonResponseBody.person,
            ];
            props.setPeopleList(createdPeople);

            setPersonName('');
            return;
          }

          if ('errors' in createPersonResponseBody) {
            props.setErrors(createPersonResponseBody.errors);
            return;
          }
        }}
        css={formStyles}
      >
        <label htmlFor="person-name">Name of Person</label>
        <input
          css={nameInputStyles}
          data-test-id="create-person"
          id="person-name"
          placeholder="Name"
          value={personName}
          onChange={(e) => setPersonName(e.currentTarget.value)}
          required
        />

        <input
          css={inputSubmitStyles}
          data-test-id="complete-create-person"
          type="submit"
          value="Add Person"
        />
      </form>
      <div css={divPersonListStyles}>
        {props.peopleList.map((person: people) => {
          return (
            person.event_id === props.eventId && (
              <div
                data-test-id={`person-width-id-${person.id}`}
                key={`this is ${person.name} witdh ${person.id} from event ${props.eventId}`}
              >
                <div css={personStyles}>
                  <span
                    css={spanStyles}
                    data-test-id={`name-${person.name}`}
                    data-id={person.id}
                  >
                    {person.name}
                  </span>
                  <button
                    css={removeButtonStyles}
                    aria-label={`Delete Button for Person: ${person.name}`}
                    onClick={() => {
                      deletePerson(person.id).catch(() => {});
                    }}
                  >
                    X
                  </button>
                </div>
              </div>
            )
          );
        })}
      </div>
    </>
  );
}
