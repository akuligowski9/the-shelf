import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your system</p>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Timezone</div>
              <div className="text-sm text-muted-foreground">
                All times are stored in this timezone
              </div>
            </div>
            <Button variant="outline" size="sm">
              EST (UTC-5)
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">
                Choose light or dark mode
              </div>
            </div>
            <Button variant="outline" size="sm">
              Light
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Import Data</div>
              <div className="text-sm text-muted-foreground">
                Import entries from a JSON file
              </div>
            </div>
            <Button variant="outline" size="sm">
              Import
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your data as JSON
              </div>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Entries</span>
            <span>127</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Habits</span>
            <span>4</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Targets</span>
            <span>8</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reflections</span>
            <span>3</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Shelf is a personal system for managing attention, balance, and
            long-term memory of effort. It is designed to be used for years.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">
            Version 0.1.0
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
