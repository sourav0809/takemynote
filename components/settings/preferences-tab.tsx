import { LayoutPicker } from "@/components/settings/layout-picker";
import { PreferenceSelectRow } from "@/components/settings/preference-select-row";
import { PreferenceToggleRow } from "@/components/settings/preference-toggle-row";
import { usePreferences } from "@/hooks/use-preferences";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function PreferencesTab() {
  const preferences = usePreferences();
  const { isDark, setThemeSmoothly } = useThemeToggle();

  return (
    <div className="flex flex-col">
      <LayoutPicker />
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
        checked={isDark}
        onCheckedChange={(checked) => void setThemeSmoothly(checked ? "dark" : "light")}
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
