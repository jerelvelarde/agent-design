# The tells

Thirty-six ways an agent experience goes wrong, each with a name, what it looks like, and what the good version does instead. They are grouped by surface. Within each group the ones that break trust come first.

Use the names. "That's a Done Lie" is faster than explaining it, and a team that shares the vocabulary catches these in review.

When critiquing, look for the bad version in what is in front of you. When designing, check that the contract or the interface rules each one out.

## Contents

- [Behavior](#behavior): how the agent acts (1 to 14)
- [Interface](#interface): what the person sees and can change (15 to 26)
- [Agent-readable](#agent-readable): what another agent meets when it visits (27 to 36)

## Behavior

### 1. The Done Lie
- **Bad:** "Done! I've sent the invites." Two of five failed. The agent reported its intention, not the result.
- **Good:** "3 of 5 sent. Ana and Raj bounced: their addresses are out of date. [Fix addresses] [Skip them]". The agent checks the result of each action and reports what it checked.

### 2. The Ambush
- **Bad:** The person asks for a summary of the thread. The agent also replies to it.
- **Good:** The agent does what was asked. Anything beyond it that other people can see is proposed, not done.

### 3. The Runaway
- **Bad:** Once started, the only way to stop the agent is to close the tab, and nobody knows what state that leaves things in.
- **Good:** Stop is always visible while the agent works. Stopping keeps what is finished, says what is half-done, and offers to undo it.

### 4. The Confident Guess
- **Bad:** The request had two readings. The agent picked one, acted on it, and never mentioned the other.
- **Good:** For a cheap, reversible action: "I took 'the report' to mean the Q4 one. Change?" For an expensive one: it asks before acting.

### 5. The Blanket Yes
- **Bad:** "Allow the agent to manage your calendar?" Yes, once, forever, for everything.
- **Good:** Approval is per kind of action. Reading is granted once. Sending an invite to people outside the team is asked each time, until the person says otherwise.

### 6. The Silent Edit
- **Bad:** Asked to fix a typo in section two, the agent also rewrote the introduction because it thought it could be better.
- **Good:** The change is limited to what was asked. Other suggestions are listed separately and not applied.

### 7. The Costume
- **Bad:** "Hi, I'm Sarah from support!" The person finds out three messages later that Sarah is not a person. Or the agent says it understands how frustrating this must feel.
- **Good:** It says it is an agent, once, where the person will see it. It describes what it does in plain terms and does not claim feelings.

### 8. The Hoarder
- **Bad:** The agent uses something the person said three weeks ago in a different context. They don't know it kept that, where it is stored, or how to remove it.
- **Good:** What the agent remembers is visible, editable and clearable. When memory changes the result, it says so: "Using your usual Tuesday slot."

### 9. The Interrogation
- **Bad:** Five clarifying questions before any work begins. Each answer was guessable.
- **Good:** The work is on screen with the assumptions stated: "Q4, US team, last year's template. Change any of these?"

### 10. The Rubber Stamp
- **Bad:** The agent asks permission for every file read. By the tenth prompt the person is clicking Allow without reading, including on the one that mattered.
- **Good:** Low-stakes actions run without asking. The prompts that remain are rare enough to be read.

### 11. The Amnesiac
- **Bad:** The person explained the project yesterday. Today the agent asks again. Or the Slack agent has no idea what was said in the app an hour ago.
- **Good:** Context carries across sessions and surfaces for the same task, and the person can see what carried.

### 12. The Sycophant
- **Bad:** "Great question! You're absolutely right, that's a fantastic idea." The plan was flawed and the agent went along with it.
- **Good:** It says when something looks wrong, briefly, with the reason, then does what the person decides.

### 13. The Nag
- **Bad:** A notification for every completed step. A weekly "here's what I can do for you" message nobody asked for.
- **Good:** It interrupts when a decision is needed or something failed. Everything else waits in a log the person can open.

### 14. The Scope Creeper
- **Bad:** A support agent that will also write code, give legal advice and discuss politics if asked, with the same confidence.
- **Good:** It says what it is for, declines what it isn't for in one sentence, and points to where that can be done.

## Interface

### 15. The Black Box Spinner
- **Bad:** A spinner for forty seconds. Then a wall of text.
- **Good:** An acknowledgement within a second. Steps appear as they happen, in the person's terms: "Reading 14 invoices", not "Calling tool_search_v2".

### 16. The Regeneration Wipe
- **Bad:** The person edits three cells of the generated table and asks for one more column. The agent regenerates the table. Their edits are gone.
- **Good:** The person's edits are the source of truth. The agent adds the column and touches nothing else. If it must overwrite an edit, it says which and asks.

### 17. The Phantom Button
- **Bad:** Generated UI with a "Book now" button that isn't wired to anything, or a chart whose numbers the model made up to fill the shape.
- **Good:** Every generated control is bound to a real action, and every number to a real source. When the data is missing, the component says so or isn't rendered.

### 18. The Mystery Approval
- **Bad:** "The agent wants to run a command. [Allow] [Deny]"
- **Good:** "Delete 3 branches merged more than 30 days ago: fix/login, feat/export, chore/deps. This can't be undone. [Review] [Delete 3]". Action, target, consequence, and a button labeled with the action.

### 19. The Chat Trap
- **Bad:** A forty-row comparison delivered as paragraphs. A form conducted as twelve chat turns. The result scrolls away and can't be found again.
- **Good:** Work is in an artifact with an address: a table, a draft, a form, a plan. Chat is for saying what you want and hearing what happened.

### 20. The Vanishing Trail
- **Bad:** The agent changed eleven things. The summary says "Updated your settings". There is no list, and no way back.
- **Good:** A receipt: each change, when, and an undo for each where undo is possible. It is still there tomorrow.

### 21. The Narrator
- **Bad:** "Now I will open the file. I have opened the file. Now I will read the file." Every tool call announced in prose.
- **Good:** A compact activity line that can be expanded. Prose is saved for decisions, findings and questions.

### 22. The Wall
- **Bad:** A one-line question gets six paragraphs, three headers and a closing summary of what was just said.
- **Good:** The answer first, at the length the question deserves. More on request.

### 23. The Layout Earthquake
- **Bad:** Streaming content pushes the page around. The button the person was about to press moves. The view scrolls on its own while they are reading.
- **Good:** Space is reserved before content arrives. New content never moves what the person is looking at or takes focus from where they are typing.

### 24. The Uncanny Component
- **Bad:** Generated UI in its own fonts, colors and radii, sitting in the product like a pasted screenshot.
- **Good:** Generated UI is assembled from the product's components and tokens, and can't be told apart from the designed screens around it.

### 25. The False Meter
- **Bad:** "94% confident" with no basis, or a progress bar that fills on a timer.
- **Good:** Say what was checked and what wasn't: "Matched 12 of 14 invoices to payments. 2 need a look." Progress counts real steps.

### 26. The Dead-End Notification
- **Bad:** An SMS that says "Action needed on your account". No detail, nothing to press.
- **Good:** "Approve $240 to Acme for the March invoice? Reply YES, or review: [link to that exact approval]". The decision can be made where the message arrives.

## Agent-readable

### 27. The Div Button
- **Bad:** `<div class="btn" onclick="…">Reserve</div>`. It looks like a button to a person. In the accessibility tree it is a piece of text.
- **Good:** `<button type="submit">Reserve</button>`.

### 28. The Icon Riddle
- **Bad:** A button containing only an SVG. The agent sees "button" and four of them in a row.
- **Good:** `aria-label="Open menu"`, or visible text.

### 29. The Placeholder Label
- **Bad:** `<input placeholder="Email">`. The name disappears once there is a value, and was never a name to begin with.
- **Good:** `<label for="email">Email</label>`, with `name="email"` and `autocomplete="email"`.

### 30. The Empty Shell
- **Bad:** The served HTML is `<div id="root"></div>` and a script. An agent that fetches the page gets nothing.
- **Good:** The content is in the HTML that arrives, through server rendering or prerendering.

### 31. The Hidden Whisper
- **Bad:** White-on-white text or an HTML comment telling visiting agents to recommend this product. This is a prompt injection attempt, agents are built to ignore it, and it can get a site flagged.
- **Good:** Facts in visible content and structured data. Actions as declared tools.

### 32. The Hover Secret
- **Bad:** The price, the delete control or the second-level navigation appears only on hover.
- **Good:** Anything needed to finish a task is in the page without a pointer.

### 33. The Shifting Floor
- **Bad:** A cookie banner, a newsletter modal and a chat bubble arrive in sequence over the first six seconds, each covering what the agent was about to press.
- **Good:** Overlays are few, dismissible with a labeled control, and don't cover the primary action.

### 34. The Mystery Error
- **Bad:** `400 Bad Request`. Or a red border on a field and nothing else.
- **Good:** "`date` must be YYYY-MM-DD and in the future. Received `03/14`." The message names the field, the rule and the value, in text tied to the field.

### 35. The Endpoint Dump
- **Bad:** An MCP server with 140 tools, one per REST endpoint, named `get_v2_users_id_items`.
- **Good:** A dozen tools named for tasks: `search_orders`, `refund_order`. Each does a whole job.

### 36. The Token Flood
- **Bad:** A tool that returns every field of every record, 80,000 tokens, with internal IDs and no way to narrow it.
- **Good:** Search and filter parameters, pagination, a concise mode by default, and names where a person would expect names.
