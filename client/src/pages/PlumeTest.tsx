import { PlumeIntegration } from "@/components/PlumeIntegration";

export default function PlumeTest() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <PlumeIntegration />
      </div>
    </div>
  );
}