import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPhotographerRecord } from "@/actions/photographer";
import { getPhotographerAlbums, getCompletedBookingsWithoutAlbum } from "@/actions/albums";
import { AlbumManager } from "./_components/album-manager";

export const metadata: Metadata = {
  title: "رفع الصور",
};

export default async function UploadPage() {
  const photographer = await getPhotographerRecord();
  if (!photographer) redirect("/dashboard");

  const [albums, bookingsWithoutAlbum] = await Promise.all([
    getPhotographerAlbums(),
    getCompletedBookingsWithoutAlbum(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">إدارة الألبومات ورفع الصور</h1>
      <AlbumManager albums={albums} bookingsWithoutAlbum={bookingsWithoutAlbum} />
    </div>
  );
}
