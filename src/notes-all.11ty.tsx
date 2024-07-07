import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function data() {
  return {
    description: "Random notes, mostly for myself. Maybe useful to someone.",
    permalink: "/notes/index.html",
  }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
  return (
    <>
      <h1 className="text-5xl font-light mb-6">All Notes</h1>
      <div className="mb-6">
        <p>This is a collection of random notes, mostly for myself. Maybe they will be useful to someone.</p>
        <p>If you wonder by, feel free to say hi.</p>
      </div>
      <PostsList collection={collections["notes"]} />
    </>
  )
}
