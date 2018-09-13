

const assignMidnights = (accounts, midnights) => {
  let assignment = {};
  let sortedAccounts = accounts.slice().sort((personA, personB) => {
    return personA.balance || 0 - personB.balance || 0;
  });

  let totalPts = midnights.reduce((acc, obj) => (acc + obj.potential), 0);
  let midnightIds = new Set(midnights.map(m => m._id));

  let accountIdxs = {};
  let totalMissing = 0;
  let maxPts = sortedAccounts[accounts.length - 1].balance;
  for (let i = 0; i < accounts.length; i++) {
    let acct = sortedAccounts[i];
    accountIdxs[acct._id] = i;
    totalMissing += maxPts - acct.balance;
  }

  let targetPoints = sortedAccounts.map(acct => Math.floor((maxPts - acct.balance) / totalMissing * totalPts));

  let personIdx = 0;

  while (personIdx < accounts.length) {
    let currentBidder = sortedAccounts[personIdx];


  }





};

module.exports = assignMidnights;