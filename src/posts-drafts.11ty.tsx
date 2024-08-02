import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function data() {
  return {
    title: "Draft Posts",
    description: "All posts I've published on this weblog.",
    permalink: "/posts/drafts/index.html",
    noIndex: true
  }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
  return (
    <>
      <h1 className="title mb-6">Draft Posts</h1>
      <p className="mb-9">These posts haven't been published and may be incomplete.</p>
      <PostsList collection={collections["posts"]} drafts />
    </>
  )
}
