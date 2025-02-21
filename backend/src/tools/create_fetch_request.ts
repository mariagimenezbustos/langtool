/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphState } from "index.js";

/**
 * @param {GraphState} state
 */
export async function createFetchRequest(
 state: GraphState
): Promise<Partial<GraphState>> {
 const { params, bestApi } = state;
 if (!bestApi) {
  throw new Error("No best API found");
 }

 let response: any = null;

 try {
  // if params are false, we're not going to add in any special query param
  if (!params) {
   // we can execute it with the request method and the URL
   const fetchRes = await fetch(bestApi.api_url, {
    method: bestApi.method,
   });

   // then get the response
   response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();

   // if we do pass in params
  } else {
   let fetchOptions: Record<string, any> = {
    method: bestApi.method,
   };

   let parsedUrl = bestApi.api_url;

   // first parse the URL to see if any of the params
   // belong inside the URL and not as query parameters
   // (if it exists, we add it in and then delete it from the params object)
   const paramsKeys = Object.entries(params);
   paramsKeys.forEach(([key, value]) => {
    if (parsedUrl.includes(`{${key}}`)) {
     parsedUrl = parsedUrl.replace(`{${key}}`, value);
     delete params[key];
    }
   });

   const url = new URL(parsedUrl);

   // check if it's a GET or a HEAD request
   // if so, there can be no body, so we don't add it in the fetch options
   if (["GET", "HEAD"].includes(bestApi.method)) {
    // format the URL with any extra query params which might exist
    Object.entries(params).forEach(([key, value]) =>
     url.searchParams.append(key, value)
    );
    // if it's not a GET or HEAD request, we need to add in the body
   } else {
    fetchOptions = {
     ...fetchOptions,
     body: JSON.stringify(params),
    };
   }

   const fetchRes = await fetch(url, fetchOptions);
   response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();
  }

  if (response) {
   return {
    response,
   };
  }
 } catch (error) {
  console.error("Error creating fetch request", error);
 }

 return {
  response: null,
 };
}
