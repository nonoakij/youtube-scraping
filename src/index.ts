import puppeteer from "puppeteer"
import readline from "readline"

// Function to prompt for user input
function promptUser(query): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise<string>((resolve) =>
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer)
    })
  )
}

async function main() {
  // Get the URL from standard input
  const url = await promptUser("Enter YouTube video URL: ")
  if (!url.startsWith("https://www.youtube.com/watch")) {
    console.error("Invalid YouTube URL. Please enter a valid URL.")
    return
  }

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the provided URL
    await page.goto(url)

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 })

    // Wait for the specific element to appear in the DOM
    await page.waitForSelector(
      "#count > yt-formatted-string > span:nth-child(1)",
      {
        visible: true,
      }
    )

    // Extract the text content of the element
    const comments = await page.$eval(
      "#count > yt-formatted-string > span:nth-child(1)",
      (element) => element.textContent?.trim()
    )

    // Output the text content
    console.log("Comments count:", comments)

    // Wait and click on first result.
    await page.locator("#expand").click()

    const views = await page.$eval("#info > span:nth-child(1)", (element) =>
      element.textContent?.trim()
    )
    console.log("Views count:", views)
  } catch (error) {
    console.error("An error occurred:", error.message)
  } finally {
    await browser.close()
  }
}

main()
