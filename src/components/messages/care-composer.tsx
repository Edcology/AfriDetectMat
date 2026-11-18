"use client";

import { useActionState, useEffect, useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import { sendCareMessage } from "@/app/actions";
import { idleState } from "@/lib/action-state";

export function CareComposer({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState(sendCareMessage, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-3 border-t border-line-soft px-5 py-4">
      <input type="hidden" name="threadId" value={threadId} />
      <button
        type="button"
        aria-label="Attach a file"
        className="focus-ring grid size-9 shrink-0 place-items-center rounded-[10px] border border-line text-ink-soft"
      >
        <Paperclip size={15} />
      </button>
      <input
        name="body"
        placeholder="Write a reply to the mother"
        aria-label="Write a reply"
        className="h-[42px] min-w-0 flex-1 rounded-[8px] border border-line px-4 text-[14px] text-ink placeholder:text-muted focus:border-brand-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="focus-ring inline-flex h-[42px] items-center gap-2 rounded-[8px] bg-brand px-5 text-[14px] font-medium text-white hover:bg-[#093f3b] disabled:opacity-60"
      >
        <Send size={14} /> {pending ? "Sending…" : "Send"}
      </button>
      {state.status === "error" ? <p className="text-[11px] text-danger">{state.message}</p> : null}
    </form>
  );
}
