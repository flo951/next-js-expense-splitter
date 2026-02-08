'use client'
/** @jsxImportSource @emotion/react */

import { Bar } from 'react-chartjs-2'
import { ArcElement } from 'chart.js'
import Chart from 'chart.js/auto'
import { css } from '@emotion/react'
import { spanStyles } from '@/styles/shared'
import type { Balances } from '@/lib/utils/split-payments'
import { splitPayments } from '@/lib/utils/split-payments'
import type { expenses, people } from '@prisma/client'

Chart.register(ArcElement)

export const barChartStyles = css`
  width: 350px;
  height: fit-content;
  padding: 12px 0;
  margin-bottom: 12px;
  border: 2px solid black;
  border-radius: 8px;
  text-align: center;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`

const resultStyles = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

type ExpenseWithParticipants = expenses & { participantIds: number[] }

type BarChartProps = {
  peopleList: people[]
  expenseList: ExpenseWithParticipants[]
}

export default function BarChart({ peopleList, expenseList }: BarChartProps) {
  const sendExpenseList: string[] = []
  expenseList.map((expense) => {
    return peopleList.map((person) => {
      return (
        person.id === expense.paymaster &&
        sendExpenseList.push(
          ` ${expense.expensename} ${expense.cost! / 100}€ paid by ${
            person.name
          }`,
        )
      )
    })
  })

  if (expenseList.length === 0) {
    return <h3>Add People and Expenses to see more</h3>
  }

  const expensePerPerson = peopleList.map((person) => {
    // Calculate what this person paid
    const totalPaid = expenseList
      .filter((expense) => expense.paymaster === person.id)
      .reduce((sum, expense) => sum + (expense.cost || 0) / 100, 0)

    // Calculate what this person owes (their share of expenses they're part of)
    const totalOwed = expenseList
      .filter((expense) => expense.participantIds.includes(person.id))
      .reduce((sum, expense) => {
        const shareAmount =
          (expense.cost || 0) / 100 / expense.participantIds.length
        return sum + shareAmount
      }, 0)

    // Balance = what they paid - what they owe
    const balance = Math.round((totalPaid - totalOwed) * 100) / 100

    return {
      personSum: {
        sum: balance,
        personId: person.id,
        personName: person.name,
      },
    }
  })

  // Balances for each person
  const balances = []

  for (let i = 0; i < expensePerPerson.length; i++) {
    balances.push(expensePerPerson[i].personSum)
  }

  // Convert balances to object format for settlement calculation
  const payments: Balances = balances.reduce(
    (obj, item) => Object.assign(obj, { [item.personName]: item.sum }),
    {},
  )
  const balanceMessages = splitPayments(payments)

  const peopleNameArray = peopleList.map((person) => person.name)

  const data = {
    labels: peopleNameArray,
    datasets: [
      {
        label: 'Positive Balances in €',
        data: expensePerPerson.map((expense) => {
          return expense.personSum.sum > 0 ? expense.personSum.sum : 0
        }),
        options: {
          plugins: {
            subtitle: {
              display: true,
              text: 'Title',
            },
          },
        },
        backgroundColor: ['rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
      {
        label: 'Negative Balances in €',
        data: expensePerPerson.map((expense) => {
          return expense.personSum.sum < 0 ? expense.personSum.sum : 0
        }),
        options: {
          plugins: {
            subtitle: {
              display: true,
              text: 'Title',
            },
          },
        },
        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <>
      <Bar
        data={data}
        height={300}
        options={{
          indexAxis: 'x',
          elements: {
            bar: {
              borderWidth: 2,
            },
          },
          responsive: true,
          plugins: {
              title: {
                display: true,
                text: 'Total Balance of each Participant in €',
              },
            legend: {
              display: true,
              position: 'bottom',
            },
          },
        }}
      />
      <div css={resultStyles}>
        <h4 style={{ margin: '12px 0 6px 0' }}>Result</h4>
        {balanceMessages.map((item) => {
          return (
            <span key={`id ${Math.random()}`} css={spanStyles}>
              {item}
            </span>
          )
        })}

        {expensePerPerson.map((item) => {
          return (
            item.personSum.sum > 0 && (
              <span
                key={`person-${item.personSum.personId} receives money `}
                css={spanStyles}
              >
                {` ${item.personSum.personName} receives ${item.personSum.sum.toFixed(2)}€`}
              </span>
            )
          )
        })}
      </div>
    </>
  )
}
