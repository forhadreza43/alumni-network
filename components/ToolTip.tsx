import {
  Tooltip as TooltipBase,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Tooltip({children, content}: {children: React.ReactNode, content: string}) {
  return (
    <TooltipBase>
      <TooltipTrigger render={children as React.ReactElement} />
      <TooltipContent>
        <p className="py-1.5">{content}</p>
      </TooltipContent>
    </TooltipBase>
  )
}
