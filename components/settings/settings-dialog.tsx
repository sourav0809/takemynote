import { Archive, Command, Settings, Sparkles, User } from "lucide-react";

import { AboutTab } from "@/components/settings/about-tab";
import { AiTab } from "@/components/settings/ai-tab";
import { DataManagementTab } from "@/components/settings/data-management-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ShortcutsTab } from "@/components/settings/shortcuts-tab";
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
import { GithubIcon } from "@/components/brand/github-icon";
import { buttonVariants } from "@/components/ui/button";
import { useAppState, type SettingsTab } from "@/hooks/use-app-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import { APP_NAME, GITHUB_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Tabs sit beside the content from this width, and in a row above it on phones. */
const SIDE_TABS_MEDIA_QUERY = "(min-width: 768px)";
/** In the side list (md and up) the current tab gets the app's light-blue highlight. */
const TAB_TRIGGER_CLASS = [
  "flex-none justify-start gap-2.5 px-3 py-2 md:py-2.5",
  "md:not-data-active:hover:bg-muted md:not-data-active:hover:text-foreground",
  "md:data-active:bg-sidebar-accent md:data-active:text-sidebar-accent-foreground md:data-active:[&_svg]:text-primary",
  "md:dark:data-active:border-transparent md:dark:data-active:bg-sidebar-accent",
].join(" ");

export function SettingsDialog() {
  const { isSettingsOpen, setSettingsOpen, settingsTab, setSettingsTab } = useAppState();
  const hasSideTabs = useMediaQuery(SIDE_TABS_MEDIA_QUERY) ?? true;

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="flex h-[88dvh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl md:h-[42rem] md:max-h-[85vh] lg:max-w-5xl">
        <DialogHeader className="space-y-0 border-b border-border px-5 py-4 pr-24 md:px-8 md:py-6">
          <DialogTitle>Settings</DialogTitle>
          <p className="text-sm text-muted-foreground">Preferences, AI and your data.</p>
        </DialogHeader>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="View source on GitHub"
          title="View source on GitHub"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "absolute top-4 right-14 text-muted-foreground")}
        >
          <GithubIcon />
        </a>

        <Tabs
          value={settingsTab}
          onValueChange={(tab) => setSettingsTab(tab as SettingsTab)}
          orientation={hasSideTabs ? "vertical" : "horizontal"}
          className="min-h-0 flex-1 gap-0 md:flex-row"
        >
          <TabsList className="no-scrollbar mx-4 mt-3 h-10 max-w-[calc(100%-2rem)] shrink-0 justify-start overflow-x-auto md:mx-0 md:mt-0 md:h-fit md:w-56 md:max-w-none md:flex-col md:items-stretch md:gap-1 md:overflow-visible md:bg-transparent md:p-4">
            <TabsTrigger value="preferences" className={TAB_TRIGGER_CLASS}>
              <Settings />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="ai" className={TAB_TRIGGER_CLASS}>
              <Sparkles />
              AI
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className={TAB_TRIGGER_CLASS}>
              <Command />
              Keyboard shortcuts
            </TabsTrigger>
            <TabsTrigger value="data" className={TAB_TRIGGER_CLASS}>
              <Archive />
              Data management
            </TabsTrigger>
            <TabsTrigger value="about" className={TAB_TRIGGER_CLASS}>
              <User />
              About {APP_NAME}
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:border-l md:border-border md:px-8 md:py-6">
            <TabsContent value="preferences">
              <PreferencesTab />
            </TabsContent>
            <TabsContent value="ai">
              <AiTab />
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
