import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function data() {
  return {
    description: "All posts I've published on this weblog."
  }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
  return (
    <>
      <h1 className="text-5xl font-light mb-6">All Posts</h1>
      <PostsList collection={collections["posts"]} />
    </>
  )
}
