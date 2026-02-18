import { Bar } from 'react-chartjs-2'
import { ArcElement } from 'chart.js'
import Chart from 'chart.js/auto'
import { css } from '@emotion/react'
import { spanStyles } from '../pages/createevent'
import type { Balances } from '../util/splitPayments'
import { splitPayments } from '../util/splitPayments'
import { calculatePersonBalances } from '../util/expenseBalances'

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

const BarChart = ({ peopleList, expenseList }: BarChartProps) => {
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
    return (
      <div css={barChartStyles}>
        <h3>Add People and Expenses to see more</h3>
      </div>
    )
  }

  const personBalances = calculatePersonBalances(peopleList, expenseList)

  // Convert balances to object format for settlement calculation
  const payments: Balances = Object.fromEntries(
    personBalances.map((pb) => [pb.personName, pb.balance]),
  )
  const balanceMessages = splitPayments(payments)

  const peopleNameArray = peopleList.map((person) => person.name)

  const data = {
    labels: peopleNameArray,
    datasets: [
      {
        label: 'Positive Balances in €',
        data: personBalances.map((pb) => (pb.balance > 0 ? pb.balance : 0)),
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
        data: personBalances.map((pb) => (pb.balance < 0 ? pb.balance : 0)),
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
    <div css={barChartStyles}>
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
        <span css={spanStyles}>Result</span>
        {balanceMessages.map((item) => {
          return (
            <span key={`id ${Math.random()}`} css={spanStyles}>
              {item}
            </span>
          )
        })}

        {personBalances.map((item) => {
          return (
            item.balance > 0 && (
              <span
                key={`person-${item.personId} receives money `}
                css={spanStyles}
              >
                {` ${item.personName} receives ${item.balance.toFixed(2)}€`}
              </span>
            )
          )
        })}
      </div>
    </div>
  )
}

export default BarChart
