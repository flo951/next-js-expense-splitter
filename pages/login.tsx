import { css } from '@emotion/react'
import type { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { formContainerStyles, formStyles } from '../styles/styles'
import { createCsrfToken } from '../util/auth'
import { getValidSessionByToken } from '../util/database'
import type { LoginResponseBody } from './api/login'

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 20px;

  border-radius: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`

export const inputSubmitStyles = css`
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
export const errorStyles = css`
  color: red;
  font-size: 20px;
`
type Errors = { message: string }[];

type LoginProps = {
  refreshUserProfile: () => void;
  csrfToken: string;
};

const Login = ({ refreshUserProfile, csrfToken }: LoginProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>([])
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="login" content="" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Login to use Splitify</h1>
        <form
          css={formStyles}
          onSubmit={async (e) => {
            e.preventDefault()

            const loginResponse = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: username,
                password: password,
                csrfToken: csrfToken,
              }),
            })

            const loginResponseBody =
              (await loginResponse.json()) as LoginResponseBody

            if ('errors' in loginResponseBody) {
              setErrors(loginResponseBody.errors)
              return
            }

            // get the query paramaeter from next.js router
            const returnTo = router.query.returnTo

            if (
              returnTo &&
              !Array.isArray(returnTo) &&
              // match returnto paramater against valid path
              // regexpressions
              /^\/[a-zA-Z0-9-?=]*$/.test(returnTo)
            ) {
              await router.push(returnTo)
              return
            }

            refreshUserProfile()
            await router
              .push(`/createevent`)
              .catch((error) => console.error(error))
          }}
        >
          <label htmlFor="username">
            <span css={spanLabelStyles}>Username</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="login-username"
            placeholder="Username"
            id="username"
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
          />
          <label htmlFor="password">
            <span css={spanLabelStyles}>Password</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="login-password"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-login"
            type="submit"
            value="Login"
          />
        </form>
        <div css={errorStyles}>
          {errors.map((error) => {
            return <div key={`error-${error.message}`}>{error.message}</div>
          })}
        </div>
      </div>
    </>
  )
}

export default Login

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  // 1. check if there is a token and is valid from the cookie

  const token = context.req.cookies.sessionToken
  // 2. if its valid redirect otherwise render the page
  if (token) {
    const session = await getValidSessionByToken(token)
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
  }
  // 3. Otherwise, generate CSRF token and render the page

  return {
    props: {
      csrfToken: createCsrfToken(),
    },
  }
}
