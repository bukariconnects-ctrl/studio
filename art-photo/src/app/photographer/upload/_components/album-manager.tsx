"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Upload, Image as ImageIcon, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAlbum, uploadPhotos } from "@/actions/albums";
import { toast } from "sonner";

interface BookingOption {
  id: string;
  booking_date: string;
  client: { full_name: string } | null;
  service: { name: string } | null;
  package: { name: string } | null;
}

interface AlbumPhoto {
  id: string;
  photo_url: string;
  file_name: string;
}

interface AlbumItem {
  id: string;
  title: string;
  photo_count: number;
  created_at: string;
  booking: { booking_date: string; client: { full_name: string } | null } | null;
  photos: AlbumPhoto[];
}

interface Props {
  albums: AlbumItem[];
  bookingsWithoutAlbum: BookingOption[];
}

export function AlbumManager({ albums, bookingsWithoutAlbum }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedBooking, setSelectedBooking] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [uploadAlbumId, setUploadAlbumId] = useState("");

  function handleCreateAlbum() {
    if (!selectedBooking) {
      toast.error("اختر جلسة أولاً");
      return;
    }
    startTransition(async () => {
      const result = await createAlbum(selectedBooking, albumTitle);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setSelectedBooking("");
        setAlbumTitle("");
      }
    });
  }

  function handleUpload(formData: FormData) {
    if (!uploadAlbumId) {
      toast.error("اختر ألبومًا أولاً");
      return;
    }
    startTransition(async () => {
      const result = await uploadPhotos(uploadAlbumId, formData);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderPlus className="h-5 w-5" />
              إنشاء ألبوم جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اختر الجلسة المكتملة</Label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                disabled={isPending}
              >
                <option value="">اختر جلسة...</option>
                {bookingsWithoutAlbum.map((b) => {
                  const client = b.client as { full_name: string } | null;
                  const svc = b.service as { name: string } | null;
                  const pkg = b.package as { name: string } | null;
                  return (
                    <option key={b.id} value={b.id}>
                      {b.booking_date} — {client?.full_name ?? "عميل"} — {svc?.name ?? pkg?.name ?? ""}
                    </option>
                  );
                })}
              </select>
              {bookingsWithoutAlbum.length === 0 && (
                <p className="text-xs text-muted-foreground">لا توجد جلسات مكتملة بدون ألبوم</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>عنوان الألبوم</Label>
              <Input
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="ألبوم الجلسة"
                disabled={isPending}
              />
            </div>
            <Button onClick={handleCreateAlbum} disabled={isPending || !selectedBooking} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>إنشاء ألبوم</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              رفع صور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label>اختر الألبوم</Label>
                <select
                  value={uploadAlbumId}
                  onChange={(e) => setUploadAlbumId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  disabled={isPending}
                >
                  <option value="">اختر ألبومًا...</option>
                  {albums.map((a) => {
                    const booking = a.booking as { booking_date: string; client: { full_name: string } | null } | null;
                    return (
                      <option key={a.id} value={a.id}>
                        {a.title} — {booking?.booking_date ?? ""} ({a.photos?.length ?? 0} صور)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <Label>اختر الصور</Label>
                <Input name="photos" type="file" accept="image/*" multiple disabled={isPending} />
              </div>
              <Button type="submit" disabled={isPending || !uploadAlbumId} className="w-full">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>رفع الصور</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">الألبومات ({albums.length})</h2>
        {albums.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد ألبومات بعد. أنشئ ألبومًا لجلسة مكتملة.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => {
              const booking = album.booking as { booking_date: string; client: { full_name: string } | null } | null;
              const client = booking?.client as { full_name: string } | null;

              return (
                <Card key={album.id}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">{album.title}</h3>
                      <Badge variant="outline">{album.photos?.length ?? 0} صور</Badge>
                    </div>
                    {booking && (
                      <div className="mb-3 text-sm text-muted-foreground">
                        <span dir="ltr">{booking.booking_date}</span>
                        {client && <span> — {client.full_name}</span>}
                      </div>
                    )}
                    {album.photos && album.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-1">
                        {album.photos.slice(0, 6).map((photo) => (
                          <div key={photo.id} className="aspect-square overflow-hidden rounded bg-muted">
                            <img src={photo.photo_url} alt={photo.file_name} className="h-full w-full object-cover" />
                          </div>
                        ))}
                        {album.photos.length > 6 && (
                          <div className="flex aspect-square items-center justify-center rounded bg-muted text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            +{album.photos.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
