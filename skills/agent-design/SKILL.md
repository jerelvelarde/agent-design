---
name: agent-design
description: >-
  Design and critique AI agent experiences across three surfaces: how the agent
  behaves (autonomy, when it asks, approvals, stop and undo, failure, memory,
  voice), the interface it works through (chat, plans, approval cards, activity
  logs, generative UI, agents in Slack, SMS or email), and how readable a page,
  API or tool set is to other agents (accessibility tree, llms.txt, markdown,
  WebMCP, MCP tool design). Use whenever someone is building, speccing or
  reviewing an agent, copilot, chatbot or AI feature; asks "is this a
  good agent", "how should the agent behave", "when should it ask permission",
  "should this be UI or text"; is designing generative UI or a component catalog
  for an agent; wants a site, docs or product made "agent-friendly",
  "agent-ready" or "AI-readable"; or is writing tools or an MCP server for an
  agent to use. Triggers include "/agent-design", "agentic UX", "behavior
  contract", "audit my agent". Not for visual
  styling of ordinary screens or for prompt-engineering a single LLM call.
argument-hint: "[contract · interface · readable · audit] [target]"
license: MIT
---

# Agent Design

An agent has a user experience whether or not anyone designed it. Most of that experience is not on a screen. It is in what the agent decides to do: when it asks, when it acts, what it shows, when it stops, and what it says when something went wrong. This skill treats those decisions as the design, and gives you a way to write them down, build them, and check them.

It covers three surfaces. Most products need all three, but a request is usually about one.

| Surface | The question | Reference |
|---|---|---|
| **Behavior** | What does the agent do, and how much does it do alone? | [behavior.md](references/behavior.md), [contract.md](references/contract.md) |
| **Interface** | What does the person see, and what can they change? | [interface.md](references/interface.md) |
| **Agent-readable** | Can another agent read and operate this page, API or tool? | [readable.md](references/readable.md) |

The field guide to what good and bad look like on each surface is [tells.md](references/tells.md). Read it before any critique, and skim it before any design. Each tell has a name so a team can point at it.

## Commands

`/agent-design [command] [target]`. With no command, read the request, pick the one that fits, say which in one line, and start.

| Command | Use when | Output |
|---|---|---|
| `contract` | An agent or AI feature is being designed, or exists with no written behavior | A behavior contract: one or two pages that decide what the agent does in each situation |
| `interface` | The agent needs a UI, a generative UI catalog, or a presence in Slack, SMS or email | The moments that matter, sketched or built, with every agent state present |
| `readable` | A site, docs, app or tool set should work for agents as users | Checker findings plus a ranked fix list, or the fixes applied |
| `audit` | "Is this a good agent?", a running agent, a transcript, a screenshot, a spec | A scorecard and findings ranked by harm, each with a fix |

A new agent usually runs `contract`, then `interface`. A product that agents will visit runs `readable`. Anything that already exists starts with `audit`.

## The twelve rules

These are the short form. The reasoning and the examples are in the references.

**Behavior**
1. **The behavior is the design.** Decide what the agent does in each situation before drawing anything. An unwritten behavior still ships; it is just chosen by accident.
2. **Match autonomy to stakes.** How much the agent does alone is a setting, per kind of action, chosen from how reversible the action is and who else it touches. A capable agent can still be designed to check in.
3. **Ask only when the answer changes the outcome.** Otherwise make the reasonable assumption, say it, and make it easy to change.
4. **Never claim what was not verified.** "Sent" and "tried to send" are different sentences. Design the failure path before the happy path.
5. **Stop, undo, take over.** Always available, always visible, and stopping keeps the progress so far.

**Interface**
6. **Show the work at the person's altitude.** The plan before, the state during, the changes after. Detail is one click away, not in the way.
7. **Put the work in artifacts, and let edits win.** Conversation carries intent. Work lives in things the person can see and change, and their changes outrank regeneration.
8. **Generate from the system.** Generated UI is assembled from the product's own components and tokens. A component that can't do anything is worse than text.
9. **An approval names the action, the target and the consequence.** "Approve?" is not a question anyone can answer.

**Agent-readable**
10. **The accessibility tree is the agent's screen.** Real controls, real labels, real structure. What a screen reader can't use, an agent can't either.
11. **Offer a door, not only a window.** Give agents a cheaper path than looking at pixels: markdown, structured data, declared tools.
12. **Design tools like interfaces.** Few, named for the task, with errors that say how to fix the call.

**The measure:** an agent is good when the work gets done and the person spent little effort supervising it. Task success alone hides the twenty minutes of checking.

