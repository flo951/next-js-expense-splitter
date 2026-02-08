// Authentication related types

export type CsrfToken = string

export type SessionToken = string

export type SessionCookie = {
  name: string
  value: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  path?: string
}
