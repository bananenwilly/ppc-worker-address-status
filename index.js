addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

 async function handleRequest(event) {
  const request = event.request; 

  async function readRequestBody(request) {
    const { headers } = request
    const contentType = headers.get("content-type") || ""
  
    if (contentType.includes("application/json")) {
      return request.json()
    }
  }

  async function parseBody(reqBody) {
    let foundDifference = false; 
    let answerArray = [];
    if(reqBody.hasOwnProperty("coin") && reqBody.hasOwnProperty("addresses")) {
        //valid request
        let kvInstance; 
        if(reqBody.coin === "peercoin") {
          kvInstance = peercoin
        } else if(reqBody.coin === "peercoinTestnet") {
          kvInstance = peercoinTestnet;
        }

      for(const element of reqBody.addresses) {
        for (var key of Object.keys(element)) {
          const addr = key;
          const number = element[key];
          //get data from database
          const numberInKV = await kvInstance.get(addr)
          if(numberInKV > number) {
            foundDifference = true; 
            answerArray.push({address: addr, tx: parseInt(numberInKV)});
          }
        }        
      }
    } else {
      return new Response("bad request", {status: 400});
   }

   return JSON.stringify({'foundDifference': foundDifference,'addresses': answerArray}, null, 2);
  }

  const reqBody = await readRequestBody(request)
  const parseResult = await parseBody(reqBody)

  return new Response(parseResult, {
    headers: { 'content-type': 'application/json' },
  })
}