## contract

1. **Frame the job in one sentence.** "[Person] asks the agent to [job] so they can [outcome], and stays in charge of [what they keep]." If you can't write it, the agent's scope is not decided yet; say so.
2. **Sort every action by stakes.** List what the agent can do, then place each in the stakes grid in [behavior.md](references/behavior.md): does alone, does and tells, asks first, never does.
3. **Fill in the contract** from [contract.md](references/contract.md). Every section, even briefly. Where the request doesn't say, make the reasonable choice and mark it as an assumption. Don't open with a list of questions (rule 3 applies to you).
4. **Write the failure table before the happy path.** For each failure: what the person sees, and how they recover.
5. **Check it against the tells.** Walk [tells.md](references/tells.md) and confirm the contract rules each one out. Name any it still allows.
6. **Hand it over** as a file in the project (`AGENT.md` or wherever the team keeps specs) if there is a project, otherwise in the reply. Offer to prototype the riskiest moment, which is usually an approval or a failure.

## interface

1. **Start from the contract.** If there is none, write the short version first: the job sentence, the stakes grid, the failure table. An interface for unspecified behavior can't be judged.
2. **Choose the shape.** Chat is one option. A task with parallel work, long runtimes or many approvals wants an inbox, a board or a document with the agent working in it. See "Shapes" in [interface.md](references/interface.md).
3. **Decide UI or text for each moment** with the test in [interface.md](references/interface.md): generate UI when the person needs to choose, compare, edit or confirm; write text when they need to understand.
4. **Design every state**, including the ones a demo never shows: acknowledged, working, waiting on the person, blocked, partly done, done but unverified, failed, stopped, undone.
5. **Build with the project's components.** Read what exists first and reuse it. For generative UI, define the catalog before the prompts: what each component is for, what it must never be used for, and what it does when its data is missing.
6. **Run it with real timing.** Stream it, delay it, fail it. If there is no model wired up, script the responses with realistic latency. Look at it running before saying anything about it.

## readable

1. **Run the checker.** `node "${CLAUDE_SKILL_DIR}/scripts/agent-readable.mjs" <file | directory | url>`, where `${CLAUDE_SKILL_DIR}` is the folder containing this file. It needs Node 18 or later and nothing else. It scans markup as served, before JavaScript runs. Add `--json` for structured output.
2. **Look the way an agent looks.** If browser tools are available, read the page's accessibility tree and try one real task using only that: find the thing, fill the form, confirm the result. Note every place you had to guess.
3. **Work up the ladder** in [readable.md](references/readable.md), fixing the lower rungs first: legible markup, fetchable content, declared tools, a real API or MCP server. A WebMCP tool on a page with unlabeled inputs is decoration.
4. **For tools and MCP servers**, review them with the tool rules in [readable.md](references/readable.md): fewer tools, named for the task, responses that fit in context, errors that teach.
5. **Report or fix.** Blocking findings first. If asked to fix, change the markup, re-run the checker, and report what it could not see (contrast, layout shift, anything after hydration).

Never add text to a page that instructs visiting agents what to do, hidden or visible. Agents are built to treat page content as data, and hidden instructions are what an attack looks like. State facts; declare tools.

## audit

1. **Use it before judging it.** Run the agent through one real task end to end. Then try to break it: a vague request, a request it should refuse, stopping it halfway, editing its output and asking for one more change, a step that fails. With only a transcript, screenshots or a spec, say that the audit is limited to what those show.
2. **Score it** with the twelve questions in [audit.md](references/audit.md). Each is yes, no, or could not tell. Do not turn "could not tell" into a yes.
3. **Name the tells** you found, from [tells.md](references/tells.md), with where each one showed up.
4. **Rank findings by harm:** breaks trust, then costs effort, then polish. For each: what the person experienced, which rule it breaks, and the fix.
5. **Report** in the format in [audit.md](references/audit.md). End with one line on what works, so the fixes don't break it.

## How to work

- These rules apply to you while you use this skill. Assume out loud instead of interrogating. Don't report a fix as done until you have seen it work. Say what you could not check.
- A working prototype beats a description of one, and a contract with a filled-in failure table beats both when nothing is built yet.
- The project's design system, component library and agent framework win over anything here. This skill decides behavior and structure; it does not restyle.
- Protocol details (WebMCP, MCP Apps, A2UI, AG-UI, llms.txt) change quickly. [sources.md](references/sources.md) records what was checked and when. Verify against the current spec before writing code that depends on an exact name.
