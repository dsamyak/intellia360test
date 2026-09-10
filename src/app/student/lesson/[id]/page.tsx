"use client";

import {
  Suspense,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";



const LESSON_ARCHITECTURE_URLS: Record<string, string> = {
  "counting-numbers-up-to-100":
    "https://number-counting-gamma.vercel.app/",

  "reading-and-writing-numbers":
    "https://readingnumbers.vercel.app/",

  "place-value-tens-and-ones":
    "https://placetens.vercel.app/",
};


/*
 * ============================================================
 * LESSON CONTENT
 * ============================================================
 */

function StudentLessonContent() {
  const params = useParams();

  const lessonId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [isLoading, setIsLoading] =
    useState(true);

  const [hasError, setHasError] =
    useState(false);


  /*
   * ----------------------------------------------------------
   * FIND ARCHITECTURE URL
   * ----------------------------------------------------------
   */

  const architectureUrl = useMemo(() => {
    if (!lessonId) {
      return null;
    }

    return LESSON_ARCHITECTURE_URLS[
      lessonId
    ] || null;
  }, [lessonId]);


  /*
   * ----------------------------------------------------------
   * LESSON NOT FOUND
   * ----------------------------------------------------------
   */

  if (!lessonId) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7ff",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "20px",
            }}
          >
            📚
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#172554",
              marginBottom: "12px",
            }}
          >
            Lesson not found
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Please select a lesson from the
            student dashboard.
          </p>
        </div>
      </main>
    );
  }


  /*
   * ----------------------------------------------------------
   * ARCHITECTURE NOT CONFIGURED
   * ----------------------------------------------------------
   */

  if (!architectureUrl) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7ff",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "50px",
            textAlign: "center",
            boxShadow:
              "0 10px 40px rgba(37, 99, 235, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "20px",
            }}
          >
            🚧
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#172554",
              marginBottom: "12px",
            }}
          >
            Lesson Architecture Coming Soon
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            This lesson does not have an architecture
            configured yet.
          </p>

          <p
            style={{
              color: "#2563eb",
              fontWeight: 600,
            }}
          >
            Lesson: {lessonId}
          </p>
        </div>
      </main>
    );
  }


  /*
   * ----------------------------------------------------------
   * LESSON PLAYER
   * ----------------------------------------------------------
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7ff",
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1500px",
            margin: "0 auto",
          }}
        >

          {/* ==================================================
              LESSON HEADER
          ================================================== */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "28px 32px",
              marginBottom: "20px",
              boxShadow:
                "0 10px 40px rgba(37, 99, 235, 0.08)",
            }}
          >
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#172554",
                margin: 0,
                marginBottom: "8px",
              }}
            >
              Lesson Player
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#64748b",
                margin: 0,
              }}
            >
              Current Lesson:{" "}
              <strong
                style={{
                  color: "#2563eb",
                }}
              >
                {lessonId}
              </strong>
            </p>
          </div>


          {/* ==================================================
              ARCHITECTURE CARD
          ================================================== */}

          <div
            style={{
              position: "relative",
              width: "100%",
              background: "#ffffff",
              borderRadius: "24px",
              padding: "12px",
              boxShadow:
                "0 10px 40px rgba(37, 99, 235, 0.08)",
              overflow: "hidden",
            }}
          >

            {/* ------------------------------------------------
                LOADING SCREEN
            ------------------------------------------------ */}

            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  background:
                    "linear-gradient(135deg, #eef2ff, #f8faff)",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "64px",
                    marginBottom: "20px",
                  }}
                >
                  🚀
                </div>

                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#172554",
                    marginBottom: "8px",
                  }}
                >
                  Preparing Your Lesson...
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "16px",
                  }}
                >
                  Get ready for your learning
                  adventure! ✨
                </p>
              </div>
            )}


            {/* ------------------------------------------------
                ERROR SCREEN
            ------------------------------------------------ */}

            {hasError && (
              <div
                style={{
                  minHeight: "750px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, #fff7ed, #fff)",
                  borderRadius: "20px",
                  padding: "40px",
                }}
              >
                <div
                  style={{
                    fontSize: "60px",
                    marginBottom: "20px",
                  }}
                >
                  😕
                </div>

                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#172554",
                    marginBottom: "10px",
                  }}
                >
                  Lesson Could Not Be Loaded
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    maxWidth: "500px",
                    lineHeight: 1.6,
                  }}
                >
                  We couldn't load this lesson
                  architecture. Please try again.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
              </div>
            )}


            {/* ==================================================
                ACTUAL LESSON ARCHITECTURE
            ================================================== */}

            {!hasError && (
              <iframe
                key={architectureUrl}
                src={architectureUrl}
                title={`${lessonId} Lesson Architecture`}
                onLoad={() => {
                  setIsLoading(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                style={{
                  width: "100%",
                  height: "calc(100vh - 180px)",
                  minHeight: "750px",
                  border: "none",
                  borderRadius: "20px",
                  display: "block",
                  background: "#ffffff",
                }}
                allow="
                  fullscreen;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  picture-in-picture;
                "
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}

          </div>

        </div>
      </div>
    </main>
  );
}


/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function StudentLessonPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f7ff",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              📚
            </div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#172554",
              }}
            >
              Loading lesson...
            </h2>
          </div>
        </main>
      }
    >
      <StudentLessonContent />
    </Suspense>
  );
}