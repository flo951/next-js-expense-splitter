import { css } from '@emotion/react'
import { useState } from 'react'
import { inputSubmitStyles, spanStyles } from '../pages/createevent'
import {
  inputExpenseStyles,
  loadingCircleStyles,
  loadingFlexBox,
} from '../pages/users/[eventId]'
import { formStyles } from '../styles/styles'
import type { Event } from '../util/database'
import { barChartStyles } from './BarChart'
const emailFeedbackStyles = css`
  color: green;
`
type SendEmailProps = {
  user: string
  expenseList: string[]
  balanceMessages: string[]
  event: Event
  participants: string[]
}
const SendEmail = ({
  user,
  expenseList,
  balanceMessages,
  event,
  participants,
}: SendEmailProps) => {
  const [name, setName] = useState(user)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [emailResponse, setEmailResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div css={barChartStyles}>
      <h3>Send the result to your friends</h3>
      <form
        css={formStyles}
        onSubmit={async (e) => {
          e.preventDefault()
          setEmailResponse('')
          setIsLoading(true)
          const createEmailResponse = await fetch('/api/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name,
              email: email,
              message: message,
              expenseList: expenseList,
              result: balanceMessages,
              event: event,
              participants: participants,
            }),
          })
          const createEmailResponseBody = await createEmailResponse.json()
          setName('')
          setEmail('')
          setMessage('')
          setIsLoading(false)
          setEmailResponse(
            `E-Mail sent successfully to ${createEmailResponseBody.mailData.accepted}`,
          )
          setTimeout(() => setEmailResponse(''), 5000)
        }}
      >
        <label htmlFor="name">Your Name</label>
        <input
          css={inputExpenseStyles}
          value={name}
          name="name"
          required
          onChange={(e) => {
            setName(e.target.value)
          }}
          placeholder="Name"
        />

        <label htmlFor="email">Who is receiving your E-Mail?</label>
        <input
          css={inputExpenseStyles}
          value={email}
          type="email"
          name="email"
          required
          onChange={(e) => {
            setEmail(e.target.value)
          }}
          placeholder="E-Mail"
        />

        <label htmlFor="message">Message</label>
        <textarea
          css={inputExpenseStyles}
          value={message}
          required
          name="message"
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          placeholder="Message"
        />

        <input type="submit" value="Send E-Mail" css={inputSubmitStyles} />
        <span>
          {isLoading && (
            <div css={loadingFlexBox}>
              <span css={spanStyles}>Sending E-Mail...</span>
              <div css={loadingCircleStyles} />
            </div>
          )}
        </span>

        <span css={emailFeedbackStyles}>{emailResponse}</span>
      </form>
    </div>
  )
}

export default SendEmail
