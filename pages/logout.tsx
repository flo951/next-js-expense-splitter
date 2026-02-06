import type { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { deleteSessionByToken } from '../util/database'
import { serialize } from 'cookie'

const Logout = () => {
  return (
    <>
      <Head>
        <title>Logout</title>
        <meta name="login" content="" />
      </Head>

      <h1>Logged out</h1>
    </>
  )
}

export default Logout

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const token = context.req.cookies.sessionToken

  if (token) {
    await deleteSessionByToken(token)
    context.res.setHeader(
      'Set-Cookie',
      serialize('sessionToken', '', {
        maxAge: -1,
        path: '/',
      }),
    )
  }

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}
