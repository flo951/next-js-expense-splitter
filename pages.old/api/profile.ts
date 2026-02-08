import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserByValidSessionToken } from '@/lib/db/users'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const token = req.cookies.sessionToken
    const user = await getUserByValidSessionToken(token)

    if (!token) {
      res.status(400).json({
        errors: [
          {
            message: 'No session token passed',
          },
        ],
      })
      return
    }

    if (user) {
      res.status(200).json({
        user: user,
      })
      return
    }

    res.status(404).json({
      errors: [
        {
          message: 'user not found or session token not valid',
        },
      ],
    })
    return // important, prevents headers already sent error
  }

  res.status(405).json({
    errors: [
      {
        message: 'Method not supported, try POST instead',
      },
    ],
  })
}
