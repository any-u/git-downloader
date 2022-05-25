# git-download
Download a github repository from node.

## Installation

```bash
npm install @any-u/git-download
```

## Usage

```js
import download from "@any-u/git-download"
import path from "path"

download({
  url: "https://github.com/vuejs/core/tree/main/packages/reactivity",
  dest: path.resolve(__dirname, "./"),
  token: "<Github-Token>",
})

// OR
download({
  url: "https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts",
  token: "<Github-Token>",
})
```

## API

### download(options, processPathFn, processContentFn)

- `options` Options for downloading GitHub repository.
- `processPathFn` Function for processing path
- `processContentFn` Function for processing file content  

Returns: `Promise<void>`

#### Options

The following properties are available on the `options` object:

- `url`  
  Type: `string`  
  A string representing the URL for downloading GitHub repository.

- `dest`  
  Type: `string`  
  Default: `process.cwd()`  
  The file path to download the repository to.

- `token`  
  Type: `string`  
  A GitHub personal token, get one here: https://github.com/settings/tokens
