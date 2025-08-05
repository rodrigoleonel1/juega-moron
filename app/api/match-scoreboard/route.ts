import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    console.log(url);

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const data = await page.evaluate(() => {
      const scores = Array.from(
        document.querySelectorAll(
          ".result_block__8wTEO .result_number__14zEM span.scores_scoreseventresult__X_Y_1"
        )
      ).map((el) => el.textContent?.trim() || "N/A");

      const matchTime =
        document
          .querySelector(".live-minute-result-event")
          ?.textContent?.trim() || "Finalizado";

      const status =
        document.querySelector(".status_text__vHmK_")?.textContent?.trim() ||
        "Información no disponible";

      const resultBlocks = document.querySelectorAll(".result_number__14zEM");

      const homeRedCards =
        resultBlocks[0]?.querySelectorAll(".red_ball__NEoJ3.red_visible__8MS3_")
          .length || null;

      const awayRedCards =
        resultBlocks[1]?.querySelectorAll(".red_ball__NEoJ3.red_visible__8MS3_")
          .length || null;

      const teamNames = Array.from(
        document.querySelectorAll(
          "span.command_title__sMlhS.comand-name__title"
        )
      ).map((el) => el.textContent?.trim() || "");

      const teamLogos = Array.from(
        document.querySelectorAll(".comand-imageteam img.team")
      ).map((el) => el.getAttribute("src") || "");

      return {
        homeTeam: teamNames[0] || "Equipo Local",
        awayTeam: teamNames[1] || "Equipo Visitante",
        homeLogo: teamLogos[0] || "",
        awayLogo: teamLogos[1] || "",
        homeScore: scores[0],
        awayScore: scores[1],
        homeReds: homeRedCards,
        awayReds: awayRedCards,
        matchTime,
        status,
      };
    });

    await browser.close();

    return NextResponse.json({
      ...data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error scraping match data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos del partido" },
      { status: 500 }
    );
  }
}
