export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "animals";
  const perPage = searchParams.get("per_page") || "6";
  const page = searchParams.get("page") || "1";

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    return Response.json(
      { error: "failed to fetch videos" },
      { status: res.status }
    );
  }

  const data = await res.json();
  const videos = (data.videos || []).map((v) => {
    const file =
      v.video_files.find((f) => f.quality === "sd" && f.width <= 640) ||
      v.video_files[0];
    return {
      id: `video-${v.id}`,
      kind: "video",
      src: file?.link,
      thumbnail: v.image,
    };
  });

  return Response.json({ videos });
}
