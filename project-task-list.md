# task list management

this guide explains how to organize, execute, and track markdown task lists while working through a product requirements document (prd).

## table of contents

- [overview](#overview)
- [workflow rules](#workflow-rules)
  - [single-sub-task flow](#single-sub-task-flow)
  - [completion protocol](#completion-protocol)
- [maintenance checklist](#maintenance-checklist)
- [ai-specific responsibilities](#ai-specific-responsibilities)
- [relevant files section](#relevant-files-section)

## overview

use markdown checklists to mirror real progress. every task should reflect the current state of the work and stay tightly coupled with the prd timeline.

## workflow rules

### single-sub-task flow

- work on exactly one sub-task at a time.
- before starting a new sub-task, ask the user for permission and proceed only after a "yes" or "y".
- after finishing a sub-task, pause for confirmation before moving to the next one.

### completion protocol

1. change the sub-task checkbox from `[ ]` to `[x]` immediately when the work is done.
2. once all subtasks under a parent task are `[x]`, follow this order:

   - run the full test suite (for example `pytest`, `npm test`, or `bin/rails test`).
   - if tests pass, stage changes with `git add .`.
   - remove temporary files or experimental code.
   - commit using a conventional commit message formatted as a single command with `-m` flags, for example:

     ```
     git commit -m "feat: add payment validation logic" -m "- validates card type and expiry" -m "- adds unit tests for edge cases" -m "related to t123 in prd"
     ```

3. when the parent task’s subtasks are complete and committed, mark the parent checkbox as `[x]`.

## maintenance checklist

1. keep the task list current by updating statuses as work progresses.
2. add new tasks or subtasks whenever new requirements surface.
3. ensure every completed item is marked `[x]` following the protocol.
4. revisit the document after each significant change to confirm accuracy.

## ai-specific responsibilities

1. update the task list document after completing any meaningful work segment.
2. adhere strictly to the completion protocol for both subtasks and parent tasks.
3. capture newly discovered tasks in the list immediately.
4. verify the next sub-task before beginning execution.
5. once a sub-task is updated, stop and wait for explicit user approval to continue.

## relevant files section

- maintain a dedicated section in the task list summarizing every file created or modified.
- provide a one-line description for each file so future readers understand its purpose at a glance.