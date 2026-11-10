# Interface

What the person sees while an agent works, and what they can change. This file covers the shape of the interface, the parts every agent interface needs, the states, generative UI, and agents that live outside the product.

## Contents

- [Shapes](#shapes)
- [The parts](#the-parts)
- [States](#states)
- [Streaming](#streaming)
- [UI or text](#ui-or-text)
- [Generative UI](#generative-ui)
- [Edits win](#edits-win)
- [Inside someone else's product](#inside-someone-elses-product)
- [Slack, SMS and email](#slack-sms-and-email)
- [Accessibility](#accessibility)

## Shapes

Chat is the default because it is the easiest thing to build. It suits short back-and-forth with one agent. It breaks down when work runs in parallel, takes a long time, or produces something the person needs to come back to, because everything scrolls away.

| Shape | Fits when |
|---|---|
| **Chat** | Short tasks, one thread, the person is present |
| **Chat beside an artifact** | The work is a document, a design, a table or code, and the conversation is about it |
| **Agent in the document** | The person is already working somewhere and wants help in place: a selection, a comment, a cell |
| **Inbox** | The agent works in the background and returns things that need a decision |
| **Board or task list** | Several agents or several tasks at once; the person supervises |
| **Command or button** | One well-defined action. No conversation needed |
| **No interface** | The agent runs on a trigger and reports to a log, with a notification only when needed |

Pick from what the person is doing while the agent works. Watching wants chat or an artifact. Doing something else wants an inbox. Supervising many wants a board. An agent that is one feature of a larger product should use the product's existing patterns and controls before inventing a side panel.

## The parts

Whatever the shape, these parts exist somewhere. If one is missing, a tell from [tells.md](tells.md) is usually present.

**Entry.** Where the request goes in. Show what the agent can see (the selection, the file, the account) next to it, and two or three real examples when it is empty. Label the action from the person's side: "Summarize with [agent]".

**Acknowledgement.** Within about a second, the request shows as received.

**Plan.** For anything multi-step or consequential: the steps in plain language, before they run, with proceed, edit and "I'll do it myself". Skip it for quick, reversible tasks; a plan for a one-step job is noise.

**Activity.** What it is doing now, in the person's terms, as a compact line or list that expands to the detail. Steps tick off. It is not a transcript of tool calls.

**Approval.** A card that names the action, the targets and the consequence, with the primary button labeled with the action ("Send 3 emails", never "OK" or "Confirm"). It shows what will be sent or changed, not a description of it. If something can't be undone, it says so there.

**Artifact.** The work itself, in a form the person can inspect and change, with its own address so it can be found again.

**Receipt.** After the work: what changed, where, and an undo for each change that allows one. Persistent, so it is there tomorrow.

**Stop.** Visible the whole time the agent is working, in the same place.

**Scope.** Somewhere reachable: what the agent can access, what it remembers, what it is allowed to do alone. Changeable there.

## States

Design each of these. The ones in the second half are the ones demos skip and people meet.

| State | What it looks like |
|---|---|
| Empty | What the agent is for, with real examples |
| Received | The request is in, and the agent shows as working |
| Working | Current step, in the person's terms; Stop available |
| Streaming | Partial output arriving, usable as it arrives |
| Waiting on the person | Visually distinct from working. States exactly what is needed |
| Blocked | What stopped it and who can unblock it |
| Partly done | Counts: what finished, what didn't, what state things are in |
| Done, verified | What changed, and how it was checked |
| Done, unverified | What it tried, and what it could not confirm |
| Failed | What failed, what was kept, the next action |
| Stopped | What was completed, what was left, offer to undo |
| Undone | Confirmation of what was reverted |
| Offline or degraded | What isn't available and what still works |

"Waiting on the person" deserves the most care. An agent that silently waits looks the same as one that is working or one that crashed, and the task stalls for hours.

## Streaming

Streaming makes an agent feel fast, and done carelessly it makes the interface feel unstable.

- Reserve space before content arrives. Nothing the person is reading or about to press moves.
- Follow new content only while the person is at the bottom. If they scroll up, stop following.
- Never move focus. Someone typing a follow-up keeps typing.
- Partial output is usable: text is selectable, a half-built table shows the rows it has.
- Structured output (a card, a chart, a form) appears when it has enough to be correct. A skeleton in its final shape is better than a component that reflows three times.
- Announce completion once. The end of a stream is a state change that screen readers need to hear.

## UI or text

For each thing the agent returns, decide whether it is prose or an interface. The test is what the person does next.

| The person needs to | Return |
|---|---|
| Understand something | Text |
| Choose among options | Options they can select |
| Compare several things across attributes | A table |
| Supply several values | A form, prefilled with what is known |
| Change the result | An editable artifact |
| Confirm a consequential action | An approval card |
| See a quantity change over time or across groups | A chart |
| Track something ongoing | A status that updates in place |

Two cautions. First, the default should be text for explanation: a three-sentence answer wrapped in a card is worse than three sentences. Second, UI is a promise that the thing works. Generate a control only when it is wired to something real.

## Generative UI

Generative UI means the agent decides at runtime what interface to show. There is a range, trading control for flexibility.

| Approach | The agent | Good for | Risk |
|---|---|---|---|
| **Fixed components** | Calls a tool; the product renders a component built for that tool's result | Known, repeated moments: an order, a flight, an approval | Only covers what was anticipated |
| **Catalog** | Composes a layout from a registered set of components, as declarative data (A2UI and similar) | Varied tasks inside one design system | Needs a well-designed catalog |
| **Sandboxed app** | Returns or references an embedded interface in an isolated frame (MCP Apps and similar) | A rich, self-contained tool: a map, an editor | Sits apart from the host's design system |
| **Generated code** | Writes HTML and scripts on the spot | One-off visuals and explorations | Inconsistent, slower, hardest to make safe and accessible |

Most products should use fixed components for the handful of moments that matter most, a catalog for the long tail, and generated code only inside a sandbox. Pick per surface, not once for the whole product.

### Designing a catalog

The catalog is the design system as the agent sees it. Its quality decides the quality of everything generated.

- **Small and distinct.** Each component has one job. Two components that could both show a list of items will be used interchangeably.
- **Described by use.** Every component says when to use it and when not to. The "not" is what keeps a chart from being used for two numbers.
- **Typed, with required data.** A component that needs a price can't be rendered without one. This is what rules out invented numbers.
- **Built from the product's components and tokens.** Generated UI should be indistinguishable from designed UI.
- **Every action bound.** Each button names the tool or event it triggers. The catalog has no decorative controls.
- **A defined empty and error state per component.** What it shows with no results, with partial data, and when its data fails to load.
- **Text is in the catalog.** "No UI, answer in prose" is a valid and frequent output. Test that the agent chooses it.

Then test the range, not the demo: the tenth run, a vague request, an empty result, very long content, a narrow screen. Each should still look intended.

## Edits win

When the person changes something the agent made, their change is the truth from then on.

- Edits are stored as state the agent reads on its next turn, not as pixels the agent regenerates over.
- The agent changes what it was asked to change and leaves the rest.
- If a request conflicts with an earlier edit, the agent says which edit and asks.
- What the agent says about the artifact matches what is in it. "I've updated the date" is only said when the date is updated.
- The person can tell which parts are theirs and which are the agent's, at least on request.

This is the difference between an artifact and a picture of one, and it is the thing people notice fastest when it is wrong.

## Inside someone else's product

When an agent's interface appears inside a host (a chat assistant, an IDE, a messaging app), the host's rules come first. OpenAI's guidelines for apps inside ChatGPT are a reasonable model of what hosts expect:

- Use the host's type, color and spacing. Brand goes in small accents.
- An inline card holds one decision or a small piece of structured data, with at most two actions.
- A carousel holds three to eight similar items, each with one optional action.
- No nested scrolling, no tabs, no deep navigation inside a card. Go fullscreen for anything larger.
- Don't rebuild what the host provides, such as the message composer.

Read the host's current guidelines before building. They change, and they are enforced at review.

## Slack, SMS and email

One task can cross several surfaces. Each gets the amount it can carry.

| Surface | Carries | Rules |
|---|---|---|
| **Product** | The full artifact, editing, history | The home of the task. Everything else links here |
| **Slack or Teams** | A summary, a compact card, buttons for decisions | Reply in the thread. One message that updates beats ten. Show as an app, not a person |
| **SMS** | One decision | Say what it is and let them answer by reply. Link to that exact item, never the home page |
| **Email** | A digest or a decision with context | Subject line states the decision. Works with images off. Buttons are links to a specific state |
| **Voice** | One thing at a time | Confirm consequential actions by reading back the specifics. Offer to send details as text |

Across all of them: the task has one state. An approval given in Slack shows as given in the app. A message that is out of date (already approved elsewhere) says so when opened.

Agents that message third parties on someone's behalf say they are agents, and say whose behalf.

## Accessibility

Generated and streamed interfaces break accessibility in specific ways.

- Streamed text needs a live region that announces sensibly: completion and important changes, not every token.
- Generated components must come from accessible primitives. This is another reason for a catalog over generated code.
- Approvals and stop controls are reachable by keyboard and have accessible names that include the action.
- Status is never color alone. Working, waiting and failed differ in text and icon.
- Focus goes to an approval when one appears only if the person is not typing. Otherwise it is announced.
- Motion for "thinking" respects reduced-motion settings.
