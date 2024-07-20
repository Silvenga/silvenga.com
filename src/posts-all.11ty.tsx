import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function data() {
  return {
    description: "All posts I've published on this weblog.",
    permalink: "/posts/index.html",
  }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
  return (
    <>
      <h1 className="title mb-6">All Posts</h1>
      <PostsList collection={collections["posts"]} />
      <footer className="flex flex-col nt-12 mb-24 text-center">
        <a href="/posts/archived/" className="link">
          Archived posts
        </a>
        <a href="/posts/drafts/" className="link">
          Unpublished drafts
        </a>
      </footer>
    </>
  )
}
