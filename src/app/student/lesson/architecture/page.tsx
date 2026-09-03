"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ArchitectureContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const lessonId = searchParams.get("lessonId");

    const architectureUrl =
        lessonId === "counting-numbers-up-to-100"
            ? "https://number-counting-gamma.vercel.app/"
            : null;

    if (!architectureUrl) {
        return (
            <main className="lesson-error">
                <h1>Architecture not available</h1>
                <button onClick={() => router.back()}>
                    ← Back to Lesson
                </button>
            </main>
        );
    }

    return (
        <main
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "#f5f7ff",
            }}
        >
            <iframe
                src={architectureUrl}
                title="Lesson Architecture"
                style={{
                    width: "100%",
                    height: "100vh",
                    border: "none",
                    display: "block",
                }}
                allow="fullscreen"
                allowFullScreen
            />
        </main>
    );
}

export default function ArchitecturePage() {
    return (
        <Suspense
            fallback={
                <main
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <h2>Loading architecture...</h2>
                </main>
            }
        >
            <ArchitectureContent />
        </Suspense>
    );
}
