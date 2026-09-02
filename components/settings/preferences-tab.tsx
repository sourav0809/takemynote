import { useTheme } from "next-themes";

import { PreferenceSelectRow } from "@/components/settings/preference-select-row";
import { PreferenceToggleRow } from "@/components/settings/preference-toggle-row";
import { usePreferences } from "@/hooks/use-preferences";

export function PreferencesTab() {
  const preferences = usePreferences();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col">
      <PreferenceToggleRow
        title="Active block highlight"
        description="Highlight the paragraph you're currently editing."
        checked={preferences.activeLineHighlight}
        onCheckedChange={(checked) =>
          preferences.setPreference("activeLineHighlight", checked)
        }
      />
      <PreferenceToggleRow
        title="Scroll past end"
        description="Allow scrolling past the last line of a note."
        checked={preferences.scrollPastEnd}
        onCheckedChange={(checked) =>
          preferences.setPreference("scrollPastEnd", checked)
        }
      />
      <PreferenceToggleRow
        title="Dark mode"
        description="Switch between light and dark appearance."
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <PreferenceSelectRow
        title="Sort by"
        description="Choose how notes are ordered in the list."
        value={preferences.sortBy}
        onValueChange={(value) =>
          preferences.setPreference("sortBy", value as typeof preferences.sortBy)
        }
        options={[
          { value: "updated", label: "Last updated" },
          { value: "created", label: "Date created" },
          { value: "title", label: "Title" },
        ]}
      />
      <PreferenceSelectRow
        title="Text direction"
        description="Set the reading direction for note content."
        value={preferences.textDirection}
        onValueChange={(value) =>
          preferences.setPreference(
            "textDirection",
            value as typeof preferences.textDirection
          )
        }
        options={[
          { value: "ltr", label: "Left to right" },
          { value: "rtl", label: "Right to left" },
        ]}
      />
    </div>
  );
}
