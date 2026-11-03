/**
 * Domain patterns entry point (`@loui/ds/patterns`, ADR-0008).
 * Compositions with a narrower purpose than core components; names stay generic.
 */
export { AgentCard } from './AgentCard';
export type { AgentCardProps, AgentCardStatus } from './AgentCard';
export { ApprovalCard } from './ApprovalCard';
export type { ApprovalCardKind, ApprovalCardProps } from './ApprovalCard';
export { ChatPanel } from './ChatPanel';
export type { ChatMessage, ChatMessageRole, ChatMessageStatus, ChatPanelProps } from './ChatPanel';
export { ColorOption } from './ColorOption';
export type { ColorOptionProps } from './ColorOption';
export { LedgerList } from './LedgerList';
export type { LedgerEntry, LedgerListProps, LedgerNegativeTone } from './LedgerList';
export { MatrixGrid } from './MatrixGrid';
export type { MatrixGridColumn, MatrixGridProps, MatrixGridRow } from './MatrixGrid';
export { ResponseFeedback } from './ResponseFeedback';
export type { ResponseFeedbackProps, ResponseRating } from './ResponseFeedback';
export { Citation, SourceList, getSourceElementId } from './SourceList';
export type { CitationProps, Source, SourceListProps } from './SourceList';
export { ToolCallList, ToolCallStep } from './ToolCallStep';
export type {
  ToolCallListProps,
  ToolCallListStep,
  ToolCallStatus,
  ToolCallStepProps,
} from './ToolCallStep';
