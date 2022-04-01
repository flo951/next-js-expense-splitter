import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BarChart from '../../components/BarChart';

import {
  Event,
  Expense,
  getAllExpensesWhereIdMatches,
  getAllPeopleWhereEventIdMatches,
  getProfileImageEvent,
  getSingleEvent,
  getUserByValidSessionToken,
  Person,
} from '../../util/database';
import { CreateEventResponseBody, DeleteEventResponseBody } from '../api/event';
import { DeleteExpenseResponseBody } from '../api/expense';
import { DeletePersonResponseBody } from '../api/person';
import {
  divPersonListStyles,
  Errors,
  formStyles,
  inputSubmitStyles,
  nameInputStyles,
  personStyles,
  spanStyles,
} from '../createevent';
import { errorStyles } from '../login';

const mainStyles = css`
  margin: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  h1 {
    font-size: 20px;
  }

  @media only screen and (max-width: 1124px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    gap: 12px;
  }
`;
export const removeButtonStyles = css`
  color: white;
  border: none;
  background-color: rgb(206, 25, 13);
  font-size: 16px;
  margin: 0px 2px;
  border: 2px solid rgb(206, 25, 13);
  border-radius: 50%;
  max-height: 25px;
  cursor: pointer;
`;
const eventNameButtonRowStyles = css`
  display: flex;
  justify-content: center;

  h3 {
    font-size: 18px;
    font-weight: 400;
  }
`;
const selectStyles = css`
  padding: 8px;

  font-size: 20px;
`;
export const inputExpenseStyles = css`
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 20px;
`;
const expenseContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    margin-top: 0;
    text-align: center;
    font-weight: 400;
  }
`;
const spanErrorStyles = css`
  color: rgb(206, 25, 13);
  font-size: 20px;
`;
const expenseBigContainerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 2px solid black;
  border-radius: 8px;
  padding: 12px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 324px;
  height: max-content;
`;
const inputExpenseSubmitStyles = css`
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  margin-top: 12px;
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    border: 2px solid #dc8409;
    transition: 0.3s ease-out;
  }
`;
const expenseDetailStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
`;

export const redColorCostsStyles = css`
  color: rgb(206, 25, 13);
`;
export const eventProfilePicStyles = css`
  border: 2px solid black;
  border-radius: 50%;
`;
const borderPeopleListStyles = css`
  border: 2px solid black;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  padding: 12px;
  width: 324px;
  height: fit-content;
`;
const buttonFileUploadStyles = css`
  color: white;
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  font-size: 16px;
  border-radius: 8px;
  padding: 6px;
  margin-top: 6px;
  cursor: pointer;
  :hover {
    border: 2px solid #dc8409;
    transition: 0.3s ease-out;
  }
`;
const inputFileUploadStyles = css`
  margin: 2px;
  border-radius: 8px;
  border: 2px solid #dc8409;
  padding: 4px;
  width: 235px;
  margin-right: 6px;
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  color: white;
`;
export const loadingFlexBox = css`
  display: flex;
  align-items: center;
`;
export const loadingCircleStyles = css`
  border-radius: 50%;
  border-top: 2px solid #2a6592;
  border-right: 2px solid #2a6592;
  border-bottom: 2px solid #dc8409;
  border-left: 2px solid #dc8409;
  width: 20px;
  height: 20px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;

  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export type ImageUrl = {
  imageurl: string;
};
type Props = {
  user: { id: number; username: string };
  eventInDb: Event;
  errors: string;
  peopleInDb: Person[];
  expensesInDb: Expense[];
  profileImageInDb: ImageUrl;
  cloudName: string;
  uploadPreset: string;
};

