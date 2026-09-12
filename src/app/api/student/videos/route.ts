import { NextRequest, NextResponse } from "next/server";
import { getLessonVideos } from "@/lib/student/lesson-videos";

/**
 * GET /api/student/videos?lessonId=<id>&grade=<gradeId>
 *
 * Topic-wise lesson videos. Mirrors /api/student/edunotes: an empty list is a
 * normal answer (200) so the page can show its "no videos yet" state.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const grade = searchParams.get("grade") || "grade1";

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          message: "lessonId parameter is required",
        },
        { status: 400 }
      );
    }

    const videos = getLessonVideos(lessonId, grade);

    return NextResponse.json(
      {
        success: true,
        lessonId,
        grade,
        count: videos.length,
        videos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lesson videos:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching lesson videos",
      },
      { status: 500 }
    );
  }
}
