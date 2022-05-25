import fs from "fs-extra"
import fetch from "node-fetch"
import { red, yellow } from "picocolors"
import path from "path"
import ora from "ora"
import parse from "./parse"

export interface Options {
  url: string
  dest?: string
  token: string
}

interface GitHubContent {
  name: string
  type: string
  download_url: string
  path: string
}

async function request<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${endpoint}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  })
  return (await response.json()) as T
}

async function getContent(url: string) {
  const response = await fetch(url)
  return await response.text()
}

export type ProcessFn = (val: string) => string

export async function download(
  options: Options,
  processPathFn: ProcessFn = (val) => val,
  processContentFn: ProcessFn = (val) => val
) {
  if (!options.url) {
    console.log(
      red(`[git-download] Failed to found url, options url must be provided`)
    )
    return
  }
  if (!options.token) {
    console.log(
      red(
        `[git-download] Failed to found token, options token must be provided`
      )
    )
    return
  }
  const parsed = parse(options.url)
  if (!parsed) {
    console.log(
      yellow(
        `[git-download] Failed to parse url, And you can refer to the doc(https://github.com/any-u/git-download/blob/main/README.md#Usage)`
      )
    )
    return
  }

  const spinner = ora(`${parsed.owner}/${parsed.repo}/${parsed.path}`).start()

  try {
    const contents: GitHubContent | GitHubContent[] = await request(
      `${parsed.owner}/${parsed.repo}/contents/${parsed.path}?ref=HEAD`,
      options.token
    )
    if (Array.isArray(contents)) {
      const { url, dest, token } = options
      for (let item of contents) {
        await download(
          {
            url: url + "/" + item.name,
            dest,
            token,
          },
          processPathFn,
          processContentFn
        )
      }
    } else if (contents.type === "file") {
      let res = await getContent(contents.download_url)
      const dest = options.dest
        ? path.resolve(options.dest, contents.path)
        : path.resolve(process.cwd(), contents.path)
      const processPath = processPathFn(dest)
      fs.ensureFileSync(processPath)
      fs.writeFileSync(processPath, processContentFn(res))
    }
  } catch (error: any) {
    spinner.stop()
    spinner.clear()
    throw new Error(error.message)
  }

  spinner.stop()
  spinner.clear()
}
