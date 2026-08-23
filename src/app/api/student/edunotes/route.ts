import { NextRequest, NextResponse } from "next/server";
import { getEduNotes } from "@/lib/student/edunotes";

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

    const edunote = getEduNotes(lessonId, grade);

    if (!edunote) {
      return NextResponse.json(
        {
          success: false,
          message: "EduNotes not available for this lesson",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        lessonId: edunote.lessonId,
        fileId: edunote.fileId,
        fileName: edunote.fileName,
        previewUrl: edunote.previewUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching EduNotes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while fetching EduNotes",
      },
      { status: 500 }
    );
  }
}
