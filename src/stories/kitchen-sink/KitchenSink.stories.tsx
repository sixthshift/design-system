import { Badge } from "@sixthshift/design-system/badge";
import { BarChart } from "@sixthshift/design-system/bar-chart";
import { Body } from "@sixthshift/design-system/body";
import { Button } from "@sixthshift/design-system/button";
import { Calendar } from "@sixthshift/design-system/calendar";
import { Card } from "@sixthshift/design-system/card";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { CheckboxGroup } from "@sixthshift/design-system/checkbox-group";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { Field } from "@sixthshift/design-system/field";
import { FormField } from "@sixthshift/design-system/form-field";
import { Heading } from "@sixthshift/design-system/heading";
import { HoverCard } from "@sixthshift/design-system/hover-card";
import { Input } from "@sixthshift/design-system/input";
import { LineChart } from "@sixthshift/design-system/line-chart";
import { Message } from "@sixthshift/design-system/message";
import { Modal } from "@sixthshift/design-system/modal";
import { Muted } from "@sixthshift/design-system/muted";
import { Popover } from "@sixthshift/design-system/popover";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { SectionTitle } from "@sixthshift/design-system/section-title";
import { Select } from "@sixthshift/design-system/select";
import { Separator } from "@sixthshift/design-system/separator";
import { Sheet } from "@sixthshift/design-system/sheet";
import { Sparkline } from "@sixthshift/design-system/sparkline";
import { Spinner } from "@sixthshift/design-system/spinner";
import { Switch } from "@sixthshift/design-system/switch";
import { Tabs } from "@sixthshift/design-system/tabs";
import { TagChip } from "@sixthshift/design-system/tag-chip";
import { TagInput } from "@sixthshift/design-system/tag-input";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Timestamp } from "@sixthshift/design-system/timestamp";
import { Toast } from "@sixthshift/design-system/toast";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Tooltip } from "@sixthshift/design-system/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Design System/Kitchen Sink",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `Most of the library on one screen, composed the way an app would compose it —
built for judging a theme, not reading about a component. Flip the **Palette**
toolbar (the alternative themes under \`src/theme/\`, from the \`plans/10\`
explorations) and the light/dark toolbar and watch everything move at once:
solids, tints, borders, focus rings, charts, overlays. Each component's own
page stays the place to study its API.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const environmentOptions = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "preview", label: "Preview" },
];

const notifyOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

const planOptions = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const viewOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const deployments = [
  { service: "api · main", when: "2m ago", status: "Live", intent: "success" as const },
  { service: "web · main", when: "1h ago", status: "Queued", intent: "warning" as const },
  { service: "docs · main", when: "3h ago", status: "Failed", intent: "danger" as const },
];

const BUTTON_VARIANTS = ["solid", "soft", "outline", "ghost"] as const;
const BUTTON_INTENTS = ["brand", "neutral", "success", "warning", "danger"] as const;

const KitchenSink = () => {
  const [environment, setEnvironment] = useState("production");
  const [channels, setChannels] = useState(["email"]);
  const [plan, setPlan] = useState("pro");
  const [view, setView] = useState("week");
  const [tags, setTags] = useState(["design-system", "q3"]);
  const [search, setSearch] = useState("");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [date, setDate] = useState<`${number}-${number}-${number}` | undefined>("2026-08-13");
  const [month, setMonth] = useState("2026-08-01" as `${number}-${number}-${number}`);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    // <main>, not <div>: Card renders a <header> per card, and a <header>
    // outside main/section scope is a banner landmark — a dozen cards means a
    // dozen banners and axe fails on landmark uniqueness.
    <main className="min-h-screen bg-bg-normal p-6 text-fg-normal sm:p-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Masthead */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading>Kitchen sink</Heading>
            <Muted>Every family of component on one surface — swap the Palette toolbar and watch it all move.</Muted>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" intent="neutral">
              Docs
            </Button>
            <Button variant="outline" intent="neutral">
              Roll back
            </Button>
            <Button intent="brand">Deploy</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Buttons */}
          <Card title="Buttons" headerAction={<Badge intent="brand">intent × variant</Badge>}>
            <div className="flex flex-col gap-2">
              {BUTTON_VARIANTS.map((variant) => (
                <div key={variant} className="flex flex-wrap items-center gap-2">
                  {BUTTON_INTENTS.map((intent) => (
                    <Button key={intent} size="sm" variant={variant} intent={intent}>
                      {intent}
                    </Button>
                  ))}
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" loading>
                  Saving
                </Button>
                <Button size="sm" disabled>
                  Disabled
                </Button>
                <Button size="sm" variant="link" intent="brand">
                  Link button
                </Button>
                <Spinner size="sm" aria-label="Loading" />
                <ToggleGroup type="single" value={view} onValueChange={setView} options={viewOptions} size="sm" aria-label="Calendar view" name="view" />
              </div>
            </div>
          </Card>

          {/* Status & feedback */}
          <Card title="Status & feedback">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge intent="success">Live</Badge>
                <Badge intent="warning" variant="soft">
                  Queued
                </Badge>
                <Badge intent="danger" variant="outline">
                  Failed
                </Badge>
                <Badge intent="neutral" variant="soft">
                  Draft
                </Badge>
                <TagChip tag="release" />
                <TagChip tag="hotfix" onRemove={() => {}} />
              </div>
              <Message intent="success" title="Deploy complete" size="sm">
                api · main is live in production.
              </Message>
              <Message intent="warning" title="Certificate expiring" size="sm">
                staging.example.com renews in 6 days.
              </Message>
              <Toast standalone={false} intent="success" title="Saved" icon={<CheckCircle />} onClose={() => {}}>
                Your changes were saved.
              </Toast>
              <Toast standalone={false} intent="danger" title="Build failed" icon={<AlertTriangle />} action="Retry" onAction={() => {}} onClose={() => {}}>
                2 type errors on docs · main.
              </Toast>
              <ProgressBar completed={6} total={8} label="Rollout" showFraction />
            </div>
          </Card>

          {/* Forms */}
          <Card title="Forms">
            <div className="flex flex-col gap-4">
              <FormField label="Project name" description="Shown on the public status page." required>
                <Input placeholder="acme-website" />
              </FormField>
              <FormField label="Environment">
                <Select aria-label="Environment" value={environment} onValueChange={setEnvironment} options={environmentOptions} name="environment" />
              </FormField>
              <FormField label="Deploy hook" feedback={{ intent: "danger", message: "That URL is not reachable." }}>
                <Input placeholder="https://hooks.example.com/deploy" />
              </FormField>
              <FormField label="Release notes">
                <Textarea placeholder="What changed?" rows={2} />
              </FormField>
              <FormField label="Tags">
                <TagInput value={tags} onValueChange={setTags} name="tags" />
              </FormField>
              <SearchInput aria-label="Search deployments" placeholder="Search deployments…" value={search} onValueChange={setSearch} />
              <div className="flex flex-wrap items-center gap-6">
                <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} label="Auto-deploy" />
                <Checkbox defaultChecked label="Notify on failure" />
              </div>
              <CheckboxGroup value={channels} onValueChange={setChannels} options={notifyOptions} aria-label="Notification channels" />
              <RadioButtonGroup value={plan} onValueChange={setPlan} options={planOptions} aria-label="Plan" />
            </div>
          </Card>

          {/* Dates */}
          <Card title="Dates & times">
            <div className="flex flex-col gap-4">
              <FormField label="Launch date">
                <DatePicker />
              </FormField>
              <Separator />
              <Calendar mode="single" value={date} onSelect={setDate} month={month} onMonthChange={setMonth} />
            </div>
          </Card>

          {/* Data */}
          <Card title="Deployments" headerAction={<Timestamp>2m ago</Timestamp>}>
            <Tabs
              items={[
                { value: "recent", label: "Recent", content: <span className="sr-only">Recent deployments are listed below.</span> },
                { value: "failed", label: "Failed", badge: 1, content: <span className="sr-only">One failed deployment.</span> },
              ]}
              defaultValue="recent"
            >
              <Tabs.List />
              <Tabs.Panels />
            </Tabs>
            <ul className="mt-3 flex list-none flex-col gap-0 p-0">
              {deployments.map((row) => (
                <li key={row.service} className="flex items-center justify-between border-border-subtle border-b py-2 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Badge intent={row.intent} variant="soft">
                      {row.status}
                    </Badge>
                    <Body className="m-0">{row.service}</Body>
                  </div>
                  <Muted>{row.when}</Muted>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Region" layout="row" mono={false}>
                ap-southeast-2
              </Field>
              <Field label="Build" layout="row">
                a91f4c2
              </Field>
            </div>
          </Card>

          {/* Charts */}
          <Card title="Charts">
            <div className="flex flex-col gap-4">
              <LineChart
                series={[
                  {
                    name: "Sessions",
                    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({ label, value: [12, 18, 14, 22, 19, 27, 24][i] as number })),
                  },
                ]}
                height={120}
                aria-label="Sessions over the last seven days"
              />
              <BarChart
                data={[
                  { label: "api", value: 34 },
                  { label: "web", value: 21 },
                  { label: "docs", value: 9 },
                ]}
                showValues
              />
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <Sparkline data={[3, 5, 4, 8, 6, 7, 9]} color="var(--fg-success)" fillArea />
                  <Muted>uptime</Muted>
                </span>
                <span className="flex items-center gap-2">
                  <Sparkline data={[12, 9, 11, 8, 9, 7, 8]} color="var(--fg-danger)" fillArea />
                  <Muted>errors</Muted>
                </span>
              </div>
            </div>
          </Card>

          {/* Overlays */}
          <Card title="Overlays" className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button variant="outline" intent="neutral" size="sm">
                    Tooltip
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Body>Deployed from main at 09:41.</Tooltip.Body>
              </Tooltip>

              <Popover>
                <Popover.Trigger asChild>
                  <Button variant="outline" intent="neutral" size="sm">
                    Popover
                  </Button>
                </Popover.Trigger>
                <Popover.Body aria-label="Quick settings" className="flex w-64 flex-col gap-3">
                  <SectionTitle>Quick settings</SectionTitle>
                  <Switch defaultChecked label="Protect production" />
                  <Popover.Close asChild>
                    <Button size="sm" intent="brand">
                      Done
                    </Button>
                  </Popover.Close>
                </Popover.Body>
              </Popover>

              <HoverCard>
                <HoverCard.Trigger>
                  <Button variant="outline" intent="neutral" size="sm">
                    Hover card
                  </Button>
                </HoverCard.Trigger>
                <HoverCard.Content className="w-64">
                  <div className="flex flex-col gap-1">
                    <Body className="m-0 font-medium">api · main</Body>
                    <Muted>Last deployed 2 minutes ago by CI.</Muted>
                  </div>
                </HoverCard.Content>
              </HoverCard>

              <Button variant="outline" intent="neutral" size="sm" onClick={() => setModalOpen(true)}>
                Modal
              </Button>
              <Button variant="outline" intent="neutral" size="sm" onClick={() => setSheetOpen(true)}>
                Sheet
              </Button>
            </div>

            {modalOpen && (
              <Modal onOpenChange={setModalOpen} closable size="sm">
                <Modal.Header>Confirm deploy</Modal.Header>
                <Modal.Body>
                  <div className="flex flex-col gap-3">
                    <Body className="m-0">Deploy api · main to production? The palette applies in here too.</Body>
                    <FormField label="Confirm environment">
                      <Select aria-label="Confirm environment" options={environmentOptions} defaultValue="production" />
                    </FormField>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="ghost" intent="neutral" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button intent="brand" onClick={() => setModalOpen(false)}>
                    Deploy
                  </Button>
                </Modal.Footer>
              </Modal>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen} closable size="sm">
              <Sheet.Header>Deployment detail</Sheet.Header>
              <Sheet.Body>
                <div className="flex flex-col gap-3">
                  <Field label="Service">api · main</Field>
                  <Field label="Status" mono={false}>
                    <Badge intent="success">Live</Badge>
                  </Field>
                  <Message intent="neutral" size="sm">
                    Sheets stay non-modal — the page behind remains interactive.
                  </Message>
                </div>
              </Sheet.Body>
            </Sheet>
          </Card>
        </div>
      </div>
    </main>
  );
};

/**
 * One dense, app-shaped surface: masthead, button matrix, status column,
 * a full form, calendar, data list, charts and every overlay. Nothing here
 * is the reference for a component's API — it exists so a palette (or any
 * theme change) can be judged against the whole system at once.
 */
export const Everything: Story = {
  render: () => <KitchenSink />,
};
