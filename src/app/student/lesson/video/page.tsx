"use client";

import {
    Suspense,
    useEffect,
    useState,
} from "react";

import {
    useSearchParams,
    useRouter,
} from "next/navigation";

import "./video.css";

/*
 * ============================================================
 * YOUTUBE VIDEO
 * ============================================================
 *
 * YouTube Embed URL:
 *
 * https://www.youtube.com/embed/cmfDZ3FXckY
 *
 * This video will play INSIDE the Intellia page.
 * It will NOT open YouTube in a new tab.
 */

const YOUTUBE_VIDEO_URL =
    "https://www.youtube.com/embed/cmfDZ3FXckY?si=5Wu6MZPIAJYeusOd";


function VideoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const lessonId =
        searchParams.get("lessonId");

    const [isLoading, setIsLoading] =
        useState(true);


    /*
     * ---------------------------------------------------------
     * LOADING FALLBACK
     * ---------------------------------------------------------
     */

    useEffect(() => {
        setIsLoading(true);

        const timer = window.setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);


    /*
     * ---------------------------------------------------------
     * PAGE
     * ---------------------------------------------------------
     */

    return (
        <main className="video-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="video-page-header">

                <button
                    type="button"
                    className="video-back-icon"
                    onClick={() => router.back()}
                    aria-label="Back to lesson"
                >
                    ←
                </button>


                <div className="video-header-text">

                    <div className="video-heading-row">

                        <span className="video-heading-icon">
                            🎬
                        </span>

                        <h1>
                            Watch & Learn
                        </h1>

                    </div>


                    <p>
                        Learn something new with this
                        fun video! ✨
                    </p>

                </div>


                <div className="video-header-badge">
                    ⭐ Learn
                </div>

            </div>


            {/* =====================================================
                VIDEO SECTION
            ===================================================== */}

            <section className="video-learning-section">

                {/* Floating Decorations */}

                <div className="video-decoration decoration-one">
                    ✦
                </div>

                <div className="video-decoration decoration-two">
                    ⭐
                </div>

                <div className="video-decoration decoration-three">
                    ✧
                </div>


                <div className="video-card">


                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div className="video-card-top">

                        <span>
                            📚 Lesson Video
                        </span>

                        <span>
                            🎯 Watch & Learn
                        </span>

                    </div>


                    {/* =================================================
                        VIDEO WRAPPER
                    ================================================= */}

                    <div className="video-wrapper">


                        {/* Loading Screen */}

                        {isLoading && (

                            <div className="video-loader">

                                <div className="video-loader-icon">
                                    📺
                                </div>

                                <h2>
                                    Preparing your video...
                                </h2>

                                <p>
                                    Get ready to learn! 🚀
                                </p>

                            </div>

                        )}


                        {/* =================================================
                            YOUTUBE EMBED
                        ================================================= */}

                        <iframe
                            src={YOUTUBE_VIDEO_URL}
                            title="Intellia Lesson Video"
                            className="youtube-player"

                            frameBorder="0"

                            allow="
                                accelerometer;
                                autoplay;
                                clipboard-write;
                                encrypted-media;
                                gyroscope;
                                picture-in-picture;
                                web-share
                            "

                            referrerPolicy="strict-origin-when-cross-origin"

                            allowFullScreen

                            onLoad={() => {
                                setIsLoading(false);
                            }}
                        />

                    </div>


                    {/* =================================================
                        VIDEO FOOTER
                    ================================================= */}

                    <div className="video-card-footer">


                        <div className="video-tip">

                            <span className="tip-icon">
                                💡
                            </span>


                            <div>

                                <strong>
                                    Learning Tip
                                </strong>

                                <p>
                                    Watch carefully and try
                                    to remember the important
                                    points!
                                </p>

                            </div>

                        </div>


                        <div className="video-reward">

                            <span>
                                +20 XP
                            </span>

                            <span>
                                ⭐
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                BOTTOM NAVIGATION
            ===================================================== */}

            <div className="video-bottom-area">

                <button
                    type="button"
                    className="video-finish-button"
                    onClick={() => router.back()}
                >

                    <span>
                        ✓
                    </span>

                    Back to Lesson

                </button>

            </div>


            {/* =====================================================
                LESSON ID
                Future progress tracking
            ===================================================== */}

            <span
                style={{
                    display: "none",
                }}
            >
                {lessonId}
            </span>

        </main>
    );
}


/* ============================================================
   PAGE
============================================================ */

export default function VideoPage() {

    return (

        <Suspense

            fallback={

                <main className="video-page">

                    <div className="video-error-card">

                        <div className="video-error-icon">
                            📺
                        </div>

                        <h1>
                            Loading video...
                        </h1>

                        <p>
                            Preparing your learning
                            experience ✨
                        </p>

                    </div>

                </main>

            }

        >

            <VideoContent />

        </Suspense>

    );
}