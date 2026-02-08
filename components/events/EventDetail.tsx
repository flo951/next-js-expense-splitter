'use client'
/** @jsxImportSource @emotion/react */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { css } from '@emotion/react'
import Image from 'next/image'
import type { User } from '@/types'
import type { expenses, people, events } from '@prisma/client'
import PeopleList from '@/components/people/PeopleList'
import ExpenseList from '@/components/expenses/ExpenseList'
import BarChart from '@/components/charts/BarChart'
import {
  spanStyles,
  eventProfilePicStyles,
  loadingCircleStyles,
} from '@/styles/shared'

type ExpenseWithParticipants = expenses & { participantIds: number[] }
type Errors = { message: string }[]

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
`

const eventNameButtonRowStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;

  h3 {
    font-size: 18px;
    font-weight: 400;
    margin: 0;
  }
`

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
`

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
`

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
`

const inputFileUploadStyles = css`
  margin: 2px;
  border-radius: 8px;
  border: 2px solid #dc8409;
  padding: 4px;
  width: 235px;
  margin-right: 6px;
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  color: white;
`

const removeButtonStyles = css`
  color: white;
  border: none;
  background-color: rgb(206, 25, 13);
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  border: 2px solid rgb(206, 25, 13);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  :hover {
    background-color: rgb(180, 20, 10);
  }
`

const loadingFlexBox = css`
  display: flex;
  align-items: center;
  gap: 8px;
`

type EventDetailProps = {
  event: events
  peopleInDb: people[]
  expensesInDb: ExpenseWithParticipants[]
  imageurl: string | null
  user: User
  eventId: number
}

export default function EventDetail({
  event,
  peopleInDb,
  expensesInDb,
  imageurl,
  user,
  eventId,
}: EventDetailProps) {
  const [peopleList, setPeopleList] = useState<people[]>(peopleInDb)
  const [personExpense, setPersonExpense] = useState('0')
  const [expenseName, setExpenseName] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState<number>(0)
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    peopleInDb.map((p) => p.id),
  )
  const [sumEventCosts, setSumEventCosts] = useState('0')
  const [formErrors, setFormErrors] = useState<Errors | undefined>([])
  const [expenseError, setExpenseError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [expenseList, setExpenseList] =
    useState<ExpenseWithParticipants[]>(expensesInDb)
  const [uploadImage, setUploadImage] = useState<FileList | null>(null)
  const [imageUrl, setImageUrl] = useState(imageurl || '')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editButtonImageUpload, setEditButtonImageUpload] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const calculateTotalSumPerEvent = () => {
      const cost: number[] = expenseList.map((expense) => {
        return (expense.cost || 0) / 100
      })
      const sum = cost.reduce((partialSum, a) => partialSum + a, 0)
      setSumEventCosts(sum.toFixed(2))
    }
    calculateTotalSumPerEvent()
  }, [expenseList])

  // Reset selectedParticipants when peopleList changes
  useEffect(() => {
    setSelectedParticipants(peopleList.map((p) => p.id))
  }, [peopleList])

  const deleteExpense = async (id: number) => {
    const deleteResponse = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expenseId: id,
      }),
    })
    const deleteExpenseResponseBody = await deleteResponse.json()

    if ('errors' in deleteExpenseResponseBody) {
      setFormErrors(deleteExpenseResponseBody.errors)
      return
    }

    if ('expense' in deleteExpenseResponseBody) {
      const newExpenseList = expenseList.filter((expense) => {
        return deleteExpenseResponseBody.expense.id !== expense.id
      })
      setExpenseList(newExpenseList)
      return
    }
  }

  const handleSelectPerson = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const personId = parseInt(event.target.value)
    setSelectedPersonId(personId)
    if (!selectedParticipants.includes(personId) && personId !== 0) {
      setSelectedParticipants([...selectedParticipants, personId])
    }
  }

  const deleteEvent = async (id: number) => {
    const deleteResponse = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: id,
        user: user,
      }),
    })
    const deleteEventResponseBody = await deleteResponse.json()

    if ('errors' in deleteEventResponseBody) {
      setFormErrors(deleteEventResponseBody.errors)
      return
    }

    router.push('/overview')
  }

  const handleUploadImage = async (eventId: number) => {
    if (!uploadImage || uploadImage.length === 0) {
      setUploadError('Please select an image first')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', uploadImage[0])
    formData.append('upload_preset', process.env.NEXT_PUBLIC_UPLOAD_PRESET || '')

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      const data = await response.json()

      if (data.secure_url) {
        // Update event with new image URL
        const updateResponse = await fetch(`/api/events/${eventId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uploadUrl: data.secure_url,
          }),
        })

        const updateData = await updateResponse.json()

        if ('imageurl' in updateData) {
          setImageUrl(data.secure_url)
          setEditButtonImageUpload(false)
          setUploadError('')
        }
      }
    } catch {
      setUploadError('Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main css={mainStyles}>
      {/* Left Column: Event Info + People List */}
      <div css={borderPeopleListStyles}>
        <div css={eventNameButtonRowStyles}>
          <h3>Event: {event.eventname}</h3>
          <button css={removeButtonStyles} onClick={() => deleteEvent(eventId)}>
            ×
          </button>
        </div>

        {editButtonImageUpload ? (
          <>
            <input
              css={inputFileUploadStyles}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setUploadImage(e.target.files)
                }
              }}
            />
            {isLoading ? (
              <div css={loadingFlexBox}>
                <span>Uploading...</span>
                <div css={loadingCircleStyles} />
              </div>
            ) : (
              <>
                <button
                  css={buttonFileUploadStyles}
                  onClick={() => handleUploadImage(eventId)}
                >
                  Upload
                </button>
                <button
                  css={buttonFileUploadStyles}
                  onClick={() => setEditButtonImageUpload(false)}
                >
                  Cancel
                </button>
              </>
            )}
            {uploadError && <span css={spanStyles}>{uploadError}</span>}
          </>
        ) : (
          <>
            <Image
              css={eventProfilePicStyles}
              src={imageUrl || '/images/maldives-1993704_640.jpg'}
              alt={`Picture of ${event.eventname}`}
              width={100}
              height={100}
            />
            <button
              css={buttonFileUploadStyles}
              onClick={() => setEditButtonImageUpload(true)}
            >
              Edit event picture
            </button>
          </>
        )}
        <PeopleList
          user={user}
          setErrors={setFormErrors}
          expenseList={expenseList}
          setExpenseList={setExpenseList}
          eventId={eventId}
          setPeopleList={setPeopleList}
          peopleList={peopleList}
        />

        {formErrors && formErrors.length > 0 && (
          <div>
            {formErrors.map((error) => (
              <p key={error.message} style={{ color: 'red' }}>
                {error.message}
              </p>
            ))}
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
          setErrors={setFormErrors}
          peopleList={peopleList}
          eventId={eventId}
          deleteExpense={deleteExpense}
          handleSelectPerson={handleSelectPerson}
        />
        <div>
          <span css={spanStyles}>Participants: {peopleList.length}</span>
        </div>
        <div>
          <span css={spanStyles}>Total: {sumEventCosts} €</span>
        </div>
      </div>

      <div css={expenseBigContainerStyles}>
        <BarChart peopleList={peopleList} expenseList={expenseList} />
      </div>
    </main>
  )
}
