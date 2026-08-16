export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "flowers";
  const perPage = searchParams.get("per_page") || "10";
  const page = searchParams.get("page") || "1";
  const source = searchParams.get("source") || "pexels";

  if (source === "pixabay") {
    const res = await fetch(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(
        query
      )}&image_type=photo&safesearch=true&per_page=${perPage}&page=${page}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return Response.json(
        { error: "failed to fetch photos" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const photos = (data.hits || []).map((p) => ({
      id: `pixabay-photo-${p.id}`,
      kind: "image",
      src: p.largeImageURL,
      alt: p.tags || "",
    }));

    return Response.json({ photos });
  }

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    return Response.json(
      { error: "failed to fetch photos" },
      { status: res.status }
    );
  }

  const data = await res.json();
  const photos = (data.photos || []).map((p) => ({
    id: `pexels-photo-${p.id}`,
    kind: "image",
    src: p.src.large,
    alt: p.alt || "",
  }));

  return Response.json({ photos });
}
