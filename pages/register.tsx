import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { formContainerStyles, formStyles } from '../styles/styles';
import { createCsrfToken } from '../util/auth';
import { getValidSessionByToken } from '../util/database';
import { RegisterResponseBody } from './api/register';
import { inputSubmitStyles } from './login';

const nameInputStyles = css`
  padding: 8px 8px;
  font-size: 20px;
  border-radius: 4px;
  :focus {
    outline-color: #2a6592;
    outline-width: 2px;
    outline-style: solid;
  }
`;

const spanLabelStyles = css`
  font-size: 20px;
  margin-bottom: 12px;
`;
const errorStyles = css`
  color: red;
  font-size: 20px;
`;

type Errors = { message: string }[];

type RegisterProps = {
  refreshUserProfile: () => void;
  csrfToken: string;
};

export default function Register({ refreshUserProfile, csrfToken }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>([]);
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Registration</title>
        <meta name="Registration" content="Register on this page" />
      </Head>

      <div css={formContainerStyles}>
        <h1>Sign Up for Splitify </h1>
        <span>its free, for now...</span>
        <form
          css={formStyles}
          onSubmit={async (e) => {
            e.preventDefault();

            const registerResponse = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: username,
                password: password,
                csrfToken: csrfToken,
              }),
            });

            const registerResponseBody =
              (await registerResponse.json()) as RegisterResponseBody;

            if ('errors' in registerResponseBody) {
              setErrors(registerResponseBody.errors);
              return;
            }
            refreshUserProfile();

            await router
              .push('./createevent')
              .catch((error) => console.log(error));
          }}
        >
          <label htmlFor="username">
            <span css={spanLabelStyles}>Username</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="sign-up-username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            placeholder="Username"
            required
          />
          <label htmlFor="password">
            <span css={spanLabelStyles}>Password</span>
          </label>
          <input
            css={nameInputStyles}
            data-test-id="sign-up-password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            required
          />
          <input
            css={inputSubmitStyles}
            data-test-id="complete-signup"
            type="submit"
            value="Sign Up Now"
          />
        </form>
        <div css={errorStyles}>
          {errors.map((error) => {
            return <div key={`error-${error.message}`}>{error.message}</div>;
          })}
        </div>
      </div>
    </>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // 1. check if there is a token and is valid from the cookie
  const token = context.req.cookies.sessionToken;
  // 2. if its valid redirect otherwise render the page
  if (token) {
    const session = await getValidSessionByToken(token);
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
  }
  return {
    props: { csrfToken: createCsrfToken() },
  };
}
