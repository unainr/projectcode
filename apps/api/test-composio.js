import { Composio } from "@composio/core"; const c = new Composio({ apiKey: "test" }); console.log(Object.keys(c)); console.log(Object.keys(c.connectedAccounts));
