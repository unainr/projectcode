import { Composio } from "@composio/core"; const c = new Composio({ apiKey: "test" }); const session = c.create("test"); console.log(Object.keys(session));
