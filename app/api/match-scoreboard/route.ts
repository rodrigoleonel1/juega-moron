import { type NextRequest, NextResponse } from "next/server"

// Importa los tipos para evitar importar la librería en runtime si no es necesario
import type { Browser } from "puppeteer-core"

export async function POST(request: NextRequest) {
  let browser: Browser | undefined
  try {
    const { url } = await request.json()
    console.log("URL recibida:", url)

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 })
    }

    // Prepend http:// if missing
    let inputUrl = url.trim()
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = `http://${inputUrl}`
    }

    // Validate the URL is a valid HTTP/HTTPS URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(inputUrl)
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return new NextResponse("URL debe comenzar con http:// o https://", {
          status: 400,
        })
      }
    } catch {
      return new NextResponse("URL inválida proporcionada.", { status: 400 })
    }

    const isVercel = !!process.env.VERCEL_ENV
    let puppeteer: any // Usamos 'any' para la importación dinámica
    let launchOptions: any = {
      headless: true,
    }

    if (isVercel) {
      // Importa dinámicamente para el entorno de Vercel
      const chromium = (await import("@sparticuz/chromium")).default
      puppeteer = await import("puppeteer-core")
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        ignoreHTTPSErrors: true, // Puede ser útil para algunos sitios
      }
    } else {
      // Importa el paquete completo de puppeteer para desarrollo local
      puppeteer = await import("puppeteer")
    }

    browser = await puppeteer.launch(launchOptions)
    if (!browser) {
      return NextResponse.json({ error: "No se pudo iniciar el navegador" }, { status: 500 })
    }
    const page = await browser.newPage()
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )
    await page.goto(parsedUrl.toString(), { waitUntil: "networkidle2", timeout: 0 })

    const data = await page.evaluate(() => {
      const scores = Array.from(
        document.querySelectorAll(".result_block__8wTEO .result_number__14zEM span.scores_scoreseventresult__X_Y_1"),
      ).map((el) => el.textContent?.trim() || "N/A")

      const matchTime = document.querySelector(".live-minute-result-event")?.textContent?.trim() || "Finalizado"

      const status = document.querySelector(".status_text__vHmK_")?.textContent?.trim() || "Información no disponible"

      const resultBlocks = document.querySelectorAll(".result_number__14zEM")
      const homeRedCards = resultBlocks[0]?.querySelectorAll(".red_ball__NEoJ3.red_visible__8MS3_").length || null
      const awayRedCards = resultBlocks[1]?.querySelectorAll(".red_ball__NEoJ3.red_visible__8MS3_").length || null

      const teamNames = Array.from(document.querySelectorAll("span.command_title__sMlhS.comand-name__title")).map(
        (el) => el.textContent?.trim() || "",
      )

      const teamLogos = Array.from(document.querySelectorAll(".comand-imageteam img.team")).map(
        (el) => el.getAttribute("src") || "",
      )

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
      }
    })

    return NextResponse.json({
      ...data,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error scraping match data:", error)
    return NextResponse.json({ error: "Error al obtener los datos del partido" }, { status: 500 })
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}