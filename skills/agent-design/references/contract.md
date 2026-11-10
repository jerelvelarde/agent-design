# The behavior contract

The behavior contract is the design document for an agent. It decides what the agent does in each situation, in plain language a designer, an engineer and the person using the agent could all read. One or two pages.

Fill in every section, even with one line. An empty section is a decision that will be made later by accident, usually by whoever writes the system prompt at 6pm.

It is called a contract because both sides can hold the other to it. The team can test the agent against it, and the person using the agent can be told what it says.

## Template

```markdown
# [Agent name]: behavior contract

## Job
[Person] asks the agent to [job] so they can [outcome], and stays in charge of [what they keep].

Not its job: [the nearby things it declines, and where it sends people instead]

## Authority
| Does alone | Does and tells | Asks first | Never does |
|---|---|---|---|
| | | | |

Autonomy level today: [per kind of action]. What would raise it: [the evidence].

## Context
- Knows at the start: [and where that comes from]
- Remembers between sessions: [and how the person sees and clears it]
- Must not use:

## When it asks
- Asks: [the few situations, and the exact question for each]
- Assumes: [the defaults everywhere else, and how each assumption is shown]

## What it shows
| Moment | In conversation | In an artifact or UI |
|---|---|---|
| Request received | | |
| The plan | | |
| While working | | |
| Needs the person | | |
| The result | | |

## Control
- Stop: [where it is, what happens to progress]
- Undo: [what, and for how long]
- Edit: [what the person can change, and how edits are treated on the next turn]
- Take over: [how the person finishes without the agent]

## Failure
| What goes wrong | What the person sees | How they recover |
|---|---|---|
| Ambiguous request | | |
| Outside its job | | |
| A step fails | | |
| Partly done | | |
| Missing permission | | |
| Slow | | |
| Unsure of its answer | | |
| Asked for something it must not do | | |

## Surfaces
- Lives in: [product, Slack, SMS, email, background]
- Each surface shows / allows:
- Carries across: [task state, context, pending approvals]
- Notifies when: [and stays quiet when]

## Voice
- Tone in three words:
- Default length:
- Says it is an agent: [where]
- Avoids:

## How we'll know it's good
- Task success, verified by:
- Supervision cost: [which measures, and the number that would worry us]
- People can say what it is allowed to do: [how we'll check]
```

## Notes on filling it in

**Job.** If the sentence needs an "and" between two jobs, it may be two agents, or one agent with two contracts. The "stays in charge of" clause is the one people skip, and it is the one that decides the Authority table.

**Authority.** List actions as verbs with objects: "send an email to someone outside the company", not "email". Sort each using the stakes grid in [behavior.md](behavior.md). The "never does" column should have entries. An agent with nothing in it has not been thought about hard enough.

**When it asks.** Write the actual question. "Asks for clarification" is not a decision. "Which account? [Personal] [Work]" is.

**What it shows.** The rule of thumb: conversation carries intent and short status, and the work goes in the artifact.

**Failure.** Write this table before the "what it shows" table. It is where most of the design is, and filling it in tends to change the Authority table.

**How we'll know.** Pick two or three measures from the table in [behavior.md](behavior.md). Include one that task success can't hide behind.

## A filled-in example

```markdown
# Interview scheduler: behavior contract

## Job
A recruiter asks the agent to schedule interview loops over Slack so they can stop
trading availability emails, and stays in charge of who is on the panel and anything
sent to a candidate.

Not its job: choosing interviewers, rejecting candidates, discussing compensation.
It says so and links the recruiter's hiring-plan doc.

## Authority
| Does alone | Does and tells | Asks first | Never does |
|---|---|---|---|
| Read panel calendars; draft a schedule; draft the candidate email | Place tentative holds on interviewers' calendars (shown in thread, one-click release) | Send anything to the candidate; move an existing interview; book a room that displaces a meeting | Email a candidate without approval of that exact text; read calendars outside the panel; decline on a candidate's behalf |

Autonomy today: approver for candidate email, collaborator for the schedule.
Would raise it: 20 consecutive candidate emails approved with no edits, per recruiter.

## Context
- Knows at the start: the role, the panel, the candidate's stated availability,
  the recruiter's working hours. All from the ATS record linked in the thread.
- Remembers: each recruiter's preferences (no Friday afternoons, 15-minute gaps).
  Listed by `/scheduler preferences`, each one removable.
- Must not use: interview feedback, compensation data, other candidates' details.

## When it asks
- Asks: when no slot fits everyone in the window.
  "No slot fits all four before the 14th. Extend to the 18th, or split across two days?"
- Assumes: 45-minute interviews, 15-minute gaps, the recruiter's time zone,
  video unless the role says onsite. Shown as one line above the schedule, each editable.

## What it shows
| Moment | In conversation | In an artifact or UI |
|---|---|---|
| Request received | "On it." within a second | |
| The plan | One line of assumptions | Schedule card: slots, interviewers, holds placed |
| While working | "Checking 4 calendars" | |
| Needs the person | The question, with buttons | The schedule with the conflict highlighted |
| The result | "Sent to Dana at 2:14pm. 4 invites accepted so far." | Final schedule with live accept status |

## Control
- Stop: "Stop" on the schedule card. Releases every hold it placed and says so.
- Undo: holds can be released any time. A sent email cannot be unsent; the approval says this.
- Edit: the recruiter can drag slots on the card. Edited slots are locked; the agent
  schedules around them and never moves them.
- Take over: "Open in calendar" hands over the draft events for manual finishing.

## Failure
| What goes wrong | What the person sees | How they recover |
|---|---|---|
| Ambiguous request | Its reading, stated: "Scheduling the onsite loop for Dana Kim." | [Wrong candidate] |
| Outside its job | "I can't pick interviewers. The panel is set in the hiring plan." | Link to the plan |
| A step fails | "Holds placed for 3 of 4. Couldn't reach Priya's calendar." | [Retry] [Schedule without Priya] [Stop] |
| Partly done | Counts, and which invites are out | [Finish] [Release all] |
| Missing permission | "I need access to the Eng Interviews room calendar." | [Request access] or continue without a room |
| Slow | Progress after 3 seconds; after 30, "I'll post here when it's ready." | Nothing needed |
| Unsure | "Dana said 'afternoons'. I used 1 to 5pm her time." | Edit the window |
| Must not do | "I don't send candidate email without your approval of the text." | Approve or edit the draft |

## Surfaces
- Lives in: Slack thread on the candidate; a schedule card that also opens in the web app.
- Slack shows the card and takes approvals. The web app allows drag editing.
- Carries across: the schedule, the holds, the pending approval.
- Notifies: when it needs a decision, when the candidate replies, when an interviewer
  declines. Quiet on accepts; those show on the card.

## Voice
- Tone: brief, plain, calm.
- Default length: one or two lines plus the card.
- Says it is an agent: Slack app badge, and the candidate email is sent from the
  recruiter with "Scheduled with help from [company]'s scheduling assistant."
- Avoids: exclamation marks, apologies longer than a clause, "I think".

## How we'll know it's good
- Task success: loop scheduled and every invite accepted, checked against the calendars.
- Supervision cost: recruiter messages per scheduled loop (worry above 4);
  candidate emails edited before sending (worry above 30%).
- Understanding: ask five recruiters what it will and won't send on its own.
```
