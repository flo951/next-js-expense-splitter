// Algorithm to calculate who owes how much to hwom
export function splitPayments(object) {
  const people = Object.keys(object);
  const valuesPaid = Object.values(object);

  // totalSum of all expenses
  const totalSum = valuesPaid.reduce((acc, curr) => curr + acc);

  // sharedAmount is the amount everyone that participates in an event has to pay
  const sharedAmount = totalSum / people.length;

  // Sort people names Array from lowest to highest balance
  const sortedPeople = people.sort(
    (personA, personB) => object[personA] - object[personB],
  );

  // Sort values array from lowest to highest balanc after deducting sharedamount
  const sortedValuesPaid = sortedPeople.map(
    (person) => object[person] - sharedAmount,
  );
  // i is start of the array
  let i = 0;
  // j begins at the end of array
  let j = sortedPeople.length - 1;
  let debt;
  const resultArray = [];

  while (i < j) {
    debt = Math.min(-sortedValuesPaid[i], sortedValuesPaid[j]);

    sortedValuesPaid[i] += debt;
    sortedValuesPaid[j] -= debt;

    resultArray.push(
      ` ${sortedPeople[i]} owes ${sortedPeople[j]} ${debt.toFixed(2)}€`,
    );
    // check if balance is 0, then go to next
    if (sortedValuesPaid[i] === 0) {
      i++;
    }
    // check if balance is 0, then go to next
    if (sortedValuesPaid[j] === 0) {
      j--;
    }
  }
  return resultArray;
}
