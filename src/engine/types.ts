export type ISODate = string;                       // 'YYYY-MM-DD'
export type StageId = 'pre-contract' | 'pre-employment' | 'onboarding' | 'first-30-days';
export type ActionType = 'read' | 'notification' | 'task' | 'automation' | 'choose' | 'provide';
export type ActorRole = 'starter' | 'line-manager' | 'buddy' | 'hr';
export type JourneyStatus =
  | 'not-started' | 'in-progress' | 'action-required' | 'done' | 'skipped' | 'cancelled';
export type OutcomeValue = 'done' | 'cancelled' | 'skipped' | 'passed' | 'failed';
export type AutomationResult = 'passed' | 'failed' | 'returned';
export type PersonStatus = 'joiner' | 'starter' | 'onboarded';

export interface Tags {
  jobFamily?: string; role?: string; grade?: string; platform?: string; location?: string;
}

export interface ActionDef {
  id: string; type: ActionType; label: string;
  owner?: ActorRole;              // task, notification
  starterOnly?: boolean;          // a Delegate cannot complete it
  options?: string[];             // choose
  flagAtOrBelow?: number;         // choose: raises a Line Manager Task
  setsOutcome?: boolean;          // automation
  connector?: string;             // automation: a connectors/ manifest id, always with operation
  operation?: string;             // automation: an operation name in that manifest
}

export interface JourneyDef {
  id: string; version: number; title: string; description: string;
  ownerTeam: string; stage: StageId; tags: Tags;
  actions: ActionDef[]; whileYouWait?: string; declaresOutcome: boolean;
}

export type AnchorKind = 'offer-accepted' | 'start-date' | 'item-done' | 'container-complete';
export interface Anchor { kind: AnchorKind; itemId?: string; containerId?: string }

export interface TimerDef {
  id: string; label: string; anchor: Anchor;
  offsetDays: number;             // negative only when anchor.kind === 'start-date'
  reminder?: { to: ActorRole; aboutItemId: string; message: string };
}

export interface ContainerDef { id: string; label: string; itemIds: string[] }

export type HardStopTrigger =
  | { kind: 'on-failed'; itemId: string }
  | { kind: 'on-deadline'; timerId: string; watchesItemId: string };

export interface HardStopDef {
  id: string; label: string; trigger: HardStopTrigger;
  stops: { wholePathway: boolean; itemIds: string[]; containerIds: string[] };
}

export type DependencyRef =
  | { kind: 'item'; itemId: string }
  | { kind: 'container'; containerId: string }
  | { kind: 'timer'; timerId: string };

export interface PathwayItem {
  id: string; journeyId: string; journeyVersion: number;
  mandatory: boolean; dependsOn: DependencyRef[]; containerId?: string;
  lane: StageId; x: number; y: number;          // canvas position
  addedBy?: { personId: string; name: string; addedOn?: ISODate }; // set only on an Addition; addedOn is the Simulated date (Demo clock) it was made, absent on older or seeded Additions
}

export interface PathwaySnapshot {
  id: string; pathwayId: string; version: number; title: string; tags: Tags;
  items: PathwayItem[]; containers: ContainerDef[]; timers: TimerDef[]; hardStops: HardStopDef[];
}

export interface PersonRef {
  id: string; name: string; tags: Tags;
  offerAcceptedDate: ISODate; startDate: ISODate;
  lineManagerId?: string; buddyId?: string; delegateId?: string;
}

export interface ActionProgress {
  itemId: string; actionId: string; state: 'pending' | 'done';
  doneAt?: ISODate; doneByPersonId?: string;
  value?: string | number; automationResult?: AutomationResult;
}

export interface ItemOverride {
  itemId: string; status: 'done' | 'skipped'; reason?: string; byPersonId?: string; at: ISODate;
}

export interface HardStopDecision {
  hardStopId: string; decision: 'confirm' | 'extend' | 'dismiss';
  reason?: string; extendDays?: number; at: ISODate;
}

export interface DurationSample { journeyId: string; journeyVersion: number; days: number }

export interface EngineInput {
  today: ISODate;
  person: PersonRef;
  appliedOn?: ISODate;                      // when the Pathway was applied; items with no Dependencies start no earlier
  pathway: PathwaySnapshot;
  journeys: Record<string, JourneyDef>;     // keyed `${journeyId}@${version}`
  progress: ActionProgress[];
  overrides: ItemOverride[];
  hardStopDecisions: HardStopDecision[];
  history: DurationSample[];
}

export interface ItemState {
  itemId: string; journeyId: string; title: string; stage: StageId;
  status: JourneyStatus; mandatory: boolean; available: boolean;
  availableSince?: ISODate; doneAt?: ISODate; outcome?: OutcomeValue;
  currentAction?: ActionDef;
  blockedFlag: boolean;                      // waiting on a Hidden automation. HR and Line Manager only
  waitingDays?: number; usualRange?: [number, number]; overdue: boolean;
  unmetDependencies: DependencyRef[];
  whileYouWait?: string;
  addedBy?: { personId: string; name: string };
}

export interface ContainerState {
  containerId: string; label: string; complete: boolean;
  doneCount: number; mandatoryCount: number; remainingItemIds: string[];
}

export interface TimerState { timerId: string; firesOn?: ISODate; fired: boolean }

export interface NeedsDecision {
  hardStopId: string; label: string; reason: string;
  stopsItemIds: string[]; wholePathway: boolean; raisedOn: ISODate; extendAllowed: boolean;
  /** The Failed item (on-failed) or the watched item (on-deadline). */
  triggerItemId?: string;
}

export interface TaskRef {
  itemId: string; actionId: string; label: string;
  owner: ActorRole; personId: string; starterName: string; raisedOn: ISODate;
}

export interface EngineState {
  today: ISODate; stage: StageId; personStatus: PersonStatus; dayNumber: number;
  items: ItemState[]; containers: ContainerState[]; timers: TimerState[];
  needsDecisions: NeedsDecision[];
  tasks: TaskRef[];                          // every open Task; filter by owner for a To-do list
  notifications: { to: ActorRole; message: string; sentOn: ISODate }[];
  nextUp?: { itemId: string; line: string }; // the starter's "what's next" line
}

// Signatures only. computeState lives in computeState.ts, resolveTimerDate in availability.ts,
// wouldCreateLoop in loops.ts. types.ts holds no implementation.
// (The three function declarations in BUILD-PLAN 4.2 are omitted here: bodiless functions do not compile.)
