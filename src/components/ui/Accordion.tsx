import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/utils/cn";

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className = "",
}: AccordionItemProps) {
  return (
    <details className={cn(className)} open={defaultOpen}>
      <summary>
        {title}
        <Plus size={17} />
      </summary>
      <div>{children}</div>
    </details>
  );
}

export function Accordion({
  items,
  className = "",
}: {
  items: { question: string; answer: ReactNode; defaultOpen?: boolean }[];
  className?: string;
}) {
  return (
    <div className={cn("faq-list", className)}>
      {items.map((item, idx) => (
        <AccordionItem
          key={item.question}
          title={item.question}
          defaultOpen={item.defaultOpen ?? idx === 0}
        >
          <p>{item.answer}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
