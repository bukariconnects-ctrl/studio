import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-2xl font-bold">404 - الصفحة غير موجودة</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
      </p>
      <Link href="/">
        <Button>
          <Home className="h-4 w-4" />
          <span>العودة للرئيسية</span>
        </Button>
      </Link>
    </div>
  );
}
