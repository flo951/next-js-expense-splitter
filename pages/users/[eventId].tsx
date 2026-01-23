import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BarChart from '../../components/BarChart';
import ExpenseList from '../../components/ExpenseList';
import PeopleList from '../../components/PeopleList';

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
import { Errors, spanStyles } from '../createevent';
import { errorStyles } from '../login';
import { expenses, people } from '@prisma/client';

type ExpenseWithParticipants = expenses & { participantIds: number[] };

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
export const selectStyles = css`
  padding: 8px;

  font-size: 20px;
`;
export const inputExpenseStyles = css`
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 20px;
`;
export const expenseContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    margin-top: 0;
    text-align: center;
    font-weight: 400;
  }
`;
export const spanErrorStyles = css`
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
export const inputExpenseSubmitStyles = css`
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
export const expenseDetailStyles = css`
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
  peopleInDb: people[];
  expensesInDb: ExpenseWithParticipants[];
  profileImageInDb: ImageUrl;
  cloudName: string;
  uploadPreset: string;
};

export default function UserDetail(props: Props) {
  const [eventList, setEventList] = useState<Event[]>([props.eventInDb]);
  const [peopleList, setPeopleList] = useState<people[]>(props.peopleInDb);
  const [personExpense, setPersonExpense] = useState('');
  const [expenseName, setExpenseName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    props.peopleInDb.map((p) => p.id),
  );
  const [sumEventCosts, setSumEventCosts] = useState('0');
  const [errors, setErrors] = useState<Errors | undefined>([]);
  const [expenseError, setExpenseError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [expenseList, setExpenseList] = useState<ExpenseWithParticipants[]>(
    props.expensesInDb,
  );
  const [uploadImage, setUploadImage] = useState<FileList>();
  const [imageUrl, setImageUrl] = useState(props.profileImageInDb.imageurl);
  const [isLoading, setIsLoading] = useState<Boolean>();
  const [editButtonImageUpload, setEditButtonImageUpload] =
    useState<Boolean>(false);
  const router = useRouter();

  useEffect(() => {
    function calculateTotalSumPerEvent() {
      if (typeof props.eventInDb === 'undefined') {
        return;
      }

      const cost: number[] = expenseList.map((expense) => {
        return expense.cost! / 100;
      });

      const sum = cost.reduce((partialSum, a) => partialSum + a, 0);
      setSumEventCosts(sum.toFixed(2));
    }
    calculateTotalSumPerEvent();
  }, [expenseList, props.eventInDb]);

  // Reset selectedParticipants when peopleList changes (new person added)
  useEffect(() => {
    setSelectedParticipants(peopleList.map((p) => p.id));
  }, [peopleList]);
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
    const personId = parseInt(event.target.value);
    setSelectedPersonId(personId);
    // Ensure paymaster is in selected participants
    if (!selectedParticipants.includes(personId) && personId !== 0) {
      setSelectedParticipants([...selectedParticipants, personId]);
    }
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
                {/* create a component for cloudinary form */}
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
                <PeopleList
                  peopleList={peopleList}
                  setPeopleList={setPeopleList}
                  user={props.user}
                  setErrors={setErrors}
                  expenseList={expenseList}
                  setExpenseList={setExpenseList}
                  eventId={props.eventInDb.id}
                />
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
                <ExpenseList
                  personExpense={personExpense}
                  setPersonExpense={setPersonExpense}
                  expenseError={expenseError}
                  setExpenseError={setExpenseError}
                  selectedPersonId={selectedPersonId}
                  selectedParticipants={selectedParticipants}
                  setSelectedParticipants={setSelectedParticipants}
                  expenseName={expenseName}
                  setExpenseName={setExpenseName}
                  expenseList={expenseList}
                  setExpenseList={setExpenseList}
                  setErrors={setErrors}
                  peopleList={peopleList}
                  eventId={props.eventInDb.id}
                  deleteExpense={deleteExpense}
                  handleSelectPerson={handleSelectPerson}
                />

                <span css={spanStyles}>Participants: {peopleList.length}</span>
                <span css={spanStyles}> Total: {sumEventCosts} €</span>
              </div>

              <BarChart people={peopleList} expenses={expenseList} />
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

  if (user.id !== eventInDb?.user_id) {
    return {
      props: {
        errors: 'You are not allowed to see this page',
      },
    };
  }

  const peopleInDb = await getAllPeopleWhereEventIdMatches(parseInt(eventId));
  console.log('people', peopleInDb);

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