export default function UserDetail(props: Props) {
  const [eventList, setEventList] = useState<Event[]>([props.eventInDb]);
  const [peopleList, setPeopleList] = useState<Person[]>(props.peopleInDb);
  const [personExpense, setPersonExpense] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [personName, setPersonName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [sumEventCosts, setSumEventCosts] = useState('0');
  const [sharedCosts, setSharedCosts] = useState('0');
  const [errors, setErrors] = useState<Errors | undefined>([]);
  const [expenseError, setExpenseError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [expenseList, setExpenseList] = useState<Expense[]>(props.expensesInDb);
  const [uploadImage, setUploadImage] = useState<FileList>();
  const [imageUrl, setImageUrl] = useState(props.profileImageInDb.imageurl);
  const [isLoading, setIsLoading] = useState<Boolean>();
  const [editButtonImageUpload, setEditButtonImageUpload] =
    useState<Boolean>(false);

  console.log('Test to open a new pr');
  const router = useRouter();

  useEffect(() => {
    function calculateTotalSumPerEvent() {
      if (typeof props.eventInDb === 'undefined') {
        return {
          props: {
            errors: 'This event doesnt exist',
          },
        };
      }

      const cost: number[] = expenseList.map((expense) => {
        return expense.cost / 100;
      });

      const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
      setSumEventCosts(sum.toFixed(2));

      const amountPeople = peopleList.filter((person) => {
        return person.name;
      });

      const costPaidByEveryone =
        Math.round((sum / amountPeople.length) * 100) / 100;

      setSharedCosts(costPaidByEveryone.toFixed(2));
    }
    calculateTotalSumPerEvent();
  }, [expenseList, peopleList, props.eventInDb]);
  if (props.errors) {
    return (
      <>
        <Head>
          <title>No Access</title>
          <meta
            name="description"
            content="You are not allowed to see this page"
          />
        </Head>
        <h1>{props.errors}</h1>
      </>
    );
  }

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
      setErrors(deletePersonResponseBody.errors);
      return;
    }
    if ('person' in deletePersonResponseBody) {
      const newPeopleList = peopleList.filter((person) => {
        return deletePersonResponseBody.person.id !== person.id;
      });
      setPeopleList(newPeopleList);

      const newExpenseList = expenseList.filter((expense) => {
        return deletePersonResponseBody.person.id !== expense.paymaster;
      });
      setExpenseList(newExpenseList);

      return;
    }
  }

  async function deleteExpense(id: number) {
    const deleteResponse = await fetch(`/api/expense`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expenseId: id,
      }),
    });
    const deleteExpenseResponseBody =
      (await deleteResponse.json()) as DeleteExpenseResponseBody;
    if ('errors' in deleteExpenseResponseBody) {
      setErrors(deleteExpenseResponseBody.errors);
      return;
    }

    if ('expense' in deleteExpenseResponseBody) {
      const newExpenseList = expenseList.filter((expense) => {
        return deleteExpenseResponseBody.expense.id !== expense.id;
      });
      setExpenseList(newExpenseList);
      return;
    }
  }
  // select a created person in a dropdown as a template for adding expenses
  function handleSelectPerson(event: React.ChangeEvent<HTMLSelectElement>) {
    const person = event.target.value;
    setSelectedPersonId(parseInt(person));
  }

  // function to delete created events
  async function deleteEvent(id: number) {
    const deleteResponse = await fetch(`/api/event`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: id,
        user: props.user,
      }),
    });
    const deleteEventResponseBody =
      (await deleteResponse.json()) as DeleteEventResponseBody;
    console.log(deleteEventResponseBody);
    if ('errors' in deleteEventResponseBody) {
      setErrors(deleteEventResponseBody.errors);
      return;
    }

    const newEventList = eventList.filter((event) => {
      return deleteEventResponseBody.event.id !== event.id;
    });

    setEventList(newEventList);
    await router.push(`/createevent`).catch((err) => console.log(err));
  }

  // function to upload event images
  async function handleUploadImage(eventId: number) {
    if (!uploadImage) {
      setUploadError('No Image selected');
      return;
    }
    setUploadError('');

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', uploadImage[0]);
    formData.append('upload_preset', props.uploadPreset);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${props.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );
    type CreateImageUploadResponseBody = {
      url: string;
      errors: { message: string }[];
    };

    const uploadImageEventResponseBody =
      (await uploadResponse.json()) as CreateImageUploadResponseBody;

    const uploadUrl = uploadImageEventResponseBody.url;
    if (typeof uploadUrl === 'undefined') {
      setUploadError('Something went wrong, please try again');
      setIsLoading(false);
      return;
    }
    setImageUrl(uploadUrl);

    if ('errors' in uploadImageEventResponseBody) {
      setErrors(uploadImageEventResponseBody.errors);
      return;
    }

    const createEventResponse = await fetch('/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl,
        eventId: eventId,
      }),
    });

    const createEventResponseBody =
      (await createEventResponse.json()) as CreateEventResponseBody;

    if ('errors' in createEventResponseBody) {
      setErrors(createEventResponseBody.errors);
      return;
    }

    setIsLoading(false);
    setEditButtonImageUpload(false);
  }

  return (
    <>
      <Head>
        <title>Event {props.eventInDb.eventname}</title>

        <meta
          name="description"
          content="View single event by id, this is event "
        />
      </Head>

      <main>
        {eventList.map((event: Event) => {
          return (
            <div
              data-test-id={`event-with-id-${event.id}`}
              key={`this is ${event.eventname} witdh ${event.id} `}
              css={mainStyles}
            >
              {/* Create People List */}
              <div css={borderPeopleListStyles}>
                <div css={expenseDetailStyles}>
                  <h3>Event: {event.eventname}</h3>
                  <button
                    onClick={() => {
                      deleteEvent(event.id).catch(() => {});
                    }}
                    css={removeButtonStyles}
                    data-test-id="delete-event"
                  >
                    X
                  </button>
                </div>
                <Image
                  css={eventProfilePicStyles}
                  src={
                    !imageUrl ? '/images/maldives-1993704_640.jpg' : imageUrl
                  }
                  alt={`Profile Picture of ${event.eventname}`}
                  width={150}
                  height={150}
                />

                {editButtonImageUpload === true ? (
                  <div>
                    <span>Edit your Event Picture</span>
                    <input
                      css={inputFileUploadStyles}
                      type="file"
                      onChange={(e) => {
                        e.currentTarget.files === null
                          ? setUploadImage(undefined)
                          : setUploadImage(e.currentTarget.files);
                      }}
                    />
                    <button
                      css={buttonFileUploadStyles}
                      onClick={() => {
                        handleUploadImage(event.id).catch(() => {});
                      }}
                    >
                      Upload
                    </button>
                    <span css={spanErrorStyles}>{uploadError}</span>
                    <span>
                      {isLoading && (
                        <div css={loadingFlexBox}>
                          <span css={spanStyles}>Uploading image...</span>
                          <div css={loadingCircleStyles} />
                        </div>
                      )}
                    </span>
                  </div>
                ) : (
                  <button
                    css={buttonFileUploadStyles}
                    onClick={() => {
                      setEditButtonImageUpload(true);
                    }}
                  >
                    Edit event picture
                  </button>
                )}

                <div css={eventNameButtonRowStyles}>
                  <h3
                    data-test-id={`event-${event.eventname}`}
                    data-id={event.id}
                  >
                    Who is participating at {event.eventname}?
                  </h3>
                </div>

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
                        eventId: event.id,
                      }),
                    });

                    const createPersonResponseBody =
                      (await createPersonResponse.json()) as DeletePersonResponseBody;
                    if ('person' in createPersonResponseBody) {
                      const createdPeople = [
                        ...peopleList,
                        createPersonResponseBody.person,
                      ];
                      setPeopleList(createdPeople);

                      setPersonName('');
                      return;
                    }

                    if ('errors' in createPersonResponseBody) {
                      setErrors(createPersonResponseBody.errors);
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
                  {peopleList.map((person: Person) => {
                    return (
                      person.eventId === event.id && (
                        <div
                          data-test-id={`person-width-id-${person.id}`}
                          key={`this is ${person.name} witdh ${person.id} from event ${event.id}`}
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
                {errors && (
                  <div css={errorStyles}>
                    {errors.map((error) => {
                      return (
                        <div key={`error-${error.message}`}>
                          {error.message}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div css={expenseBigContainerStyles}>
                {/* Create Expense List */}

                <form
                  css={formStyles}
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (parseFloat(personExpense) <= 0) {
                      setExpenseError(
                        'Invalid input, please enter a positive value',
                      );
                      return;
                    }
                    const testNumber: number = parseInt(personExpense);

                    if (!Number.isInteger(testNumber)) {
                      setExpenseError('Invalid input, please enter a number');
                      return;
                    }

                    if (selectedPersonId === 0) {
                      setExpenseError('Please select a person');
                      return;
                    }

                    const createPersonResponse = await fetch('/api/expense', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        expensename: expenseName,
                        cost: parseFloat(personExpense) * 100,
                        eventId: event.id,
                        paymaster: selectedPersonId,
                      }),
                    });

                    const createPersonResponseBody =
                      (await createPersonResponse.json()) as DeleteExpenseResponseBody;

                    const createdExpenses: Expense[] = [
                      ...expenseList,
                      createPersonResponseBody.expense,
                    ];
                    if ('errors' in createPersonResponseBody) {
                      setErrors(createPersonResponseBody.errors);
                      return;
                    }

                    setExpenseList(createdExpenses);
                    setExpenseName('');
                    setPersonExpense('0');

                    setErrors([]);
                    setExpenseError('');
                  }}
                >
                  <div css={expenseContainerStyles}>
                    <h3>Expense List</h3>
                    <label htmlFor="person-list">Who is paying?</label>
                    <select
                      data-test-id="select-person"
                      id="person-list"
                      onChange={handleSelectPerson}
                      required
                      css={selectStyles}
                    >
                      <option key="template" value={0}>
                        Select Person
                      </option>
                      {peopleList.map((person) => {
                        return (
                          person.eventId === event.id && (
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
                    <label htmlFor="expense">Cost</label>
                    <input
                      data-test-id="expense-value"
                      css={inputExpenseStyles}
                      id="expense"
                      value={personExpense}
                      placeholder="0 €"
                      required
                      onChange={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /,/g,
                          '.',
                        );
                        setPersonExpense(e.currentTarget.value);
                      }}
                    />

                    <label htmlFor="expense-name">
                      What are you paying for?
                    </label>
                    <input
                      css={inputExpenseStyles}
                      data-test-id="expense-name"
                      id="expense-name"
                      value={expenseName}
                      placeholder="Name of the Expense"
                      required
                      onChange={(e) => {
                        setExpenseName(e.currentTarget.value);
                      }}
                    />
                    {expenseError && (
                      <span css={spanErrorStyles}> {expenseError}</span>
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
                {expenseList.map((expense) => {
                  return (
                    <div key={`expense-${expense.id}}`}>
                      <div css={expenseDetailStyles}>
                        <span
                          data-test-id="expense-value-name"
                          css={spanStyles}
                        >
                          {peopleList.map((person) => {
                            return (
                              person.id === expense.paymaster && (
                                <span
                                  key={`expense from person with id ${person.id}`}
                                >
                                  {expense.expensename} {expense.cost / 100}€
                                  paid by {person.name}
                                </span>
                              )
                            );
                          })}
                        </span>

                        <button
                          css={removeButtonStyles}
                          aria-label={`Delete Button for Expense: ${expense.expensename}`}
                          onClick={() => {
                            deleteExpense(expense.id).catch(() => {});
                          }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}

                <span css={spanStyles}>Participants: {peopleList.length}</span>
                <span css={spanStyles}> Total: {sumEventCosts} €</span>

                {peopleList.length !== 0 && (
                  <span css={spanStyles}>
                    Everyone has to pay
                    <span css={redColorCostsStyles}> {sharedCosts} €</span>
                  </span>
                )}
              </div>

              <BarChart
                people={peopleList}
                expenses={expenseList}
                sharedCosts={sharedCosts}
                user={props.user}
                event={props.eventInDb}
              />
            </div>
          );
        })}
      </main>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const eventId = context.query.eventId as string;

  const token = context.req.cookies.sessionToken;

  const user = await getUserByValidSessionToken(token);

  if (!user) {
    return {
      redirect: {
        destination: `/login?returnTo=/users/${eventId}`,
        permanent: false,
      },
    };
  }
  const profileImageInDb = await getProfileImageEvent(parseInt(eventId));

  const eventInDb = await getSingleEvent(parseInt(eventId));

  if (typeof eventInDb === 'undefined') {
    return {
      props: {
        errors: 'This event doesnt exist',
      },
    };
  }

  if (user.id !== eventInDb.userId) {
    return {
      props: {
        errors: 'You are not allowed to see this page',
      },
    };
  }

  const peopleInDb = await getAllPeopleWhereEventIdMatches(parseInt(eventId));

  const expensesInDb = await getAllExpensesWhereIdMatches(parseInt(eventId));

  const cloudName = process.env.CLOUD_NAME;
  if (typeof cloudName === 'undefined') {
    return {
      props: {
        errors: 'cloudName is undefined',
      },
    };
  }
  const uploadPreset = process.env.UPLOAD_PRESET;
  if (typeof uploadPreset === 'undefined') {
    return {
      props: {
        errors: 'uploadPreset is undefined',
      },
    };
  }

  return {
    props: {
      user: user,
      eventInDb: eventInDb,
      peopleInDb: peopleInDb,
      expensesInDb: expensesInDb,
      profileImageInDb: profileImageInDb,
      cloudName: cloudName,
      uploadPreset: uploadPreset,
    },
  };
}
