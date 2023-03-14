const {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  gql,
} = require("@apollo/client");

const limit = 10;
const query = gql`
  query firstQuery($offset: Int = 0) {
    myList(offset: $offset) {
      id
      title
    }
  }
`;

function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache({
      resultCacheMaxSize: 100,
    }),
    link: new ApolloLink(function (operation) {
      const { offset } = operation.variables;
      return Observable.from([createResult(offset)]);
    }),
  });
  return client;
}

function createResult(offset) {
  const myList = [];
  for (let i = 1; i <= limit; i++) {
    const id = String(offset + i);
    myList.push({
      __typename: "ListEntry",
      id,
      title: `Title${id}`,
    });
  }
  return { data: { __typename: "Query", myList } };
}

async function run(enableFix, iterations = 1000) {
  global.enableOptimismFix = enableFix;
  const client = createClient();
  for (let offset = 0; offset < iterations; offset += limit) {
    await client.query({
      query,
      variables: { offset },
    });
  }
  global.gc();

  const memory = process.memoryUsage();
  console.log(`${enableFix ? "with-fix" : "no-fix"}|${memory.heapUsed}`);
}

run(process.argv.some((arg) => arg === "--enable-fix"));
