# Sources

What this skill draws on, and when each was last checked. The rules and tells are a synthesis; where a specific idea, number or name comes from one source, it is credited here.

Protocols in this area change quickly. Before writing code that depends on an exact attribute or method name, read the current spec.

Last checked: November 10, 2026.

## Behavior

- **K. J. Kevin Feng, David W. McDonald, Amy X. Zhang, "Levels of Autonomy for AI Agents"** (Knight First Amendment Institute). The five user roles: operator, collaborator, consultant, approver, observer. Autonomy as a design decision separate from capability. https://knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1
- **Victor Yocco, "Designing For Agentic AI: Practical UX Patterns For Control, Consent, And Accountability"** (Smashing Magazine, February 2026). Intent preview, autonomy dial, explainable rationale, confidence signal, action audit and undo, escalation pathway, and the starting thresholds quoted in behavior.md. https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/
- **Linear, Agent Interaction Guidelines.** Disclose that it is an agent, work inside the platform's patterns, acknowledge immediately, be open about state, stop when asked, keep a person accountable. https://linear.app/developers/aig
- **Microsoft, "Human-centered design for agents"** (May 2026). Keep the person as the initiator, don't use human or emotional framing, design first run, interaction and being wrong as a lifecycle. https://learn.microsoft.com/en-us/agents/design-guidelines/human-centered-design
- **Anthropic, "Building effective agents"** (December 2024). Use the simplest thing that works, show the agent's planning, treat the agent-computer interface with the care of a human one. https://www.anthropic.com/engineering/building-effective-agents
- **Alan Tippins, agentic-ux-patterns.** Thirteen heuristics, including responsible memory, surfacing what the agent can see, and onboarding the agent like a teammate. https://github.com/alantippins/agentic-ux-patterns
- **Andrej Karpathy** on the autonomy slider and interfaces built to speed up verification (YC AI Startup School, June 2025).

## Interface and generative UI

- **OpenAI, Apps SDK design guidelines.** Display modes and their limits (two actions on an inline card, three to eight items in a carousel, no nested scrolling). https://developers.openai.com/apps-sdk/concepts/design-guidelines
- **A2UI.** Declarative, catalog-constrained generative UI: the agent sends data describing components the client has registered, never executable code. https://a2ui.org/
- **MCP Apps** (SEP-1865). Interfaces delivered as resources linked to tools and rendered in sandboxed frames. https://github.com/modelcontextprotocol/ext-apps
- **AG-UI.** Event protocol between agents and applications, including shared state and human-in-the-loop pauses; the basis for treating a person's edits as state the agent reads. https://docs.ag-ui.com/
- **Nielsen Norman Group, "Generative UI and Outcome-Oriented Design"** (Kate Moran, Sarah Gibbons). Designing the goals and constraints the system generates within. https://www.nngroup.com/articles/generative-ui/
- **Luke Wroblewski,** essays on agent management interfaces, showing the work of agents, and orchestration UI (2025 to 2026). Why linear chat stops working with parallel agents. https://www.lukew.com/ff/
- **Emily Campbell, The Shape of AI.** Pattern library for AI interfaces. https://www.shapeof.ai/

## Agent-readable

- **Nielsen Norman Group, "AI Agents as Users".** How agents perceive pages (screenshots, accessibility tree, APIs) and why accessibility practice is the foundation. https://www.nngroup.com/articles/ai-agents-as-users/
- **Netlify, Agent Experience (AX)** (Mathias Biilmann). Naming the experience agents have as users of a product. https://www.netlify.com/agent-experience/
- **Chrome for Developers, WebMCP.** Status, the declarative attributes (`toolname`, `tooldescription`, `toolparamdescription`, `toolautosubmit`), the imperative `document.modelContext.registerTool` API, and tool annotations. Experimental; origin trial at time of checking. https://developer.chrome.com/docs/ai/webmcp
- **Cloudflare, "Markdown for Agents".** `Accept: text/markdown` content negotiation and the token savings from it. https://blog.cloudflare.com/markdown-for-agents/
- **llms.txt.** The proposed format for a site index aimed at language models. https://llmstxt.org/
- **Anthropic, "Writing effective tools for agents".** Fewer task-shaped tools, namespacing, meaningful context over raw IDs, response size control, errors that teach, and testing descriptions. https://www.anthropic.com/engineering/writing-tools-for-agents
- **Model Context Protocol.** Tool annotations for read-only, destructive, idempotent and open-world tools. https://modelcontextprotocol.io/
- **AGENTS.md.** Convention for repository instructions aimed at coding agents. https://agents.md/

## How this skill is built

Structure borrowed from skills that work: one skill with sub-commands and references loaded on demand (Impeccable, Paul Bakaus), named failure modes (Anthropic's frontend-design), opinionated rules from one point of view (Emil Kowalski's skills), and a deterministic checker beside the prose so there is something that can fail.
