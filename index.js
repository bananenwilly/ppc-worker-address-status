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
    if(reqBody.hasOwnProperty("coin") && reqBody.hasOwnProperty("addresses")) {
        //valid request
        let kvInstance; 
        if(reqBody.coin === "peercoin") {
          kvInstance = peercoin
        } else if(reqBody.coin === "peercoinTestnet") {
          kvInstance = peercoinTestnet;
        }
      
      for(const element of reqBody.addresses) {
        const addr = Object.keys(element)[0];
        const number = element[addr];

        //get data from database
        const numberInKV = await kvInstance.get(addr)
        if(numberInKV > number) {
          foundDifference = true; 
        }
      }
    } else {
      return new Response("bad request", {status: 400});
   }
   return foundDifference; 
  }

  const reqBody = await readRequestBody(request)
  const parseResult = await parseBody(reqBody)

  const json = JSON.stringify({"foundDifference": parseResult}, null, 2)
  return new Response(json, {
    headers: { 'content-type': 'application/json' },
  })
}
