let graphs = require('js-graph-algorithms');

const NUM_BUCKETS = 5;

const createCapacities = function(numBros, numTasks) {
  let buckets = [];
  for (let i = 0; i < numBros; i++) {
    buckets.push(Math.floor(i * NUM_BUCKETS / numBros))
  }
  let bucketCounts = [];
  for (let i = 0; i < NUM_BUCKETS; i++) {
    bucketCounts.push(0);
  }
  for (let i = 0; i < buckets.length; i++) {
    bucketCounts[buckets[i]] += 1
  }

  let bucketTaskIncrement = Math.floor(2 * numTasks / (NUM_BUCKETS * (NUM_BUCKETS + 1)));

  let broTaskCount = buckets.map((bucket, idx) => {
    let bucketIdx = Math.floor(idx* NUM_BUCKETS / numBros);
    return Math.floor(bucketTaskIncrement * (bucketIdx + 1) / bucketCounts[bucket])
  });

  let assignedCount = broTaskCount.reduce((acc, val) => acc + val, 0);
  let broCounter = 0;

  while (assignedCount < numTasks) {
    broTaskCount[broCounter] += 1;
    broCounter = (broCounter + 1) % numTasks;
    assignedCount += 1;
  }

  return broTaskCount;
};

const assignMidnights = function(bros, tasks, getPreferences) {
  let numVertices = bros.length + tasks.length + 2;
  let source = 0;
  let sink = numVertices - 1;

  console.log("initializing flow network");
  let g = new graphs.FlowNetwork(numVertices);

  let sortedBros = bros.slice().sort((personA, personB) => {
    return (personB.requirement || 100 - personB.balance || 0) - (personA.requirement || 100 - personA.balance || 0);
  });
  console.log(sortedBros.length);

  let getCapacity = createCapacities(bros.length, tasks.length);

  for (let i = 0; i < bros.length; i++) {
    let bro = i + 1;
    g.addEdge(new graphs.FlowEdge(source, bro, getCapacity[bros.length - i - 1]))
  }

  for (let i = 0; i < bros.length; i++) {
    let bro = i+1;
    for (let j = 0; j < tasks.length; j++) {
      let task = j + bros.length + 1;
      if (getPreferences(sortedBros[i]._id.toString(), tasks[j]._id.toString())) {
        g.addEdge(new graphs.FlowEdge(bro, task, 1))
      }
    }
  }

  for (let j = 0; j < tasks.length; j++) {
    let task = j + bros.length + 1;
    g.addEdge(new graphs.FlowEdge(task, sink, 1))
  }

  console.log("Flow network initialized, beginning FF loop");

  let losingPrefs = 0;
  let ff = new graphs.FordFulkerson(g, source, sink);
  let maxFlow = ff.value;
  while (maxFlow < tasks.length) {
    // bro is gonna lose all his prefs
    let bro = losingPrefs + 1;
    console.log(sortedBros[losingPrefs].zebe.kerberos);
    for (let j = 0; j < tasks.length; j++) {
      let task = j + bros.length + 1;
      if (!getPreferences(sortedBros[losingPrefs]._id.toString(), tasks[j]._id.toString())) {
        g.addEdge(new graphs.FlowEdge(bro, task, 1))
      }
    }
    let additionalFlow = new graphs.FordFulkerson(g, source, sink);
    maxFlow += additionalFlow.value;
    losingPrefs += 1;
  }

  console.log("Flow satisfied, retrieve midnights now");

  for (let i = 0; i < bros.length; i++) {
    let bro = i + 1;
    for (let j = 0; j < tasks.length; j++) {
      let task = j + 1 + bros.length;
      let flowEdge = g.edge(bro, task);
      if (flowEdge) {
        let flow = flowEdge.residualCapacityTo(flowEdge.from());
        if (flow > 0) {
          tasks[j].account = sortedBros[i]._id
        }
      }
    }
  }

  console.log("done extracting solution");
  return tasks;
};

module.exports = {
  assignMidnights,
};
