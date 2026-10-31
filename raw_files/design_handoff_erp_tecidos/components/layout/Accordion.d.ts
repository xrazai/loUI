import * as React from "react";
export interface AccordionItem { value: string; title: string; content: React.ReactNode; meta?: string; }
/** Seções expansíveis (FAQ, configurações avançadas, detalhes). */
export interface AccordionProps {
  items: AccordionItem[];
  /** Permite várias abertas. Padrão: uma por vez. */
  multiple?: boolean;
  defaultValue?: string[];
  bordered?: boolean;
  style?: React.CSSProperties;
}
export function Accordion(props: AccordionProps): JSX.Element;
