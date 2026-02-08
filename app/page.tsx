'use client'
/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react'
import Link from 'next/link'

const mainStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    font-weight: 400;
  }
`

const spanStyles = css`
  margin: 1rem;
  font-size: 24px;
  text-align: center;
`

const videoStyles = css`
  height: 600px;
  border: 2px solid black;
  border-radius: 12px;
`

const videoContainerStyles = css`
  display: flex;
  gap: 12px;
  @media only screen and (max-width: 800px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`

export default function Home() {
  return (
    <main css={mainStyles}>
      <h1>Welcome to Splitify</h1>

      <div css={videoContainerStyles}>
        <video css={videoStyles} autoPlay loop muted src="/videos/clip4.mov">
          <track kind="captions" />
        </video>

        <video css={videoStyles} autoPlay loop muted src="/videos/clip8.mov">
          <track kind="captions" />
        </video>
      </div>

      <p css={spanStyles}>
        Splitify allows you to split up expenses fast and easy.
      </p>

      <span css={spanStyles}>
        <Link href="/register">Create an Account</Link> to use our Service
      </span>
    </main>
  )
}
