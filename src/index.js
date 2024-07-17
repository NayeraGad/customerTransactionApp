const contentTable = document.querySelector(".content-table");
const tableBody = document.querySelector(".table-body");
const filterInput = document.querySelector("#filterInput");
const searchBtn = document.querySelector(".btn");
const canvas = document.querySelector("#canvas");

let customers = [];
let transactions = [];
let chart;

// Get data from API
async function getData() {
  try {
    const res = await fetch("../db.json");

    if (!res.ok) {
      throw new Error(res.status);
    }

    const data = await res.json();

    console.log(data);

    customers = data.customers;
    transactions = data.transactions;

    displayCustomers(transactions);
  } catch (error) {
    console.log(error);
  }
}

// Get transactions of each customer
const getCustomerTransactions = (transactionID) => {
  return customers.filter((customer) => customer.id === transactionID);
};

// Get all customer transaction amounts
const getTotalAmountPerDay = (customerId) => {
  const customerTransactions = transactions.filter(
    (transaction) => transaction.customer_id === customerId
  );

  const totalAmountPerDay = {};

  customerTransactions.forEach((transaction) => {
    const date = transaction.date;
    const amount = transaction.amount;

    if (totalAmountPerDay[date]) {
      totalAmountPerDay[date] += amount;
    } else {
      totalAmountPerDay[date] = amount;
    }
  });

  return totalAmountPerDay;
};

// Search by name or amount
function search() {
  const term = filterInput.value.toLowerCase();

  if (isNaN(term)) {
    // Search by name if input is not a number
    const matchingCustomers = customers.filter((customer) =>
      customer.name.toLowerCase().startsWith(term)
    );

    // Get transaction data for the first matched customer
    const matchingTransactions = transactions.filter((transaction) =>
      matchingCustomers
        .slice(0, 1)
        .some((customer) => customer.id === transaction.customer_id)
    );

    displaySearch(matchingTransactions);

    // Generate graph for the selected customer
    if (matchingCustomers.length > 0) {
      const customerId = matchingCustomers[0].id;
      const totalAmountPerDay = getTotalAmountPerDay(customerId);
      displayGraph(totalAmountPerDay);
    }
  } else {
    // Search by amount
    const matchingTransactions = transactions.filter((transaction) =>
      transaction.amount.toString().includes(term)
    );

    displaySearch(matchingTransactions);
  }
}

// Display Customers & Transactions
const displayCustomers = (transaction) => {
  let row = "";

  for (let i = 0; i < transaction.length; i++) {
    const customer = getCustomerTransactions(transaction[i].customer_id);

    for (let j = 0; j < customer.length; j++) {
      row += `
            <div class="w-3/12 p-3">
              <span class="text-lg font-bold">${transaction[i].id}</span>
            </div>
            <div class="w-3/12 p-3">
              <span class="text-lg">${customer[j].name}</span>
            </div>
            <div class="w-3/12 p-3">
              <span class="text-lg">${transaction[i].amount}</span>
            </div>
            <div class="w-3/12 p-3">
              <span class="text-lg">${transaction[i].date}</span>
            </div>
            `;
    }
  }

  tableBody.innerHTML = row;
};

// Display selected customer or amount
const displaySearch = (data) => {
  let row = "";

  // Destroy the existing Chart if it exists
  if (chart) {
    chart.destroy();
  }

  for (let i = 0; i < data.length; i++) {
    const customer = getCustomerTransactions(data[i].customer_id);

    for (let j = 0; j < customer.length; j++) {
      row += `
            <div class="w-4/12 p-3">
              <span class="text-lg">${customer[j].name}</span>
            </div>
            <div class="w-4/12 p-3">
              <span class="text-lg">${data[i].amount}</span>
            </div>
            <div class="w-4/12 p-3">
              <span class="text-lg">${data[i].date}</span>
            </div>
            `;
    }
  }

  contentTable.innerHTML = `<div class="table-header flex items-center text-center mt-7 shadow-md bg-sky-600 text-white rounded-lg">
            <div class="customer-name w-4/12 p-3">
              <h2 class="sm:text-lg md:text-xl xl:text-2xl">Customer Name</h2>
            </div>
            <div class="transaction w-4/12 p-3">
              <h2 class="sm:text-lg md:text-xl xl:text-2xl">Transaction Amount</h2>
            </div>
            <div class="date w-4/12 p-3">
              <h2 class="sm:text-lg md:text-xl xl:text-2xl">Date</h2>
            </div>
          </div>

          <div
            class="table-body flex flex-wrap justify-center mt-4 items-center text-center shadow-md bg-sky-50 rounded-lg"
          >${row}</div>`;
};

function displayGraph(data) {
  chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          label: "Total Amount",
          data: Object.values(data),
          backgroundColor: "rgba(14, 165, 233, 0.6)",
          borderColor: "rgba(2, 132, 199 ,1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Amount",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    },
  });
}

getData();

searchBtn.addEventListener("click", search);
filterInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    search();
  }
});
