'use client'

import { css } from '@emotion/react'

// Form styles
export const formStyles = css`
  display: flex;
  width: 300px;
  flex-direction: column;
  gap: 12px;
  margin: 12px;
`

export const divPersonListStyles = css`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 12px auto;
`

export const smallContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: 20px;
  }
`

// Text styles
export const spanStyles = css`
  font-size: 20px;
  color: black;
`

// Input styles
export const inputSubmitStyles = css`
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    border: 2px solid #dc8409;
    transition: 0.3s ease-out;
  }
`

export const nameInputStyles = css`
  font-size: 20px;
  border-radius: 4px;
  padding: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`

export const inputExpenseStyles = css`
  padding: 8px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 20px;
`

export const inputExpenseSubmitStyles = css`
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  margin-top: 12px;
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    border: 2px solid #dc8409;
    transition: 0.3s ease-out;
  }
`

export const selectStyles = css`
  padding: 8px;
  font-size: 20px;
`

// Button styles
export const removeButtonStyles = css`
  color: white;
  border: none;
  background-color: rgb(206, 25, 13);
  font-size: 16px;
  margin: 0px 2px;
  border: 2px solid rgb(206, 25, 13);
  border-radius: 50%;
  max-height: 25px;
  cursor: pointer;
`

// List styles
export const personStyles = css`
  display: flex;
  padding: 4px;
`

export const eventListStyles = css`
  margin: 12px;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  a {
    color: black;
    text-decoration: none;
  }
`

// Expense styles
export const expenseContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    margin-top: 0;
    text-align: center;
    font-weight: 400;
  }
`

export const expenseDetailStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
`

export const redColorCostsStyles = css`
  color: rgb(206, 25, 13);
`

export const spanErrorStyles = css`
  color: rgb(206, 25, 13);
  font-size: 20px;
`

// Image styles
export const eventProfilePicStyles = css`
  border: 2px solid black;
  border-radius: 50%;
`

// Loading styles
export const loadingCircleStyles = css`
  border-radius: 50%;
  border-top: 2px solid #2a6592;
  border-right: 2px solid #2a6592;
  border-bottom: 2px solid #dc8409;
  border-left: 2px solid #dc8409;
  width: 20px;
  height: 20px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;

  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
