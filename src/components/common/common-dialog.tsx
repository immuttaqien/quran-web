import { type Context, useContext } from "react"
import { AlertDialog } from "../ui/alert-dialog"
import { Dialog } from "../ui/dialog"

export type CommonDialogContextProps = {
  setOpen: (open: boolean) => void
}

function useCommonDialogContext(context: Context<CommonDialogContextProps>) {
  const ctx = useContext(context)
  if (!ctx) {
    throw new Error(
      "useCommonDialogContext must be used within a CommonDialogProvider"
    )
  }
  return ctx
}

interface CommonDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  Context: Context<CommonDialogContextProps>
  type?: "alert" | "dialog"
}

function CommonDialog({
  open,
  setOpen,
  Context,
  type = "dialog",
  children,
}: React.PropsWithChildren<CommonDialogProps>) {
  const Comp = type === "alert" ? AlertDialog : Dialog

  return (
    <Context.Provider value={{ setOpen }}>
      <Comp onOpenChange={setOpen} open={open}>
        {children}
      </Comp>
    </Context.Provider>
  )
}

export { CommonDialog, useCommonDialogContext }
