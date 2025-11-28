import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative flex flex-col items-center gap-4">
                <div className="relative w-32 h-12 mb-4">
                    <Image
                        src="/assets/logo.png"
                        alt="Basak Pastanesi"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <Spinner size="lg" variant="primary" />
                <p className="text-basak-golden font-medium animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
}
