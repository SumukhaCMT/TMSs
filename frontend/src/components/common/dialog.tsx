"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ModalExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Popup</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>
            This is a shadcn modal popup example.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          Your content goes here.
        </div>
      </DialogContent>
    </Dialog>
  )
}