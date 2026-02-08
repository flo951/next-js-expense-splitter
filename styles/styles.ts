'use client'

import { css } from '@emotion/react'

export const formContainerStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h1 {
    text-align: center;
    font-weight: 400;
  }
`

export const formStyles = css`
  padding: 24px;
  flex-direction: column;
  color: black;
  display: flex;
  gap: 1rem;
  margin: 1rem 1rem;
  border-radius: 8px;
  h4 {
    font-size: 20px;
  }
`
