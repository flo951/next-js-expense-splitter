'use client'
/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formContainerStyles, formStyles } from '@/styles/styles'

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 20px;
  border-radius: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`

const inputSubmitStyles = css`
  padding: 8px 8px;
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  color: white;
  border: 2px solid black;
  border-radius: 8px;
  font-size: 20px;
  width: 100%;
  cursor: pointer;
`

const spanLabelStyles = css`
  font-size: 20px;
  margin-bottom: 12px;
`

const errorStyles = css`
  color: red;
  font-size: 20px;
`

type RegisterFormProps = {
  csrfToken: string
}

export default function RegisterForm({ csrfToken }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ message: string }[]>([])
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        csrfToken,
      }),
    })

    const data = await response.json()

    if ('errors' in data) {
      setErrors(data.errors)
      return
    }

    router.push('/overview')
    router.refresh()
  }

  return (
    <div css={formContainerStyles}>
      <form css={formStyles} onSubmit={handleSubmit}>
        <span css={spanLabelStyles}>Username</span>
        <input
          css={nameInputStyles}
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
        />
        <span css={spanLabelStyles}>Password</span>
        <input
          css={nameInputStyles}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <button css={inputSubmitStyles}>Register</button>
      </form>
      {errors.map((error) => (
        <div css={errorStyles} key={error.message}>
          {error.message}
        </div>
      ))}
    </div>
  )
}
