"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServiceCategory, type ActionResult } from "@/actions/admin-services";

const initialState: ActionResult = {};

export function CreateCategoryForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createServiceCategory(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">تصنيف جديد</CardTitle>
      </CardHeader>
      <CardContent>
        {state.error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
        )}
        {state.success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{state.success}</div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">اسم التصنيف</Label>
            <Input id="cat-name" name="name" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">الوصف</Label>
            <Input id="cat-desc" name="description" disabled={isPending} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>إضافة تصنيف</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
