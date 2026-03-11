"use client";

import { useState, useTransition, useActionState } from "react";
import { Loader2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSetting, createSetting, type ActionResult } from "@/actions/admin-settings";
import { toast } from "sonner";

interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

const initialState: ActionResult = {};

export function SettingsManager({ settings }: { settings: Setting[] }) {
  const [isPending, startTransition] = useTransition();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const [createState, createAction, isCreating] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createSetting(formData),
    initialState
  );

  function handleSave(key: string) {
    const value = editValues[key];
    if (value === undefined) return;
    startTransition(async () => {
      const result = await updateSetting(key, value);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            إضافة إعداد جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {createState.error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{createState.error}</div>
          )}
          {createState.success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{createState.success}</div>
          )}
          <form action={createAction} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>المفتاح</Label>
              <Input name="key" placeholder="site_name" dir="ltr" required disabled={isCreating} />
            </div>
            <div className="space-y-2">
              <Label>القيمة</Label>
              <Input name="value" disabled={isCreating} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>الوصف</Label>
                <Input name="description" disabled={isCreating} />
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الإعدادات ({settings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">لا توجد إعدادات</p>
          ) : (
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <code className="text-sm font-medium" dir="ltr">{setting.key}</code>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(setting.key)}
                      disabled={isPending || editValues[setting.key] === undefined}
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      <span>حفظ</span>
                    </Button>
                  </div>
                  <Textarea
                    defaultValue={setting.value ?? ""}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                    className="text-sm"
                    rows={2}
                    disabled={isPending}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
