import { groq } from "@ai-sdk/groq";
import { Bindings } from "./env";
import { getComposioSession } from "./composio-session";



export async function getAgentTools(
  env: Bindings,
  userId: string,
) {
  const session = await getComposioSession(env, userId);

  const tools = await session.tools();

  return {
    session,
    tools,
  };
}

// export function getModel(env: Bindings) {
//   return groq("llama-3.3-70b-versatile", {
   
//   });
// }