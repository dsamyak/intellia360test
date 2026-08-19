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

    const driveUrl =
      `https://drive.google.com/uc?export=download&id=${edunote.fileId}`;

    const driveResponse = await fetch(driveUrl, {
      redirect: "follow",
      cache: "no-store",
    });

    if (!driveResponse.ok) {
      console.error(
        "Google Drive fetch failed:",
        driveResponse.status,
        driveResponse.statusText
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to fetch EduNotes PDF from Google Drive",
        },
        { status: 502 }
      );
    }

    const pdfBuffer = await driveResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${edunote.fileName}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("EduNotes content API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while loading EduNotes",
      },
      { status: 500 }
    );
  }
}
