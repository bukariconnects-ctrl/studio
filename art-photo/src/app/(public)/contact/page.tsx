import type { Metadata } from "next";
import { ContactForm } from "./_components/contact-form";

export const metadata: Metadata = {
  title: "اتصل بنا",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">اتصل بنا</h1>
        <p className="text-muted-foreground">نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت.</p>
      </div>
      <ContactForm />
    </div>
  );
}
