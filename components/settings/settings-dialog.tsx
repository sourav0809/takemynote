import { Archive, Command, Settings, User } from "lucide-react";

import { AboutTab } from "@/components/settings/about-tab";
import { DataManagementTab } from "@/components/settings/data-management-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ShortcutsTab } from "@/components/settings/shortcuts-tab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAppState } from "@/hooks/use-app-state";
import { APP_NAME } from "@/lib/constants";

export function SettingsDialog() {
  const { isSettingsOpen, setSettingsOpen } = useAppState();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="flex h-[42rem] max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border px-8 py-6">
          <Avatar size="lg">
            <AvatarFallback>
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <DialogTitle>{APP_NAME} Settings</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Manage your preferences and data.
            </p>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="preferences"
          orientation="vertical"
          className="min-h-0 flex-1 flex-row gap-0"
        >
          <TabsList className="h-fit w-56 shrink-0 flex-col items-stretch gap-1 bg-transparent p-4">
            <TabsTrigger value="preferences" className="justify-start gap-2.5 px-3 py-2.5">
              <Settings />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="justify-start gap-2.5 px-3 py-2.5">
              <Command />
              Keyboard shortcuts
            </TabsTrigger>
            <TabsTrigger value="data" className="justify-start gap-2.5 px-3 py-2.5">
              <Archive />
              Data management
            </TabsTrigger>
            <TabsTrigger value="about" className="justify-start gap-2.5 px-3 py-2.5">
              <User />
              About {APP_NAME}
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto border-l border-border px-8 py-6">
            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>
            <TabsContent value="shortcuts">
              <ShortcutsTab />
            </TabsContent>
            <TabsContent value="data">
              <DataManagementTab />
            </TabsContent>
            <TabsContent value="about">
              <AboutTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
