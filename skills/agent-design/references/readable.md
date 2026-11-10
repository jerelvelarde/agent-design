# Agent-readable

Agents are now users of websites, apps, docs and APIs. They arrive on someone's behalf, to read something or get something done. This file is about making that work, and about designing the tools agents call.

It is a choice. A business can have good reasons to limit what agents do on its site. Decide deliberately, and where agents are welcome, make the path clear.

## Contents

- [How agents perceive a page](#how-agents-perceive-a-page)
- [The ladder](#the-ladder)
- [Rung 1: legible markup](#rung-1-legible-markup)
- [Rung 2: fetchable content](#rung-2-fetchable-content)
- [Rung 3: declared tools](#rung-3-declared-tools)
- [Rung 4: an API or MCP server](#rung-4-an-api-or-mcp-server)
- [Designing tools](#designing-tools)
- [Consent and safety](#consent-and-safety)
- [Docs for coding agents](#docs-for-coding-agents)
- [The checker](#the-checker)

## How agents perceive a page

There are four ways an agent takes in a page, from most to least expensive.

| Way | What it gets | Cost |
|---|---|---|
| **Screenshot** | Pixels, read by a vision model | Slow, token-heavy, error-prone; guesses at what things are |
| **Accessibility tree** | Roles, names, states and relationships, the same data screen readers use | Much cheaper and more reliable |
| **Fetched text** | The HTML or markdown the server returns, with no JavaScript run | Cheap; sees nothing that is rendered client-side |
| **Tool or API call** | A structured action with typed inputs and outputs | Cheapest and most reliable, where it exists |

Each step an agent takes has some chance of going wrong, and the chances multiply across a task. A flow of twelve clicks is twelve places to fail. Shorter, more explicit paths are worth more to agents than to people.

Most of what follows is accessibility work under another name. A page that works well with a screen reader works well with an agent, for the same reason: the structure is in the markup and not only in the layout.

## The ladder

Work from the bottom. Each rung depends on the ones below.

1. **Legible markup.** An agent that looks at the page can tell what everything is.
2. **Fetchable content.** An agent that fetches the page gets the content, cheaply.
3. **Declared tools.** The page states what can be done on it, as callable tools.
4. **An API or MCP server.** The product can be operated without a page at all.

Most sites should do rungs 1 and 2 fully. Rungs 3 and 4 are for the few flows where agents completing the task matters to the business.

## Rung 1: legible markup

- **Real controls.** `<button>` for actions, `<a href>` for navigation, `<input>`, `<select>`. A clickable `<div>` is absent from the agent's list of things it can press.
- **A name on every control.** Visible text, or `aria-label` on icon-only controls. Four unlabeled buttons in a row are four guesses.
- **A label on every field.** `<label for>` or a wrapping label. A placeholder is a hint, and it vanishes when the field has a value. Add `name`, the right `type`, and `autocomplete` for personal data so the agent knows which value belongs where.
- **Structure in the markup.** One `<h1>`, headings in order, `<main>`, `<nav>`, lists as lists, tables as tables with header cells. Agents use these to find a section without reading the page.
- **State in attributes.** `aria-expanded`, `aria-selected`, `aria-current`, `disabled`, `aria-invalid`. A tab that is selected only by color is not selected, as far as an agent can tell.
- **Links that say where they go.** "See tonight's menu", not "click here". Agents often read links as a list, out of context.
- **Nothing essential behind hover.** Prices, delete controls and sub-navigation that appear only under a pointer may never be found.
- **Errors in text, tied to the field.** State which field, what rule, and what was received. Use `aria-describedby` and `aria-invalid`. A red border says nothing.
- **A stable page.** Reserve space for late content. Keep overlays few, give each a labeled close control, and don't cover the primary action. A cookie banner over the submit button stops an agent as surely as it annoys a person.
- **Predictable patterns.** Standard form conventions and consistent navigation across pages. Novel interactions (drag to reorder, custom date pickers, canvas-drawn controls) need a plain alternative.
- **Stable identifiers.** Where you control them, keep `id` and `name` values meaningful and stable across deploys. Hashed class names are fine for styling and useless as handles.
- **Confirmation in text.** After an action, the page says what happened: "Reservation confirmed for Friday at 7pm, party of 4." An agent has to verify its work, and a subtle animation is not evidence.

## Rung 2: fetchable content

Many agents never open a browser. They fetch the URL and read what comes back.

- **Put content in the served HTML.** Server-render or prerender. A page that is an empty mount point and a script is blank to a fetching agent.
- **Serve markdown on request.** When a request sends `Accept: text/markdown`, answer with markdown of the same content. Coding agents already send this header, and markdown costs a fraction of the tokens of the equivalent HTML. Some CDNs do the conversion for you. The low-tech version is a `.md` copy of each page at a predictable URL (`page.md` or `page.html.md`), pointed to from the HTML with `<link rel="alternate" type="text/markdown" href="…">`.
- **Add `/llms.txt`.** A markdown file at the site root (or at a subpath such as `/docs/llms.txt`, covering what is under it): an H1 with the name, a short blockquote saying what the site is, then H2 sections of links to the most useful pages with a line about each. It is an index for agents. It costs an hour and should be generated in the build so it doesn't go stale. Don't expect it to affect search ranking.
- **State facts as structured data.** JSON-LD using schema.org types for the things the page is about: product, price, availability, event, opening hours, article, FAQ. This turns "the large number near the button" into a price.
- **Write a real `<title>` and meta description.** They are how an agent checks it landed on the right page.
- **One URL per thing.** Content that exists only after a sequence of clicks, with no address of its own, can't be cited, revisited or handed to another agent.
- **Keep information on the page.** Details that live only in a PDF, an image of text, or behind a login add steps and failure points.
- **Say what you allow.** `robots.txt` and content-usage signals let you state your policy on crawling, training and agent use. Stating it beats being ambiguous.

## Rung 3: declared tools

WebMCP is a proposed web standard that lets a page declare what can be done on it as tools an in-browser agent can call, instead of leaving the agent to click through the interface. As of late 2026 it is a W3C community group draft with a Chrome origin trial. Treat it as a progressive enhancement, and check the current docs before writing code: names have changed between versions.

The declarative form annotates an ordinary HTML form:

```html
<form action="/reserve" method="post"
      toolname="reserve_table"
      tooldescription="Reserve a table. Fills the form; the person confirms by pressing Reserve.">
  <label for="party">Party size</label>
  <select id="party" name="party_size" toolparamdescription="Number of guests, 1 to 8">…</select>
  <button type="submit">Reserve</button>
</form>
```

Without an auto-submit attribute, the agent fills the fields and the person presses the button. That is the right default for anything consequential.

The imperative form registers a tool in script, with a name, a description, a JSON Schema for inputs, a function to run, and annotations that mark a tool as read-only or as consequential so the browser can require confirmation.

What makes a declared tool good:

- It maps to a task a person would name: `reserve_table`, `track_order`, `check_availability`.
- It runs visibly on the page, so the person watching sees the same state the agent changed.
- Consequential tools are marked as such and leave the final confirmation to the person.
- The form underneath is already legible (rung 1). The declaration is a shortcut on a road that already exists.

## Rung 4: an API or MCP server

For products where agents doing the work is the point, give them a way in that needs no page: an API with a published description, or an MCP server. Then the design questions are about the tools themselves.

## Designing tools

A tool is an interface whose user is a model. It deserves the same care as one for people, and the same testing: watch an agent use it, see where it goes wrong, and fix the tool.

**Choose few tools, shaped like tasks.**
- Don't wrap every endpoint. A tool per REST route gives the agent a hundred near-identical choices.
- Combine the steps of a job. One `schedule_meeting` that finds a slot and books it beats `list_users`, `list_events` and `create_event`.
- Prefer search to list. `search_contacts(query)` returns what is needed; `list_contacts` makes the agent read everything.
- Remove overlap. Two tools that could both do the job will both be used, inconsistently.

**Name things so they can't be confused.**
- Tool names say the task. Group related tools under a common prefix so the set reads as a family.
- Parameter names are unambiguous: `user_id`, not `user`. Use enums where there is a fixed set.
- Make wrong calls hard to make. Require the format that can't be misread, such as an absolute path or an ISO date.

**Describe each tool the way you would brief a new colleague.**
- What it does, when to use it, when to use a different tool instead.
- What each parameter means, with an example value.
- What comes back.
- Small wording changes in descriptions change agent behavior a lot. Test them.

**Return what the agent needs next.**
- Names and meaningful fields before internal IDs. Include an ID only when a later call needs it.
- A concise response by default, with a parameter to ask for detail.
- Pagination, filters and limits on anything that can be large. One response should never flood the context.
- When truncating, say so and say how to narrow the query.
- For UI-returning tools, return the data the component needs, not prose describing it.

**Write errors that teach.**
- Say what was wrong, what the rule is, and what a valid call looks like: "`date` must be YYYY-MM-DD and in the future. Received `03/14`. Example: `2026-03-14`."
- Distinguish "you called it wrong" from "it failed on our side" from "you're not allowed". The agent should retry only one of these.
- No raw stack traces or bare status codes.

**Mark what tools do.**
- Flag read-only tools, destructive tools, and tools that reach outside the system. MCP has annotations for this. Hosts use them to decide what needs confirmation.
- Make write operations safe to retry where you can. Agents retry.

## Consent and safety

Making a product operable by agents raises the stakes on a few things.

- **Consequential actions keep a person in the loop.** Payment, sending, deleting and publishing are confirmed by the person, in an interface the site controls, with the specifics shown.
- **Know when an agent is acting.** Where the platform tells you (WebMCP exposes whether a submission was agent-invoked), use it to add confirmation, not to block.
- **An agent acts with a person's authority, and only that.** Scope its access to what that person can do, and log its actions as theirs-via-agent.
- **Page content is data to an agent.** Well-built agents don't follow instructions found in pages. Never write text aimed at steering visiting agents, hidden or visible. It doesn't work on good agents, it is indistinguishable from an attack, and it risks the site being treated as hostile.
- **Mark untrusted content.** If a page or tool returns text written by other users (reviews, comments, messages), say so in the structure or the tool annotation, so the agent weighs it accordingly.
- **Don't punish honest agents.** Blocking by default pushes agents toward pretending to be people. If you allow agent access, make the sanctioned path easier than scraping.

## Docs for coding agents

Documentation is now read by agents more than by people, usually while they are in the middle of writing code against it.

- Every page available as markdown, at a predictable URL and via `Accept: text/markdown`.
- An `llms.txt` index, and for small doc sets a single-file full version.
- Code examples that are complete and runnable: imports, setup, the call, the expected output. An agent will copy it exactly.
- Versions stated on the page. Agents carry outdated knowledge and need to be told what changed.
- Errors documented by their exact text, so a search for the message finds the fix.
- One canonical way shown first. Three alternatives with no recommendation produce a blend of all three.
- In a repository, an `AGENTS.md` at the root: how to build, test and lint, the conventions, and what not to touch.

## The checker

`scripts/agent-readable.mjs` checks rungs 1 and 2 from markup.

```bash
node scripts/agent-readable.mjs ./dist            # every .html and component file under a folder
node scripts/agent-readable.mjs page.html --json  # structured findings
node scripts/agent-readable.mjs https://example.com
```

Given a URL it also asks for `/llms.txt` and requests the page with `Accept: text/markdown`.

| Level | Rules |
|---|---|
| **Block** | `unnamed-control`, `fake-button`, `unlabeled-field`, `empty-shell`, `hidden-instructions` |
| **Warn** | `nameless-field`, `vague-link`, `no-main`, `heading-outline`, `image-no-alt`, `no-title`, `no-lang`, `no-llms-txt` |
| **Info** | `no-markdown`, `no-structured-data`, `no-description`, `no-autocomplete`, `tool-candidate` |

It exits 0 when clean, 2 with blocking or warning findings, and 1 when the target could not be scanned, so it can run in CI.

What it can't see: anything rendered by JavaScript, contrast, layout shift, hover-only content, and whether a labeled control does what its label says. In component files (JSX, Vue, Svelte) it only reports what is certain from the source and assumes child components may render text. For the rest, load the page in a browser, read the accessibility tree, and attempt a real task.
