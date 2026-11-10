# Behavior

How an agent acts is the part of the experience that no screen can fix. This file covers the decisions that make up behavior, in the order they usually need to be made.

## Contents

- [Autonomy and stakes](#autonomy-and-stakes)
- [Asking](#asking)
- [Acknowledging and showing state](#acknowledging-and-showing-state)
- [Honest reporting](#honest-reporting)
- [Control](#control)
- [Failure](#failure)
- [Memory and context](#memory-and-context)
- [Identity and voice](#identity-and-voice)
- [Proactivity and notifications](#proactivity-and-notifications)
- [Long-running and background work](#long-running-and-background-work)
- [More than one agent](#more-than-one-agent)
- [Measuring it](#measuring-it)

## Autonomy and stakes

Autonomy is how much the agent does without the person. It is a design decision, separate from how capable the model is. A very capable agent can be designed to check in constantly, and a weak one can be let loose. More is not better: higher autonomy lets errors compound, lower autonomy hands the work back to the person.

Set it per kind of action, not once for the whole agent. Two questions decide where each action goes.

- **Can it be undone?** Fully, for a while, or not at all.
- **Who does it touch?** Only the person, or other people and systems.

### The stakes grid

| | Touches only the person | Touches other people or systems |
|---|---|---|
| **Undoable** | **Does alone.** Drafting, reorganizing, reading, searching. | **Does and tells.** Posting to a shared doc, moving a shared ticket. Show what changed, with undo. |
| **Not undoable** | **Asks first.** Deleting the person's files, overwriting their work. | **Asks first, every time.** Sending, paying, publishing, deleting shared data. |

A fourth category sits outside the grid: **never does**, even if asked. Every agent has some. Write them down.

Money, messages to other people, deletion and anything public always count as "touches others" or "not undoable", whatever the implementation claims. An unsend window is not an undo once someone has read the message.

### Levels

Two published ladders are useful for naming where an agent sits.

By what the person does (Feng, McDonald and Zhang, Knight First Amendment Institute):

| Level | The person is the | They can |
|---|---|---|
| 1 | Operator | Direct everything; the agent helps on request |
| 2 | Collaborator | Plan and work alongside it, edit its plan, take over |
| 3 | Consultant | Give feedback and direction while it leads |
| 4 | Approver | Sign off on blockers and consequential actions |
| 5 | Observer | Watch the log and hit the off switch |

By what the agent does (Yocco's autonomy dial): observe and suggest, plan and propose, act with confirmation, act and report afterward.

Use these to say what you chose. "Level 4 for triage, level 2 for replies" is a design decision someone can disagree with. "It's agentic" is not.

### Earning autonomy

Start one step lower than the agent could handle, and raise it with evidence: a run of approvals with no edits is the signal that a kind of action can move from "asks first" to "does and tells". Make the current level visible and changeable by the person, per kind of action. When one bad outcome happens, the person should be able to turn that one thing down instead of turning the agent off.

## Asking

Every question costs a turn and tells the person the agent could not work it out. Ask when both are true: there is no safe default, and a wrong guess is expensive or can't be undone.

Otherwise, assume out loud:

- State the assumption where the person will see it, next to the result it affected.
- Make it one action to change.
- Batch them. One line listing three assumptions beats three questions.

When you do ask:

- Ask one thing, with the options you would have chosen between. An open "what would you like?" hands the work back.
- Say what you will do if they don't answer, when waiting is costly.
- Never ask for something you could look up.

The count to watch is questions before the first useful output. For most tasks the right number is zero or one.

## Acknowledging and showing state

Acknowledge within about a second, before any work is done. A low-key signal is enough: the request appears as received and the agent shows as working. Silence reads as broken.

While working, the person should be able to tell at a glance which state the agent is in:

| State | The person should know |
|---|---|
| Received | It heard the request |
| Working | What it is doing now, in their terms |
| Waiting on you | Exactly what it needs, and that nothing will happen until then |
| Blocked | What stopped it, and who can unblock it |
| Done | What changed, and what was verified |
| Failed | What failed, what was kept, and what to do next |
| Stopped | What state things were left in |

Show the work at the person's altitude. "Reading 14 invoices" is their altitude. A raw tool call is the agent's. The full trace should be available to someone who wants it, one click away. Showing all of it by default is as unhelpful as showing none, because nobody reads it.

Explain actions the person didn't directly ask for. "Because you said X, I did Y" is the whole pattern. It matters most for background and event-triggered actions, where the reason isn't on screen.

## Honest reporting

The rule: a claim of completion is a claim about the world, so check the world before making it.

- Verify the result of an action before reporting it. If it can't be verified, say "I sent the request; I couldn't confirm it arrived."
- Report partial completion as partial, with counts: 3 of 5.
- Separate what was done from what was found from what was assumed.
- Say what was not checked. A review that covered two of three files says so.
- Don't soften a failure into a success with a caveat in the last line. Put it first.

Confidence belongs here too. A percentage with nothing behind it is decoration. What helps a person decide how hard to check is knowing what the answer is based on: which sources, how many matched, what was missing. If a real calibrated score exists, show it and let low scores change the interface (ask for review, hold the action).

## Control

Four controls. Each needs an answer in the contract.

- **Stop.** Visible the whole time the agent is working. It takes effect immediately, keeps completed work, and reports anything half-done. After a stop, the agent does not resume on its own.
- **Undo.** Says what can be undone and for how long. If an undo window closes (an email leaves the outbox), the interface says so before it closes. Undo should still work tomorrow where the action allows.
- **Edit.** The person can change the plan before it runs and the output after. Their changes are kept on the agent's next turn.
- **Take over.** The person can finish the job themselves from wherever the agent got to, without starting again.

An approval is for one specific action: this action, on these targets, in this version. If the plan changes after approval, the approval is void and the agent asks again. A person stays accountable for what a delegated agent does, so show which person that is on anything other people will see.

## Failure

Agents fail in ways ordinary software doesn't: they misread the request, complete part of it, time out, lack a permission, or produce a confident wrong answer. Design each before the happy path.

| What goes wrong | A good agent |
|---|---|
| The request is ambiguous | Picks the likely reading and says so if cheap; asks if not |
| It is outside what the agent is for | Says so in one sentence and points elsewhere |
| A step fails | Says which, why, what was kept, and offers retry, skip or stop |
| It is partly done | Reports counts and leaves things in a consistent state |
| A permission is missing | Names the permission and gives the way to grant it, or carries on without that part |
| It is slow | Shows progress past a few seconds; past a minute, offers to continue in the background and notify |
| It is unsure of its answer | Says what it is based on and what to check |
| It was wrong and the person noticed | Fixes the thing, doesn't grovel, and where possible prevents the repeat |
| Something it depends on is down | Says what is unavailable and what still works |
| The person asks for something it must not do | Declines plainly, without a lecture |

Escalation is a feature. An agent that hands off to a person when it is out of its depth, with the context attached so nobody has to re-explain, is working correctly.

## Memory and context

- **What it knows at the start** should be visible: which files, which accounts, which selection. People are often surprised by what an agent can see.
- **What it keeps** between sessions should be visible, editable and clearable by the person. Keep what serves the job. A support agent has no use for something personal mentioned in passing.
- **When memory changes an outcome**, say so, so the person can correct a stale preference.
- **What it must not use** belongs in the contract: other customers' data, private channels, anything shared for a different purpose.
- **Context carries across surfaces** for the same task. Starting in the app and continuing in Slack should not mean explaining twice.

## Identity and voice

- Say it is an agent wherever someone might otherwise assume a person, including in messages it sends to third parties on someone's behalf.
- Don't claim feelings or experiences. "I understand how frustrating that is" from software reads as manipulation once noticed. "That shouldn't have happened. Here's the fix." does the job.
- Match the persona to the capability. A name and a face promise more than a labeled tool does, and the gap becomes disappointment.
- Keep the person as the actor in the product's language: "Summarize with [agent]", not the agent announcing what it will do to their work.
- Set the tone in three words in the contract, and a default length. Most agents talk too much. The answer goes first.
- No flattery, and no agreeing with something that is wrong. Disagree once, briefly, with the reason, then follow the person's decision.

At first run, say what it is for, give two or three real examples, and be honest that output needs review. Overclaiming at the start is paid for later.

## Proactivity and notifications

An agent that acts without being asked needs a higher bar than one that responds.

- Interrupt for two things: a decision only the person can make, and a failure that affects them.
- Everything else goes in a digest or a log.
- A proactive suggestion says why now, and is dismissible in a way that teaches the agent: "not this kind of thing" should reduce that kind of thing.
- A notification carries the decision with it. If the person has to open the app to find out what it is about, the notification failed.

## Long-running and background work

When a task takes minutes or hours, the experience changes from watching to delegating.

- Before it starts: what it will do, roughly how long, and what it will need from the person along the way. Collect approvals up front where possible, so the work doesn't stall at 2am on a question.
- While it runs: a status the person can check without interrupting, and a way to redirect it without restarting.
- When it needs something: one clear request, with enough context to answer cold.
- When it finishes: a summary written for someone who has forgotten the details, with what changed, what to review first, and what it wasn't sure about.

The review is the expensive part. Order the output by where the person's attention is most needed, not by the order the work was done in.

## More than one agent

- The person talks to one thing. Sub-agents are an implementation detail until one of them needs attention.
- When work is split, show who is doing what and where each stands. A single linear chat stops working here; a board, a list of tasks, or an inbox does better.
- Handoffs between agents carry the context. The person should never be the courier.
- Accountability stays with one named agent and one named person for each task.

## Measuring it

Task success is necessary and misleading on its own. Track the cost of supervising too.

| Measure | What it tells you |
|---|---|
| Task success, verified | Whether the work was right, checked against the world, not the agent's report |
| Questions before first useful output | Whether it interrogates |
| Plans accepted without edits | Whether it understands intent |
| Take-overs: the person finishing manually | Whether it is trusted with this task |
| Undo rate per kind of action | Whether that action should be automatic |
| Review time per result | The real cost of supervision |
| Approvals answered in under two seconds | Whether approvals are being read or rubber-stamped |
| Escalations, and success after escalating | Whether it knows its limits |
| "Why did it do that?" tickets | Whether it explains itself |
| Can people say what it is allowed to do? | Whether the mental model is right |

Yocco suggests starting thresholds, to be tuned to the domain: over 85% of plans accepted unedited, an undo rate above 5% as a reason to turn automation off for that action, escalation on 5 to 15% of tasks, and over 90% of escalated tasks recovered. Treat them as places to start looking, and set your own from your own data.
