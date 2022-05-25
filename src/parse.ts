export interface Parsed {
  owner: string
  repo: string
  way: string
  branch: string
  path: string
}

export default function parse(url: string): Parsed | undefined {
  const urlRE = /^http[s]:\/\/github.com(.*)/
  const urlMatch = url.match(urlRE)
  if (urlMatch) {
    const pathname = urlMatch[1]
    const pathRE = /[^\/\s]+/g
    const path = pathname.match(pathRE)
    if (path) {
      const [owner, repo, way, branch, ...dest] = path
      return {
        owner,
        repo,
        way,
        branch,
        path: dest.join("/"),
      }
    }
  }
}
