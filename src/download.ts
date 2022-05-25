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

async function request(endpoint: string, token: string) {
  const response = await fetch(`https://api.github.com/repos/${endpoint}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  })
  return response.json()
}

async function getContent(url: string) {
  try {
    const response = await fetch(url)
    return response.text()
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export type ProcessFn = (val: string) => string

export async function download(
  options: Options,
  processPathFn: ProcessFn = (val) => val,
  processContentFn: ProcessFn = (val) => val
) {
  if (!options.url) {
    console.log(red(`[git-download] Failed to found url, options url must be provided`))
    return
  }
  if (!options.token) {
    console.log(red(`[git-download] Failed to found token, options token must be provided`))
    return
  }
  const parsed = parse(options.url)
  if (!parsed) {
    console.log(yellow(`[git-download] Failed to parse url, And you can refer to the doc(https://github.com/any-u/git-download/blob/main/README.md#Usage)`))
    return
  }

  const text = parsed.owner + "/" + parsed.repo + "/" + parsed.path
  const spinner = ora(text).start()
  const contents = await request(
    `${parsed.owner}/${parsed.repo}/contents/${parsed.path}?ref=HEAD`,
    options.token
  )

  if (contents.type === "file") {
    let res = await getContent(contents.download_url)
    const dest = options.dest
      ? path.resolve(options.dest, contents.path)
      : path.resolve(process.cwd(), contents.path)
    const processPath = processPathFn(dest)
    fs.ensureFileSync(processPath)
    fs.writeFileSync(processPath, processContentFn(res))
  } else {
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
  }

  spinner.stop()
  spinner.clear()
}
