Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const body = await request.json();
    const params = body.action?.params || {};
    const product = params["product"] || "";
    const deadline = params["deadline"] || "해당없음";
    const design = params["design"] || "";

    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = kst.toISOString().slice(2, 10).replace(/-/g, "");
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    const orderNum = "#" + dateStr + "-" + seq;
    const dateTime = kst.toISOString().slice(0, 16).replace("T", " ");

    const sheetUrl = "https://api.sheety.co/45025b27255e00fb81f2402fd95ee8d1/문의접수/문의접수";
    await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "문의접수": {
          "주문번호": orderNum,
          "날짜": dateTime,
          "상품": product,
          "납기일": deadline,
          "디자인파일": design,
          "상태": "접수완료",
        },
      }),
    });

    const text = `접수됐어요! 🎉\n주문번호 ${orderNum}\n\n📦 상품: ${product || "-"}\n📅 납기일: ${deadline}\n🎨 디자인: ${design || "-"}\n\n디자이너가 곧 연락드릴게요!\n연락받으실 번호를 채팅으로 보내주세요 😊`;

    return new Response(
      JSON.stringify({ version: "2.0", template: { outputs: [{ simpleText: { text } }] } }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("에러:", err);
    return new Response(
      JSON.stringify({ version: "2.0", template: { outputs: [{ simpleText: { text: "잠시 후 다시 시도해주세요 🙏" } }] } }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});
