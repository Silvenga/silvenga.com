import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function data() {
  return {
    description: "All posts I've published on this weblog.",
    permalink: "/posts/archived/index.html",
    noIndex: true
  }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
  return (
    <>
      <h1 className="title mb-6">Archived Posts</h1>
      <p className="mb-9">These posts are archived and exist.</p>
      <PostsList collection={collections["posts"]} archived />
    </>
  )
}
