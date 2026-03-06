"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { BrightDataSettingsTab } from "./BrightDataSettingsTab"

export function SettingsModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" data-settings-trigger>
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="brightdata" className="w-full">
          <TabsList>
            <TabsTrigger value="brightdata">Bright Data</TabsTrigger>
          </TabsList>
          <TabsContent value="brightdata" className="mt-4">
            <BrightDataSettingsTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
