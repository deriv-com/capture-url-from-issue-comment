# Overview

Capture a URL from github issue comment and feed it into your next GitHub action.

1. This action should run whenever an edit is made to a pull request comment (see `example.yml` below).
2. It checks whether the editor of the comment is from specific bot on GitHub.
3. It attempts to extract the URL from the comment and sets it as the action's output so that you can feed it into your next action.

Please note:

- This action only succeeds when a URL was found, it gets cancelled (if `GITHUB_TOKEN` is passed) or fails on every other event.
- This action will keep executing for every edit (if following `issue_comment.edited` trigger). When a new commit is pushed, a bot may edit the comment again, triggering this action. Please ensure you're building in logic into your next action to handle this.

## Inputs

- `cancel_pattern`: Regular expression pattern to cancel the action when comment contains this pattern.
- `GITHUB_TOKEN`: Pass this (as `${{secrets.GITHUB_TOKEN}}`) to cancel actions instead of failing them.
- `url_pattern`: Regular expression pattern to capture the URL. Ensure first capture group captures the URL.
- `user_name`: The name of the action commenting on pull requests.

## Outputs

- `url`: The URL which can be accessed through the [`steps` context](https://docs.github.com/en/free-pro-team@latest/actions/reference/context-and-expression-syntax-for-github-actions#steps-context).

## Example

The example below captures the URL and comments with it on the pull request.

```YML
name: Capture URL

on:
  issue_comment:
    types: [edited]

jobs:
  capture_url:
    name: Capture URL
    runs-on: "ubuntu-latest"
    steps:
      - uses: deriv-com/capture-url-from-issue-comment@master
        id: capture_url
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      # Below is merely an example of what you could do with the URL.
      # The URL is accessed through ${{ steps.capture_url.outputs.url }}
      - uses: actions/github-script@v3
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            github.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'The URL is: ${{ steps.capture_url.outputs.url }}.'
            });
```