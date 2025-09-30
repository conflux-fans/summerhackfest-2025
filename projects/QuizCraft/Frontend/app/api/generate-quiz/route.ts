import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Quiz generation request received");
    
    const {
      category = "Technology",
      difficulty = "medium",
      questionCount = 10,
      timePerQuestion = 10,
      seed,
    } = await request.json()

    console.log("Quiz generation params:", {
      category,
      difficulty,
      questionCount,
      timePerQuestion,
      seed
    });

    // Compose a prompt for OpenAI
    const prompt = `Generate exactly ${questionCount} ${difficulty} multiple-choice quiz questions about ${category}.
Return STRICT JSON ONLY with NO prose, NO markdown, NO code fences.
Ensure questions are diverse and non-repetitive. Vary phrasing, subtopics, and difficulty within the band.
Return a JSON array of ${questionCount} objects, each with this schema:
{
  "question": string,
  "options": [string, string, string, string],
  "answer": string,
  "explanation": string
}`

    // OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY

    const callOpenAI = async (model: string) => {
      if (!apiKey) {
        console.log("No OpenAI API key found, will use fallback questions");
        return { ok: false, status: 0, content: "" as string }
      }
      
      console.log(`Calling OpenAI API with model: ${model}`);
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2048,
          temperature: 0.3,
        }),
      })

      if (!resp.ok) {
        let errorInfo: any = undefined
        try { errorInfo = await resp.json() } catch {}
        console.error("OpenAI API error:", resp.status, errorInfo || (await resp.text?.()))
        return { ok: false, status: resp.status, content: "" as string }
      }
      const data = await resp.json()
      const content: string = data.choices?.[0]?.message?.content ?? ""
      console.log(`OpenAI API success with model: ${model}, content length: ${content.length}`);
      return { ok: true, status: 200, content }
    }

    // Try OpenAI models that are excellent at instruction following
    let p = await callOpenAI("gpt-3.5-turbo")
    // Retry with GPT-4 if available
    if (!p.ok || !p.content) p = await callOpenAI("gpt-4")
    if (!p.ok || !p.content) p = await callOpenAI("gpt-3.5-turbo-16k")

    let content = p.content || ""
    console.log("OpenAI response content length:", content.length);

    // Normalize AI output into questions array that the client expects
    const toQuestions = (raw: any): Array<{ id: string; question: string; options: string[]; correctAnswer: number; timeLimit: number; explanation: string }> => {
      const ensureIndex = (options: string[], answer: string): number => {
        const idx = options.findIndex((o) => o.trim().toLowerCase() === String(answer || "").trim().toLowerCase())
        return idx >= 0 ? idx : 0
      }

      const toQuestion = (obj: any) => {
        const options: string[] = Array.isArray(obj?.options) ? obj.options.slice(0, 4) : []
        const correctAnswer = ensureIndex(options, obj?.answer)
        const derivedExplanation = options[correctAnswer]
          ? `The correct answer is "${options[correctAnswer]}".`
          : "The provided answer matches the first option."
        return {
          id: (globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
          question: String(obj?.question ?? "Failed to generate question."),
          options,
          correctAnswer,
          timeLimit: Number(timePerQuestion) || 10,
          explanation: String(obj?.explanation ?? derivedExplanation),
        }
      }

      if (Array.isArray(raw)) {
        return raw.map(toQuestion)
      }
      return [toQuestion(raw)]
    }

    let parsed: any
    try {
      // Some models may wrap JSON in code fences; try to extract JSON substring first
      const jsonMatch = content?.match(/```(?:json)?\n([\s\S]*?)```/i)
      const toParse = jsonMatch ? jsonMatch[1] : content
      console.log("Attempting to parse JSON:", toParse.substring(0, 200) + "...");
      parsed = JSON.parse(toParse)
      console.log("Successfully parsed JSON, type:", Array.isArray(parsed) ? 'array' : typeof parsed);
    } catch (e) {
      console.log("JSON parsing failed, using fallback:", e);
      // If the model didn't return strict JSON, fall back to a single placeholder question
      parsed = {
        question: "Failed to generate question.",
        options: ["A", "B", "C", "D"],
        answer: "A",
        explanation: "The correct answer is \"A\".",
      }
    }

    let questions = toQuestions(parsed)
    console.log("Generated questions count:", questions.length);

    // Shuffle options and re-index correctAnswer to avoid positional bias
    // Seeded RNG if seed provided (xorshift32)
    const rngFactory = (s?: string) => {
      if (!s) return () => Math.random()
      let h = 2166136261 >>> 0
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619)
      }
      let x = h || 123456789
      return () => {
        // xorshift
        x ^= x << 13
        x ^= x >>> 17
        x ^= x << 5
        // map to [0,1)
        return ((x >>> 0) % 1_000_000) / 1_000_000
      }
    }
    const rand = rngFactory(seed)

    const shuffle = <T,>(arr: T[]): T[] => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
      }
      return arr
    }

    const postProcess = (items: typeof questions) => {
      const seen = new Set<string>()
      const unique: typeof questions = []
      for (const q of items) {
        // Deduplicate by normalized question text
        const key = q.question.trim().toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)

        // Shuffle options and recompute correct index
        const originalCorrect = q.options[q.correctAnswer]
        const shuffled = shuffle([...q.options])
        const newCorrectIndex = Math.max(0, shuffled.findIndex(o => o === originalCorrect))
        unique.push({ ...q, options: shuffled, correctAnswer: newCorrectIndex })
      }
      return unique
    }

    questions = postProcess(questions)

    // Local fallback generator if AI failed or produced empty/invalid content
    const needsLocalFallback =
      !p.ok ||
      !questions.length ||
      questions.every(q => !q.question || q.options.length < 2) ||
      questions.some(q => String(q.question).toLowerCase().includes("failed to generate question")) ||
      questions.length < Number(questionCount)

    if (needsLocalFallback) {
      console.log("Using local fallback questions");
      const localGenerate = (topic: string, count: number) => {
        const bank: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> = [
          { question: `${topic}: What does CPU stand for?`, options: ["Central Processing Unit", "Computer Personal Unit", "Central Peripheral Unit", "Compute Process Utility"], correctAnswer: 0, explanation: 'CPU stands for "Central Processing Unit".' },
          { question: `${topic}: Which language runs in a web browser?`, options: ["Java", "C", "Python", "JavaScript"], correctAnswer: 3, explanation: 'JavaScript is the language that runs in the browser.' },
          { question: `${topic}: What is the value of 2^5?`, options: ["16", "32", "64", "8"], correctAnswer: 1, explanation: '2^5 equals 32.' },
          { question: `${topic}: HTTP status 404 means?`, options: ["Server Error", "Unauthorized", "Not Found", "Forbidden"], correctAnswer: 2, explanation: '404 indicates the requested resource was not found.' },
          { question: `${topic}: Which is a NoSQL database?`, options: ["MySQL", "MongoDB", "PostgreSQL", "SQLite"], correctAnswer: 1, explanation: 'MongoDB is a NoSQL document database.' },
          { question: `${topic}: What does RAM stand for?`, options: ["Random Access Memory", "Rapid Access Memory", "Readily Available Memory", "Runtime Active Memory"], correctAnswer: 0, explanation: 'RAM stands for "Random Access Memory".' },
          { question: `${topic}: What is Git used for?`, options: ["Text editing", "Version control", "Image processing", "Virtualization"], correctAnswer: 1, explanation: 'Git is a distributed version control system.' },
          { question: `${topic}: CSS stands for?`, options: ["Colorful Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Creative Style System"], correctAnswer: 1, explanation: 'CSS stands for "Cascading Style Sheets".' },
          { question: `${topic}: Which company developed TypeScript?`, options: ["Google", "Facebook", "Microsoft", "Amazon"], correctAnswer: 2, explanation: 'TypeScript was developed by Microsoft.' },
          { question: `${topic}: Which framework is for React routing?`, options: ["Vuex", "Next.js", "Laravel", "Django"], correctAnswer: 1, explanation: 'Next.js is a React framework that includes routing.' },
          { question: `${topic}: What does API stand for?`, options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Integration"], correctAnswer: 0, explanation: 'API stands for "Application Programming Interface".' },
          { question: `${topic}: Which is a frontend framework?`, options: ["Express.js", "Django", "React", "Flask"], correctAnswer: 2, explanation: 'React is a frontend JavaScript framework.' },
          { question: `${topic}: What is Docker used for?`, options: ["Database management", "Containerization", "Version control", "Web hosting"], correctAnswer: 1, explanation: 'Docker is used for containerization of applications.' },
          { question: `${topic}: Which is a cloud provider?`, options: ["GitHub", "AWS", "Docker", "Nginx"], correctAnswer: 1, explanation: 'AWS (Amazon Web Services) is a major cloud provider.' },
          { question: `${topic}: What does SQL stand for?`, options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"], correctAnswer: 0, explanation: 'SQL stands for "Structured Query Language".' },
          { question: `${topic}: Which is a JavaScript runtime?`, options: ["Python", "Node.js", "Java", "C++"], correctAnswer: 1, explanation: 'Node.js is a JavaScript runtime environment.' },
          { question: `${topic}: What is the purpose of HTML?`, options: ["Styling", "Structure", "Logic", "Database"], correctAnswer: 1, explanation: 'HTML is used to structure web page content.' },
          { question: `${topic}: Which is a version control system?`, options: ["Git", "MySQL", "Apache", "Nginx"], correctAnswer: 0, explanation: 'Git is a distributed version control system.' },
          { question: `${topic}: What does URL stand for?`, options: ["Uniform Resource Locator", "Universal Resource Locator", "Unified Resource Locator", "Unique Resource Locator"], correctAnswer: 0, explanation: 'URL stands for "Uniform Resource Locator".' },
          { question: `${topic}: Which is a CSS preprocessor?`, options: ["SASS", "HTML", "JavaScript", "Python"], correctAnswer: 0, explanation: 'SASS is a CSS preprocessor that extends CSS functionality.' },
          { question: `${topic}: What is the purpose of a CDN?`, options: ["Code development", "Content delivery", "Database management", "User authentication"], correctAnswer: 1, explanation: 'CDN (Content Delivery Network) is used for faster content delivery.' },
          { question: `${topic}: Which is a testing framework?`, options: ["Jest", "Express", "MongoDB", "Apache"], correctAnswer: 0, explanation: 'Jest is a popular JavaScript testing framework.' },
          { question: `${topic}: What does REST stand for?`, options: ["Representational State Transfer", "Remote State Transfer", "Resource State Transfer", "Rapid State Transfer"], correctAnswer: 0, explanation: 'REST stands for "Representational State Transfer".' },
          { question: `${topic}: Which is a package manager?`, options: ["npm", "HTML", "CSS", "SQL"], correctAnswer: 0, explanation: 'npm is a package manager for JavaScript.' },
          { question: `${topic}: What is the purpose of HTTPS?`, options: ["Faster loading", "Security", "Styling", "Database"], correctAnswer: 1, explanation: 'HTTPS provides secure communication over HTTP.' },
          { question: `${topic}: Which is a database?`, options: ["React", "PostgreSQL", "Express", "Node.js"], correctAnswer: 1, explanation: 'PostgreSQL is a relational database management system.' },
          { question: `${topic}: What does JSON stand for?`, options: ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Online Notation", "Java Script Object Network"], correctAnswer: 0, explanation: 'JSON stands for "JavaScript Object Notation".' },
          { question: `${topic}: Which is a web server?`, options: ["Apache", "React", "MongoDB", "Express"], correctAnswer: 0, explanation: 'Apache is a popular web server software.' },
          { question: `${topic}: What is the purpose of caching?`, options: ["Security", "Performance", "Styling", "Database"], correctAnswer: 1, explanation: 'Caching improves performance by storing frequently accessed data.' },
          { question: `${topic}: Which is a design pattern?`, options: ["MVC", "HTML", "CSS", "JavaScript"], correctAnswer: 0, explanation: 'MVC (Model-View-Controller) is a software design pattern.' },
        ]
        const result: Array<{ id: string; question: string; options: string[]; correctAnswer: number; timeLimit: number; explanation: string }> = []
        // Deterministic selection order if seeded
        const order = [...bank.keys()]
        const ordered = seed ? shuffle(order) : order
        for (let idx = 0; idx < Math.min(count, ordered.length); idx++) {
          const item = bank[ordered[idx]]
          // Shuffle local options too and rotate correct index
          const opts = [...item.options]
          for (let s = opts.length - 1; s > 0; s--) {
            const j = Math.floor(rand() * (s + 1))
            const t = opts[s]; opts[s] = opts[j]; opts[j] = t
          }
          const newCorrect = Math.max(0, opts.findIndex(o => o === item.options[item.correctAnswer]))
          result.push({
            id: (seed ? `${seed}-${idx}` : Math.random().toString(36).slice(2)),
            question: item.question,
            options: opts,
            correctAnswer: newCorrect,
            timeLimit: Number(timePerQuestion) || 10,
            explanation: item.explanation,
          })
        }
        return result
      }
      questions = localGenerate(category, Number(questionCount) || 10)
      questions = postProcess(questions)
      console.log("Local fallback questions generated:", questions.length);
    }

    const responsePayload: any = {
      success: true,
      quiz: {
        id: (globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        category,
        timePerQuestion: Number(timePerQuestion) || 10,
        questions,
      },
    }

    // Attach debug info in development to diagnose AI issues
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.debug = {
        hadApiKey: Boolean(apiKey),
        usedModel: p.ok ? (content ? (content.length > 0 ? "openai_resolved" : "empty_content") : "no_content") : "failed",
        fallbackUsed: needsLocalFallback,
        rawContentBytes: typeof content === 'string' ? content.length : 0,
        parsedType: Array.isArray(parsed) ? 'array' : typeof parsed,
        questionCount: questions.length,
      }
    }

    console.log("Final response payload:", {
      success: responsePayload.success,
      questionCount: responsePayload.quiz.questions.length,
      debug: responsePayload.debug
    });

    // If AI failed, we still return success true with local questions
    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}