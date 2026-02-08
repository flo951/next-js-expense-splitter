import type { GetServerSidePropsContext } from 'next'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { getValidSessionByToken } from '@/lib/db/sessions'
import { css } from '@emotion/react'

const mainStyles = css`
  margin: 1rem 1rem;
`

type RestrictedPageProps =
  | {
      user: User
    }
  | {
      error: string
    }

const RestrictedPage = (props: RestrictedPageProps) => {
  if ('error' in props) {
    return (
      <main css={mainStyles}>
        <p>{props.error}</p>
      </main>
    )
  }

  return (
    <main css={mainStyles}>
      <h1>you will only see this when you are logged in</h1>
    </main>
  )
}

export default RestrictedPage

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const sessionToken = context.req.cookies.sessionToken
  const session = await getValidSessionByToken(sessionToken)

  if (!session) {
    return {
      props: {
        error: 'You are not allowed to see this page',
      },
    }
  }
  const user = await getUserByValidSessionToken(sessionToken)
  return {
    props: {
      user: user,
    },
  }
}
