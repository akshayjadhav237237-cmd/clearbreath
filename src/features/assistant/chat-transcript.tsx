import type { JSX } from 'react';
import { Modal } from '../../shared/ui';
import type { GroundingFact } from '../../ai/contracts';

/** Pre-canned suggested prompts for user exploration. */
const PRE_CANNED_PROMPTS = [
  'Can my child play outdoors at 4pm?',
  'How much will a DIY air cleaner reduce indoor PM2.5?',
  'What is the cleanest commute option during severe smog?',
] as const;

/** Single message entry rendered within the conversational transcript. */
export interface ChatMessage {
  readonly id: string;
  readonly sender: 'user' | 'assistant';
  readonly text: string;
  readonly source?: 'local' | 'gemini';
  readonly refusal?: boolean;
}

function getBubbleStyle(
  sender: 'user' | 'assistant',
  refusal?: boolean
): string {
  if (sender === 'user') {
    return 'bg-sky-700 text-white';
  }
  if (refusal) {
    return 'border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/30';
  }
  return 'border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100';
}

/** Sub-component rendering the scrollable chat message transcript. */
function ChatTranscript({
  messages,
}: {
  readonly messages: readonly ChatMessage[];
}): JSX.Element {
  return (
    <div className="my-4 max-h-80 space-y-3 overflow-y-auto pr-1">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs sm:text-sm ${getBubbleStyle(m.sender, m.refusal)}`}
          >
            <p>{m.text}</p>
            {m.source ? (
              <span className="mt-1 block text-[10px] text-slate-700 dark:text-slate-300">
                Source: {m.source} engine
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChatBoxProps {
  readonly messages: readonly ChatMessage[];
  readonly input: string;
  readonly isLoading: boolean;
  readonly onInputChange: (val: string) => void;
  readonly onSend: (text: string) => void;
  readonly placeholder: string;
  readonly sendLabel: string;
}

/** Chat box rendering suggested prompts, transcript list, and input form. */
export function AssistantChatBox({
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  placeholder,
  sendLabel,
}: ChatBoxProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        {PRE_CANNED_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onSend(p)}
            className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
          >
            {p}
          </button>
        ))}
      </div>
      <ChatTranscript messages={messages} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          maxLength={300}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-sky-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
        >
          {isLoading ? '...' : sendLabel}
        </button>
      </form>
    </div>
  );
}

/** Modal dialog presenting empirical grounding facts supplied to the assistant. */
export function FactsModal({
  isOpen,
  onClose,
  facts,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly facts: readonly GroundingFact[];
}): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grounding Facts Sent to AI">
      <ul className="space-y-2">
        {facts.map((f) => (
          <li
            key={f.id}
            className="rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800"
          >
            <span className="font-mono text-[10px] text-sky-700 dark:text-sky-300">
              [{f.kind}]
            </span>
            <p className="mt-0.5">{f.text}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
